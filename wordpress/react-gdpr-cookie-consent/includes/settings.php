<?php

if (!defined('ABSPATH')) {
    exit;
}

function rgcc_register_settings(): void {
    register_setting('rgcc_settings', 'rgcc_general', [
        'type'              => 'array',
        'sanitize_callback' => 'rgcc_sanitize_general',
        'default'           => rgcc_get_default_config()['general'],
    ]);

    register_setting('rgcc_settings', 'rgcc_theme', [
        'type'              => 'array',
        'sanitize_callback' => 'rgcc_sanitize_theme',
        'default'           => rgcc_get_default_config()['theme'],
    ]);

    register_setting('rgcc_settings', 'rgcc_integrations', [
        'type'              => 'array',
        'sanitize_callback' => 'rgcc_sanitize_integrations',
        'default'           => rgcc_get_default_config()['integrations'],
    ]);

    register_setting('rgcc_settings', 'rgcc_providers', [
        'type'              => 'array',
        'sanitize_callback' => 'rgcc_sanitize_providers',
        'default'           => [],
    ]);
}
add_action('admin_init', 'rgcc_register_settings');

function rgcc_sanitize_general(mixed $input): array {
    $defaults = rgcc_get_default_config()['general'];

    if (!is_array($input)) {
        return $defaults;
    }

    return [
        'website_name'           => sanitize_text_field($input['website_name'] ?? $defaults['website_name']),
        'cookie_policy_link'     => esc_url_raw($input['cookie_policy_link'] ?? $defaults['cookie_policy_link']),
        'domain'                 => sanitize_text_field($input['domain'] ?? $defaults['domain']),
        'lang'                   => 'deDE',
        'cookies_valid_for_days' => absint($input['cookies_valid_for_days'] ?? $defaults['cookies_valid_for_days']),
        'banner_heading'         => sanitize_text_field($input['banner_heading'] ?? $defaults['banner_heading']),
        'banner_intro'           => sanitize_textarea_field($input['banner_intro'] ?? $defaults['banner_intro']),
    ];
}

function rgcc_sanitize_theme(mixed $input): array {
    $defaults = rgcc_get_default_config()['theme'];

    if (!is_array($input)) {
        return $defaults;
    }

    $presets = array_keys(rgcc_get_theme_presets());
    $preset  = in_array($input['preset'] ?? '', $presets, true)
        ? $input['preset']
        : $defaults['preset'];

    return [
        'preset'         => $preset,
        'bg_primary'     => sanitize_hex_color($input['bg_primary'] ?? '') ?: $defaults['bg_primary'],
        'bg_secondary'   => sanitize_hex_color($input['bg_secondary'] ?? '') ?: $defaults['bg_secondary'],
        'text_primary'   => sanitize_hex_color($input['text_primary'] ?? '') ?: $defaults['text_primary'],
        'text_secondary' => sanitize_hex_color($input['text_secondary'] ?? '') ?: $defaults['text_secondary'],
        'primary_color'  => sanitize_hex_color($input['primary_color'] ?? '') ?: $defaults['primary_color'],
        'button_text'    => sanitize_hex_color($input['button_text'] ?? '') ?: $defaults['button_text'],
    ];
}

function rgcc_sanitize_integrations(mixed $input): array {
    $defaults = rgcc_get_default_config()['integrations'];

    if (!is_array($input)) {
        return $defaults;
    }

    $ga_id  = sanitize_text_field($input['ga_measurement_id'] ?? '');
    $gtm_id = sanitize_text_field($input['gtm_container_id'] ?? '');
    $fb_id  = sanitize_text_field($input['fb_pixel_id'] ?? '');

    if ($ga_id !== '' && !preg_match('/^G-[A-Z0-9]+$/', $ga_id)) {
        add_settings_error('rgcc_integrations', 'invalid_ga_id', __('Ungültiges Format der GA-Mess-ID. Erwartet: G-XXXXXXXXXX', 'react-gdpr-cookie-consent'));
        $ga_id = '';
    }

    if ($gtm_id !== '' && !preg_match('/^GTM-[A-Z0-9]+$/', $gtm_id)) {
        add_settings_error('rgcc_integrations', 'invalid_gtm_id', __('Ungültiges Format der GTM-Container-ID. Erwartet: GTM-XXXXXXX', 'react-gdpr-cookie-consent'));
        $gtm_id = '';
    }

    return [
        'ga_measurement_id' => $ga_id,
        'gtm_container_id'  => $gtm_id,
        'gtm_granular'      => !empty($input['gtm_granular']),
        'fb_pixel_id'       => $fb_id,
    ];
}

