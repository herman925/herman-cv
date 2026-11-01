const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMotion({ core = true, scrollTrigger = true } = {}) {
    const listeners = [];
    const preference = { matches: false, addEventListener(type, handler) { listeners.push(handler); } };
    const classes = new Set(['loading']);
    const counter = { textContent: '0', getAttribute(name) { return name === 'data-count' ? '12000' : '+'; } };
    const gsap = { registerPlugin() {}, matchMedia() { return { add() {} }; } };
    const document = {
        documentElement: { classList: {
            add(name) { classes.add(name); }, remove(name) { classes.delete(name); },
            toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); }
        } },
        addEventListener() {}, querySelectorAll(selector) { return selector === '[data-count]' ? [counter] : []; }
    };
    const window = { matchMedia() { return preference; }, addEventListener() {} };
    if (core) window.gsap = gsap;
    if (scrollTrigger) window.ScrollTrigger = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'motion.js'), 'utf8'), {
        window, document, gsap, ScrollTrigger: window.ScrollTrigger
    });
    return { window, classes, counter, setReduced(value) { preference.matches = value; listeners.forEach(handler => handler({ matches: value })); } };
}

test('motion preference is reactive without a page reload', () => {
    const app = loadMotion();
    assert.equal(app.window.SPINE.motionOK, true);
    app.setReduced(true);
    assert.equal(app.window.SPINE.motionOK, false);
    assert.equal(app.classes.has('motion-ready'), false);
    assert.equal(app.counter.textContent, '12,000+');
    app.setReduced(false);
    assert.equal(app.window.SPINE.motionOK, true);
    assert.equal(app.classes.has('motion-ready'), true);
});

for (const missing of ['core', 'scrollTrigger']) {
    test(`missing ${missing} leaves final content available`, () => {
        const app = loadMotion({ [missing]: false });
        assert.equal(app.window.SPINE.motionOK, false);
        assert.equal(app.window.SPINE.onMotion(() => assert.fail('motion must not initialise')), null);
        assert.equal(app.classes.has('loading'), false);
        assert.equal(app.classes.has('motion-ready'), false);
        assert.equal(app.counter.textContent, '12,000+');
    });
}
