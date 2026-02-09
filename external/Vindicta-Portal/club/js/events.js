/**
 * EVENTS PAGE CONTROLLER
 * Fix for Issue #2: Events page filter buttons non-functional
 * 
 * Handles filtering of event cards by type (tournament, game-night, hobby)
 */

class EventsFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.eventCards = document.querySelectorAll('.event-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleFilter(e) {
        const btn = e.currentTarget;
        const filterText = btn.textContent.toLowerCase();

        // Update active state on buttons
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Determine filter type from button text
        let filterType = 'all';
        if (filterText.includes('tournament')) {
            filterType = 'tournament';
        } else if (filterText.includes('game night')) {
            filterType = 'game-night';
        } else if (filterText.includes('hobby')) {
            filterType = 'hobby';
        }

        // Filter event cards
        this.eventCards.forEach(card => {
            if (filterType === 'all') {
                card.style.display = '';
            } else {
                const cardType = card.dataset.type || '';
                card.style.display = cardType === filterType ? '' : 'none';
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new EventsFilter();
});
