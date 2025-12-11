/**
 * File Explorer Logic for Technology Facet
 * Handles navigation, rendering, and interaction for the "Digital Ecosystem" file explorer.
 */

const explorerData = {
    name: 'root',
    type: 'folder',
    children: [
        {
            name: 'Core Platforms',
            type: 'folder',
            icon: 'server',
            description: 'Production systems & legacy monoliths',
            children: [
                {
                    name: 'Enterprise Systems',
                    type: 'folder',
                    icon: 'building-2',
                    children: [
                        { id: 'masterlist-osp', type: 'file', fileType: 'vba' },
                        { id: 'eocp', type: 'file', fileType: 'web' },
                        { id: 'sec-osp', type: 'file', fileType: 'vba' },
                        { id: 'project-masterlist', type: 'file', fileType: 'excel' }
                    ]
                },
                {
                    name: 'EdTech & Mobile',
                    type: 'folder',
                    icon: 'smartphone',
                    children: [
                        { id: 'imaze', type: 'file', fileType: 'mobile' }
                    ]
                },
                {
                    name: 'Research Ops & Automation',
                    type: 'folder',
                    icon: 'settings',
                    children: [
                        { id: 'publication-records', type: 'file', fileType: 'excel' },
                        { id: 'autosuite', type: 'file', fileType: 'script' }
                    ]
                }
            ]
        },
        {
            name: 'Featured GitHub Repos',
            type: 'folder',
            icon: 'github',
            description: 'Open source projects & case studies',
            children: [
                {
                    name: 'Enterprise & Research',
                    type: 'folder',
                    icon: 'flask-conical',
                    children: [
                        {
                            name: 'The 4Set Evolution',
                            type: 'folder',
                            icon: 'layers',
                            description: 'From Excel to Hybrid Server',
                            children: [
                                { id: 'gen0-excel', type: 'file', fileType: 'excel' },
                                { id: 'gen1-pwa', type: 'file', fileType: 'web' },
                                { id: 'gen2-desktop', type: 'file', fileType: 'python' },
                                { id: 'gen3-server', type: 'file', fileType: 'server' }
                            ]
                        },
                        { id: 'teacher-survey-ece-2025', type: 'file', fileType: 'python' }
                    ]
                },
                {
                    name: 'AI & Innovation',
                    type: 'folder',
                    icon: 'brain-circuit',
                    children: [
                        { id: 'ai-tier-list', type: 'file', fileType: 'web' },
                        { id: 'quick-dish-wizard', type: 'file', fileType: 'react' },
                        { id: 'video-tagger', type: 'file', fileType: 'cpp' }
                    ]
                },
                {
                    name: 'Utilities & Tools',
                    type: 'folder',
                    icon: 'wrench',
                    children: [
                        { id: 'ks-qrcode', type: 'file', fileType: 'web' },
                        { id: 'ks-retreat', type: 'file', fileType: 'web' },
                        { id: 'shoppingcart925', type: 'file', fileType: 'js' },
                        { id: 'sheet-sync-combine', type: 'file', fileType: 'react' }
                    ]
                }
            ]
        }
    ]
};

// State
let currentPath = []; // Array of folder objects

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
    renderExplorer();
}

/**
 * Render the Explorer UI based on currentPath
 */
function renderExplorer() {
    const container = document.getElementById('explorer-grid');
    const breadcrumbs = document.getElementById('explorer-breadcrumbs');
    const backBtn = document.getElementById('explorer-back');
    
    if (!container) return;

    // 1. Determine Current Folder
    let currentFolder = explorerData;
    currentPath.forEach(folderName => {
        currentFolder = currentFolder.children.find(c => c.name === folderName);
    });

    // 2. Render Breadcrumbs
    renderBreadcrumbs(breadcrumbs);

    // 3. Render Back Button State
    if (currentPath.length > 0) {
        backBtn.classList.remove('opacity-0', 'pointer-events-none');
        backBtn.onclick = navigateUp;
    } else {
        backBtn.classList.add('opacity-0', 'pointer-events-none');
    }

    // 4. Render Grid Content
    container.innerHTML = '';
    
    // Animation class for transition
    container.classList.add('opacity-0', 'translate-y-2');
    
    setTimeout(() => {
        container.innerHTML = currentFolder.children.map(item => {
            if (item.type === 'folder') {
                return createFolderHTML(item);
            } else {
                return createFileHTML(item);
            }
        }).join('');
        
        // Re-initialize icons
        if (window.lucide) lucide.createIcons();
        
        // Fade in
        container.classList.remove('opacity-0', 'translate-y-2');
    }, 150);
}

/**
 * Create HTML for a Folder Item
 */
