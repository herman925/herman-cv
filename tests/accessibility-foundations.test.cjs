const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = name => fs.readFileSync(path.join(__dirname, '..', 'js', name), 'utf8');

function node(tag = 'DIV', text = '') {
    const attributes = {}, events = {}, classes = new Set();
    return {
        tagName: tag, textContent: text, innerHTML: text, children: [], events,
        classList: { add: c => classes.add(c), remove: c => classes.delete(c), toggle(c, on) { if (on) classes.add(c); else classes.delete(c); } },
        setAttribute(k, v) { attributes[k] = String(v); }, getAttribute: k => attributes[k] ?? null,
        removeAttribute: k => delete attributes[k], addEventListener(k, fn) { events[k] = fn; },
        querySelector() { return null; }, replaceChildren(...children) { this.children = children; },
        contains(other) { return this === other || this.children.includes(other); }
    };
}
function disclosure() {
    const button = node('BUTTON'), panel = node(), target = node('SECTION');
    const listeners = {};
    const document = { activeElement: button, getElementById: id => ({ button, panel, target }[id]), addEventListener(k, fn) { (listeners[k] ||= []).push(fn); } };
    [button, target].forEach(el => { el.focus = () => { document.activeElement = el; }; });
    const app = { document, window: {} };
    vm.runInNewContext(source('navbar.js'), app);
    app.setupNavDisclosure('button', 'panel');
    const emit = (name, data = {}) => { const event = { ...data, prevented: false, preventDefault() { this.prevented = true; } }; (listeners[name] || []).forEach(fn => fn(event)); return event; };
    return { button, panel, target, document, emit, open() { button.events.click(); } };
}

test('site disclosure closes on Escape and restores its invoker without trapping Tab', () => {
    const app = disclosure(); app.open();
    assert.equal(app.button.getAttribute('aria-expanded'), 'true'); assert.equal(app.panel.hidden, false);
    assert.equal(app.emit('keydown', { key: 'Tab' }).prevented, false);
    app.document.activeElement = app.panel;
    app.emit('keydown', { key: 'Escape' });
    assert.equal(app.panel.hidden, true); assert.equal(app.button.getAttribute('aria-expanded'), 'false');
    assert.equal(app.document.activeElement, app.button);
});
test('site disclosure dismisses on outside interaction, focus departure and a local link', () => {
    const app = disclosure(); app.open(); app.emit('pointerdown', { target: node() });
    assert.equal(app.panel.hidden, true);
    app.open(); const outside = node(); app.document.activeElement = outside; app.emit('focusin', { target: outside });
    assert.equal(app.panel.hidden, true); assert.equal(app.document.activeElement, outside);
    app.open(); const link = { hash: '#target', getAttribute: () => '#target' };
    app.panel.events.click({ target: { closest: () => link } });
    assert.equal(app.panel.hidden, true); assert.equal(app.document.activeElement, app.target);
});
test('navbar renders a named landmark and current facet/Home states', () => {
    const container = {};
    const app = { document: { getElementById: () => container, readyState: 'complete' }, window: {} };
    vm.runInNewContext(source('navbar.js'), app);
    app.setupNavDisclosure = () => () => {}; app.setupNavbarLayout = app.setupScrollEffect = () => {};
    app.initNavbar({ activePage: 'project', sections: [], themeColor: 'oxblood' });
    assert.match(container.innerHTML, /<nav id="navbar" aria-label="Primary"/);
    assert.match(container.innerHTML, /href="project-management.html"[^>]*aria-current="page"/);
    assert.match(container.innerHTML, /class="sr-only">Home — <\/span>/);
    assert.doesNotMatch(container.innerHTML, /aria-label="Home/);
    app.initNavbar({ activePage: 'home', themeColor: 'gold' });
    assert.match(container.innerHTML, /href="index.html"[^>]*aria-current="page"/);
});

function motion({ reduced = false, core = true, split = true, broken = false } = {}) {
    const heading = node('H2', 'A heading'), quote = node('BLOCKQUOTE', 'A quote with a link'), link = node('A', 'a link');
    quote.children = [link]; quote.querySelector = () => link;
    const counter = node('DIV', '12,000+'); counter.setAttribute('data-count', '12000'); counter.setAttribute('data-suffix', '+');
    const calls = { splits: [], counters: [] }, preference = { matches: reduced, addEventListener(k, fn) { this.change = fn; } };
    const scope = { querySelectorAll(selector) { return selector === '[data-reveal-lines]' ? [heading, quote] : selector === '[data-count]' ? [counter] : []; } };
    const document = { ...scope, documentElement: node('HTML'), addEventListener() {}, createElement: tag => node(tag.toUpperCase()) };
    const gsap = { registerPlugin() {}, matchMedia: () => ({ add() {} }), set() {}, from() {}, to(value, options) { calls.counters.push({ value, options }); }, timeline: () => ({}) };
    const window = { matchMedia: () => preference, addEventListener() {} };
    if (core) { window.gsap = gsap; window.ScrollTrigger = {}; }
    if (split) window.SplitText = { create(el) { calls.splits.push(el); el.setAttribute('aria-label', 'Split label'); if (broken) { el.innerHTML = 'broken'; throw Error('SplitText failed'); } return { revert() {} }; } };
    vm.runInNewContext(source('motion.js'), { window, document, gsap, ScrollTrigger: window.ScrollTrigger, SplitText: window.SplitText });
    if (window.SPINE.motionOK) window.SPINE.initReveals(scope);
    return { heading, quote, link, counter, calls, preference };
}
test('normal motion keeps native quotation/link semantics and stable accessible counter values', () => {
    const app = motion();
    assert.deepEqual(app.calls.splits, [app.heading]); assert.equal(app.quote.getAttribute('aria-label'), null);
    assert.equal(app.quote.children[0], app.link); assert.equal(app.quote.innerHTML, 'A quote with a link');
    const [visual, accessible] = app.counter.children;
    assert.equal(visual.getAttribute('aria-hidden'), 'true'); assert.equal(visual.textContent, '0+');
    assert.equal(accessible.textContent, '12,000+'); assert.equal(accessible.className, 'sr-only');
    const tween = app.calls.counters[0]; tween.value.val = 7; tween.options.onUpdate();
    assert.equal(visual.textContent, '7+'); assert.equal(accessible.textContent, '12,000+');
    app.preference.matches = true; app.preference.change(); assert.equal(visual.textContent, '12,000+');
});
for (const [name, config] of [['reduced', { reduced: true }], ['missing GSAP', { core: false }], ['missing SplitText', { split: false }], ['failed SplitText', { broken: true }]]) {
    test(`${name} retains complete unsplit content and final accessible numbers`, () => {
        const app = motion(config);
        assert.equal(app.quote.getAttribute('aria-label'), null); assert.equal(app.quote.children[0], app.link);
        assert.equal(app.heading.innerHTML, 'A heading');
        if (config.broken) assert.equal(app.heading.getAttribute('aria-label'), null);
        if (app.counter.children.length) assert.equal(app.counter.children[1].textContent, '12,000+');
        else assert.equal(app.counter.textContent, '12,000+');
    });
}
