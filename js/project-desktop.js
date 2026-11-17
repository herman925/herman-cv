/* One desktop and one Finder view use the canonical explorer and project modals. */
function initProjectDesktop() {
    const desktop = document.getElementById('portfolio-desktop-home');
    const finder = document.getElementById('portfolio-finder');
    if (!desktop || !finder || typeof explorerData === 'undefined') return;
    const title = document.getElementById('finder-window-head');
    const grid = document.getElementById('explorer-grid');
    const workspace = document.getElementById('project-desktop');
    function refreshChangedHeight(previousHeight) {
        if (workspace.offsetHeight !== previousHeight) window.ScrollTrigger?.refresh();
    }
    const dockHome = document.getElementById('desktop-show-home');
    const dockPortfolio = document.getElementById('desktop-open-portfolio');
    const dockRecent = document.getElementById('desktop-open-recent');
    const dockSearch = document.getElementById('desktop-search');
    const dockButtons = [dockHome, dockPortfolio, dockRecent, dockSearch];
    let searchRequested = false;
    function syncDock() {
        const selected = finder.hidden ? dockHome
            : searchQuery || searchRequested ? dockSearch
            : !showAllProjects && currentPath[0] === 'Recent Work' ? dockRecent : dockPortfolio;
        dockButtons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
    }
    title.tabIndex = -1;
    let desktopTrigger = dockPortfolio;

    function showFinder(trigger, focus = true) {
        const previousHeight = workspace.offsetHeight;
        if (trigger && !finder.contains(trigger)) desktopTrigger = trigger;
        document.getElementById('project-desktop').setAttribute('data-view', 'finder');
        finder.hidden = false;
        desktop.hidden = true;
        syncDock();
        renderExplorer();
        if (focus) title.focus({ preventScroll: true });
        refreshChangedHeight(previousHeight);
    }
    function showDesktop(event) {
        const previousHeight = workspace.offsetHeight;
        document.getElementById('project-desktop').setAttribute('data-view', 'desktop');
        finder.hidden = true;
        desktop.hidden = false;
        syncDock();
        (event?.currentTarget === dockHome ? dockHome : desktopTrigger).focus({ preventScroll: true });
        refreshChangedHeight(previousHeight);
    }
    function openCollection(folder, trigger) {
        searchRequested = false;
        showFinder(trigger, false);
        navigateRoot();
        navigateTo(folder.name);
        title.focus({ preventScroll: true });
    }
    function collectionButton(folder, className, iconName) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', iconName || folder.icon || 'folder');
        icon.setAttribute('aria-hidden', 'true');
        const label = document.createElement(className === 'desktop-launcher' ? 'strong' : 'span');
        label.textContent = folder.name;
        button.append(icon, label);
        if (className === 'desktop-launcher') {
            const count = document.createElement('small');
            count.textContent = collectProjects(folder).length + ' projects';
            button.append(count);
        }
        button.addEventListener('click', () => openCollection(folder, button));
        return button;
    }
    const launchers = document.getElementById('desktop-launchers');
    const sidebar = document.getElementById('finder-sidebar');
    const collections = document.createElement('button');
    collections.type = 'button';
    collections.textContent = 'All collections';
    collections.addEventListener('click', () => { navigateRoot(); title.focus({ preventScroll: true }); });
    sidebar.append(collections);
    const sidebarItems = [];
    explorerData.children.filter(item => item.type === 'folder').forEach(folder => {
        launchers.append(collectionButton(folder, 'desktop-launcher'));
        const button = collectionButton(folder, 'finder-collection');
        sidebar.append(button);
        sidebarItems.push({ folder, button });
    });
    let lastView = '';
    function sync() {
        syncDock();
        const view = JSON.stringify([currentPath, searchQuery, showAllProjects]);
        if (view !== lastView) grid.scrollTop = 0;
        lastView = view;
        title.textContent = searchQuery ? 'Search results' : showAllProjects ? 'All projects' : currentPath[currentPath.length - 1] || 'Portfolio';
        collections.toggleAttribute('data-current', !currentPath.length && !searchQuery && !showAllProjects);
        if (collections.hasAttribute('data-current')) collections.setAttribute('aria-current', 'location');
        else collections.removeAttribute('aria-current');
        sidebarItems.forEach(({ folder, button }) => {
            if (currentPath[0] === folder.name && !searchQuery && !showAllProjects) button.setAttribute('aria-current', 'location');
            else button.removeAttribute('aria-current');
        });
    }
    document.getElementById('desktop-project-count').textContent = collectProjects().length;
    document.getElementById('desktop-minimize').addEventListener('click', showDesktop);
    dockHome.addEventListener('click', showDesktop);
    document.getElementById('desktop-browse-all').addEventListener('click', event => { searchRequested = false; showFinder(event.currentTarget, false); document.getElementById('explorer-all').click(); title.focus({ preventScroll: true }); });
    dockPortfolio.addEventListener('click', () => showFinder(dockPortfolio));
    dockRecent.addEventListener('click', event => openCollection(explorerData.children.find(folder => folder.name === 'Recent Work'), event.currentTarget));
    dockSearch.addEventListener('click', event => {
        searchRequested = true;
        showFinder(event.currentTarget, false);
        document.getElementById('explorer-search').focus({ preventScroll: true });
    });
    document.getElementById('finder-home').addEventListener('click', () => { navigateRoot(); title.focus({ preventScroll: true }); });
    // Only explicit catalogue navigation ends an empty dock-initiated search.
    finder.addEventListener('click', event => {
        if (event.target.closest('#finder-home, #explorer-all, #explorer-back, #explorer-breadcrumbs button, #finder-sidebar button, .explorer-folder')) searchRequested = false;
    }, true);
    new MutationObserver(sync).observe(grid, { childList: true });
    sync();
    if (window.lucide) lucide.createIcons();
}
document.addEventListener('DOMContentLoaded', initProjectDesktop);
