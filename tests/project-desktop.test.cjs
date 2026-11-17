const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

function workspace() {
    const elements = new Map();
    let observer;
    const document = { addEventListener() {}, activeElement: null, getElementById: id => elements.get(id), createElement: tag => element(tag) };
    function element(tag = 'div') {
        const attrs = {}, events = {};
        return { tagName: tag.toUpperCase(), children: [], hidden: false, value: '', textContent: '', scrollTop: 0,
            append(...children) { this.children.push(...children); }, setAttribute(k, v) { attrs[k] = String(v); }, getAttribute: k => attrs[k] ?? null,
            removeAttribute(k) { delete attrs[k]; }, hasAttribute: k => k in attrs, toggleAttribute(k, enabled) { if (enabled) attrs[k] = ''; else delete attrs[k]; },
            contains(target) { return this === target || this.children.some(child => child.contains(target)); },
            addEventListener(k, fn) { (events[k] ||= []).push(fn); }, click() { this.onclick?.(); (events.click || []).forEach(fn => fn({ currentTarget: this })); },
            focus() { document.activeElement = this; }, scrollIntoView() {}
        };
    }
    for (const id of ['project-desktop', 'portfolio-desktop-home', 'portfolio-finder', 'finder-window-head', 'explorer-grid', 'desktop-show-home', 'desktop-open-portfolio', 'desktop-launchers', 'finder-sidebar', 'desktop-project-count', 'desktop-minimize', 'desktop-browse-all', 'desktop-open-recent', 'desktop-search', 'finder-home', 'explorer-all', 'explorer-search']) elements.set(id, element());
    elements.get('portfolio-finder').hidden = true;
    elements.get('portfolio-finder').append(elements.get('finder-sidebar'));
    const preference = { matches: true, addEventListener(type, fn) { this.change = fn; } };
    const ctx = vm.createContext({ document, window: { matchMedia: () => preference }, MutationObserver: class { constructor(fn) { observer = fn; } observe() {} }, requestAnimationFrame: fn => fn() });
    for (const name of ['js/github-cards.js', 'js/explorer.js', 'js/project-desktop.js']) vm.runInContext(read(name), ctx);
    ctx.renderExplorer = () => observer?.();
    elements.get('explorer-all').onclick = () => { vm.runInContext("currentPath=[]; searchQuery=''; showAllProjects=true", ctx); observer?.(); };
    ctx.initProjectDesktop();
    return { elements, ctx, preference, state: () => JSON.parse(vm.runInContext('JSON.stringify({currentPath, searchQuery, showAllProjects})', ctx)) };
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