function rgcc_sanitize_providers(mixed $input): array {
    if (!is_array($input)) {
        return [];
    }

    $valid_categories = array_keys(rgcc_get_cookie_categories());
    $valid_units      = array_keys(rgcc_get_cookie_units());
    $sanitized        = [];

    foreach ($input as $provider) {
        if (!is_array($provider) || empty($provider['id']) || empty($provider['name'])) {
            continue;
        }

        $category = in_array($provider['category'] ?? '', $valid_categories, true)
            ? $provider['category']
            : 'Essential';

        $cookies = [];
        if (!empty($provider['cookies']) && is_array($provider['cookies'])) {
            foreach ($provider['cookies'] as $cookie) {
                if (!is_array($cookie) || empty($cookie['name'])) {
                    continue;
                }

                $unit = in_array($cookie['unit'] ?? '', $valid_units, true)
                    ? $cookie['unit']
                    : 'days';

                $cookies[] = [
                    'name'       => sanitize_text_field($cookie['name']),
                    'duration'   => absint($cookie['duration'] ?? 0),
                    'unit'       => $unit,
                    'purpose_de' => sanitize_text_field($cookie['purpose_de'] ?? ''),
                ];
            }
        }

        $sanitized[] = [
            'id'                   => sanitize_key($provider['id']),
            'name'                 => sanitize_text_field($provider['name']),
            'category'             => $category,
            'description_de'       => sanitize_textarea_field($provider['description_de'] ?? ''),
            'data_protection_link' => esc_url_raw($provider['data_protection_link'] ?? ''),
            'service_provider'     => sanitize_text_field($provider['service_provider'] ?? ''),
            'cookies'              => $cookies,
        ];
    }

    return $sanitized;
}

function rgcc_build_frontend_config(): array {
    $general      = rgcc_get_general_settings();
    $theme        = get_option('rgcc_theme', rgcc_get_default_config()['theme']);
    $integrations = get_option('rgcc_integrations', rgcc_get_default_config()['integrations']);
    $providers    = get_option('rgcc_providers', []);

    $js_providers = [];
    foreach ($providers as $p) {
        $description = $p['description_de'] ?? '';

        $cookies = [];
        foreach ($p['cookies'] as $c) {
            $cookies[] = [
                'name'     => $c['name'],
                'duration' => $c['duration'],
                'unit'     => $c['unit'],
                'purpose'  => $c['purpose_de'] ?? '',
            ];
        }

        $js_providers[] = [
            'id'                 => $p['id'],
            'name'               => $p['name'],
            'category'           => $p['category'],
            'description'        => $description,
            'cookies'            => $cookies,
            'dataProtectionLink' => $p['data_protection_link'],
            'serviceProvider'    => $p['service_provider'],
        ];
    }

    $theme_colors = [
        'bgPrimary'    => $theme['bg_primary'],
        'bgSecondary'  => $theme['bg_secondary'],
        'textPrimary'  => $theme['text_primary'],
        'textSecondary' => $theme['text_secondary'],
        'primaryColor' => $theme['primary_color'],
        'buttonText'   => $theme['button_text'],
    ];

    return [
        'cookiePolicyLink'    => $general['cookie_policy_link'],
        'websiteName'         => $general['website_name'],
        'domain'              => $general['domain'],
        'lang'                => 'deDE',
        'cookiesValidForDays' => (int) $general['cookies_valid_for_days'],
        'bannerHeading'       => $general['banner_heading'],
        'bannerIntro'         => $general['banner_intro'],
        'theme'               => $theme_colors,
        'providers'           => $js_providers,
        'integrations'        => [
            'gaMeasurementId' => $integrations['ga_measurement_id'],
            'gtmContainerId'  => $integrations['gtm_container_id'],
            'gtmGranular'     => (bool) $integrations['gtm_granular'],
            'fbPixelId'       => $integrations['fb_pixel_id'],
        ],
    ];
}
