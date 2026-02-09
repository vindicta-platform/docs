document.addEventListener('DOMContentLoaded', () => {
    const specNav = document.getElementById('spec-nav');
    const specContent = document.getElementById('spec-content');
    const searchInput = document.getElementById('spec-search');

    // Store the original server-rendered content for the search functionality.
    const originalContent = specContent.innerHTML;
    let intersectionObserver;

    const setupScrollSpy = () => {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
        }

        const sections = Array.from(specContent.querySelectorAll('section[id^="section-"]'));
        const links = Array.from(specNav.querySelectorAll('a'));

        const onIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const correspondingLink = links.find(link => link.hash === `#${sectionId}`);

                    links.forEach(l => l.classList.remove('active'));
                    if (correspondingLink) {
                        correspondingLink.classList.add('active');
                    }
                }
            });
        };

        intersectionObserver = new IntersectionObserver(onIntersect, {
            rootMargin: '-40% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(section => intersectionObserver.observe(section));
    };

    const handleSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        specContent.innerHTML = originalContent;

        if (query === '') return;

        const regex = new RegExp(`(${query})`, 'gi');
        const textNodes = [];
        const walk = document.createTreeWalker(specContent, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            if (node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                textNodes.push(node);
            }
        }

        textNodes.forEach(node => {
            const text = node.nodeValue;
            if (text.toLowerCase().includes(query)) {
                const newNode = document.createElement('span');
                newNode.innerHTML = text.replace(regex, '<mark>$1</mark>');
                node.parentNode.replaceChild(newNode, node);
            }
        });
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- Initialization ---
    setupScrollSpy();
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    specNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetId = e.target.hash;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});
