const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

function workspace() {
    const elements = new Map();
    let observer;
    const effects = { scrolls: 0, refreshes: 0 };
    const document = { addEventListener() {}, activeElement: null, getElementById: id => elements.get(id), createElement: tag => element(tag) };
    function element(tag = 'div') {
        const attrs = {}, events = {};
        return { tagName: tag.toUpperCase(), children: [], hidden: false, value: '', textContent: '', scrollTop: 0, offsetHeight: 600,
            append(...children) { this.children.push(...children); }, setAttribute(k, v) { attrs[k] = String(v); }, getAttribute: k => attrs[k] ?? null,
            removeAttribute(k) { delete attrs[k]; }, hasAttribute: k => k in attrs, toggleAttribute(k, enabled) { if (enabled) attrs[k] = ''; else delete attrs[k]; },
            contains(target) { return this === target || this.children.some(child => child.contains(target)); },
            addEventListener(k, fn) { (events[k] ||= []).push(fn); }, click() { this.onclick?.(); (events.click || []).forEach(fn => fn({ currentTarget: this })); },
            dispatch(type, event) { (events[type] || []).forEach(fn => fn(event)); },
            focus() { document.activeElement = this; }, scrollIntoView() { effects.scrolls++; }
        };
    }
    for (const id of ['project-desktop', 'portfolio-desktop-home', 'portfolio-finder', 'finder-window-head', 'explorer-grid', 'desktop-show-home', 'desktop-open-portfolio', 'desktop-launchers', 'finder-sidebar', 'desktop-project-count', 'desktop-minimize', 'desktop-browse-all', 'desktop-open-recent', 'desktop-search', 'finder-home', 'explorer-all', 'explorer-search']) elements.set(id, element());
    elements.get('portfolio-finder').hidden = true;
    elements.get('portfolio-finder').append(elements.get('finder-sidebar'));
    const preference = { matches: true, addEventListener(type, fn) { this.change = fn; } };
    const ctx = vm.createContext({ document, window: { matchMedia: () => preference, ScrollTrigger: { refresh() { effects.refreshes++; } } }, MutationObserver: class { constructor(fn) { observer = fn; } observe() {} }, requestAnimationFrame: fn => fn() });
    for (const name of ['js/github-cards.js', 'js/explorer.js', 'js/project-desktop.js']) vm.runInContext(read(name), ctx);
    ctx.renderExplorer = () => observer?.();
    elements.get('explorer-all').onclick = () => { vm.runInContext("currentPath=[]; searchQuery=''; showAllProjects=true", ctx); observer?.(); };
    ctx.initProjectDesktop();
    return { elements, ctx, preference, effects, navigationClick(button) { elements.get('portfolio-finder').dispatch('click', { target: { closest: () => button } }); button.click(); }, state: () => JSON.parse(vm.runInContext('JSON.stringify({currentPath, searchQuery, showAllProjects})', ctx)) };
}

