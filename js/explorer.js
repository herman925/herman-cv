/**
 * File Explorer Logic for Technology Facet
 * Handles navigation, rendering, and interaction for the "Digital Ecosystem" file explorer.
 */

const explorerData = {
    name: 'root', type: 'folder', children: [
        { name: 'Recent Work', type: 'folder', icon: 'clock-3', description: 'Current platforms, ventures and developer tools', children: [
            { id: 'hualong-platform', type: 'file', fileType: 'mobile' },
            { id: 'equalplay', type: 'file', fileType: 'web' },
            { id: 'equalplay-conversion', type: 'file', fileType: 'python' },
            { id: 'equalplay-teacher', type: 'file', fileType: 'web' },
            { id: 'citereflex', type: 'file', fileType: 'web' },
            { id: 'teacher-companion', type: 'file', fileType: 'web' },
            { id: 'claude-code-plugins', type: 'file', fileType: 'js' },
        ] },
        { name: 'Education & Research', type: 'folder', icon: 'graduation-cap', description: 'Learning platforms, assessments and research operations', children: [
            { name: 'Learning Platforms', type: 'folder', icon: 'school', children: [
                { id: 'hualong-platform', type: 'file', fileType: 'mobile' },
                { id: 'teacher-companion', type: 'file', fileType: 'web' },
                { id: 'eocp', type: 'file', fileType: 'web' },
                { id: 'imaze', type: 'file', fileType: 'mobile' }
            ] },
            { name: 'Research & Assessment', type: 'folder', icon: 'flask-conical', children: [
                { name: 'The 4Set Evolution', type: 'folder', icon: 'layers', description: 'From Excel to hybrid server', children: [
                    { id: 'gen0-excel', type: 'file', fileType: 'excel' },
                    { id: 'gen1-pwa', type: 'file', fileType: 'web' },
                    { id: 'gen2-desktop', type: 'file', fileType: 'python' },
                    { id: 'gen3-server', type: 'file', fileType: 'server' }
                ] },
                { id: 'teacher-survey-ece-2025', type: 'file', fileType: 'python' },
                { id: 'attention-to-number', type: 'file', fileType: 'web' },
                { id: 'publication-records', type: 'file', fileType: 'excel' },
                { id: 'citereflex', type: 'file', fileType: 'web' }
            ] },
            { name: 'Research Content Tools', type: 'folder', icon: 'files', children: [
                { id: 'emr-art', type: 'file', fileType: 'react' },
                { id: 'emr-jotform-wrapper', type: 'file', fileType: 'react' }
            ] }
        ] },
        { name: 'Enterprise & Automation', type: 'folder', icon: 'building-2', description: 'Operational systems and repeatable administrative work', children: [
            { id: 'masterlist-osp', type: 'file', fileType: 'vba' },
            { id: 'sec-osp', type: 'file', fileType: 'vba' },
            { id: 'project-masterlist', type: 'file', fileType: 'excel' },
            { id: 'autosuite', type: 'file', fileType: 'script' }
        ] },
        { name: 'MyAndante HK Limited', type: 'folder', icon: 'music', description: 'EqualPlay application work · Sole Developer', children: [
            { id: 'equalplay', type: 'file', fileType: 'web' },
            { id: 'equalplay-conversion', type: 'file', fileType: 'python' },
            { id: 'equalplay-practice', type: 'file', fileType: 'web' },
            { id: 'equalplay-teacher', type: 'file', fileType: 'web' },
            { id: 'equalplay-games', type: 'file', fileType: 'web' },
            { id: 'equalplay-engagement', type: 'file', fileType: 'web' },
            { id: 'equalplay-creative', type: 'file', fileType: 'web' },
            { id: 'equalplay-services', type: 'file', fileType: 'server' },
            { id: 'equalplay-posture', type: 'file', fileType: 'mobile' }
        ] },
        { name: 'AI & Developer Tools', type: 'folder', icon: 'code-2', description: 'Creation workflows, coding tools and interactive software', children: [
            { id: 'ai-tier-list', type: 'file', fileType: 'web' },
            { id: 'minutes-master', type: 'file', fileType: 'web' },
            { id: 'claude-code-plugins', type: 'file', fileType: 'js' },
            { id: 'video-tagger', type: 'file', fileType: 'cpp' },
            { id: 'quick-dish-wizard', type: 'file', fileType: 'react' },
        ] },
        { name: 'Event & Everyday Tools', type: 'folder', icon: 'wrench', description: 'Event delivery, access portals and practical utilities', children: [
            { id: 'ks-qrcode', type: 'file', fileType: 'web' },
            { id: 'ks-free-play-conference', type: 'file', fileType: 'web' },
            { id: 'ks-retreat', type: 'file', fileType: 'web' },
            { id: 'shoppingcart925', type: 'file', fileType: 'js' },
            { id: 'sheet-sync-combine', type: 'file', fileType: 'react' }
        ] }
    ]
};

let currentPath = [];
let searchQuery = '';
let showAllProjects = false;
let refreshTimer;
let catalogTween;

