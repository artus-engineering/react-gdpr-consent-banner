<?php

if (!defined('ABSPATH')) {
    exit;
}

function rgcc_render_admin_page(): void {
    if (!current_user_can('manage_options')) {
        return;
    }

    $general      = rgcc_get_general_settings();
    $theme        = get_option('rgcc_theme', rgcc_get_default_config()['theme']);
    $integrations = get_option('rgcc_integrations', rgcc_get_default_config()['integrations']);
    $providers    = get_option('rgcc_providers', []);
    $presets      = rgcc_get_theme_presets();
    $categories   = rgcc_get_cookie_categories();
    $units        = rgcc_get_cookie_units();
    ?>
    <div class="wrap rgcc-admin">
        <h1><?php esc_html_e('Cookie-Einwilligungs-Einstellungen', 'react-gdpr-cookie-consent'); ?></h1>

        <?php settings_errors(); ?>

        <form method="post" action="options.php" id="rgcc-settings-form">
            <?php settings_fields('rgcc_settings'); ?>

            <div class="rgcc-tabs">
                <nav class="rgcc-tab-nav">
                    <a href="#rgcc-tab-general" class="rgcc-tab-link active"><?php esc_html_e('Allgemein', 'react-gdpr-cookie-consent'); ?></a>
                    <a href="#rgcc-tab-theme" class="rgcc-tab-link"><?php esc_html_e('Design', 'react-gdpr-cookie-consent'); ?></a>
                    <a href="#rgcc-tab-integrations" class="rgcc-tab-link"><?php esc_html_e('Integrationen', 'react-gdpr-cookie-consent'); ?></a>
                    <a href="#rgcc-tab-providers" class="rgcc-tab-link"><?php esc_html_e('Cookie-Anbieter', 'react-gdpr-cookie-consent'); ?></a>
                </nav>

                <!-- Allgemein -->
                <div id="rgcc-tab-general" class="rgcc-tab-panel active">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_website_name"><?php esc_html_e('Website-Name', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_general_website_name" name="rgcc_general[website_name]"
                                       value="<?php echo esc_attr($general['website_name']); ?>" class="regular-text">
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_banner_heading"><?php esc_html_e('Banner-Überschrift', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_general_banner_heading" name="rgcc_general[banner_heading]"
                                       value="<?php echo esc_attr($general['banner_heading']); ?>" class="large-text">
                                <p class="description"><?php esc_html_e('Überschrift im Einwilligungs-Banner (oberhalb des Einleitungstexts).', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_banner_intro"><?php esc_html_e('Banner-Text', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <textarea id="rgcc_general_banner_intro" name="rgcc_general[banner_intro]" rows="4"
                                          class="large-text"><?php echo esc_textarea($general['banner_intro']); ?></textarea>
                                <p class="description"><?php esc_html_e('Einleitungstext im Banner. Der Satz endet in der Oberfläche direkt vor dem Link zur Cookie-Richtlinie.', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_cookie_policy_link"><?php esc_html_e('Link zur Cookie-Richtlinie', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="url" id="rgcc_general_cookie_policy_link" name="rgcc_general[cookie_policy_link]"
                                       value="<?php echo esc_attr($general['cookie_policy_link']); ?>" class="regular-text"
                                       placeholder="/datenschutzerklaerung">
                                <p class="description"><?php esc_html_e('URL zu Ihrer Cookie- oder Datenschutzerklärung.', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_domain"><?php esc_html_e('Domain', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_general_domain" name="rgcc_general[domain]"
                                       value="<?php echo esc_attr($general['domain']); ?>" class="regular-text"
                                       placeholder="beispiel.de">
                                <p class="description"><?php esc_html_e('Die Domain für die Cookie-Speicherung. Wird automatisch aus Ihrer WordPress-URL erkannt.', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_general_cookies_valid_for_days"><?php esc_html_e('Cookie-Laufzeit (Tage)', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="rgcc_general_cookies_valid_for_days" name="rgcc_general[cookies_valid_for_days]"
                                       value="<?php echo esc_attr($general['cookies_valid_for_days']); ?>" min="1" max="730" class="small-text">
                                <p class="description"><?php esc_html_e('Wie lange Einwilligungs-Cookies gültig sind. Standard: 183 Tage (ca. 6 Monate).', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <?php esc_html_e('Link zum erneuten Öffnen', 'react-gdpr-cookie-consent'); ?>
                            </th>
                            <td>
                                <p class="description">
                                    <?php esc_html_e('Verwenden Sie diesen Shortcode in Beiträgen oder Seiten:', 'react-gdpr-cookie-consent'); ?>
                                    <code>[rgcc_cookie_settings text="Cookie-Einstellungen"]</code>
                                </p>
                                <p class="description">
                                    <?php esc_html_e('Verwenden Sie diese URL für individuelle WordPress-Menülinks:', 'react-gdpr-cookie-consent'); ?>
                                    <code><?php echo esc_html(RGCC_OPEN_CONSENT_HASH); ?></code>
                                </p>
                                <p class="description">
                                    <?php esc_html_e('Alternativ können Sie den Eintrag "Cookie-Einstellungen" unter Design > Menüs > Cookie Consent hinzufügen.', 'react-gdpr-cookie-consent'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Design -->
                <div id="rgcc-tab-theme" class="rgcc-tab-panel">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rgcc_theme_preset"><?php esc_html_e('Design-Vorlage', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <select id="rgcc_theme_preset" name="rgcc_theme[preset]">
                                    <?php foreach ($presets as $key => $preset) : ?>
                                        <option value="<?php echo esc_attr($key); ?>"
                                                <?php selected($theme['preset'], $key); ?>
                                                <?php if ($key !== 'custom') : ?>
                                                    data-bg-primary="<?php echo esc_attr($preset['bg_primary'] ?? ''); ?>"
                                                    data-bg-secondary="<?php echo esc_attr($preset['bg_secondary'] ?? ''); ?>"
                                                    data-text-primary="<?php echo esc_attr($preset['text_primary'] ?? ''); ?>"
                                                    data-text-secondary="<?php echo esc_attr($preset['text_secondary'] ?? ''); ?>"
                                                    data-primary-color="<?php echo esc_attr($preset['primary_color'] ?? ''); ?>"
                                                    data-button-text="<?php echo esc_attr($preset['button_text'] ?? ''); ?>"
                                                <?php endif; ?>>
                                            <?php echo esc_html($preset['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                    </table>

                    <div id="rgcc-color-fields">
                        <?php
                        $color_fields = [
                            'bg_primary'     => __('Primäre Hintergrundfarbe', 'react-gdpr-cookie-consent'),
                            'bg_secondary'   => __('Sekundäre Hintergrundfarbe', 'react-gdpr-cookie-consent'),
                            'text_primary'   => __('Primäre Textfarbe', 'react-gdpr-cookie-consent'),
                            'text_secondary' => __('Sekundäre Textfarbe', 'react-gdpr-cookie-consent'),
                            'primary_color'  => __('Primär- / Akzentfarbe', 'react-gdpr-cookie-consent'),
                            'button_text'    => __('Textfarbe der Schaltflächen', 'react-gdpr-cookie-consent'),
                        ];
                        ?>
                        <table class="form-table">
                            <?php foreach ($color_fields as $field_key => $label) : ?>
                                <tr>
                                    <th scope="row"><label for="rgcc_theme_<?php echo esc_attr($field_key); ?>"><?php echo esc_html($label); ?></label></th>
                                    <td>
                                        <input type="text"
                                               id="rgcc_theme_<?php echo esc_attr($field_key); ?>"
                                               name="rgcc_theme[<?php echo esc_attr($field_key); ?>]"
                                               value="<?php echo esc_attr($theme[$field_key]); ?>"
                                               class="rgcc-color-picker"
                                               data-default-color="<?php echo esc_attr($theme[$field_key]); ?>">
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </table>
                    </div>
                </div>

                <!-- Integrationen -->
                <div id="rgcc-tab-integrations" class="rgcc-tab-panel">
                    <p class="description" style="margin-bottom: 15px;">
                        <?php esc_html_e('Tragen Sie die Tracking-IDs der genutzten Dienste ein. Das Plugin erstellt automatisch die passenden Einwilligungs-Hooks und lädt Skripte erst nach Zustimmung der Besucher.', 'react-gdpr-cookie-consent'); ?>
                    </p>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rgcc_integrations_ga"><?php esc_html_e('Google Analytics Mess-ID', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_integrations_ga" name="rgcc_integrations[ga_measurement_id]"
                                       value="<?php echo esc_attr($integrations['ga_measurement_id']); ?>"
                                       class="regular-text" placeholder="G-XXXXXXXXXX">
                                <p class="description"><?php esc_html_e('GA4-Mess-ID. Google Consent Mode v2 wird automatisch umgesetzt.', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_integrations_gtm"><?php esc_html_e('Google Tag Manager Container-ID', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_integrations_gtm" name="rgcc_integrations[gtm_container_id]"
                                       value="<?php echo esc_attr($integrations['gtm_container_id']); ?>"
                                       class="regular-text" placeholder="GTM-XXXXXXX">
                                <p class="description"><?php esc_html_e('GTM wird mit abgelehnten Einwilligungs-Standards geladen und nach Zustimmung der Besucher aktualisiert.', 'react-gdpr-cookie-consent'); ?></p>

                                <label style="margin-top: 8px; display: inline-block;">
                                    <input type="checkbox" name="rgcc_integrations[gtm_granular]" value="1"
                                           <?php checked(!empty($integrations['gtm_granular'])); ?>>
                                    <?php esc_html_e('Granulare Einwilligung aktivieren (einzelne Einwilligungsparameter statt Kategorien)', 'react-gdpr-cookie-consent'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rgcc_integrations_fb"><?php esc_html_e('Facebook-Pixel-ID', 'react-gdpr-cookie-consent'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rgcc_integrations_fb" name="rgcc_integrations[fb_pixel_id]"
                                       value="<?php echo esc_attr($integrations['fb_pixel_id']); ?>"
                                       class="regular-text" placeholder="123456789012345">
                                <p class="description"><?php esc_html_e('Der Facebook Pixel wird erst nach Zustimmung zu Marketing-Cookies geladen.', 'react-gdpr-cookie-consent'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Cookie-Anbieter -->
                <div id="rgcc-tab-providers" class="rgcc-tab-panel">
                    <p class="description" style="margin-bottom: 15px;">
                        <?php esc_html_e('Definieren Sie die Cookie-Anbieter, die im Einwilligungsbanner angezeigt werden. Jeder Anbieter steht für einen Dienst, der Cookies auf Ihrer Website setzt.', 'react-gdpr-cookie-consent'); ?>
                    </p>

                    <div id="rgcc-providers-list">
                        <?php
                        if (!empty($providers)) {
                            foreach ($providers as $index => $provider) {
                                rgcc_render_provider_fieldset($index, $provider, $categories, $units);
                            }
                        }
                        ?>
                    </div>

                    <button type="button" id="rgcc-add-provider" class="button button-secondary">
                        <?php esc_html_e('+ Anbieter hinzufügen', 'react-gdpr-cookie-consent'); ?>
                    </button>

                    <!-- Versteckte Vorlage für JavaScript-Kopien -->
                    <script type="text/html" id="rgcc-provider-template">
                        <?php rgcc_render_provider_fieldset('__INDEX__', [], $categories, $units); ?>
                    </script>
                    <script type="text/html" id="rgcc-cookie-template">
                        <?php rgcc_render_cookie_fieldset('__PIDX__', '__CIDX__', [], $units); ?>
                    </script>
                </div>
            </div>

            <?php submit_button(__('Einstellungen speichern', 'react-gdpr-cookie-consent')); ?>
        </form>
    </div>
    <?php
}

/**
 * @param int|string $index
 */
function rgcc_render_provider_fieldset($index, array $provider, array $categories, array $units): void {
    $id                   = $provider['id'] ?? '';
    $name                 = $provider['name'] ?? '';
    $category             = $provider['category'] ?? 'Essential';
    $description_de       = $provider['description_de'] ?? '';
    $data_protection_link = $provider['data_protection_link'] ?? '';
    $service_provider     = $provider['service_provider'] ?? '';
    $cookies              = $provider['cookies'] ?? [];
    $prefix               = "rgcc_providers[{$index}]";
    ?>
    <div class="rgcc-provider-group" data-index="<?php echo esc_attr((string) $index); ?>">
        <div class="rgcc-provider-header">
            <strong class="rgcc-provider-title">
                <?php echo esc_html($name !== '' ? $name : __('Neuer Anbieter', 'react-gdpr-cookie-consent')); ?>
            </strong>
            <button type="button" class="rgcc-toggle-provider button-link"><?php esc_html_e('Aufklappen', 'react-gdpr-cookie-consent'); ?></button>
            <button type="button" class="rgcc-remove-provider button-link rgcc-remove-btn"><?php esc_html_e('Entfernen', 'react-gdpr-cookie-consent'); ?></button>
        </div>
        <div class="rgcc-provider-body" style="display:none;">
            <table class="form-table">
                <tr>
                    <th><label><?php esc_html_e('ID', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <input type="text" name="<?php echo esc_attr($prefix); ?>[id]"
                               value="<?php echo esc_attr($id); ?>" class="regular-text" required
                               placeholder="mein-dienst">
                        <p class="description"><?php esc_html_e('Eindeutige Kennung (klein geschrieben, ohne Leerzeichen).', 'react-gdpr-cookie-consent'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e('Name', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <input type="text" name="<?php echo esc_attr($prefix); ?>[name]"
                               value="<?php echo esc_attr($name); ?>" class="regular-text rgcc-provider-name-input" required
                               placeholder="Mein Dienst">
                    </td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e('Kategorie', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <select name="<?php echo esc_attr($prefix); ?>[category]">
                            <?php foreach ($categories as $cat_value => $cat_label) : ?>
                                <option value="<?php echo esc_attr($cat_value); ?>" <?php selected($category, $cat_value); ?>>
                                    <?php echo esc_html($cat_label); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e('Beschreibung', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <textarea name="<?php echo esc_attr($prefix); ?>[description_de]"
                                  rows="2" class="large-text"><?php echo esc_textarea($description_de); ?></textarea>
                    </td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e('Datenschutz-Link', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <input type="url" name="<?php echo esc_attr($prefix); ?>[data_protection_link]"
                               value="<?php echo esc_attr($data_protection_link); ?>" class="regular-text"
                               placeholder="https://beispiel.de/datenschutzerklaerung">
                    </td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e('Dienstanbieter', 'react-gdpr-cookie-consent'); ?></label></th>
                    <td>
                        <input type="text" name="<?php echo esc_attr($prefix); ?>[service_provider]"
                               value="<?php echo esc_attr($service_provider); ?>" class="regular-text"
                               placeholder="Google LLC">
                    </td>
                </tr>
            </table>

            <h4><?php esc_html_e('Cookies', 'react-gdpr-cookie-consent'); ?></h4>
            <div class="rgcc-cookies-list">
                <?php
                if (!empty($cookies)) {
                    foreach ($cookies as $ci => $cookie) {
                        rgcc_render_cookie_fieldset($index, $ci, $cookie, $units);
                    }
                }
                ?>
            </div>
            <button type="button" class="rgcc-add-cookie button button-secondary button-small">
                <?php esc_html_e('+ Cookie hinzufügen', 'react-gdpr-cookie-consent'); ?>
            </button>
        </div>
    </div>
    <?php
}

/**
 * @param int|string $provider_index
 * @param int|string $cookie_index
 */
function rgcc_render_cookie_fieldset($provider_index, $cookie_index, array $cookie, array $units): void {
    $prefix = "rgcc_providers[{$provider_index}][cookies][{$cookie_index}]";
    ?>
    <div class="rgcc-cookie-row">
        <div class="rgcc-cookie-fields">
            <label>
                <span><?php esc_html_e('Name', 'react-gdpr-cookie-consent'); ?></span>
                <input type="text" name="<?php echo esc_attr($prefix); ?>[name]"
                       value="<?php echo esc_attr($cookie['name'] ?? ''); ?>" placeholder="_ga">
            </label>
            <label>
                <span><?php esc_html_e('Laufzeit', 'react-gdpr-cookie-consent'); ?></span>
                <input type="number" name="<?php echo esc_attr($prefix); ?>[duration]"
                       value="<?php echo esc_attr($cookie['duration'] ?? '0'); ?>" min="0" class="small-text">
            </label>
            <label>
                <span><?php esc_html_e('Einheit', 'react-gdpr-cookie-consent'); ?></span>
                <select name="<?php echo esc_attr($prefix); ?>[unit]">
                    <?php foreach ($units as $unit_value => $unit_label) : ?>
                        <option value="<?php echo esc_attr($unit_value); ?>"
                                <?php selected($cookie['unit'] ?? 'days', $unit_value); ?>>
                            <?php echo esc_html($unit_label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label>
                <span><?php esc_html_e('Zweck', 'react-gdpr-cookie-consent'); ?></span>
                <input type="text" name="<?php echo esc_attr($prefix); ?>[purpose_de]"
                       value="<?php echo esc_attr($cookie['purpose_de'] ?? ''); ?>" class="regular-text">
            </label>
        </div>
        <button type="button" class="rgcc-remove-cookie button-link rgcc-remove-btn">&times;</button>
    </div>
    <?php
}
