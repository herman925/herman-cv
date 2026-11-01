/** Chapter ink stays continuous across documents while the destination loads. */
(function () {
    'use strict';

    const CHAPTERS = {
        'index.html': ['ink', '00', 'The Digital Humanist'],
        'education-culture.html': ['moss', '01', 'Education & Culture'],
        'counselling.html': ['sienna', '02', 'Counselling'],
        'project-management.html': ['oxblood', '03', 'Project Management'],
        'technology.html': ['tealink', '04', 'Technology']
    };
    const FLAG = 'spine-wipe';
    const COVER_MS = 650;
    const HOLD_MS = 2000;
    const REVEAL_MS = 1200;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let busy = false;
    let pendingHref;
    let departureTimer, revealTimer, fallbackTimer, hideTimer;

    function getVeil(chapter) {
        let veil = document.getElementById('wipe-veil');
        if (!veil) {
            veil = document.createElement('div');
            veil.id = 'wipe-veil';
            veil.setAttribute('aria-hidden', 'true');
            veil.innerHTML = '<span class="wipe-numeral"></span><span class="wipe-mark"></span><span class="wipe-name"></span>';
            // Arrival runs in the head, before any slow third-party scripts or body paint.
            (document.body || document.documentElement).appendChild(veil);
        }
        veil.setAttribute('data-ink', chapter[0]);
        veil.querySelector('.wipe-numeral').textContent = chapter[1];
        veil.querySelector('.wipe-mark').textContent = 'CHAPTER ' + chapter[1];
        veil.querySelector('.wipe-name').textContent = chapter[2];
        return veil;
    }

    function killVeil() {
        [departureTimer, revealTimer, fallbackTimer, hideTimer].forEach(clearTimeout);
        const veil = document.getElementById('wipe-veil');
        if (veil) {
            veil.style.transition = 'none';
            veil.style.transform = 'translateY(100%)';
            veil.setAttribute('data-state', 'hidden');
        }
        busy = false;
        pendingHref = null;
    }

    function clearFlag() {
        try { sessionStorage.removeItem(FLAG); } catch (error) { /* Storage can be disabled. */ }
    }

    function onArrive() {
        let data;
        try { data = JSON.parse(sessionStorage.getItem(FLAG)); } catch (error) { return; }
        clearFlag();
        const file = location.pathname.split('/').pop() || 'index.html';
        const chapter = CHAPTERS[file];
        // An already-open tab may still send the previous version's handoff.
        if (data && chapter && !data.path && data.ink === chapter[0] && Number.isFinite(data.t)) {
            data = { path: location.pathname + location.search, coveredAt: data.t };
        }
        if (!data || !chapter || !Number.isFinite(data.coveredAt) || data.path !== location.pathname + location.search ||
            Date.now() - data.coveredAt > 30000 || data.coveredAt > Date.now() + COVER_MS + 100 ||
            reduceQuery.matches) return;

        busy = true;
        const veil = getVeil(chapter);
        veil.style.transform = 'translateY(0%)';
        veil.setAttribute('data-state', 'holding');
        let revealing = false;

        function reveal() {
            if (!busy || revealing) return;
            revealing = true;
            clearTimeout(fallbackTimer);
            clearTimeout(revealTimer);
            if (reduceQuery.matches) { killVeil(); return; }
            requestAnimationFrame(function () {
                if (!busy) return;
                veil.setAttribute('data-state', 'revealing');
                veil.style.transition = 'transform ' + REVEAL_MS + 'ms cubic-bezier(.65,0,.25,1)';
                veil.style.transform = 'translateY(-100%)';
                hideTimer = setTimeout(killVeil, REVEAL_MS + 80);
            });
        }

        function ready() {
            if (document.body && veil.parentNode !== document.body) document.body.appendChild(veil);
            const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
            Promise.race([fonts, new Promise(resolve => setTimeout(resolve, 1000))]).then(function () {
                if (!busy) return;
                revealTimer = setTimeout(reveal, Math.max(0, HOLD_MS - (Date.now() - data.coveredAt)));
            });
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
        else ready();
        // A stalled optional script must never trap visitors behind the title screen.
        fallbackTimer = setTimeout(reveal, 10000);
    }
    onArrive();

    window.addEventListener('pageshow', function (event) {
        if (event.persisted) killVeil();
    });
    reduceQuery.addEventListener('change', function () {
        if (!reduceQuery.matches) return;
        const href = pendingHref;
        killVeil();
        clearFlag();
        if (href) location.href = href;
    });

    function navigate(href) {
        if (busy) return;
        const url = new URL(href, location.href);
        const file = url.pathname.split('/').pop() || 'index.html';
        const chapter = CHAPTERS[file];
        if (location.protocol === 'file:' || reduceQuery.matches || !chapter || url.origin !== location.origin) {
            location.href = href;
            return;
        }
        const data = { path: url.pathname + url.search, coveredAt: Date.now() + COVER_MS };
        try { sessionStorage.setItem(FLAG, JSON.stringify(data)); }
        catch (error) { location.href = href; return; }

        busy = true;
        pendingHref = href;
        const veil = getVeil(chapter);
        veil.setAttribute('data-state', 'covering');
        veil.style.transition = 'none';
        veil.style.transform = 'translateY(100%)';
        veil.getBoundingClientRect();
        requestAnimationFrame(function () {
            if (!busy) return;
            veil.style.transition = 'transform ' + COVER_MS + 'ms cubic-bezier(.76,0,.24,1)';
            veil.style.transform = 'translateY(0%)';
            departureTimer = setTimeout(function () {
                data.coveredAt = Date.now();
                try { sessionStorage.setItem(FLAG, JSON.stringify(data)); } catch (error) { /* Initial flag remains usable. */ }
                location.href = href;
            }, COVER_MS + 40);
        });
    }
    // The brain's zoom uses the same handoff as every chapter link.
    window.spineNavigate = navigate;

    document.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.target.closest && event.target.closest('a[href]');
        if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download') || anchor.hasAttribute('data-no-wipe')) return;
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        const url = new URL(href, location.href);
        const file = url.pathname.split('/').pop() || 'index.html';
        if (url.origin !== location.origin || !CHAPTERS[file] || url.pathname === location.pathname && url.search === location.search) return;
        event.preventDefault();
        navigate(href);
    }, true);
})();