function collectProjects(folder = explorerData) {
    const projects = new Map();
    folder.children.forEach(item => {
        if (item.type === 'folder') collectProjects(item).forEach(file => projects.set(file.id, file));
        else projects.set(item.id, item);
    });
    return [...projects.values()];
}

// Icons Mapping
const fileIcons = {
    'web': { icon: 'globe', color: 'text-blue-400' },
    'vba': { icon: 'file-spreadsheet', color: 'text-green-500' },
    'excel': { icon: 'sheet', color: 'text-green-400' },
    'mobile': { icon: 'smartphone', color: 'text-purple-400' },
    'script': { icon: 'terminal', color: 'text-yellow-400' },
    'server': { icon: 'server', color: 'text-orange-400' },
    'python': { icon: 'file-code', color: 'text-yellow-300' },
    'react': { icon: 'atom', color: 'text-cyan-400' },
    'cpp': { icon: 'cpu', color: 'text-red-400' },
    'js': { icon: 'file-json', color: 'text-yellow-200' }
};

/**
 * Initialize the Explorer
 */
function initExplorer() {
    document.getElementById('explorer-search').addEventListener('input', event => {
        searchQuery = event.target.value.trim().toLowerCase();
        currentPath = [];
        showAllProjects = false;
        renderExplorer();
    });
    document.getElementById('explorer-all').addEventListener('click', () => {
        currentPath = [];
        searchQuery = '';
        document.getElementById('explorer-search').value = '';
        showAllProjects = true;
        renderExplorer({ animate: true });
    });
    const preference = window.SPINE?.reduceQuery || window.matchMedia('(prefers-reduced-motion: reduce)');
    preference.addEventListener('change', event => {
        if (event.matches && window.gsap) {
            const cards = document.querySelectorAll('#explorer-grid > button');
            catalogTween?.kill();
            if (window.Flip) Flip.killFlipsOf(cards, false);
            gsap.killTweensOf(cards);
            gsap.set([...cards, document.getElementById('explorer-grid')], { clearProps: 'transform,opacity,height,width,position,top,left' });
        }
    });
    renderExplorer();
    window.SPINE?.onMotion(function () {
        ScrollTrigger.create({
            trigger: '#explorer-grid', start: 'top 90%', once: true,
            onEnter: function () {
                const cards = document.querySelectorAll('#explorer-grid > button');
                if (cards.length) gsap.fromTo(cards, { y: 24, opacity: 0, rotationX: -5, transformPerspective: 900 }, {
                    y: 0, opacity: 1, rotationX: 0, duration: 0.65, stagger: { amount: 0.16 },
                    ease: 'power3.out', clearProps: 'transform,opacity'
                });
            }
        });
    });
}

/**
 * Render the Explorer UI based on currentPath
 */
function renderExplorer({ animate = false } = {}) {
    const container = document.getElementById('explorer-grid');
    const breadcrumbs = document.getElementById('explorer-breadcrumbs');
    const backBtn = document.getElementById('explorer-back');
    
    if (!container) return;
    const hadFocus = document.getElementById('explorer-shell').contains(document.activeElement);

    // 1. Determine Current Folder
    let currentFolder = explorerData;
    currentPath.forEach(folderName => {
        currentFolder = currentFolder.children.find(c => c.name === folderName);
    });

    renderBreadcrumbs(breadcrumbs);
    const canGoBack = currentPath.length > 0 || showAllProjects || Boolean(searchQuery);
    backBtn.classList.toggle('invisible', !canGoBack);
    backBtn.disabled = !canGoBack;
    backBtn.onclick = navigateUp;

    let items = currentFolder.children;
    if (searchQuery || showAllProjects) {
        items = collectProjects().filter(file => {
            const data = githubCardData[file.id];
            return `${data.title} ${data.subtitle} ${data.tags.join(' ')}`.toLowerCase().includes(searchQuery);
        });
    }
    container.classList.toggle('explorer-root', !searchQuery && !showAllProjects && currentPath.length === 0);
    const previous = [...container.querySelectorAll(':scope > button')];
    const previousByKey = new Map(previous.map(node => [node.dataset.catalogKey, node]));
    const canAnimate = Boolean(window.SPINE?.motionOK && window.gsap);
    const oldHeight = container.getBoundingClientRect().height;
    const visible = previous.filter(node => { const r = node.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; });
    const state = canAnimate && window.Flip && visible.length ? Flip.getState(visible, { kill: false, props: 'opacity' }) : null;
    catalogTween?.kill();
    if (window.Flip) Flip.killFlipsOf(previous, false);
    if (window.gsap) {
        gsap.killTweensOf([...previous, container]);
        gsap.set([...previous, container], { clearProps: 'transform,opacity,height,width,position,top,left' });
    }
    const next = items.map(item => {
        const key = item.type === 'folder' ? `folder:${item.name}` : `project:${item.id}`;
        if (previousByKey.has(key)) return previousByKey.get(key);
        const template = document.createElement('template');
        template.innerHTML = item.type === 'folder' ? createFolderHTML(item) : createFileHTML(item);
        return template.content.firstElementChild;
    });
    if (next.length) container.replaceChildren(...next);
    else container.innerHTML = '<p class="explorer-empty">No projects match. Try another title, tool or topic.</p>';
    const count = document.getElementById('explorer-count');
    if (count) count.textContent = `${items.length} ${searchQuery || showAllProjects ? 'projects' : 'items'} · ${collectProjects().length} unique projects`;
    document.getElementById('explorer-all').setAttribute('aria-pressed', String(showAllProjects));
    if (window.lucide) lucide.createIcons();
    if (canAnimate && previous.length) {
        const enter = nodes => {
            const entering = [...nodes].filter(node => { const r = node.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight + 100; });
            if (!entering.length) return;
            return gsap.fromTo(entering, { y: animate ? 24 : 12, opacity: 0, scale: 0.96, rotationX: animate ? -5 : 0, transformPerspective: 900 }, {
                y: 0, opacity: 1, scale: 1, rotationX: 0,
                duration: animate ? 0.6 : 0.35, stagger: { amount: animate ? 0.14 : 0.05 },
                ease: 'power3.out', clearProps: 'transform,opacity'
            });
        };
        catalogTween = gsap.timeline();
        if (state) catalogTween.add(Flip.from(state, { targets: next, scale: true, duration: 0.55, ease: 'power3.inOut', prune: true, onEnter: enter }), 0);
        else if (animate && next.length) catalogTween.add(enter(next), 0);
        const newHeight = container.getBoundingClientRect().height;
        if (Math.abs(newHeight - oldHeight) > 2) catalogTween.fromTo(container, { height: oldHeight }, { height: newHeight, duration: 0.55, ease: 'power3.inOut', clearProps: 'height' }, 0);
    }
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(), canAnimate ? 700 : 120);
    if (hadFocus && document.activeElement.id !== 'explorer-search') {
        container.querySelector('button')?.focus({ preventScroll: true });
    }
}

