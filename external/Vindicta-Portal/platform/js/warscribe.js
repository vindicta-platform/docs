document.addEventListener('DOMContentLoaded', () => {
    fetchSpecData();
    setupRecorder();
});

const MOCK_SPEC = {
    version_string: "2.1.0-STABLE",
    sections: [
        {
            id: 101,
            title: "Core Protocol",
            rules: [
                { content_type: "header", content: "WARScribe Recordation Protocol" },
                { content_type: "paragraph", content: "WARScribe is the definitive notation standard for the Vindicta ecosystem. It bridge the gap between human tactical intent and AI analytical processing." },
                { content_type: "sub_header", content: "The Golden Rule" },
                { content_type: "paragraph", content: "Every action must be recorded using the [TAG: Action] format. Ambiguity is the enemy of precision." }
            ]
        },
        {
            id: 104,
            title: "Syntax Library",
            rules: [
                { content_type: "header", content: "Operational Tags" },
                { content_type: "sub_header", content: "Movement" },
                { content_type: "list", content: "MOVE: Unit -> Destination\nADVANCE: Unit -> Increase Distance\nCHARGE: Unit -> Target" },
                { content_type: "sub_header", content: "Combat" },
                { content_type: "list", content: "SHOOT: Attacker -> Target\nMELEE: Attacker -> Target\nCASUALTY: Unit [-Count]" }
            ]
        },
        {
            id: 106,
            title: "Glossary",
            rules: [
                { content_type: "header", content: "Terms of Engagement" },
                { content_type: "list", content: "Arbiter: The supreme AI analytical node.\nGas Tank: The operational currency for high-intensity processing.\nPortal: The unified interface for Vindicta systems." }
            ]
        }
    ]
};

async function fetchSpecData() {
    // Check for explicit "force mocks" signal (URL param ?mock or localStorage flag)
    const forceMocks = new URLSearchParams(window.location.search).has('mock') ||
        localStorage.getItem('VINDICTA_FORCE_MOCKS') === 'true';

    if (forceMocks) {
        console.log('WARScribe: Force Mock Mode active.');
        renderSpec(MOCK_SPEC);
        if (typeof PortalUI !== 'undefined') {
            PortalUI.showToast("Dev Mode: Forcing Mock Specification");
        }
        return;
    }

    try {
        const response = await fetch('/api/v1/spec');

        // Handle failed or denied (403/404/500)
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const spec = await response.json();
        renderSpec(spec);
    } catch (error) {
        console.warn(`WARScribe: Connection failed (${error.message}). Falling back to mocks.`);
        renderSpec(MOCK_SPEC);

        // Notify user via PortalUI
        if (typeof PortalUI !== 'undefined') {
            PortalUI.showToast("Offline Mode: Loading Embedded Specification");
        }
    }
}

function renderSpec(spec) {
    // 1. Render Version
    document.getElementById('spec-version-display').textContent = `v${spec.version_string} (Latest)`;
    document.title = `WARScribe Specification v${spec.version_string} | Vindicta Platform`;

    // 2. Render Sidebar Navigation
    const navList = document.getElementById('spec-nav-list');
    navList.innerHTML = spec.sections.map(section => `
        <li>
            <a href="#section-${section.id}" class="sidebar-link block border-l-2 border-transparent pl-4 py-1 text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                ${section.title}
            </a>
        </li>
    `).join('');

    // 3. Render Main Content
    const contentContainer = document.getElementById('spec-sections-container');
    contentContainer.innerHTML = spec.sections.map(section => renderSection(section)).join('');

    // 4. Initialize ScrollSpy (Re-attach event listeners)
    initScrollSpy();
}

function renderSection(section) {
    let contentHtml = '';

    // Special Rendering: Syntax Library (ID 104)
    if (section.id === 104) {
        contentHtml = renderSyntaxLibrary(section);
    }
    // Special Rendering: Glossary (ID 106)
    else if (section.id === 106) {
        contentHtml = renderGlossary(section);
    }
    // Standard Rendering
    else {
        contentHtml = section.rules.map(rule => renderRule(rule)).join('');
    }

    return `
        <section id="section-${section.id}" class="scroll-mt-20 mb-16">
            <div class="p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
                ${contentHtml}
            </div>
        </section>
    `;
}

function renderRule(rule) {
    switch (rule.content_type) {
        case 'header':
            return `<h2 class="text-3xl font-bold text-white !mt-0">${rule.content}</h2>`;
        case 'sub_header':
            return `<h3 class="text-2xl font-bold text-yellow-400 mt-8 mb-2">${rule.content}</h3>`;
        case 'paragraph':
            return `<p class="mt-2 text-lg text-gray-400">${rule.content}</p>`;
        case 'list':
            return `
                <ul class="mt-4 space-y-2 list-disc list-inside text-gray-300 text-lg">
                    ${rule.content.split('\n').map(item => `<li>${item}</li>`).join('')}
                </ul>`;
        case 'code':
            return `<pre class="mt-4 rounded-lg border border-gray-700 p-4 bg-gray-900/50"><code class="font-mono text-white">${rule.content}</code></pre>`;
        default:
            return '';
    }
}

