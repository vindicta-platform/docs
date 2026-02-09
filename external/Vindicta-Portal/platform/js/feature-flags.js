/**
 * Feature Flags UI Module
 * Vindicta-Portal Week 1 Foundation
 * 
 * Provides UI utilities for conditional feature rendering.
 */

/**
 * FeatureGate - Conditionally show/hide elements based on feature flags
 * 
 * ⚠️ SECURITY WARNING: This is CLIENT-SIDE ONLY.
 * 
 * These flags control VISUAL AIDS only (UI element visibility).
 * They are NOT secure - users can inspect/modify client-side code.
 * 
 * For secure feature gating (API access, data permissions, billing):
 * - Server-side validation is MANDATORY
 * - Do NOT rely on these flags for authorization
 * - Backend feature checks must be implemented separately
 * 
 * Server-side feature gating: DEFERRED (see Vindicta-API roadmap)
 */
class FeatureGate {

    /**
     * Initialize feature gates on all elements with data-feature attribute
     */
    static init() {
        const elements = document.querySelectorAll('[data-feature]');
        elements.forEach(el => FeatureGate.apply(el));

        console.log(`[FeatureGate] Applied to ${elements.length} elements`);
    }

    /**
     * Apply feature gate to a single element
     * @param {HTMLElement} element - Element to gate
     */
    static apply(element) {
        const featureName = element.dataset.feature;
        const invert = element.dataset.featureInvert === 'true';

        if (!featureName) return;

        const isEnabled = window.vindictaConfig?.isEnabled(featureName) ?? false;
        const shouldShow = invert ? !isEnabled : isEnabled;

        element.style.display = shouldShow ? '' : 'none';
        element.setAttribute('aria-hidden', !shouldShow);
    }

    /**
     * Check if feature is enabled (convenience wrapper)
     * @param {string} featureName - Feature flag name
     * @returns {boolean} Feature enabled status
     */
    static isEnabled(featureName) {
        return window.vindictaConfig?.isEnabled(featureName) ?? false;
    }

    /**
     * Refresh all feature gates after config update
     */
    static refresh() {
        FeatureGate.init();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for config to initialize first
        setTimeout(() => FeatureGate.init(), 100);
    });
} else {
    setTimeout(() => FeatureGate.init(), 100);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.FeatureGate = FeatureGate;
}
