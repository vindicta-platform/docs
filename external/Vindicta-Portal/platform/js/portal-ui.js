/**
 * PORTAL UI LIBRARY
 * T059: Shared components for the Vindicta Portal.
 * Focuses on maintenance and premium aesthetics.
 */

class PortalUI {
    static init() {
        this.injectHeader();
        this.injectFooter();
        this.setupDashboardLinks();
    }

    static injectHeader() {
        const header = document.getElementById('portal-header');
        if (!header) return;

        header.innerHTML = `
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 flex items-center justify-center font-black text-black" style="background: var(--vindicta-gold); border-radius: var(--radius-sm);">V</div>
                    <h1 class="text-2xl font-black tracking-tighter text-white uppercase hidden md:block">Vindicta <span style="color: var(--vindicta-gold);">Portal</span></h1>
                </div>
                <nav class="flex items-center gap-4 md:gap-8">
                    <a href="/platform/index.html" class="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Home</a>
                    <a href="/platform/dashboard.html" class="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Dashboard</a>
                    <a href="/platform/warscribe.html" class="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Warscribe</a>
                    <div class="h-8 w-[1px] bg-gray-700 hidden md:block"></div>
                    <div class="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                        <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="text-[10px] uppercase tracking-widest font-black text-gray-300">Core Active</span>
                    </div>
                </nav>
            </div>
        `;
        header.className = "fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300";
    }


    static injectFooter() {
        const footer = document.getElementById('portal-footer');
        if (!footer) return;

        footer.innerHTML = `
            <div class="container mx-auto px-6 py-12">
                <div class="grid md:grid-cols-4 gap-12 mb-12">
                    <div class="col-span-2">
                        <div class="text-2xl font-black tracking-tighter text-white uppercase mb-4">VINDICTA <span style="color: var(--vindicta-gold);">PORTAL</span></div>
                        <p class="text-gray-500 max-w-sm leading-relaxed">
                            The definitive AI-backed ecosystem for competitive tabletop strategy.
                            Built for the Long Island competitive scene, scaled for the galaxy.
                        </p>
                    </div>
                    <div>
                        <h4 class="text-white font-bold uppercase tracking-widest text-xs mb-6">Sub-Systems</h4>
                        <ul class="space-y-4 text-sm text-gray-500">
                            <li><a href="#" class="hover:text-amber-500 transition-colors" style="--hover-color: var(--vindicta-gold);">Meta-Oracle</a></li>
                            <li><a href="#" class="hover:text-amber-500 transition-colors" style="--hover-color: var(--vindicta-gold);">Gas Tank</a></li>
                            <li><a href="#" class="hover:text-amber-500 transition-colors" style="--hover-color: var(--vindicta-gold);">WARScribe</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-white font-bold uppercase tracking-widest text-xs mb-6">Platform</h4>
                        <ul class="space-y-4 text-sm text-gray-500">
                            <li><a href="/docs" class="hover:text-amber-500 transition-colors">API Docs</a></li>
                            <li><a href="/club/" class="hover:text-amber-500 transition-colors">The Club</a></li>
                        </ul>
                    </div>
                </div>
                <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-[10px] text-gray-600 uppercase tracking-widest">&copy; 2026 VINDICTA. ALL RIGHTS RESERVED.</p>
                    <div class="flex gap-6">
                        <span class="text-[10px] uppercase tracking-widest font-bold" style="color: var(--vindicta-gold-dim);">UNOFFICIAL / THIRD-PARTY PLATFORM</span>
                    </div>
                </div>

            </div>
        `;
    }

    static setupDashboardLinks() {
        // Prevent default on locked items
        document.querySelectorAll('.locked-cursor').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast("System Segment Restricted: Under Construction");
            });
        });
    }

    static showToast(message) {
        let toast = document.getElementById('portal-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'portal-toast';
            toast.className = "fixed bottom-8 right-8 z-[100] text-black font-black uppercase text-xs tracking-widest px-6 py-4 transition-all translate-y-20 opacity-0";
            toast.style.background = "var(--vindicta-gold)";
            toast.style.borderRadius = "var(--radius-md)";
            toast.style.boxShadow = "var(--vindicta-gold-glow)";
            document.body.appendChild(toast);
        }


        toast.innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => PortalUI.init());