function createFolderHTML(folder) {
    return `
        <div onclick="navigateTo('${folder.name}')" class="group p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:border-cyber-500/50 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center h-36 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-cyber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i data-lucide="${folder.icon || 'folder'}" class="w-12 h-12 text-cyber-400 group-hover:scale-110 transition-transform duration-300"></i>
            <div>
                <div class="font-bold text-slate-200 group-hover:text-white text-base">${folder.name}</div>
                ${folder.description ? `<div class="text-xs text-slate-500 mt-1">${folder.description}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Create HTML for a File Item
 */
function createFileHTML(file) {
    // Look up card data for title
    const cardData = githubCardData[file.id];
    const title = cardData ? cardData.title : file.id;
    const iconConfig = fileIcons[file.fileType] || { icon: 'file', color: 'text-slate-400' };
    
    // Check for distinction/award
    const hasDistinction = cardData && cardData.award;
    const awardTier = cardData && cardData.awardTier ? cardData.awardTier : 'gold';
    const awardStyles = {
        gold: {
            borderClass: 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
            bgClass: 'bg-slate-900/50',
            bannerColor: 'bg-yellow-500',
            dotColor: 'bg-white'
        },
        platinum: {
            // God rays effect: Radial gradient from top + strong glow
            borderClass: 'border-cyan-200/60 shadow-[0_0_40px_rgba(34,211,238,0.4),inset_0_0_20px_rgba(34,211,238,0.1)]',
            bgClass: 'bg-slate-900/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-slate-900/50 to-slate-900',
            bannerColor: 'bg-gradient-to-r from-cyan-50 via-white to-cyan-50 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.6)]',
            dotColor: 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]'
        },
        silver: {
            borderClass: 'border-slate-400/30 shadow-[0_0_10px_rgba(148,163,184,0.15)]',
            bgClass: 'bg-slate-900/50',
            bannerColor: 'bg-gradient-to-br from-slate-300 to-slate-400',
            dotColor: 'bg-slate-100'
        },
        bronze: {
            borderClass: 'border-orange-900/40 shadow-[0_0_8px_rgba(120,53,15,0.2)]',
            bgClass: 'bg-slate-900/50',
            bannerColor: 'bg-gradient-to-br from-orange-800 to-amber-900',
            dotColor: 'bg-orange-600'
        },
        iron: {
            borderClass: 'border-slate-600/40 shadow-[0_0_5px_rgba(71,85,105,0.2)]',
            bgClass: 'bg-slate-950/70',
            bannerColor: 'bg-gradient-to-br from-slate-600 to-slate-700',
            dotColor: 'bg-slate-500'
        }
    };
    const tierStyle = hasDistinction ? (awardStyles[awardTier] || awardStyles.gold) : null;
    const distinctionBanner = hasDistinction ? `
        <div class="absolute -top-1 -right-1 w-12 h-12 overflow-hidden rounded-tr-xl z-20">
            <div class="absolute top-0 right-0 ${tierStyle.bannerColor} w-16 h-4 rotate-45 translate-x-4 translate-y-2 shadow-lg flex items-center justify-center">
                <div class="w-2 h-2 ${tierStyle.dotColor} rounded-full animate-pulse"></div>
            </div>
        </div>
    ` : '';
    const borderClass = hasDistinction ? tierStyle.borderClass : 'border-slate-800';
    const bgClass = hasDistinction && tierStyle.bgClass ? tierStyle.bgClass : 'bg-slate-900/50';

    return `
        <div onclick="openModal('${file.id}')" class="group p-4 rounded-xl ${bgClass} border ${borderClass} hover:bg-slate-800 hover:border-purple-500/50 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center h-36 relative overflow-hidden">
            ${distinctionBanner}
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <i data-lucide="external-link" class="w-4 h-4 text-slate-500"></i>
            </div>
            <i data-lucide="${iconConfig.icon}" class="w-10 h-10 ${iconConfig.color} group-hover:scale-110 transition-transform duration-300 relative z-10"></i>
            <div class="w-full relative z-10">
                <div class="font-bold text-slate-300 group-hover:text-white text-sm line-clamp-2 leading-tight px-1">${title}</div>
                <div class="text-xs font-mono text-slate-500 mt-1 group-hover:text-slate-400">.${file.fileType}</div>
            </div>
        </div>
    `;
}

/**
 * Render Breadcrumbs
 */
function renderBreadcrumbs(container) {
    let html = `<span onclick="navigateRoot()" class="hover:text-cyber-400 cursor-pointer transition-colors flex items-center gap-1"><i data-lucide="hard-drive" class="w-3 h-3"></i> root</span>`;
    
    currentPath.forEach((folder, index) => {
        html += ` <span class="text-slate-600">/</span> `;
        if (index === currentPath.length - 1) {
            html += `<span class="text-cyber-400 font-bold">${folder}</span>`;
        } else {
            html += `<span onclick="navigateToLevel(${index})" class="hover:text-cyber-400 cursor-pointer transition-colors">${folder}</span>`;
        }
    });
    
    container.innerHTML = html;
}

/**
 * Navigation Actions
 */
function navigateTo(folderName) {
    currentPath.push(folderName);
    renderExplorer();
}

function navigateUp() {
    currentPath.pop();
    renderExplorer();
}

function navigateRoot() {
    currentPath = [];
    renderExplorer();
}

function navigateToLevel(index) {
    currentPath = currentPath.slice(0, index + 1);
    renderExplorer();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initExplorer);
