/**
 * DASHBOARD CORE
 * T059: Manages resource visualization and ledger syncing.
 */

class Dashboard {
    constructor() {
        this.userBalanceEl = document.getElementById('userBalance');
        this.globalBalanceEl = document.getElementById('globalBalance');
        this.tankFillEl = document.getElementById('tankFill');
        this.tankPercentEl = document.getElementById('tankPercent');
        this.txListEl = document.getElementById('txList');

        this.init();
    }

    init() {
        // Initial Refresh
        this.refreshData();

        // Setup View Toggles
        document.getElementById('view-user').onclick = (e) => this.toggleView(e, 'user');
        document.getElementById('view-admin').onclick = (e) => this.toggleView(e, 'admin');
    }

    async refreshData() {
        // Mock data for initial structure validation
        // In Phase 6, this will fetch from /api/v1/economy/status
        const mockData = {
            userBalance: 145.50,
            globalBalance: 2450.75,
            tankMax: 5000,
            transactions: [
                { id: 'TX-8821', type: 'prediction', cost: 0.05, status: 'confirmed', ts: '2m ago', desc: 'Arbiter Analysis: Faction A vs B' },
                { id: 'TX-8820', type: 'funding', cost: 50.00, status: 'confirmed', ts: '1h ago', desc: 'Gas Tank Recharge: Credit Uplink' },
                { id: 'TX-8819', type: 'debate', cost: 0.12, status: 'confirmed', ts: '3h ago', desc: 'Vindicta Debate: Round 4 Resolution' },
                { id: 'TX-8818', type: 'simulation', cost: 0.01, status: 'confirmed', ts: 'Yesterday', desc: 'Monte Carlo Hardening Run' }
            ]
        };

        this.updateUI(mockData);
    }

    updateUI(data) {
        // Counter Animation for Balances
        this.animateValue(this.userBalanceEl, 0, data.userBalance, 1000);
        this.animateValue(this.globalBalanceEl, 0, data.globalBalance, 1500);

        // Tank Visualization
        const percent = Math.min(100, (data.globalBalance / data.tankMax) * 100);
        setTimeout(() => {
            this.tankFillEl.style.width = `${percent}%`;
            this.tankPercentEl.innerText = Math.round(percent);
        }, 500);

        // Transaction List
        this.txListEl.innerHTML = data.transactions.map(tx => `
            <div class="group flex items-center justify-between p-6 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div class="flex items-center gap-6">
                    <div class="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-gray-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                        ${tx.type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="text-white font-bold text-sm mb-1">${tx.desc}</div>
                        <div class="text-[10px] uppercase tracking-widest text-gray-600 font-black">${tx.id} • ${tx.ts}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="${tx.type === 'funding' ? 'text-green-500' : 'text-white'} font-black tracking-tighter text-lg">
                        ${tx.type === 'funding' ? '+' : '-'}$${tx.cost.toFixed(2)}
                    </div>
                    <div class="text-[8px] uppercase tracking-[0.2em] font-black text-gray-700">Ledger Verified</div>
                </div>
            </div>
        `).join('');
    }

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    toggleView(e, view) {
        // Update button states
        const userBtn = document.getElementById('view-user');
        const adminBtn = document.getElementById('view-admin');

        userBtn.classList.remove('active');
        adminBtn.classList.remove('active');
        e.target.classList.add('active');

        // Toggle content visibility based on data-view attribute
        document.querySelectorAll('[data-view]').forEach(section => {
            const sectionView = section.dataset.view;
            if (sectionView === 'all' || sectionView === view) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        // Show appropriate toast message
        if (view === 'admin') {
            if (typeof PortalUI !== 'undefined' && PortalUI.showToast) {
                PortalUI.showToast("Elevating Privileges: Accessing Arbiter Metrics");
            }
        } else {
            if (typeof PortalUI !== 'undefined' && PortalUI.showToast) {
                PortalUI.showToast("Standard User View Active");
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