test('desktop launchers are the real six collections and open one canonical Finder view', () => {
    const app = workspace(), get = id => app.elements.get(id);
    assert.equal(get('desktop-launchers').children.length, 6);
    assert.equal(get('desktop-project-count').textContent, 37);
    const launcher = get('desktop-launchers').children[0]; launcher.click();
    assert.deepEqual(app.state().currentPath, ['Recent Work']);
    assert.equal(get('portfolio-finder').hidden, false); assert.equal(get('portfolio-desktop-home').hidden, true);
    assert.equal(get('finder-window-head').textContent, 'Recent Work');
    get('desktop-minimize').click();
    assert.equal(get('portfolio-finder').hidden, true); assert.equal(app.ctx.document.activeElement, launcher);
    get('desktop-open-portfolio').click();
    assert.deepEqual(app.state().currentPath, ['Recent Work']); assert.equal(get('portfolio-finder').hidden, false);
});
test('dock restore keeps search/location and collections/navigation remain real actions', () => {
    const app = workspace(), get = id => app.elements.get(id);
    get('desktop-browse-all').click(); assert.equal(app.state().showAllProjects, true);
    vm.runInContext("searchQuery='piano';showAllProjects=false", app.ctx);
    get('desktop-show-home').click(); get('desktop-open-portfolio').click();
    assert.equal(app.state().searchQuery, 'piano');
    get('desktop-search').click(); assert.equal(app.ctx.document.activeElement, get('explorer-search'));
    get('finder-home').click(); assert.deepEqual(app.state().currentPath, []); assert.equal(app.state().searchQuery, '');
    get('finder-sidebar').children[2].click(); assert.deepEqual(app.state().currentPath, ['Education & Research']);
    get('desktop-minimize').click(); assert.notEqual(app.ctx.document.activeElement, get('finder-sidebar').children[2]);
});
test('collections root stays available and window restore does not reset catalogue scroll', () => {
    const app = workspace(), get = id => app.elements.get(id);
    get('desktop-browse-all').click(); get('finder-home').click();
    assert.deepEqual(app.state().currentPath, []);
    get('desktop-browse-all').click(); get('explorer-grid').scrollTop = 200;
    get('desktop-show-home').click(); get('desktop-open-portfolio').click(); assert.equal(get('explorer-grid').scrollTop, 200);
});
test('first HTML brain is the current head artwork with four real routes and no obsolete polygon art', () => {
    const html = read('index.html'), script = read('js/brain-cover.js');
    for (const name of ['HEAD_OUTER_D', 'HEAD_INNER_D']) assert(html.includes(script.match(new RegExp("var " + name + " = '([^']+)'"))[1]));
    assert.doesNotMatch(html, /network-edge|network-node|highlight-edge|brain-highlight/);
    assert.equal((html.match(/class="brain-section zone-/g) || []).length, 4);
    assert.equal((html.match(/data-brain-band=/g) || []).length, 4);
    assert.doesNotMatch(html, /id="thesis"[^>]*data-reveal-lines/);
    assert.match(script, /webglcontextlost/);
    assert.match(script, /boot\(\)\.catch\(useStaticBrain\)/);
});

function assertSelected(app, id) {
    const ids = ['desktop-show-home', 'desktop-open-portfolio', 'desktop-open-recent', 'desktop-search'];
    assert.deepEqual(ids.map(name => app.elements.get(name).getAttribute('aria-pressed')), ids.map(name => String(name === id)));
}
test('all four dock states derive from desktop, recent collection and restored query views', () => {
    const app = workspace(), get = id => app.elements.get(id);
    assertSelected(app, 'desktop-show-home');
    get('desktop-open-recent').click(); assertSelected(app, 'desktop-open-recent');
    get('desktop-minimize').click(); assertSelected(app, 'desktop-show-home');
    get('desktop-open-portfolio').click(); assertSelected(app, 'desktop-open-recent');
    get('desktop-browse-all').click(); assertSelected(app, 'desktop-open-portfolio');
    get('desktop-launchers').children[0].click(); assertSelected(app, 'desktop-open-recent');
    get('finder-sidebar').children[2].click(); assertSelected(app, 'desktop-open-portfolio');
    get('finder-sidebar').children[1].click(); assertSelected(app, 'desktop-open-recent');
    vm.runInContext("currentPath=[];searchQuery='piano'", app.ctx); app.ctx.renderExplorer(); assertSelected(app, 'desktop-search');
    get('desktop-show-home').click(); assertSelected(app, 'desktop-show-home');
    get('desktop-open-portfolio').click(); assertSelected(app, 'desktop-search');
    vm.runInContext("searchQuery=''", app.ctx); app.ctx.renderExplorer(); assertSelected(app, 'desktop-open-portfolio');
});
test('empty Search selection preserves its folder and survives typing or a modal render', () => {
    const app = workspace(), get = id => app.elements.get(id);
    get('desktop-open-recent').click();
    const before = app.state(); get('desktop-search').click();
    assert.deepEqual(app.state(), before); assert.equal(app.ctx.document.activeElement, get('explorer-search'));
    assertSelected(app, 'desktop-search');
    vm.runInContext("currentPath=[];searchQuery='piano'", app.ctx); app.ctx.renderExplorer(); assertSelected(app, 'desktop-search');
    vm.runInContext("searchQuery=''", app.ctx); app.ctx.renderExplorer(); assertSelected(app, 'desktop-search');
    app.ctx.renderExplorer(); assertSelected(app, 'desktop-search');
    get('desktop-minimize').click(); assertSelected(app, 'desktop-show-home');
    get('desktop-open-portfolio').click(); assertSelected(app, 'desktop-search');
    app.navigationClick(get('finder-home')); assertSelected(app, 'desktop-open-portfolio');
    get('desktop-search').click(); app.navigationClick(get('explorer-all')); assertSelected(app, 'desktop-open-portfolio');
    get('desktop-search').click(); get('finder-sidebar').children[1].click(); assertSelected(app, 'desktop-open-recent');
});
test('dock markup exposes one selected native button before JavaScript runs', () => {
    const html = read('technology.html');
    const buttons = [...html.matchAll(/<button id="(desktop-show-home|desktop-open-portfolio|desktop-open-recent|desktop-search)"[^>]*>/g)];
    assert.equal(buttons.length, 4);
    buttons.forEach(match => assert(match[0].includes('aria-pressed="' + (match[1] === 'desktop-show-home') + '"')));
    assert.match(html, /js\/project-desktop\.js\?v=29/);
});

test('bounded workspace switching never forces outer scroll or refreshes unchanged geometry', () => {
    const app = workspace(), get = id => app.elements.get(id);
    get('desktop-open-recent').click(); get('desktop-search').click();
    get('desktop-show-home').click(); get('desktop-open-portfolio').click();
    get('desktop-minimize').click(); get('desktop-browse-all').click();
    assert.equal(app.effects.scrolls, 0);
    assert.equal(app.effects.refreshes, 0);
    assert.equal(app.ctx.document.activeElement, get('finder-window-head'));
});
test('flowing workspace refreshes only when switching really changes its outer height', () => {
    const app = workspace(), get = id => app.elements.get(id);
    Object.defineProperty(get('project-desktop'), 'offsetHeight', { get: () => get('portfolio-finder').hidden ? 600 : 1200 });
    get('desktop-open-portfolio').click(); assert.equal(app.effects.refreshes, 1);
    get('desktop-search').click(); assert.equal(app.effects.refreshes, 1);
    get('desktop-show-home').click(); assert.equal(app.effects.refreshes, 2);
    assert.equal(app.effects.scrolls, 0);
});
