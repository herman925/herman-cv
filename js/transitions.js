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
    var CHAPTERS = {
        ink: ['00', 'The Digital Humanist'],
        moss: ['01', 'Education & Culture'],
        sienna: ['02', 'Counselling'],
        oxblood: ['03', 'Project Management'],
        tealink: ['04', 'Technology']
    };

    function paintVeil(veil, ink) {
        var chapter = CHAPTERS[ink] || CHAPTERS.ink;
        veil.setAttribute('data-ink', CHAPTERS[ink] ? ink : 'ink');
        veil.querySelector('.wipe-numeral').textContent = chapter[0];
        veil.querySelector('.wipe-mark').textContent = 'CHAPTER ' + chapter[0];
        veil.querySelector('.wipe-name').textContent = chapter[1];
    }

    var FLAG = 'spine-wipe';
    var FRESH_MS = 2500;
    var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var isFile = location.protocol === 'file:';

    function getVeil() {
        var veil = document.getElementById('wipe-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.id = 'wipe-veil';
            veil.setAttribute('aria-hidden', 'true');
            veil.innerHTML = '<span class="wipe-numeral"></span><span class="wipe-mark"></span><span class="wipe-name"></span>';
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

    reduceQuery.addEventListener('change', function () {
        if (reduceQuery.matches) killVeil();
    });

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
        paintVeil(veil, data.ink || 'ink');
        veil.style.transform = 'translateY(0%)';

        var reveal = function () {
            if (reduceQuery.matches) {
                killVeil();
            } else {
                veil.style.transition = 'transform .4s cubic-bezier(0.87, 0, 0.13, 1)';
                veil.style.transform = 'translateY(-100%)';
                setTimeout(killVeil, 460);
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
        if (isFile || reduceQuery.matches) { location.href = href; return; }
        var dur = window.matchMedia('(min-width: 768px)').matches ? 450 : 380;
        var veil = getVeil();
        paintVeil(veil, ink || 'ink');
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
        if (!href || href.charAt(0) === '#') return;
        if (/^[a-z]+:/i.test(href) && href.indexOf(location.origin) !== 0) return;

        var file = (href.split('#')[0].split('?')[0].split('/').pop() || 'index.html');
        var ink = INK_BY_PATH[file];
        if (!ink) return;                      // not an internal chapter link
        var currentFile = (location.pathname.split('/').pop() || 'index.html');
        if (file === currentFile) return;      // same-page anchor

        e.preventDefault();
        var dur = reduceQuery.matches ? 0 : (window.matchMedia('(min-width: 768px)').matches ? 450 : 380);
        var go = function () {
            try {
                sessionStorage.setItem(FLAG, JSON.stringify({ ink: ink, t: Date.now() }));
            } catch (err) { /* ignore */ }
            location.href = href;
        };

        if (dur === 0) { go(); return; }

        var veil = getVeil();
        paintVeil(veil, ink);
        veil.style.transition = 'none';
        veil.style.transform = 'translateY(100%)';
        requestAnimationFrame(function () {
            veil.style.transition = 'transform ' + dur + 'ms cubic-bezier(0.87, 0, 0.13, 1)';
            veil.style.transform = 'translateY(0%)';
            setTimeout(go, dur + 30);
        });
    }, true);
})();
