<?php
/**
 * Plugin Name:       Artus Engineering DSGVO Cookie-Banner
 * Plugin URI:        https://github.com/artus-engineering/react-gdpr-consent-banner
 * Description:       Ein anpassbares DSGVO-Cookie-Banner auf React-Basis. Cookie-Anbieter, Designs und Integrationen (GA4, GTM, Facebook Pixel) werden direkt im WordPress-Adminbereich verwaltet.
 * Version:           1.0.1
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            Artus Engineering GmbH
 * Author URI:        https://artus-engineering.de
 * License:           ISC
 * Text Domain:       react-gdpr-cookie-consent
 * Domain Path:       /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RGCC_VERSION', '1.0.0');
define('RGCC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RGCC_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once RGCC_PLUGIN_DIR . 'includes/defaults.php';
require_once RGCC_PLUGIN_DIR . 'includes/settings.php';
require_once RGCC_PLUGIN_DIR . 'includes/frontend-links.php';
require_once RGCC_PLUGIN_DIR . 'includes/admin-page.php';

function rgcc_admin_menu(): void {
    add_options_page(
        __('Cookie-Einwilligung', 'react-gdpr-cookie-consent'),
        __('Cookie-Einwilligung', 'react-gdpr-cookie-consent'),
        'manage_options',
        'rgcc-settings',
        'rgcc_render_admin_page'
    );
}
add_action('admin_menu', 'rgcc_admin_menu');

function rgcc_admin_enqueue(string $hook): void {
    if ($hook !== 'settings_page_rgcc-settings') {
        return;
    }

    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    wp_enqueue_style(
        'rgcc-admin',
        RGCC_PLUGIN_URL . 'assets/css/admin.css',
        [],
        RGCC_VERSION
    );

    wp_enqueue_script(
        'rgcc-admin',
        RGCC_PLUGIN_URL . 'assets/js/admin.js',
        ['jquery', 'wp-color-picker'],
        RGCC_VERSION,
        true
    );
}
add_action('admin_enqueue_scripts', 'rgcc_admin_enqueue');

function rgcc_enqueue_frontend(): void {
    if (is_admin()) {
        return;
    }

    $js_file = RGCC_PLUGIN_DIR . 'assets/js/cookie-consent-banner.js';
    if (!file_exists($js_file)) {
        return;
    }

    wp_enqueue_script(
        'rgcc-cookie-consent',
        RGCC_PLUGIN_URL . 'assets/js/cookie-consent-banner.js',
        [],
        RGCC_VERSION,
        true
    );

    $config = rgcc_build_frontend_config();
    wp_localize_script('rgcc-cookie-consent', 'cookieConsentConfig', $config);
}
add_action('wp_enqueue_scripts', 'rgcc_enqueue_frontend');

function rgcc_activate(): void {
    $defaults = rgcc_get_default_config();

    if (get_option('rgcc_general') === false) {
        add_option('rgcc_general', $defaults['general']);
    }
    if (get_option('rgcc_theme') === false) {
        add_option('rgcc_theme', $defaults['theme']);
    }
    if (get_option('rgcc_integrations') === false) {
        add_option('rgcc_integrations', $defaults['integrations']);
    }
    if (get_option('rgcc_providers') === false) {
        add_option('rgcc_providers', $defaults['providers']);
    }
}
register_activation_hook(__FILE__, 'rgcc_activate');

function rgcc_settings_link(array $links): array {
    $settings_link = sprintf(
        '<a href="%s">%s</a>',
        admin_url('options-general.php?page=rgcc-settings'),
        __('Einstellungen', 'react-gdpr-cookie-consent')
    );
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'rgcc_settings_link');
