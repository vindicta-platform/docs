/**
 * GRADER PAGE CONTROLLER
 * T005: Wires up grader page interactivity with Firebase feature flags
 */

import { gradeArmyList, getGradeColor } from '../../assets/js/grader-service.js';

class GraderController {
    constructor() {
        // DOM elements
        this.form = document.getElementById('grader-form');
        this.listInput = document.getElementById('list-input');
        this.fileInput = document.getElementById('file-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.resultsPanel = document.getElementById('results-panel');
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.gradeResult = document.getElementById('grade-result');

        this.isLoading = false;
        this.init();
    }

    init() {
        // Check feature flag before enabling
        this.checkFeatureFlag();

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // File input handler
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Character counter
        if (this.listInput) {
            this.listInput.addEventListener('input', () => this.updateCharCount());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearForm());
        }
    }

    async checkFeatureFlag() {
        // Wait for Firebase flags to load
        if (typeof window.vindictaFlags === 'undefined') {
            document.addEventListener('vindicta:flags:ready', () => {
                this.applyFeatureFlags();
            });
        } else {
            this.applyFeatureFlags();
        }
    }

    applyFeatureFlags() {
        const graderEnabled = window.vindictaFlags?.getValue('FEATURE_LIST_GRADER');

        if (graderEnabled === false) {
            this.showDisabledState();
        }
    }

    showDisabledState() {
        const mainContent = document.querySelector('.grader-main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="feature-disabled">
                    <h2>🚧 Coming Soon</h2>
                    <p>The List Grader is currently in development. Check back soon!</p>
                </div>
            `;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const listText = this.listInput?.value?.trim();

        // Validate input
        if (!listText) {
            this.showError('Please enter an army list to grade');
            return;
        }

        if (listText.length < 20) {
            this.showError('Army list appears too short. Please enter a complete list.');
            return;
        }

        await this.gradeList(listText);
    }

    async handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const validExtensions = ['.ros', '.rosz', '.xml', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(ext)) {
            this.showError('Please upload a .ros, .rosz, .xml, or .txt file');
            return;
        }

        try {
            let text;

            if (ext === '.rosz') {
                // Handle compressed roster files
                this.showError('Compressed .rosz files require extraction. Please use .ros or .xml format.');
                return;
            }

            text = await file.text();

            if (this.listInput) {
                this.listInput.value = text;
                this.updateCharCount();
            }
        } catch (error) {
            this.showError('Failed to read file: ' + error.message);
        }
    }

    async gradeList(listText) {
        this.setLoading(true);
        this.hideError();
        this.hideResults();

        try {
            const result = await gradeArmyList(listText);

            if (!result.success) {
                this.showError(result.error);
                return;
            }

            this.showResults(result);
        } catch (error) {
            console.error('Grading error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isLoading = loading;

        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            this.submitBtn.textContent = loading ? 'Analyzing...' : 'Grade My List';
        }

        if (this.loadingState) {
            this.loadingState.style.display = loading ? 'flex' : 'none';
        }
    }

    showResults(result) {
        if (!this.resultsPanel || !this.gradeResult) return;

        const gradeColor = getGradeColor(result.grade);

        this.gradeResult.innerHTML = `
            <div class="grade-display">
                <div class="grade-badge" style="background: ${gradeColor}">
                    ${result.grade}
                </div>
                <div class="grade-score">${result.score}/100</div>
                <div class="grade-tier">${result.tier} tier</div>
            </div>

            <div class="grade-summary">
                <h3>Analysis Summary</h3>
                <p>${result.summary}</p>
            </div>

            <div class="parsed-info">
                <span class="info-badge">📋 ${result.parsedList.faction || 'Unknown Faction'}</span>
                <span class="info-badge">⚔️ ${result.parsedList.unitCount} units</span>
                <span class="info-badge">🎯 ${result.parsedList.points} pts</span>
            </div>

            <details class="analysis-details">
                <summary>View Detailed Analysis</summary>
                
                <div class="strengths-weaknesses">
                    <div class="strengths">
                        <h4>✅ Strengths</h4>
                        <ul>
                            ${result.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="weaknesses">
                        <h4>⚠️ Weaknesses</h4>
                        <ul>
                            ${result.weaknesses.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="matchups">
                    <h4>Matchup Predictions</h4>
                    <div class="matchup-grid">
                        <div class="favorable">
                            <h5>Favorable</h5>
                            ${result.matchups.favorable.map(m => `
                                <div class="matchup-card favorable">
                                    <span class="faction">${m.faction}</span>
                                    <span class="probability">${m.winProbability}%</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="unfavorable">
                            <h5>Challenging</h5>
                            ${result.matchups.unfavorable.map(m => `
                                <div class="matchup-card unfavorable">
                                    <span class="faction">${m.faction}</span>
                                    <span class="probability">${m.winProbability}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="recommendations">
                    <h4>💡 Recommendations</h4>
                    <ul>
                        ${result.recommendations.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </details>
        `;

        this.resultsPanel.style.display = 'block';
        this.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideResults() {
        if (this.resultsPanel) {
            this.resultsPanel.style.display = 'none';
        }
    }

    showError(message) {
        if (this.errorState) {
            this.errorState.textContent = message;
            this.errorState.style.display = 'block';
        }
    }

    hideError() {
        if (this.errorState) {
            this.errorState.style.display = 'none';
        }
    }

    updateCharCount() {
        const counter = document.getElementById('char-count');
        if (counter && this.listInput) {
            counter.textContent = `${this.listInput.value.length} characters`;
        }
    }

    clearForm() {
        if (this.listInput) {
            this.listInput.value = '';
            this.updateCharCount();
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        this.hideResults();
        this.hideError();
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new GraderController();
});
