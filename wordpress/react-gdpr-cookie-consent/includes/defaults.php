<?php

if (!defined('ABSPATH')) {
    exit;
}

function rgcc_get_default_config(): array {
    return [
        'general' => [
            'website_name'         => get_bloginfo('name'),
            'cookie_policy_link'   => '/datenschutzerklaerung',
            'domain'               => wp_parse_url(home_url(), PHP_URL_HOST) ?: '',
            'lang'                 => 'deDE',
            'cookies_valid_for_days' => 183,
        ],
        'theme' => [
            'preset'        => 'default',
            'bg_primary'    => '#ffffff',
            'bg_secondary'  => '#f8fafc',
            'text_primary'  => '#1e293b',
            'text_secondary' => '#64748b',
            'primary_color' => '#3b82f6',
            'button_text'   => '#ffffff',
        ],
        'integrations' => [
            'ga_measurement_id'  => '',
            'gtm_container_id'   => '',
            'gtm_granular'       => false,
            'fb_pixel_id'        => '',
        ],
        'providers' => [],
    ];
}

function rgcc_get_theme_presets(): array {
    return [
        'default' => [
            'label'          => __('Standard (Blau)', 'react-gdpr-cookie-consent'),
            'bg_primary'     => '#ffffff',
            'bg_secondary'   => '#f8fafc',
            'text_primary'   => '#1e293b',
            'text_secondary' => '#64748b',
            'primary_color'  => '#3b82f6',
            'button_text'    => '#ffffff',
        ],
        'dark' => [
            'label'          => __('Dunkel', 'react-gdpr-cookie-consent'),
            'bg_primary'     => '#1e293b',
            'bg_secondary'   => '#334155',
            'text_primary'   => '#f8fafc',
            'text_secondary' => '#94a3b8',
            'primary_color'  => '#60a5fa',
            'button_text'    => '#1e293b',
        ],
        'neutral' => [
            'label'          => __('Neutral', 'react-gdpr-cookie-consent'),
            'bg_primary'     => '#fafafa',
            'bg_secondary'   => '#f4f4f5',
            'text_primary'   => '#27272a',
            'text_secondary' => '#71717a',
            'primary_color'  => '#52525b',
            'button_text'    => '#ffffff',
        ],
        'warm' => [
            'label'          => __('Warm (Bernstein)', 'react-gdpr-cookie-consent'),
            'bg_primary'     => '#fffbeb',
            'bg_secondary'   => '#fef3c7',
            'text_primary'   => '#451a03',
            'text_secondary' => '#78350f',
            'primary_color'  => '#d97706',
            'button_text'    => '#ffffff',
        ],
        'custom' => [
            'label' => __('Benutzerdefiniert', 'react-gdpr-cookie-consent'),
        ],
    ];
}

function rgcc_get_cookie_categories(): array {
    return [
        'Essential'  => __('Essentiell', 'react-gdpr-cookie-consent'),
        'Functional' => __('Funktional', 'react-gdpr-cookie-consent'),
        'Analytics'  => __('Analyse', 'react-gdpr-cookie-consent'),
        'Marketing'  => __('Marketing', 'react-gdpr-cookie-consent'),
    ];
}

function rgcc_get_cookie_units(): array {
    return [
        'session' => __('Sitzung', 'react-gdpr-cookie-consent'),
        'days'    => __('Tage', 'react-gdpr-cookie-consent'),
        'weeks'   => __('Wochen', 'react-gdpr-cookie-consent'),
        'months'  => __('Monate', 'react-gdpr-cookie-consent'),
        'years'   => __('Jahre', 'react-gdpr-cookie-consent'),
    ];
}