/**
 * Create HTML for a Folder Item
 */
function createFolderHTML(folder) {
    return `<button type="button" onclick="navigateTo('${folder.name}')" data-catalog-key="folder:${folder.name}" class="explorer-card explorer-folder">
        <i data-lucide="${folder.icon || 'folder'}" aria-hidden="true"></i>
        <span class="explorer-card-title">${folder.name}</span>
        <span class="explorer-card-description">${folder.description || 'Open this collection'}</span>
        <span class="explorer-card-meta">${collectProjects(folder).length} projects <span aria-hidden="true">→</span></span>
    </button>`;
}

/**
 * Create HTML for a File Item
 */
function createFileHTML(file) {
    const data = githubCardData[file.id];
    const icon = fileIcons[file.fileType] || { icon: 'file' };
    return `<button type="button" onclick="openModal('${file.id}', this)" data-catalog-key="project:${file.id}" class="explorer-card explorer-file">
        <span class="explorer-file-top"><i data-lucide="${icon.icon}" aria-hidden="true"></i><span>${file.fileType.toUpperCase()}</span></span>
        <span class="explorer-card-title">${data.title}</span>
        <span class="explorer-card-description">${data.subtitle}</span>
        ${data.award ? `<span class="explorer-award">${data.award}</span>` : ''}
        <span class="explorer-card-meta">${data.valuation.total}<span class="explorer-estimate-label">${data.valuation.model ? 'AI replacement-cost range' : 'Historical AI estimate'}</span></span>
    </button>`;
}

/**
 * Render Breadcrumbs
 */
function renderBreadcrumbs(container) {
    let html = `<button type="button" onclick="navigateRoot()" class="hover:text-cyber-400 cursor-pointer transition-colors flex items-center gap-1"><i data-lucide="hard-drive" class="w-3 h-3"></i> root</button>`;
    
    currentPath.forEach((folder, index) => {
        html += ` <span class="text-slate-600">/</span> `;
        if (index === currentPath.length - 1) {
            html += `<span aria-current="location" class="text-cyber-400 font-bold">${folder}</span>`;
        } else {
            html += `<button type="button" onclick="navigateToLevel(${index})" class="hover:text-cyber-400 cursor-pointer transition-colors">${folder}</button>`;
        }
    });
    
    if (searchQuery || showAllProjects) html += `<span aria-hidden="true">/</span><span aria-current="location">${searchQuery ? 'Search results' : 'All projects'}</span>`;
    container.innerHTML = html;
}

/**
 * Navigation Actions
 */
function navigateTo(folderName) {
    currentPath.push(folderName);
    renderExplorer({ animate: true });
}

function navigateUp() {
    if (searchQuery || showAllProjects) { navigateRoot(); return; }
    currentPath.pop();
    renderExplorer({ animate: true });
}

function navigateRoot() {
    currentPath = [];
    searchQuery = '';
    showAllProjects = false;
    document.getElementById('explorer-search').value = '';
    renderExplorer({ animate: true });
}

function navigateToLevel(index) {
    currentPath = currentPath.slice(0, index + 1);
    renderExplorer({ animate: true });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initExplorer);
