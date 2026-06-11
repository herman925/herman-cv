/**
 * SPINE — chapter cursors. The pointer belongs to the chapter it is in:
 *
 *   cover       — a gold ring; the brain already leans toward it
 *   education   — the cursor is a pen: it leaves a fading emerald route line
 *                 (the Journey Line follows your hand)
 *   counselling — the cursor is a presence: a soft warm light that gently
 *                 breathes and warms whatever it rests near
 *   project     — the cursor is a drafting tool: full-bleed crosshair
 *                 hairlines + live mono coordinates (the page is the board)
 *   technology  — the cursor is a targeting system: a phosphor dot that
 *                 snaps into corner brackets around any interactive element
 *
 * Fine pointers only; fully disabled under prefers-reduced-motion and on
 * touch. The native cursor stays (a11y) — these are companions, not
 * replacements.
 */
(function () {
    'use strict';

    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var chapter = document.documentElement.getAttribute('data-chapter');
    if (!chapter) return;

    var mx = -100, my = -100;      // raw pointer
    var fx = -100, fy = -100;      // follower (lerped)
    var seen = false;

    window.addEventListener('pointermove', function (e) {
        mx = e.clientX; my = e.clientY; seen = true;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { seen = false; });

    /* ---- shared follower ring -------------------------------------------- */
    var ring = document.createElement('div');
    ring.id = 'spine-cursor';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);

    var INTERACTIVE = 'a, button, summary, [role="button"], input, textarea, select, [data-zone]';

    /* ---- chapter extras --------------------------------------------------- */
    var extra = {};

    if (chapter === 'education') {
        var trail = document.createElement('canvas');
        trail.className = 'cursor-layer';
        trail.setAttribute('aria-hidden', 'true');
        document.body.appendChild(trail);
        var tx = trail.getContext('2d');
        var pts = [];
        extra.resize = function () {
            trail.width = innerWidth; trail.height = innerHeight;
        };
        extra.tick = function () {
            if (seen) pts.push({ x: mx, y: my, life: 1 });
            if (pts.length > 70) pts.splice(0, pts.length - 70);
            tx.clearRect(0, 0, trail.width, trail.height);
            tx.lineCap = 'round';
            tx.lineJoin = 'round';
            for (var i = 1; i < pts.length; i++) {
                var p = pts[i];
                p.life -= 0.012;
                if (p.life <= 0) continue;
                tx.strokeStyle = 'rgba(16,185,129,' + (p.life * 0.45).toFixed(3) + ')';
                tx.lineWidth = 1.5;
                tx.beginPath();
                tx.moveTo(pts[i - 1].x, pts[i - 1].y);
                tx.lineTo(p.x, p.y);
                tx.stroke();
            }
            while (pts.length && pts[0].life <= 0) pts.shift();
        };
    }

    if (chapter === 'counselling') {
        var glow = document.createElement('div');
        glow.className = 'cursor-layer cursor-warmth';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        var gx = -400, gy = -400, breathe = 0;
        extra.tick = function (t) {
            // the warmth follows slowly — presence, not pursuit
            gx += (mx - gx) * 0.06;
            gy += (my - gy) * 0.06;
            breathe = 1 + Math.sin(t / 1400) * 0.06;
            glow.style.transform = 'translate(' + (gx - 210) + 'px,' + (gy - 210) + 'px) scale(' + breathe + ')';
            glow.style.opacity = seen ? '1' : '0';
        };
    }

    if (chapter === 'project') {
        var cross = document.createElement('div');
        cross.className = 'cursor-layer';
        cross.setAttribute('aria-hidden', 'true');
        cross.innerHTML =
            '<div class="crosshair-x"></div>' +
            '<div class="crosshair-y"></div>' +
            '<div class="crosshair-readout"></div>';
        document.body.appendChild(cross);
        var chx = cross.children[0], chy = cross.children[1], read = cross.children[2];
        extra.tick = function () {
            chx.style.transform = 'translateY(' + my + 'px)';
            chy.style.transform = 'translateX(' + mx + 'px)';
            read.style.transform = 'translate(' + (mx + 16) + 'px,' + (my + 14) + 'px)';
            read.textContent = 'X ' + String(Math.round(mx)).padStart(4, '0') +
                ' · Y ' + String(Math.round(my)).padStart(4, '0');
            cross.style.opacity = seen ? '1' : '0';
        };
    }

    var bracketTarget = null;
    if (chapter === 'technology') {
        document.addEventListener('pointerover', function (e) {
            var t = e.target.closest && e.target.closest(INTERACTIVE);
            bracketTarget = t || null;
        }, true);
    }

    /* ---- follower loop ----------------------------------------------------- */
    var hoveringInteractive = false;
    document.addEventListener('pointerover', function (e) {
        hoveringInteractive = !!(e.target.closest && e.target.closest(INTERACTIVE));
    }, true);

    function loop(t) {
        requestAnimationFrame(loop);

        if (chapter === 'technology' && bracketTarget && bracketTarget.isConnected) {
            // snap brackets around the target
            var r = bracketTarget.getBoundingClientRect();
            fx += (r.left - 6 - fx) * 0.22;
            fy += (r.top - 6 - fy) * 0.22;
            ring.classList.add('bracketed');
            ring.style.width = (r.width + 12) + 'px';
            ring.style.height = (r.height + 12) + 'px';
            ring.style.transform = 'translate(' + fx + 'px,' + fy + 'px)';
        } else {
            ring.classList.remove('bracketed');
            ring.style.width = '';
            ring.style.height = '';
            fx += (mx - fx) * 0.2;
            fy += (my - fy) * 0.2;
            var s = hoveringInteractive ? 1.8 : 1;
            ring.style.transform = 'translate(' + (fx - 10) + 'px,' + (fy - 10) + 'px) scale(' + s + ')';
        }
        ring.style.opacity = seen ? '1' : '0';

        if (extra.tick) extra.tick(t);
    }

    if (extra.resize) {
        extra.resize();
        window.addEventListener('resize', extra.resize);
    }
    requestAnimationFrame(loop);
})();
