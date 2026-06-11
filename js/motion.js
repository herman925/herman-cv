/**
 * SPINE motion system — shared GSAP behaviors for all pages.
 * Requires (deferred, loaded before this file): gsap, ScrollTrigger, SplitText, lenis (optional).
 * Data-attribute driven:
 *   [data-reveal-lines]  — SplitText masked line reveal
 *   .plate-reveal        — batched fade-up
 *   [data-parallax]      — inner img parallax (img pre-scaled 1.12)
 *   [data-count]         — numeric count-up (value in attribute, suffix via data-suffix)
 *   [data-accent-bar]    — scaleX 0→1 scrubbed
 *   .breathing           — 8s sine.inOut yoyo scale loop (e.g. counselling ring)
 */
(function () {
    'use strict';

    var USE_LENIS = true;

    var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined';

    // Easing dialect — one grammar, everywhere
    var EASE_ENTER = 'power4.out';
    var EASE_STRUCT = 'expo.inOut';
    var EASE_MICRO = 'power2.out';
    var EASE_AMBIENT = 'sine.inOut';

    window.SPINE = {
        motionOK: motionOK,
        EASE_ENTER: EASE_ENTER,
        EASE_STRUCT: EASE_STRUCT,
        EASE_MICRO: EASE_MICRO,
        EASE_AMBIENT: EASE_AMBIENT,
        lenis: null
    };

    document.documentElement.classList.add('js');

    // --- Lucide brand-icon shim ---------------------------------------------
    // lucide@latest dropped brand icons (github); createIcons leaves the <i>
    // untouched and logs an error. Swap any unresolved github tags for an
    // inline SVG, preserving classes. Re-runs for injected content (modals).
    var GITHUB_SVG = '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>';
    function fixGithubIcons() {
        document.querySelectorAll('i[data-lucide="github"]').forEach(function (el) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.setAttribute('aria-hidden', 'true');
            if (el.getAttribute('class')) svg.setAttribute('class', el.getAttribute('class'));
            svg.innerHTML = GITHUB_SVG;
            el.replaceWith(svg);
        });
    }
    document.addEventListener('DOMContentLoaded', fixGithubIcons);
    window.addEventListener('load', fixGithubIcons);
    document.addEventListener('githubCardsLoaded', fixGithubIcons);
    document.addEventListener('click', function () { setTimeout(fixGithubIcons, 80); }, true);

    // --- Gadgets (functional — run regardless of motion preference) --------
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Reading progress rule
        var bar = document.createElement('div');
        bar.id = 'spine-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);
        var ticking = false;
        function paintProgress() {
            ticking = false;
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); }
        }, { passive: true });
        paintProgress();

        // 2. Live Hong Kong clock in the colophon fine print
        var fine = document.querySelector('.colophon-fine');
        if (fine) {
            var clock = document.createElement('span');
            clock.className = 'hk-clock';
            clock.innerHTML = '<span class="clock-dot" aria-hidden="true"></span>HONG KONG — <time></time> HKT';
            fine.appendChild(clock);
            var timeEl = clock.querySelector('time');
            function tick() {
                try {
                    timeEl.textContent = new Intl.DateTimeFormat('en-GB', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false, timeZone: 'Asia/Hong_Kong'
                    }).format(new Date());
                } catch (e) { timeEl.textContent = new Date().toTimeString().slice(0, 8); }
            }
            tick();
            setInterval(tick, 1000);
        }

        // 3. Copy-email button beside the colophon mailto link
        var mail = document.querySelector('.colophon a[href^="mailto:"]');
        if (mail && navigator.clipboard) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-email-btn';
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy email address');
            mail.insertAdjacentElement('afterend', btn);
            btn.addEventListener('click', function () {
                navigator.clipboard.writeText(mail.getAttribute('href').replace('mailto:', '')).then(function () {
                    btn.textContent = 'Copied ▪';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        btn.textContent = 'Copy';
                        btn.classList.remove('copied');
                    }, 1600);
                });
            });
        }
    });

    function releaseFOUC() {
        document.documentElement.classList.remove('loading');
    }
    // Hard timeout so nothing can stay hidden
    setTimeout(releaseFOUC, 800);

    if (!hasGSAP || !motionOK) {
        // Reduced motion or GSAP missing: final states only (CSS handles visibility)
        document.querySelectorAll('[data-count]').forEach(function (el) {
            el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
        });
        releaseFOUC();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    // --- Lenis smooth scroll: desktop + fine pointer only, feature-flagged ---
    if (USE_LENIS && window.Lenis &&
        window.matchMedia('(min-width: 768px) and (pointer: fine)').matches) {
        var lenis = new Lenis({ autoRaf: false });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        window.SPINE.lenis = lenis;
    }

    function initReveals(scope) {
        var root = scope || document;

        // 1. SplitText masked line reveals
        root.querySelectorAll('[data-reveal-lines]').forEach(function (el) {
            if (el.__spineRevealed) return;
            el.__spineRevealed = true;
            if (window.SplitText) {
                SplitText.create(el, {
                    type: 'lines',
                    mask: 'lines',
                    autoSplit: true,
                    onSplit: function (self) {
                        gsap.set(el, { visibility: 'visible' });
                        return gsap.from(self.lines, {
                            yPercent: 110,
                            duration: 1.1,
                            ease: EASE_ENTER,
                            stagger: 0.08,
                            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
                            // the line masks clip Fraunces descenders (g, y, p) —
                            // restore the original unsplit markup once revealed
                            onComplete: function () { self.revert(); }
                        });
                    }
                });
            } else {
                gsap.set(el, { visibility: 'visible' });
                gsap.from(el, {
                    y: 24, opacity: 0, duration: 0.9, ease: EASE_ENTER,
                    scrollTrigger: { trigger: el, start: 'top 80%', once: true }
                });
            }
        });

        // 2. Batched plate fade-ups
        var plates = Array.prototype.filter.call(
            root.querySelectorAll('.plate-reveal'),
            function (el) { return !el.__spineRevealed; }
        );
        plates.forEach(function (el) { el.__spineRevealed = true; });
        if (plates.length) {
            ScrollTrigger.batch(plates, {
                start: 'top 85%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        y: 0, opacity: 1, duration: 0.9, ease: EASE_ENTER, stagger: 0.06
                    });
                }
            });
        }

        // 3. Inner-image parallax
        root.querySelectorAll('[data-parallax]').forEach(function (frame) {
            if (frame.__spineRevealed) return;
            frame.__spineRevealed = true;
            var img = frame.querySelector('img');
            if (!img) return;
            gsap.set(img, { scale: 1.12 });
            gsap.fromTo(img, { yPercent: -8 }, {
                yPercent: 8, ease: 'none',
                scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });

        // 4. Counters
        root.querySelectorAll('[data-count]').forEach(function (el) {
            if (el.__spineRevealed) return;
            el.__spineRevealed = true;
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var obj = { val: 0 };
            el.textContent = '0' + suffix;
            gsap.to(obj, {
                val: target,
                duration: 1.2,
                ease: EASE_MICRO,
                snap: { val: 1 },
                scrollTrigger: { trigger: el, start: 'top 70%', once: true },
                onUpdate: function () {
                    el.textContent = obj.val.toLocaleString('en-US') + suffix;
                }
            });
        });

        // 5. Accent bars (scrubbed)
        root.querySelectorAll('[data-accent-bar]').forEach(function (el) {
            if (el.__spineRevealed) return;
            el.__spineRevealed = true;
            gsap.fromTo(el, { scaleX: 0 }, {
                scaleX: 1, ease: 'none',
                scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 50%', scrub: true }
            });
        });

        // 6. Ambient breathing loops
        root.querySelectorAll('.breathing').forEach(function (el) {
            if (el.__spineRevealed) return;
            el.__spineRevealed = true;
            gsap.to(el, {
                scale: parseFloat(el.getAttribute('data-breath-scale') || 1.35),
                duration: parseFloat(el.getAttribute('data-breath-dur') || 4),
                ease: EASE_AMBIENT,
                yoyo: true,
                repeat: -1
            });
        });
    }
    window.SPINE.initReveals = initReveals;

    function initNavbarCondense() {
        var nav = document.getElementById('navbar');
        if (!nav) return;
        var inner = nav.querySelector('.navbar-inner');
        if (!inner) return;
        gsap.to(inner, {
            height: 64,
            ease: 'none',
            scrollTrigger: { start: 0, end: 120, scrub: true }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initReveals(document);
        initNavbarCondense();
        releaseFOUC();

        // Refresh discipline: Fraunces metrics shift pin/trigger measurements
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
        }

        // Protected injected content (technology.html explorer) — animate post-injection,
        // zero edits to explorer.js / github-cards.js
        var grid = document.getElementById('explorer-grid');
        if (grid && window.MutationObserver) {
            var pending = null;
            var mo = new MutationObserver(function () {
                clearTimeout(pending);
                pending = setTimeout(function () {
                    // explorer.js re-renders raw <i data-lucide> tags on every
                    // folder navigation — re-init icons or they vanish
                    if (window.lucide && typeof lucide.createIcons === 'function') {
                        try { lucide.createIcons(); } catch (e) { /* ignore */ }
                    }
                    fixGithubIcons();
                    grid.querySelectorAll(':scope > *').forEach(function (child) {
                        if (!child.__spineRevealed) {
                            child.__spineRevealed = true;
                            gsap.from(child, { y: 16, opacity: 0, duration: 0.5, ease: EASE_ENTER });
                        }
                    });
                    ScrollTrigger.refresh();
                }, 60);
            });
            mo.observe(grid, { childList: true });
        }
    });
})();
