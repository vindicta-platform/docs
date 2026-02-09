import { fetchAndActivate, getBoolean, getNumber, getString, getValue } from "firebase/remote-config";
import { setUserProperties, setUserId } from "firebase/analytics";

/**
 * Service to manage feature flags and remote configuration.
 * Wraps the Firebase Remote Config SDK to provide a consistent interface.
 */
export class FeatureFlagService {
    /**
     * @param {Object} remoteConfig - The initialized Firebase Remote Config instance.
     * @param {Object} defaults - Map of default values for configuration keys.
     * @param {Object} analytics - The initialized Firebase Analytics instance.
     */
    constructor(remoteConfig, defaults, analytics) {
        this.remoteConfig = remoteConfig;
        this.remoteConfig.defaultConfig = defaults;
        this.analytics = analytics;
        this.isInitialized = false;
    }

    /**
     * Sets the user ID for targeting.
     * @param {string} userId
     */
    setUserId(userId) {
        if (this.analytics) {
            setUserId(this.analytics, userId);
        }
    }

    /**
     * Sets user properties for targeting.
     * @param {Object} properties - Map of property keys and values.
     */
    setUserProperties(properties) {
        if (this.analytics) {
            setUserProperties(this.analytics, properties);
        }
    }

    /**
     * Fetches and activates remote configuration values.
     * @returns {Promise<boolean>} - True if activation was successful.
     */
    async initialize() {
        try {
            const activated = await fetchAndActivate(this.remoteConfig);
            this.isInitialized = true;
            return activated;
        } catch (error) {
            console.error("FeatureFlagService: Failed to fetch and activate remote config:", error);
            this.isInitialized = true; // Still marked as initialized to allow fallback to defaults
            return false;
        }
    }

    /**
     * Retrieves a boolean value for a given key.
     * @param {string} key - The configuration key.
     * @returns {boolean}
     */
    getBoolean(key) {
        return getBoolean(this.remoteConfig, key);
    }

    /**
     * Retrieves a numeric value for a given key.
     * @param {string} key - The configuration key.
     * @returns {number}
     */
    getNumber(key) {
        return getNumber(this.remoteConfig, key);
    }

    /**
     * Retrieves a string value for a given key.
     * @param {string} key - The configuration key.
     * @returns {string}
     */
    getString(key) {
        return getString(this.remoteConfig, key);
    }

    /**
     * Shorthand helper for checking if a feature flag is enabled.
     * @param {string} featureName - The name of the feature (e.g., 'new_dashboard').
     * @returns {boolean}
     */
    isFeatureEnabled(featureName) {
        const key = `feat_${featureName}_enabled`;
        return this.getBoolean(key);
    }

    /**
     * Creates a mock instance of FeatureFlagService for testing purposes.
     * @param {Object} overrides - Map of keys and their mocked values.
     * @returns {Object} - A mock FeatureFlagService.
     */
    static createMock(overrides = {}) {
        return {
            initialize: async () => true,
            getBoolean: (key) => overrides[key] ?? false,
            getNumber: (key) => overrides[key] ?? 0,
            getString: (key) => overrides[key] ?? '',
            isFeatureEnabled: (name) => overrides[`feat_${name}_enabled`] ?? false
        };
    }
}
