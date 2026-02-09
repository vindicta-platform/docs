/**
 * Default values for Firebase Remote Config.
 * These are used as fallbacks when remote values cannot be fetched.
 * @see specs/001-firebase-remote-config/data-model.md
 */
export const REMOTE_CONFIG_DEFAULTS = {
    // Feature Flags
    feat_new_dashboard_enabled: false,
    feat_warscribe_beta_enabled: false,
    feat_platform_analytics_enabled: false,

    // Configuration Values
    conf_upload_limit_mb: 50,
    conf_cache_ttl_minutes: 60,

    // UI Variants
    ui_cta_button_variant: 'default',
    ui_theme_mode: 'dark'
};
