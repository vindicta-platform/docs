/**
 * Developer Override Panel for Firebase Remote Config.
 * Allows local overriding of feature flags from the UI.
 * Only enabled in development or via specific flag.
 */
export class FeatureOverridePanel {
    constructor(flagsService) {
        this.flags = flagsService;
        this.container = null;
    }

    render() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'vindicta-flag-overrides';
        this.container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #121212;
            border: 1px solid var(--vindicta-gold, #ffd700);
            padding: 15px;
            z-index: 9999;
            color: #fff;
            font-family: monospace;
            font-size: 12px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            max-width: 300px;
        `;

        const title = document.createElement('h4');
        title.textContent = '🚩 Feature Overrides';
        title.style.margin = '0 0 10px 0';
        this.container.appendChild(title);

        const list = document.createElement('div');
        Object.keys(this.flags.remoteConfig.defaultConfig || {}).forEach(key => {
            if (key.startsWith('feat_')) {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.style.marginBottom = '5px';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = this.flags.isFeatureEnabled(key.replace('feat_', ''));
                checkbox.style.marginRight = '8px';

                checkbox.onchange = (e) => {
                    const enabled = e.target.checked;
                    console.log(`Overriding ${key} to ${enabled}`);
                    // Minimal implementation: override the method
                    const originalMethod = this.flags.isFeatureEnabled;
                    this.flags.isFeatureEnabled = (name) => {
                        if (key === `feat_${name}`) return enabled;
                        return originalMethod.call(this.flags, name);
                    };
                    // Dispatch change event
                    document.dispatchEvent(new CustomEvent('vindicta:flags:changed'));
                };

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(key.replace('feat_', '')));
                list.appendChild(label);
            }
        });

        this.container.appendChild(list);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => this.container.remove();
        closeBtn.style.marginTop = '10px';
        this.container.appendChild(closeBtn);

        document.body.appendChild(this.container);
    }
}
