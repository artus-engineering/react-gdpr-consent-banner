<?php
/**
 * Frontend-Links zum erneuten Öffnen des Cookie-Banners.
 *
 * @package ReactGdprCookieConsent
 */

if (!defined('ABSPATH')) {
    exit;
}

const RGCC_OPEN_CONSENT_HASH = '#rgcc-open-cookie-consent';
const RGCC_COOKIE_SETTINGS_MENU_ITEM_CLASS = 'rgcc-cookie-settings-menu-item';

/**
 * Bereinigt eine durch Leerzeichen getrennte HTML-Klassenliste.
 *
 * @param string $class_names Unbereinigte Klassennamen.
 * @return string
 */
function rgcc_sanitize_class_list(string $class_names): string {
    $sanitized_classes = array_filter(
        array_map('sanitize_html_class', preg_split('/\s+/', $class_names) ?: [])
    );

    return implode(' ', $sanitized_classes);
}

/**
 * Rendert einen Link, der das Cookie-Banner erneut öffnet.
 *
 * Verwendung:
 *   [rgcc_cookie_settings]
 *   [rgcc_cookie_settings text="Cookie-Einstellungen" class="fusszeilen-link"]
 *
 * @param array<string, string>|string $atts Shortcode attributes.
 * @return string
 */
function rgcc_cookie_settings_shortcode($atts = []): string {
    $attributes = shortcode_atts(
        [
            'text'  => __('Cookie-Einstellungen', 'react-gdpr-cookie-consent'),
            'class' => '',
            'id'    => '',
        ],
        $atts,
        'rgcc_cookie_settings'
    );

    $html_attributes = [
        'href'                          => RGCC_OPEN_CONSENT_HASH,
        'data-rgcc-open-cookie-consent' => 'true',
    ];

    $class_name = rgcc_sanitize_class_list((string) $attributes['class']);
    if ($class_name !== '') {
        $html_attributes['class'] = $class_name;
    }

    $id = sanitize_html_class((string) $attributes['id']);
    if ($id !== '') {
        $html_attributes['id'] = $id;
    }

    $attribute_string = '';
    foreach ($html_attributes as $name => $value) {
        $attribute_string .= sprintf(' %s="%s"', esc_attr($name), esc_attr($value));
    }

    return sprintf(
        '<a%s>%s</a>',
        $attribute_string,
        esc_html(sanitize_text_field((string) $attributes['text']))
    );
}

add_shortcode('rgcc_cookie_settings', 'rgcc_cookie_settings_shortcode');

/**
 * Fügt einen Cookie-Consent-Eintrag zu Design > Menüs hinzu.
 *
 * Der Eintrag wird als normaler individueller Link gespeichert und funktioniert
 * dadurch mit klassischen Menüs und Themes, die wp_nav_menu ausgeben.
 *
 * @return void
 */
function rgcc_register_nav_menu_meta_box(): void {
    add_meta_box(
        'rgcc-cookie-consent-menu-item',
        __('Cookie Consent', 'react-gdpr-cookie-consent'),
        'rgcc_render_nav_menu_meta_box',
        'nav-menus',
        'side',
        'default'
    );
}

add_action('admin_head-nav-menus.php', 'rgcc_register_nav_menu_meta_box');

/**
 * Rendert die Checkbox-Auswahl, die WordPress für Menüeinträge verwendet.
 *
 * @return void
 */
function rgcc_render_nav_menu_meta_box(): void {
    global $_nav_menu_placeholder, $nav_menu_selected_id;

    if (!class_exists('Walker_Nav_Menu_Checklist')) {
        return;
    }

    $_nav_menu_placeholder = (int) $_nav_menu_placeholder - 1;

    $menu_item = (object) [
        'ID'               => 0,
        'db_id'            => 0,
        'menu_item_parent' => 0,
        'object_id'        => $_nav_menu_placeholder,
        'post_parent'      => 0,
        'type'             => 'custom',
        'object'           => 'custom',
        'type_label'       => __('Individueller Link', 'react-gdpr-cookie-consent'),
        'title'            => __('Cookie-Einstellungen', 'react-gdpr-cookie-consent'),
        'url'              => RGCC_OPEN_CONSENT_HASH,
        'target'           => '',
        'attr_title'       => '',
        'description'      => '',
        'classes'          => [RGCC_COOKIE_SETTINGS_MENU_ITEM_CLASS],
        'xfn'              => '',
    ];

    $walker = new Walker_Nav_Menu_Checklist();
    $args   = (object) ['walker' => $walker];
    ?>
    <div id="rgcc-cookie-consent-menu-item" class="posttypediv">
        <div id="tabs-panel-rgcc-cookie-consent" class="tabs-panel tabs-panel-active">
            <ul id="rgcc-cookie-consent-checklist" class="categorychecklist form-no-clear">
                <?php echo walk_nav_menu_tree([$menu_item], 0, $args); ?>
            </ul>
        </div>

        <p class="button-controls wp-clearfix">
            <span class="add-to-menu">
                <input
                    type="submit"
                    <?php disabled((int) $nav_menu_selected_id, 0); ?>
                    class="button-secondary submit-add-to-menu right"
                    value="<?php esc_attr_e('Zum Menü hinzufügen', 'react-gdpr-cookie-consent'); ?>"
                    name="add-rgcc-cookie-consent-menu-item"
                    id="submit-rgcc-cookie-consent-menu-item"
                >
                <span class="spinner"></span>
            </span>
        </p>
    </div>
    <?php
}
