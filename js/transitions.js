/**
 * SPINE page transitions — MPA accent-ink wipe between pages.
 * The veil slides up in the DESTINATION chapter's ink, a sessionStorage flag
 * hands off to the next page, which reveals top-down. Deep links and stale
 * flags never show a veil; bfcache restores clear any stuck veil.
 */
(function () {
    'use strict';

    var INK_BY_PATH = {
        'index.html': 'ink',
        'counselling.html': 'sienna',
        'technology.html': 'tealink',
        'project-management.html': 'oxblood',
        'education-culture.html': 'moss'
    };
    var FLAG = 'spine-wipe';
    var FRESH_MS = 2500;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isFile = location.protocol === 'file:';

    function getVeil() {
        var veil = document.getElementById('wipe-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.id = 'wipe-veil';
            veil.setAttribute('aria-hidden', 'true');
            document.body.appendChild(veil);
        }
        return veil;
    }

    function killVeil() {
        var veil = document.getElementById('wipe-veil');
        if (veil) {
            veil.style.transition = 'none';
            veil.style.transform = 'translateY(100%)';
            veil.style.opacity = '';
        }
    }

    // --- Arrival: reveal if a fresh flag exists -----------------------------
    function onArrive() {
        var raw = null;
        try { raw = sessionStorage.getItem(FLAG); } catch (e) { /* ignore */ }
        if (!raw) return;
        try { sessionStorage.removeItem(FLAG); } catch (e) { /* ignore */ }

        var data;
        try { data = JSON.parse(raw); } catch (e) { return; }
        if (!data || (Date.now() - data.t) > FRESH_MS) return; // stale → no veil

        var veil = getVeil();
        veil.setAttribute('data-ink', data.ink || 'ink');
        veil.style.transform = 'translateY(0%)';

        var reveal = function () {
            if (reduced) {
                veil.style.transition = 'opacity .3s ease';
                veil.style.opacity = '0';
                setTimeout(killVeil, 350);
            } else {
                veil.style.transition = 'transform .5s cubic-bezier(0.87, 0, 0.13, 1)';
                veil.style.transform = 'translateY(-100%)';
                setTimeout(killVeil, 600);
            }
        };
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            requestAnimationFrame(reveal);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                requestAnimationFrame(reveal);
            });
        }
    }
    onArrive();

    // --- bfcache restore: never leave a stuck overlay -----------------------
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) killVeil();
    });

    // --- Programmatic wipe (used by the brain cover's zoom-then-navigate) ---
    window.spineNavigate = function (href, ink) {
        if (isFile || reduced) { location.href = href; return; }
        var dur = window.matchMedia('(min-width: 768px)').matches ? 700 : 500;
        var veil = getVeil();
        veil.setAttribute('data-ink', ink || 'ink');
        veil.style.transition = 'none';
        veil.style.transform = 'translateY(100%)';
        requestAnimationFrame(function () {
            veil.style.transition = 'transform ' + dur + 'ms cubic-bezier(0.87, 0, 0.13, 1)';
            veil.style.transform = 'translateY(0%)';
            setTimeout(function () {
                try {
                    sessionStorage.setItem(FLAG, JSON.stringify({ ink: ink || 'ink', t: Date.now() }));
                } catch (err) { /* ignore */ }
                location.href = href;
            }, dur + 30);
        });
    };

    // --- Departure: intercept internal page links ---------------------------
    document.addEventListener('click', function (e) {
        if (isFile) return; // file:// — plain navigation, no veil, no storage
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
        if (a.hasAttribute('data-no-wipe')) return; // element handles its own transition

        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href) && href.indexOf(location.origin) !== 0) {
            if (!/^[a-z]+:/i.test(href || '')) { /* relative — continue below */ } else { return; }
        }

        var file = (href.split('#')[0].split('?')[0].split('/').pop() || 'index.html');
        var ink = INK_BY_PATH[file];
        if (!ink) return;                      // not an internal chapter link
        var currentFile = (location.pathname.split('/').pop() || 'index.html');
        if (file === currentFile) return;      // same-page anchor

        e.preventDefault();
        var dur = reduced ? 0 : (window.matchMedia('(min-width: 768px)').matches ? 700 : 500);
        var go = function () {
            try {
                sessionStorage.setItem(FLAG, JSON.stringify({ ink: ink, t: Date.now() }));
            } catch (err) { /* ignore */ }
            location.href = href;
        };

        if (dur === 0) { go(); return; }

        var veil = getVeil();
        veil.setAttribute('data-ink', ink);
        veil.style.transition = 'none';
        veil.style.transform = 'translateY(100%)';
        requestAnimationFrame(function () {
            veil.style.transition = 'transform ' + dur + 'ms cubic-bezier(0.87, 0, 0.13, 1)';
            veil.style.transform = 'translateY(0%)';
            setTimeout(go, dur + 30);
        });
    }, true);
})();
