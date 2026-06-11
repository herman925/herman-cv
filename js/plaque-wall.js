/**
 * SPINE — The Archive Wall (technology.html ONLY)
 *
 * A curved 3D wall inside a dark room: every project from githubCardData is
 * a phosphor plaque mounted on the inner surface of a cylinder. Drag (or
 * touch-drag) sweeps the wall around you; hovering a plaque lifts and glows
 * it; clicking dollies the camera up to the plaque, then opens the existing
 * project modal (#project-modal via window.openModal) with the full story:
 * what it is, the AI valuation, and every detail. Closing the modal pulls
 * the camera back to the wall.
 *
 * Fallback (no WebGL / reduced motion / save-data): a flat DOM grid of the
 * same plaques into #plaque-wall-fallback, opening the same modal.
 */
(function () {
    'use strict';

    var TIER_COLORS = {
        gold: '#F2C14E',
        platinum: '#E8F4F1',
        silver: '#B9C7C4',
        bronze: '#D2854C',
        iron: '#6E7B76'
    };
    var TIER_GLOW = {
        gold: 0xF2C14E,
        platinum: 0xE8F4F1,
        silver: 0xB9C7C4,
        bronze: 0xD2854C,
        iron: 0x6E7B76
    };
    var ACCENT = '#2DD4BF';

    function gatePasses() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        if (navigator.connection && navigator.connection.saveData) return false;
        if ((navigator.deviceMemory || 8) < 4) return false;
        try {
            var c = document.createElement('canvas');
            if (!(c.getContext('webgl2') || c.getContext('webgl'))) return false;
        } catch (e) { return false; }
        return true;
    }

    function getEntries() {
        // github-cards.js declares `const githubCardData` — a global LEXICAL
        // binding, visible to modules as a bare identifier but NOT on window
        var data = (typeof githubCardData !== 'undefined') ? githubCardData : window.githubCardData;
        if (!data) return [];
        return Object.keys(data).map(function (id) {
            var d = data[id];
            return {
                id: id,
                title: d.title || id,
                subtitle: d.subtitle || '',
                tier: d.awardTier || null,
                award: d.award || null,
                tags: d.tags || []
            };
        });
    }

    function buildFallback(entries) {
        var holder = document.getElementById('plaque-wall-fallback');
        var wall = document.getElementById('plaque-wall');
        if (!holder || !wall) return;
        holder.classList.remove('hidden');
        wall.style.height = 'auto';
        wall.style.minHeight = '0';
        var hint = document.getElementById('plaque-wall-hint');
        if (hint) hint.remove();
        var grid = document.createElement('div');
        grid.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
        entries.forEach(function (en) {
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'text-left p-6 border';
            card.style.borderColor = 'var(--hairline)';
            card.style.background = 'var(--paper-soft)';
            card.innerHTML =
                '<p class="kicker" style="color:' + (TIER_COLORS[en.tier] || 'var(--ink-soft)') + '">' +
                (en.tier ? en.tier.toUpperCase() + ' PLAQUE' : 'PLAQUE') + '</p>' +
                '<h3 class="font-display font-semibold text-lg mt-2" style="color:var(--ink)">' + en.title + '</h3>' +
                '<p class="caption mt-1">' + en.subtitle + '</p>';
            card.addEventListener('click', function () {
                if (window.openModal) window.openModal(en.id);
            });
            grid.appendChild(card);
        });
        holder.appendChild(grid);
    }

    /* ---- plaque face rendered to a canvas texture ------------------------ */
    function plaqueTexture(en, index) {
        var W = 512, H = 320;
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var x = c.getContext('2d');

        // brushed dark panel
        var g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#101A18');
        g.addColorStop(1, '#0A1210');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        // faint horizontal brush lines
        x.globalAlpha = 0.05;
        x.strokeStyle = '#7FD1C8';
        for (var ly = 8; ly < H; ly += 9) {
            x.beginPath(); x.moveTo(0, ly); x.lineTo(W, ly); x.stroke();
        }
        x.globalAlpha = 1;

        // the whole frame carries the tier's metal; untiered plaques stay teal
        var tierCol = TIER_COLORS[en.tier] || ACCENT;
        x.strokeStyle = tierCol;
        x.globalAlpha = en.tier ? 0.95 : 0.5;
        x.lineWidth = en.tier ? 6 : 3;
        x.strokeRect(6, 6, W - 12, H - 12);
        x.globalAlpha = 1;

        // tier banner across the top — the medal is unmissable
        if (en.tier) {
            x.fillStyle = tierCol;
            x.fillRect(9, 9, W - 18, 42);
            x.fillStyle = '#0A1210';
            x.font = '700 22px "Space Grotesk", monospace';
            x.fillText('★ ' + en.tier.toUpperCase() + ' PLAQUE', 26, 38);
            x.textAlign = 'right';
            x.font = '500 20px "Space Grotesk", monospace';
            x.fillText('FIG. ' + String(index + 1).padStart(2, '0'), W - 26, 38);
            x.textAlign = 'left';
        } else {
            x.fillStyle = 'rgba(147,172,166,.9)';
            x.font = '500 20px "Space Grotesk", monospace';
            x.fillText('FIG. ' + String(index + 1).padStart(2, '0'), 40, 48);
        }

        // screws
        x.fillStyle = 'rgba(212,178,116,.8)';
        [[26, 70], [W - 26, 70], [26, H - 24], [W - 26, H - 24]].forEach(function (p) {
            x.beginPath(); x.arc(p[0], p[1], 5, 0, 7); x.fill();
        });

        // title (wrap, max 3 lines)
        x.fillStyle = '#E9F4F1';
        x.font = '600 38px "Fraunces", Georgia, serif';
        var words = en.title.split(' ');
        var line = '', lines = [];
        words.forEach(function (w) {
            if (x.measureText(line + ' ' + w).width > W - 90 && line) { lines.push(line); line = w; }
            else line = line ? line + ' ' + w : w;
        });
        lines.push(line);
        lines.slice(0, 3).forEach(function (l, i) {
            x.fillText(l, 40, 120 + i * 46);
        });

        // subtitle
        x.fillStyle = 'rgba(45,212,191,.85)';
        x.font = '400 21px "Space Grotesk", monospace';
        var sub = en.subtitle.length > 38 ? en.subtitle.slice(0, 37) + '…' : en.subtitle;
        x.fillText(sub, 40, H - 44);

        return c;
    }

    async function boot() {
        var mountWrap = document.getElementById('plaque-wall');
        if (!mountWrap) return;

        var entries = getEntries();
        if (!entries.length) {
            // data script may not have evaluated yet
            setTimeout(boot, 300);
            return;
        }

        if (!gatePasses()) { buildFallback(entries); return; }

        var THREE;
        try {
            THREE = await import('three');
        } catch (e) {
            buildFallback(entries);
            return;
        }

        var isMobile = window.matchMedia('(max-width: 767px)').matches;
        var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);

        var scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0A0F0E, 6, 14);
        var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 30);
        camera.position.set(0, 0, 0.001);

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(DPR);
        renderer.setClearColor(0x000000, 0);
        mountWrap.insertBefore(renderer.domElement, mountWrap.firstChild);
        renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;';
        renderer.domElement.setAttribute('aria-hidden', 'true');

        /* ---- the room: wireframe cylinder + floor grid -------------------- */
        var R = 6;
        var room = new THREE.Group();
        scene.add(room);

        var cylGeo = new THREE.CylinderGeometry(R + 0.25, R + 0.25, 7, 64, 6, true);
        var cylMat = new THREE.MeshBasicMaterial({
            color: 0x14998F, wireframe: true, transparent: true, opacity: 0.07
        });
        room.add(new THREE.Mesh(cylGeo, cylMat));

        var gridTop = new THREE.PolarGridHelper(R + 0.2, 16, 8, 64, 0x0F766E, 0x0F766E);
        gridTop.position.y = -3.2;
        gridTop.material.transparent = true;
        gridTop.material.opacity = 0.18;
        room.add(gridTop);

        /* ---- plaques on the inner wall ------------------------------------ */
        var wall = new THREE.Group();
        scene.add(wall);

        var COLS = Math.ceil(entries.length / 3);
        var ROWS = Math.min(3, Math.ceil(entries.length / COLS));
        var ARC = Math.min(2.4, COLS * 0.34);            // radians of wall used
        var plaqueW = 1.55, plaqueH = 0.97;
        var plaques = [];

        entries.forEach(function (en, i) {
            var col = i % COLS, row = (i / COLS) | 0;
            var theta = -ARC / 2 + (COLS === 1 ? 0 : (col / (COLS - 1)) * ARC);
            var y = (ROWS === 1 ? 0 : (row - (ROWS - 1) / 2) * -1.25);

            var tex = new THREE.CanvasTexture(plaqueTexture(en, i));
            tex.anisotropy = 4;
            tex.colorSpace = THREE.SRGBColorSpace;
            var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(plaqueW, plaqueH), mat);

            mesh.position.set(Math.sin(theta) * R, y, -Math.cos(theta) * R);
            mesh.lookAt(0, y, 0);
            mesh.userData = { id: en.id, theta: theta, y: y, baseScale: 1 };
            wall.add(mesh);
            plaques.push(mesh);

            // glow backing (tier-coloured halo, shown on hover)
            var glow = new THREE.Mesh(
                new THREE.PlaneGeometry(plaqueW * 1.08, plaqueH * 1.12),
                new THREE.MeshBasicMaterial({
                    color: en.tier ? TIER_GLOW[en.tier] : 0x2DD4BF,
                    transparent: true, opacity: 0
                })
            );
            glow.position.copy(mesh.position).multiplyScalar(1.004);
            glow.quaternion.copy(mesh.quaternion);
            wall.add(glow);
            mesh.userData.glow = glow;
        });

        /* ---- interaction: drag to sweep, hover to lift, click to open ----- */
        var rotY = 0, rotTarget = 0, rotMin = -ARC / 2 - 0.2, rotMax = ARC / 2 + 0.2;
        var dragging = false, lastX = 0, dragMoved = 0;
        var raycaster = new THREE.Raycaster();
        var pointerNDC = new THREE.Vector2(-2, -2);
        var hovered = null;
        var zoomed = false;
        var gsapOK = typeof window.gsap !== 'undefined';

        var el = renderer.domElement;
        el.addEventListener('pointerdown', function (e) {
            dragging = true; dragMoved = 0; lastX = e.clientX;
            el.style.cursor = 'grabbing';
            el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove', function (e) {
            var rect = el.getBoundingClientRect();
            pointerNDC.set(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -(((e.clientY - rect.top) / rect.height) * 2 - 1)
            );
            if (dragging && !zoomed) {
                var dx = e.clientX - lastX;
                lastX = e.clientX;
                dragMoved += Math.abs(dx);
                rotTarget = Math.min(rotMax, Math.max(rotMin, rotTarget + dx * 0.0035));
            }
        });
        function endDrag() { dragging = false; el.style.cursor = 'grab'; }
        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);
        el.addEventListener('pointerleave', function () { if (!dragging) pointerNDC.set(-2, -2); });

        el.addEventListener('click', function () {
            if (dragMoved > 8 || zoomed) return;
            if (hovered) openPlaque(hovered);
        });

        var modal = document.getElementById('project-modal');
        function openPlaque(mesh) {
            if (!window.openModal) return;
            zoomed = true;
            var ud = mesh.userData;
            if (gsapOK) {
                var tl = gsap.timeline();
                // sweep the wall so the chosen plaque faces the camera.
                // apparent angle = theta + rotY (wall.rotation.y = -rotY),
                // so facing front (0) requires rotY = -theta
                tl.to({ r: rotY }, {
                    r: -ud.theta, duration: 0.55, ease: 'power3.inOut',
                    onUpdate: function () { rotTarget = rotY = this.targets()[0].r; }
                }, 0);
                // ...then step right up to it
                tl.to(camera.position, {
                    x: 0, y: ud.y * 0.85, z: -(R - 1.5),
                    duration: 0.7, ease: 'expo.inOut'
                }, 0.15);
                tl.call(function () { window.openModal(ud.id); }, null, 0.8);
            } else {
                window.openModal(ud.id);
            }
        }
        function retreat() {
            zoomed = false;
            if (gsapOK) {
                gsap.to(camera.position, { x: 0, y: 0, z: 0.001, duration: 0.8, ease: 'expo.inOut' });
            } else {
                camera.position.set(0, 0, 0.001);
            }
        }
        if (modal && 'MutationObserver' in window) {
            new MutationObserver(function () {
                var hidden = modal.classList.contains('hidden') ||
                    getComputedStyle(modal).display === 'none';
                if (hidden && zoomed) retreat();
            }).observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
        }

        function resize() {
            var w = mountWrap.clientWidth || 1, h = mountWrap.clientHeight || 1;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        var running = true;
        var clock = new THREE.Clock();

        function frame() {
            if (!running) return;
            requestAnimationFrame(frame);
            var t = clock.getElapsedTime();

            // idle sway + drag target
            var idle = zoomed ? 0 : Math.sin(t * 0.12) * 0.04;
            rotY += ((rotTarget + idle) - rotY) * 0.08;
            wall.rotation.y = -rotY;          // wall rotates opposite so target faces camera
            room.rotation.y = -rotY * 0.6;

            // hover raycast
            if (!zoomed && !dragging && pointerNDC.x > -1.5) {
                raycaster.setFromCamera(pointerNDC, camera);
                var hits = raycaster.intersectObjects(plaques, false);
                var hit = hits.length ? hits[0].object : null;
                if (hit !== hovered) {
                    if (hovered) {
                        if (gsapOK) {
                            gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
                            gsap.to(hovered.userData.glow.material, { opacity: 0, duration: 0.3 });
                        }
                    }
                    hovered = hit;
                    if (hovered) {
                        if (gsapOK) {
                            gsap.to(hovered.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.3 });
                            gsap.to(hovered.userData.glow.material, { opacity: 0.22, duration: 0.3 });
                        }
                        el.style.cursor = 'pointer';
                    } else if (!dragging) {
                        el.style.cursor = 'grab';
                    }
                }
            }

            renderer.render(scene, camera);
        }
        frame();

        document.addEventListener('visibilitychange', function () {
            running = !document.hidden;
            if (running) { clock.getDelta(); frame(); }
        });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en2) {
                var vis = en2[0].isIntersecting;
                if (vis && !running && !document.hidden) { running = true; clock.getDelta(); frame(); }
                if (!vis) running = false;
            }, { threshold: 0 }).observe(mountWrap);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
