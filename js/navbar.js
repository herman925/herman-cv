/**
 * Global Navigation Bar Component
 * Renders a responsive navbar with active state handling and dynamic sections.
 * 
 * @param {Object} options
 * @param {string} options.activePage - The key of the current page ('counselling', 'project', 'education', 'technology')
 * @param {Array<{id: string, label: string}>} options.sections - Array of section links for the dropdown
 * @param {string} options.themeColor - Tailwind color name (e.g., 'emerald', 'rose')
 * @param {boolean} options.isDark - Whether the theme is dark mode (affects background/text colors)
 */
function initNavbar({ activePage, sections, themeColor, isDark = false }) {
    // Theme-dependent classes
    const colors = {
        bg: isDark ? 'bg-slate-900' : 'bg-white',
        bgScroll: isDark ? 'bg-slate-900/90' : 'bg-slate-50/90',
        textMain: isDark ? 'text-slate-100' : 'text-slate-900',
        textMuted: isDark ? 'text-slate-400' : 'text-slate-600',
        textHover: isDark ? `hover:text-${themeColor}-400` : `hover:text-${themeColor}-600`,
        textActive: isDark ? `text-${themeColor}-400` : `text-${themeColor}-600`,
        border: isDark ? `border-${themeColor}-500/30` : `border-${themeColor}-500/30`,
        logoBg: isDark ? 'bg-slate-800' : 'bg-white',
        dropdownBg: isDark ? 'bg-slate-900/95' : 'bg-slate-50/95',
        dropdownHover: isDark ? `hover:bg-${themeColor}-900/30` : `hover:bg-${themeColor}-100`,
        dropdownTextHover: isDark ? `hover:text-${themeColor}-400` : `hover:text-${themeColor}-800`,
        mobileBorder: isDark ? `border-${themeColor}-500/20` : `border-${themeColor}-500/20`,
    };

    const navLinks = [
        { href: 'education-culture.html', label: 'Education & Culture', key: 'education' },
        { href: 'counselling.html', label: 'Counselling', key: 'counselling' },
        { href: 'project-management.html', label: 'Project Management', key: 'project' },
        { href: 'technology.html', label: 'Technology', key: 'technology' }
    ];

    const renderLink = (link, isMobile = false) => {
        const isActive = activePage === link.key;
        const baseClass = isMobile ? "text-base font-medium transition-colors" : "text-sm font-medium transition-colors";
        const colorClass = isActive ? colors.textActive : `${colors.textMuted} ${colors.textHover}`;
        return `<a href="${link.href}" class="${baseClass} ${colorClass}"${isActive ? ' aria-current="page"' : ''}>${link.label}</a>`;
    };

    const navbarHTML = `
    <nav id="navbar" aria-label="Primary" class="navbar fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent">
        <div class="navbar-inner container mx-auto px-6 h-20 flex justify-between items-center">
            <a href="index.html"${activePage === 'home' ? ' aria-current="page"' : ''} class="navbar-brand flex items-center gap-3 group cursor-pointer">
                <span class="sr-only">Home — </span>
                <div class="navbar-brand-mark relative w-10 h-10 flex items-center justify-center ${colors.logoBg} border ${colors.border} rounded-lg overflow-hidden group-hover:border-${themeColor}-600 transition-colors">
                    <span class="font-mono font-bold text-${themeColor}-600 group-hover:animate-pulse">HC</span>
                    <div class="absolute inset-0 bg-${themeColor}-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span class="navbar-brand-name font-bold text-lg tracking-tight ${colors.textMain}">Herman<span class="text-${themeColor}-600">Chan</span></span>
            </a>

            <!-- Desktop Menu -->
            <div class="navbar-desktop hidden xl:flex items-center gap-6">
                ${navLinks.map(link => renderLink(link)).join('')}
                
                <!-- Local Sections Dropdown -->
                ${sections && sections.length > 0 ? `
                <div class="relative group ml-4">
                    <button id="sections-menu-btn" type="button" aria-expanded="false" aria-controls="sections-menu" class="flex items-center gap-1 text-sm font-medium ${colors.textMuted} ${colors.textHover} transition-colors px-3 py-2 rounded-md hover:bg-${themeColor}-500/10">
                        Sections <i data-lucide="chevron-down" class="w-4 h-4" aria-hidden="true"></i>
                    </button>
                    <div id="sections-menu" hidden class="sections-panel absolute right-0 mt-2 w-48 ${colors.dropdownBg} backdrop-blur-md border ${colors.border} rounded-lg shadow-xl transition-all transform origin-top-right z-50">
                        ${sections.map((section, index) => `
                            <a href="#${section.id}" class="block px-4 py-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} ${colors.dropdownHover} ${colors.dropdownTextHover} ${index === 0 ? 'first:rounded-t-lg' : ''} ${index === sections.length - 1 ? 'last:rounded-b-lg' : ''}">${section.label}</a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Mobile Menu Button -->
            <button type="button" id="mobile-menu-btn" class="inline-flex items-center justify-center min-w-[44px] min-h-[44px] xl:hidden ${colors.textMuted} ${colors.textHover} transition-colors" title="Toggle mobile menu" aria-label="Toggle mobile menu" aria-controls="mobile-menu" aria-expanded="false">
                <i data-lucide="menu" class="w-6 h-6" aria-hidden="true"></i>
            </button>
        </div>

        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" hidden data-lenis-prevent class="hidden xl:hidden ${colors.dropdownBg} backdrop-blur-md border-t ${colors.mobileBorder} absolute w-full left-0 top-20 shadow-xl">
            <div class="flex flex-col px-6 py-6 space-y-4">
                ${navLinks.map(link => renderLink(link, true)).join('')}
                
                ${sections && sections.length > 0 ? `
                <div class="border-t ${colors.mobileBorder} pt-4 mt-2">
                    <p class="text-xs font-mono text-${themeColor}-500 mb-2 uppercase tracking-wider">Sections</p>
                    ${sections.map(section => `
                        <a href="#${section.id}" class="block py-2 text-sm ${colors.textMuted} ${colors.textHover}">${section.label}</a>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    </nav>
    `;

    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        
        // Lucide downloads without blocking the HTML parser.
        const renderIcons = () => {
            if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderIcons, { once: true });
        else renderIcons();

        // Setup Listeners
        const closeMobile = setupNavDisclosure('mobile-menu-btn', 'mobile-menu', true);
        const closeSections = setupNavDisclosure('sections-menu-btn', 'sections-menu');
        setupNavbarLayout(closeMobile, closeSections);
        setupScrollEffect(colors.bgScroll);
    } else {
        console.error('Navbar container not found');
    }
}

// Site navigation is a disclosure, not an application menu: ordinary Tab order stays intact.
function setupNavDisclosure(buttonId, panelId, hasIcon = false) {
    const button = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    if (!button || !panel) return () => {};
    const isOpen = () => button.getAttribute('aria-expanded') === 'true';
    function setOpen(open, restoreFocus = false) {
        panel.hidden = !open;
        if (hasIcon) panel.classList.toggle('hidden', !open);
        button.setAttribute('aria-expanded', String(open));
        if (hasIcon) {
            button.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}" class="w-6 h-6" aria-hidden="true"></i>`;
            if (window.lucide) lucide.createIcons();
        }
        if (restoreFocus) button.focus({ preventScroll: true });
    }
    button.addEventListener('click', () => setOpen(!isOpen()));
    panel.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        setOpen(false);
        if (link.getAttribute('href').startsWith('#')) {
            const target = document.getElementById(link.hash.slice(1));
            if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isOpen()) { event.preventDefault(); setOpen(false, true); }
    });
    document.addEventListener('pointerdown', event => {
        if (isOpen() && !panel.contains(event.target) && !button.contains(event.target)) {
            setOpen(false, panel.contains(document.activeElement));
        }
    });
    document.addEventListener('focusin', event => {
        if (isOpen() && !panel.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    return () => setOpen(false);
}

function setupNavbarLayout(closeMobile, closeSections) {
    const nav = document.getElementById('navbar');
    const row = nav.querySelector('.navbar-inner');
    const desktop = nav.querySelector('.navbar-desktop');
    const brand = nav.querySelector('.navbar-brand');
    let pending = false;
    function measure() {
        pending = false;
        document.documentElement.classList.toggle('text-enlarged', parseFloat(getComputedStyle(document.documentElement).fontSize) > 16);
        nav.classList.add('nav-measuring');
        const style = getComputedStyle(row);
        const needed = brand.scrollWidth + desktop.scrollWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 24;
        nav.classList.remove('nav-measuring');
        nav.classList.toggle('nav-collapsed', needed > row.clientWidth);
        document.documentElement.style.setProperty('--nav-block-size', row.getBoundingClientRect().height + 'px');
        if (!document.getElementById('mobile-menu-btn').getClientRects().length) closeMobile();
        if (!document.getElementById('sections-menu-btn')?.getClientRects().length) closeSections();
    }
    function queueMeasure() {
        if (!pending) { pending = true; requestAnimationFrame(measure); }
    }
    window.addEventListener('resize', queueMeasure);
    if (window.ResizeObserver) {
        const observer = new ResizeObserver(queueMeasure);
        [row, brand, desktop].forEach(element => observer.observe(element));
    }
    if (document.fonts?.ready) document.fonts.ready.then(queueMeasure);
    measure();
}

function setupScrollEffect(bgClass) {
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        // Extract classes to add/remove
        // bgClass might be "bg-slate-900/90"
        
        if (window.scrollY > 50) {
            navbar.classList.add(...bgClass.split(' '), 'backdrop-blur-md', 'shadow-lg');
        } else {
            navbar.classList.remove(...bgClass.split(' '), 'backdrop-blur-md', 'shadow-lg');
        }
    });
}
