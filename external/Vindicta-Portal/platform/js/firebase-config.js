/**
 * Firebase Remote Config Module
 * Vindicta-Portal Week 1 Foundation
 * 
 * Provides feature flag management via Firebase Remote Config.
 * Per Platform Constitution Art. I: Uses vindicta-warhammer project only.
 */

// Firebase configuration (vindicta-warhammer project)
const firebaseConfig = {
    apiKey: "AIzaSyBqjGDVHqe8WwHTDdepvZjqDj7fmLnxbTY",
    authDomain: "vindicta-warhammer.firebaseapp.com",
    projectId: "vindicta-warhammer",
    storageBucket: "vindicta-warhammer.firebasestorage.app",
    messagingSenderId: "958513869571",
    appId: "1:958513869571:web:4d1b4d9b0a0b0c0d0e0f0g"
};

// Feature flag defaults (used when offline or config unavailable)
const DEFAULT_FLAGS = {
    'feature_list_grader': false,
    'feature_meta_snapshot': false,
    'feature_upset_detector': false,
    'feature_game_tracker': false,
    'feature_primordia_overlay': false,
    'maintenance_mode': false,
    'beta_features_enabled': false
};

/**
 * VindictaConfig - Feature Flag Manager
 */
class VindictaConfig {
    constructor() {
        this._initialized = false;
        this._remoteConfig = null;
        this._flags = { ...DEFAULT_FLAGS };
    }

    /**
     * Initialize Firebase and Remote Config
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        if (this._initialized) {
            console.log('[VindictaConfig] Already initialized');
            return true;
        }

        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.warn('[VindictaConfig] Firebase SDK not loaded, using defaults');
                this._initialized = true;
                return true;
            }

            // Initialize Firebase app if not already
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            // Get Remote Config instance
            this._remoteConfig = firebase.remoteConfig();

            // Set minimum fetch interval (12 hours for production)
            this._remoteConfig.settings = {
                minimumFetchIntervalMillis: 43200000 // 12 hours
            };

            // Set defaults
            this._remoteConfig.defaultConfig = DEFAULT_FLAGS;

            // Fetch and activate
            await this._remoteConfig.fetchAndActivate();

            // Update local flags from remote
            this._syncFlags();

            this._initialized = true;
            console.log('[VindictaConfig] Initialized successfully');
            return true;

        } catch (error) {
            console.error('[VindictaConfig] Init failed:', error);
            this._initialized = true; // Continue with defaults
            return false;
        }
    }

    /**
     * Sync flags from Remote Config to local cache
     */
    _syncFlags() {
        if (!this._remoteConfig) return;

        Object.keys(DEFAULT_FLAGS).forEach(key => {
            const value = this._remoteConfig.getValue(key);
            if (typeof DEFAULT_FLAGS[key] === 'boolean') {
                this._flags[key] = value.asBoolean();
            } else if (typeof DEFAULT_FLAGS[key] === 'number') {
                this._flags[key] = value.asNumber();
            } else {
                this._flags[key] = value.asString();
            }
        });
    }

    /**
     * Check if a feature is enabled
     * @param {string} flagName - Feature flag name
     * @returns {boolean} Feature enabled status
     */
    isEnabled(flagName) {
        return this._flags[flagName] ?? false;
    }

    /**
     * Get a config value
     * @param {string} key - Config key
     * @returns {*} Config value
     */
    getValue(key) {
        return this._flags[key];
    }

    /**
     * Get all feature flags
     * @returns {Object} All flags
     */
    getAllFlags() {
        return { ...this._flags };
    }

    /**
     * Force refresh from Remote Config
     * @returns {Promise<boolean>} Success status
     */
    async refresh() {
        if (!this._remoteConfig) {
            console.warn('[VindictaConfig] Cannot refresh - not initialized with Remote Config');
            return false;
        }

        try {
            await this._remoteConfig.fetchAndActivate();
            this._syncFlags();
            console.log('[VindictaConfig] Refreshed successfully');
            return true;
        } catch (error) {
            console.error('[VindictaConfig] Refresh failed:', error);
            return false;
        }
    }
}

// Global singleton instance
const vindictaConfig = new VindictaConfig();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => vindictaConfig.init());
} else {
    vindictaConfig.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.vindictaConfig = vindictaConfig;
}
