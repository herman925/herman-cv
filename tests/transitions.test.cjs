const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function boot({ flag, reduced = false, blockedStorage = false } = {}) {
    let now = 1000000, nextId = 0;
    const timers = new Map(), nodes = new Map(), listeners = {}, navigations = [];
    const storage = new Map(flag ? [['spine-wipe', JSON.stringify(flag)]] : []);
    const preference = { matches: reduced, addEventListener(type, callback) { this.change = callback; } };
    function node() { return { style: {}, attrs: {}, children: {}, setAttribute(k, v) { this.attrs[k] = v; },
        querySelector(key) { return this.children[key] ||= { textContent: '' }; },
        appendChild(child) { child.parentNode = this; if (child.id) nodes.set(child.id, child); },
        getBoundingClientRect() { return {}; }
    }; }
    const document = { body: null, readyState: 'loading', documentElement: node(), createElement: node,
        getElementById(id) { return nodes.get(id); },
        addEventListener(type, callback) { (listeners[type] ||= []).push(callback); }
    };
    const location = { pathname: '/technology.html', search: '', protocol: 'https:', origin: 'https://example.test',
        get href() { return 'https://example.test/technology.html'; }, set href(value) { navigations.push(value); }
    };
    const window = { matchMedia() { return preference; }, addEventListener(type, callback) { (listeners[type] ||= []).push(callback); } };
    const setTimeout = (callback, delay = 0) => { const id = ++nextId; timers.set(id, { at: now + delay, callback }); return id; };
    vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../js/transitions.js'), 'utf8'), {
        window, document, location, URL, Date: class extends Date { static now() { return now; } },
        setTimeout, clearTimeout(id) { timers.delete(id); }, requestAnimationFrame(callback) { setTimeout(callback, 16); },
        sessionStorage: {
            getItem(key) { return storage.get(key) || null; }, removeItem(key) { storage.delete(key); },
            setItem(key, value) { if (blockedStorage) throw Error('storage blocked'); storage.set(key, value); }
        }
    });
    return { document, window, preference, storage, navigations, veil: () => nodes.get('wipe-veil'),
        emit(type, event) { (listeners[type] || []).forEach(callback => callback(event)); },
        ready() { document.body = node(); document.readyState = 'interactive'; this.emit('DOMContentLoaded'); },
        async advance(ms) {
            const end = now + ms;
            await Promise.resolve(); await Promise.resolve();
            while (true) {
                const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                now = next[1].at; timers.delete(next[0]); next[1].callback();
                await Promise.resolve(); await Promise.resolve();
            }
            now = end;
        }
    };
}
const flag = { path: '/technology.html', coveredAt: 1000000 };

test('arrival covers the document before the body and holds the title for two seconds', async () => {
    const app = boot({ flag });
    assert.equal(app.veil().parentNode, app.document.documentElement);
    assert.equal(app.veil().style.transform, 'translateY(0%)');
    assert.equal(app.veil().children['.wipe-name'].textContent, 'Technology');
    assert.equal(app.storage.has('spine-wipe'), false);
    app.ready(); await app.advance(1900);
    assert.equal(app.veil().attrs['data-state'], 'holding');
    await app.advance(150);
    assert.equal(app.veil().attrs['data-state'], 'revealing');
    assert.match(app.veil().style.transition, /1200ms/);
    await app.advance(1300);
    assert.equal(app.veil().attrs['data-state'], 'hidden');
});

test('slow optional scripts keep the ink covered until the document is ready', async () => {
    const app = boot({ flag });
    await app.advance(4000);
    assert.equal(app.veil().attrs['data-state'], 'holding');
    app.ready(); await app.advance(50);
    assert.equal(app.veil().attrs['data-state'], 'revealing');
});

test('an already-open tab can hand off to the updated transition', () => {
    const app = boot({ flag: { ink: 'tealink', t: 1000000 } });
    assert.equal(app.veil().attrs['data-state'], 'holding');
    assert.equal(app.veil().children['.wipe-name'].textContent, 'Technology');
});

test('stalled optional scripts have a bounded reveal fallback', async () => {
    const app = boot({ flag });
    await app.advance(11400);
    assert.equal(app.veil().attrs['data-state'], 'hidden');
});

test('direct visits and unrelated, invalid or stale flags do not show a title screen', () => {
    for (const data of [undefined, { ...flag, path: '/index.html' }, { ...flag, coveredAt: 900000 }, { ...flag, coveredAt: 'bad' }]) {
        assert.equal(boot({ flag: data }).veil(), undefined);
    }
});

test('one departure hands off the destination and prevents duplicate navigation', async () => {
    const app = boot();
    app.window.spineNavigate('index.html'); app.window.spineNavigate('counselling.html');
    await app.advance(750);
    assert.deepEqual(app.navigations, ['index.html']);
    assert.equal(JSON.parse(app.storage.get('spine-wipe')).path, '/index.html');
});

test('reduced motion and blocked storage preserve immediate navigation', () => {
    for (const config of [{ reduced: true }, { blockedStorage: true }]) {
        const app = boot(config); app.window.spineNavigate('index.html');
        assert.deepEqual(app.navigations, ['index.html']); assert.equal(app.veil(), undefined);
    }
});

test('live reduced motion cancels the departure and navigates only once', async () => {
    const app = boot(); app.window.spineNavigate('index.html');
    app.preference.matches = true; app.preference.change();
    await app.advance(3000);
    assert.deepEqual(app.navigations, ['index.html']);
    assert.equal(app.veil().attrs['data-state'], 'hidden');
});

test('back/forward cache restoration clears a covered screen', () => {
    const app = boot({ flag }); app.emit('pageshow', { persisted: true });
    assert.equal(app.veil().attrs['data-state'], 'hidden');
});