function renderSyntaxLibrary(section) {
    // Extract subheaders (Tabs)
    const tabs = section.rules.filter(r => r.content_type === 'sub_header');

    // Header
    let html = `<h2 class="text-3xl font-bold text-white !mt-0">${section.rules[0].content}</h2>`;

    // Tabs Container (AlpineJS x-data logic embedded in HTML string)
    html += `<div class="mt-4" x-data="{ activeTab: 0 }">`;

    // Tab Headers
    html += `<div class="border-b border-gray-700"><nav class="-mb-px flex space-x-8" aria-label="Tabs">`;
    tabs.forEach((rule, index) => {
        html += `
            <button @click="activeTab = ${index}" :class="{ 'active': activeTab === ${index} }"
                class="tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg text-gray-400 hover:text-white border-transparent"
                :class="activeTab === ${index} ? 'border-yellow-400 text-yellow-400' : ''">
                ${rule.content}
            </button>`;
    });
    html += `</nav></div>`;

    // Tab Contents
    html += `<div class="mt-6">`;
    // We need to match content to tabs. Assuming structure: Header -> List -> Header -> List
    // Logic: Find the sub_header, then look for the next rule.
    tabs.forEach((rule, index) => {
        // Find index of this rule in the main list
        const ruleIndex = section.rules.indexOf(rule);
        const contentRule = section.rules[ruleIndex + 1]; // Assume next is content

        let listHtml = '';
        if (contentRule && contentRule.content_type === 'list') {
            listHtml = `<ul class="space-y-3">
                ${contentRule.content.split('\n').map(item => {
                const [code, desc] = item.split(': ');
                return `<li class="flex items-baseline">
                        <code class="font-mono text-yellow-400 bg-gray-700 p-1 rounded-md text-base">${code}</code>
                        <span class="ml-4 text-gray-300">${desc || ''}</span>
                    </li>`;
            }).join('')}
            </ul>`;
        }

        html += `
            <div x-show="activeTab === ${index}" class="tab-content" :class="{ 'active': activeTab === ${index} }">
                ${listHtml}
            </div>`;
    });
    html += `</div></div>`; // Close tabs-content and x-data
    return html;
}

function renderGlossary(section) {
    // Header
    let html = `<h2 class="text-3xl font-bold text-white !mt-0">${section.rules[0].content}</h2>`;

    // Content (assuming rule[1] is the list)
    const listRule = section.rules[1];
    if (listRule && listRule.content_type === 'list') {
        html += `<dl class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">`;
        listRule.content.split('\n').forEach(item => {
            const [term, def] = item.split(': ');
            html += `
                <div class="relative">
                    <dt><p class="font-mono text-lg font-semibold text-yellow-400">${term}</p></dt>
                    <dd class="mt-1 text-base text-gray-400">${def || ''}</dd>
                </div>`;
        });
        html += `</dl>`;
    }
    return html;
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#spec-nav-list a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// --- Game Log Recorder Logic ---

function setupRecorder() {
    const input = document.getElementById('log-input');
    const submitBtn = document.getElementById('submit-log');
    const status = document.getElementById('log-status');
    const indicator = document.getElementById('validation-indicator');

    input.addEventListener('input', () => {
        const isValid = validateInput(input.value);
        updateValidationUI(isValid, indicator);
        submitBtn.disabled = !isValid;
    });

    submitBtn.addEventListener('click', async () => {
        if (!validateInput(input.value)) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        status.textContent = '';

        try {
            await submitGameLog(input.value);
            status.textContent = 'Log submitted successfully!';
            status.className = 'text-green-400 font-mono text-sm';
            input.value = ''; // Clear input
            updateValidationUI(false, indicator); // Reset state
        } catch (err) {
            console.error(err);
            status.textContent = 'Error: ' + err.message;
            status.className = 'text-red-400 font-mono text-sm';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Log';
        }
    });
}

function validateInput(text) {
    if (!text || !text.trim()) return false;
    const lines = text.trim().split('\n');
    // Basic Rule: Must start with 3+ Uppercase letters, colon, space.
    return lines.every(line => /^[A-Z]{3,}: .+$/.test(line));
}

function updateValidationUI(isValid, indicator) {
    if (isValid) {
        indicator.textContent = 'VALID SYNTAX';
        indicator.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-green-500/20 text-green-400 transition-colors duration-300';
    } else {
        indicator.textContent = 'INVALID / EMPTY';
        indicator.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 transition-colors duration-300';
    }
}

async function submitGameLog(text) {
    const res = await fetch('/api/v1/gamelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_text: text })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ? JSON.stringify(err.detail) : 'Submission Failed');
    }
    return await res.json();
}
