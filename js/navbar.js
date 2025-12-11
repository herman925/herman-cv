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
        { href: 'counselling.html', label: 'Counselling', key: 'counselling' },
        { href: 'project-management.html', label: 'Project Management', key: 'project' },
        { href: 'education-culture.html', label: 'Education & Culture', key: 'education' },
        { href: 'technology.html', label: 'Technology', key: 'technology' }
    ];

    const renderLink = (link, isMobile = false) => {
        const isActive = activePage === link.key;
        const baseClass = isMobile ? "text-base font-medium transition-colors" : "text-sm font-medium transition-colors";
        const colorClass = isActive ? colors.textActive : `${colors.textMuted} ${colors.textHover}`;
        return `<a href="${link.href}" class="${baseClass} ${colorClass}">${link.label}</a>`;
    };

    const navbarHTML = `
    <nav id="navbar" class="navbar fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent">
        <div class="navbar-inner container mx-auto px-6 h-20 flex justify-between items-center">
            <a href="index.html" class="flex items-center gap-3 group cursor-pointer">
                <div class="relative w-10 h-10 flex items-center justify-center ${colors.logoBg} border ${colors.border} rounded-lg overflow-hidden group-hover:border-${themeColor}-600 transition-colors">
                    <span class="font-mono font-bold text-${themeColor}-600 group-hover:animate-pulse">HC</span>
                    <div class="absolute inset-0 bg-${themeColor}-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span class="font-bold text-lg tracking-tight ${colors.textMain}">Herman<span class="text-${themeColor}-600">Chan</span></span>
            </a>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center gap-8">
                ${navLinks.map(link => renderLink(link)).join('')}
                
                <!-- Local Sections Dropdown -->
                ${sections && sections.length > 0 ? `
                <div class="relative group ml-4">
                    <button class="flex items-center gap-1 text-sm font-medium ${colors.textMuted} ${colors.textHover} transition-colors px-3 py-2 rounded-md hover:bg-${themeColor}-500/10">
                        Sections <i data-lucide="chevron-down" class="w-4 h-4"></i>
                    </button>
                    <div class="absolute right-0 mt-2 w-48 ${colors.dropdownBg} backdrop-blur-md border ${colors.border} rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                        ${sections.map((section, index) => `
                            <a href="#${section.id}" class="block px-4 py-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'} ${colors.dropdownHover} ${colors.dropdownTextHover} ${index === 0 ? 'first:rounded-t-lg' : ''} ${index === sections.length - 1 ? 'last:rounded-b-lg' : ''}">${section.label}</a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="md:hidden ${colors.textMuted} ${colors.textHover} transition-colors focus:outline-none" title="Toggle mobile menu">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>

        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" class="hidden md:hidden ${colors.dropdownBg} backdrop-blur-md border-t ${colors.mobileBorder} absolute w-full left-0 top-20 shadow-xl">
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
        
        // Initialize Icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }

        // Setup Listeners
        setupMobileMenu();
        setupScrollEffect(colors.bgScroll);
    } else {
        console.error('Navbar container not found');
    }
}

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            const icon = btn.querySelector('i');
            if (menu.classList.contains('hidden')) {
                icon.setAttribute('data-lucide', 'menu');
            } else {
                icon.setAttribute('data-lucide', 'x');
            }
            lucide.createIcons();
        });
    }
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
