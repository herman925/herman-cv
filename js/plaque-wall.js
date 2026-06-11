/**
 * SPINE — The Archive Gallery (technology.html ONLY)
 *
 * A realistic museum corridor: warm grey wall, dark timber floor, brown
 * ceiling with a black lighting track and angled spot fixtures — one per
 * plaque — each throwing a soft scallop of light down the wall and a pool
 * onto the floor. Wooden benches sit along the corridor. Every project from
 * githubCardData hangs as a framed plaque (frame metal follows its award
 * tier). Drag (or touch-drag) walks the gallery; hovering a plaque warms it;
 * clicking walks the camera up to it, then opens the existing project modal
 * (#project-modal via window.openModal) — story, AI valuation, details.
 * Closing the modal steps you back into the room.
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
    var TIER_FRAME = {
        gold: 0xC9A14E,
        platinum: 0xDDE8E5,
        silver: 0x9FAAA7,
        bronze: 0xA66A38,
        iron: 0x55605C
    };
    var WOOD_FRAME = 0x5C4631;
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

        var g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#101A18');
        g.addColorStop(1, '#0A1210');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        x.globalAlpha = 0.05;
        x.strokeStyle = '#7FD1C8';
        for (var ly = 8; ly < H; ly += 9) {
            x.beginPath(); x.moveTo(0, ly); x.lineTo(W, ly); x.stroke();
        }
        x.globalAlpha = 1;

        var tierCol = TIER_COLORS[en.tier] || ACCENT;
        x.strokeStyle = tierCol;
        x.globalAlpha = en.tier ? 0.95 : 0.5;
        x.lineWidth = en.tier ? 6 : 3;
        x.strokeRect(6, 6, W - 12, H - 12);
        x.globalAlpha = 1;

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

        x.fillStyle = 'rgba(212,178,116,.8)';
        [[26, 70], [W - 26, 70], [26, H - 24], [W - 26, H - 24]].forEach(function (p) {
            x.beginPath(); x.arc(p[0], p[1], 5, 0, 7); x.fill();
        });

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

        x.fillStyle = 'rgba(45,212,191,.85)';
        x.font = '400 21px "Space Grotesk", monospace';
        var sub = en.subtitle.length > 38 ? en.subtitle.slice(0, 37) + '…' : en.subtitle;
        x.fillText(sub, 40, H - 44);

        return c;
    }

    /* ---- a soft museum light scallop (cone of light down the wall) ------- */
    function scallopTexture() {
        var c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        var x = c.getContext('2d');
        var g = x.createRadialGradient(128, 10, 8, 128, 30, 230);
        g.addColorStop(0, 'rgba(255,244,224,0.85)');
        g.addColorStop(0.35, 'rgba(255,240,214,0.30)');
        g.addColorStop(1, 'rgba(255,236,200,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 256, 256);
        return c;
    }
    function poolTexture() {
        var c = document.createElement('canvas');
        c.width = 256; c.height = 128;
        var x = c.getContext('2d');
        var g = x.createRadialGradient(128, 64, 6, 128, 64, 120);
        g.addColorStop(0, 'rgba(255,240,214,0.35)');
        g.addColorStop(1, 'rgba(255,236,200,0)');
        x.fillStyle = g;
        x.save(); x.translate(128, 64); x.scale(1, 0.5); x.translate(-128, -64);
        x.beginPath(); x.arc(128, 64, 120, 0, 7); x.fill();
        x.restore();
        return c;
    }

    async function boot() {
        var mountWrap = document.getElementById('plaque-wall');
        if (!mountWrap) return;

        var entries = getEntries();
        if (!entries.length) {
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

        /* ---- room dimensions ---------------------------------------------- */
        var SPACING = 2.35;
        var L = (entries.length - 1) * SPACING;        // corridor length
        var WALL_Z = -2.3;
        var FLOOR_Y = -1.45, CEIL_Y = 1.7;

        var scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x07090A, 4.5, 14);

        var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 40);

        var renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
        renderer.setPixelRatio(DPR);
        renderer.setClearColor(0x07090A, 1);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mountWrap.insertBefore(renderer.domElement, mountWrap.firstChild);
        renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;';
        renderer.domElement.setAttribute('aria-hidden', 'true');

        /* ---- lights --------------------------------------------------------- */
        scene.add(new THREE.AmbientLight(0xFFF0DC, 0.5));
        var keyLight = new THREE.DirectionalLight(0xFFF6E8, 0.4);
        keyLight.position.set(2, 4, 5);
        scene.add(keyLight);

        /* ---- the room ------------------------------------------------------- */
        var PAD = 4;
        var wallMat = new THREE.MeshStandardMaterial({ color: 0xB6B1A8, roughness: 0.95, metalness: 0 });
        var wall = new THREE.Mesh(
            new THREE.PlaneGeometry(L + PAD * 2, CEIL_Y - FLOOR_Y),
            wallMat
        );
        wall.position.set(L / 2, (CEIL_Y + FLOOR_Y) / 2, WALL_Z);
        scene.add(wall);

        var floorMat = new THREE.MeshStandardMaterial({ color: 0x17120D, roughness: 0.85, metalness: 0.05 });
        var floor = new THREE.Mesh(new THREE.PlaneGeometry(L + PAD * 2, 9), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(L / 2, FLOOR_Y, WALL_Z + 4.5);
        scene.add(floor);

        var ceilMat = new THREE.MeshStandardMaterial({ color: 0x4A3A2C, roughness: 0.95 });
        var ceil = new THREE.Mesh(new THREE.PlaneGeometry(L + PAD * 2, 9), ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(L / 2, CEIL_Y, WALL_Z + 4.5);
        scene.add(ceil);

        /* ---- the lighting track + fixtures ---------------------------------- */
        var trackMat = new THREE.MeshStandardMaterial({ color: 0x0C0C0C, roughness: 0.5, metalness: 0.6 });
        var track = new THREE.Mesh(new THREE.BoxGeometry(L + PAD * 2, 0.05, 0.07), trackMat);
        track.position.set(L / 2, CEIL_Y - 0.03, WALL_Z + 1.15);
        scene.add(track);

        var fixtureGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.22, 12);
        var lensMat = new THREE.MeshBasicMaterial({ color: 0xFFF2D8 });
        var lensGeo = new THREE.CircleGeometry(0.035, 12);

        var scallopTex = new THREE.CanvasTexture(scallopTexture());
        scallopTex.colorSpace = THREE.SRGBColorSpace;
        var poolTex = new THREE.CanvasTexture(poolTexture());
        poolTex.colorSpace = THREE.SRGBColorSpace;

        /* ---- framed plaques + their light ------------------------------------ */
        var plaques = [];
        var PLAQUE_Y = 0.12;
        entries.forEach(function (en, i) {
            var px = i * SPACING;
            var featured = en.tier === 'gold' || en.tier === 'platinum';
            var w = featured ? 1.5 : 1.22;
            var h = w * 0.625;

            // frame: a shallow box, metal follows the tier
            var frameMat = new THREE.MeshStandardMaterial({
                color: en.tier ? TIER_FRAME[en.tier] : WOOD_FRAME,
                roughness: en.tier ? 0.35 : 0.6,
                metalness: en.tier ? 0.75 : 0.15
            });
            var frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.07), frameMat);
            frame.position.set(px, PLAQUE_Y, WALL_Z + 0.045);
            scene.add(frame);

            // the plaque face — emissive so the artwork reads "lit"
            var tex = new THREE.CanvasTexture(plaqueTexture(en, i));
            tex.anisotropy = 4;
            tex.colorSpace = THREE.SRGBColorSpace;
            var faceMat = new THREE.MeshStandardMaterial({
                map: tex,
                emissive: 0xFFFFFF,
                emissiveMap: tex,
                emissiveIntensity: 0.55,
                roughness: 0.6,
                metalness: 0
            });
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), faceMat);
            mesh.position.set(px, PLAQUE_Y, WALL_Z + 0.085);
            mesh.userData = { id: en.id, x: px, y: PLAQUE_Y, mat: faceMat, baseEmissive: 0.55 };
            scene.add(mesh);
            plaques.push(mesh);

            // ceiling fixture angled at the plaque
            var fixture = new THREE.Mesh(fixtureGeo, trackMat);
            fixture.position.set(px, CEIL_Y - 0.14, WALL_Z + 1.15);
            fixture.lookAt(px, PLAQUE_Y + 0.4, WALL_Z);
            fixture.rotateX(Math.PI / 2);
            scene.add(fixture);
            var lens = new THREE.Mesh(lensGeo, lensMat);
            lens.position.set(px, CEIL_Y - 0.24, WALL_Z + 1.08);
            lens.lookAt(px, PLAQUE_Y, WALL_Z + 0.3);
            scene.add(lens);

            // light scallop washing down the wall over the plaque
            var scH = h * 2.6, scW = w * 1.9;
            var scallop = new THREE.Mesh(
                new THREE.PlaneGeometry(scW, scH),
                new THREE.MeshBasicMaterial({
                    map: scallopTex, transparent: true, opacity: 0.85,
                    blending: THREE.AdditiveBlending, depthWrite: false
                })
            );
            scallop.position.set(px, PLAQUE_Y + scH * 0.28, WALL_Z + 0.01);
            scene.add(scallop);
            mesh.userData.scallop = scallop;

            // pool of light on the floor beneath
            var pool = new THREE.Mesh(
                new THREE.PlaneGeometry(w * 2.2, 1.1),
                new THREE.MeshBasicMaterial({
                    map: poolTex, transparent: true, opacity: 0.5,
                    blending: THREE.AdditiveBlending, depthWrite: false
                })
            );
            pool.rotation.x = -Math.PI / 2;
            pool.position.set(px, FLOOR_Y + 0.01, WALL_Z + 0.7);
            scene.add(pool);
        });

        /* ---- benches ---------------------------------------------------------- */
        function bench(bx) {
            var grp = new THREE.Group();
            var topMat = new THREE.MeshStandardMaterial({ color: 0x6B4A2F, roughness: 0.65 });
            var legMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5, metalness: 0.5 });
            var top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.5), topMat);
            top.position.y = FLOOR_Y + 0.46;
            grp.add(top);
            [-0.7, 0.7].forEach(function (o) {
                var leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.44), legMat);
                leg.position.set(o, FLOOR_Y + 0.21, 0);
                grp.add(leg);
            });
            grp.position.set(bx, 0, WALL_Z + 1.55);
            grp.rotation.y = 0.06;
            scene.add(grp);
        }
        bench(L * 0.30);
        bench(L * 0.74);

        /* ---- camera: walking the corridor -------------------------------------- */
        var CAM_Z = 1.1, LOOK_AHEAD = 1.4;
        var camX = 0, camXTarget = 0;
        var camMin = -0.5, camMax = L + 0.5;
        var zoomed = false;
        var gsapOK = typeof window.gsap !== 'undefined';

        function aimCamera() {
            camera.position.set(camX, 0.1, CAM_Z);
            camera.lookAt(camX + LOOK_AHEAD, -0.18, WALL_Z);
        }
        aimCamera();

        /* ---- interaction -------------------------------------------------------- */
        var dragging = false, lastX = 0, dragMoved = 0;
        var raycaster = new THREE.Raycaster();
        var pointerNDC = new THREE.Vector2(-2, -2);
        var hovered = null;

        var el = renderer.domElement;
        el.addEventListener('pointerdown', function (e) {
            dragging = true; dragMoved = 0; lastX = e.clientX;
            el.style.cursor = 'grabbing';
            try { el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
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
                camXTarget = Math.min(camMax, Math.max(camMin, camXTarget - dx * 0.012));
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

        // debug handle for automated QA
        window.__wallDebug = {
            pick: function (cx, cy) {
                var rect = el.getBoundingClientRect();
                var v = new THREE.Vector2(
                    ((cx - rect.left) / rect.width) * 2 - 1,
                    -(((cy - rect.top) / rect.height) * 2 - 1)
                );
                var rc = new THREE.Raycaster();
                rc.setFromCamera(v, camera);
                var hits = rc.intersectObjects(plaques, false);
                return hits.length ? hits[0].object.userData.id : null;
            },
            camera: function () { return { p: camera.position.toArray(), aspect: camera.aspect }; },
            plaque0: function () { return plaques[0].position.toArray(); }
        };

        var modal = document.getElementById('project-modal');
        var preZoom = { x: 0 };
        function openPlaque(mesh) {
            if (!window.openModal) return;
            zoomed = true;
            var ud = mesh.userData;
            preZoom.x = camX;
            if (gsapOK) {
                var walk = { x: camX, z: CAM_Z, look: LOOK_AHEAD };
                gsap.to(walk, {
                    x: ud.x, z: WALL_Z + 1.45, look: 0,
                    duration: 0.9, ease: 'expo.inOut',
                    onUpdate: function () {
                        camera.position.set(walk.x, 0.08, walk.z);
                        camera.lookAt(walk.x + walk.look, ud.y * 0.6, WALL_Z);
                    },
                    onComplete: function () { window.openModal(ud.id); }
                });
            } else {
                window.openModal(ud.id);
            }
        }
        function retreat() {
            zoomed = false;
            if (gsapOK) {
                var walk = { x: camera.position.x, z: camera.position.z, look: 0 };
                gsap.to(walk, {
                    x: preZoom.x, z: CAM_Z, look: LOOK_AHEAD,
                    duration: 0.9, ease: 'expo.inOut',
                    onUpdate: function () {
                        camera.position.set(walk.x, 0.05, walk.z);
                        camera.lookAt(walk.x + walk.look, 0, WALL_Z);
                    },
                    onComplete: function () { camX = camXTarget = preZoom.x; aimCamera(); }
                });
            } else {
                camX = camXTarget = preZoom.x;
                aimCamera();
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

            if (!zoomed) {
                var idle = Math.sin(t * 0.10) * 0.06;
                camX += ((camXTarget + idle) - camX) * 0.07;
                aimCamera();
            }

            if (!zoomed && !dragging && pointerNDC.x > -1.5) {
                raycaster.setFromCamera(pointerNDC, camera);
                var hits = raycaster.intersectObjects(plaques, false);
                var hit = hits.length ? hits[0].object : null;
                if (hit !== hovered) {
                    if (hovered && gsapOK) {
                        gsap.to(hovered.userData.mat, { emissiveIntensity: hovered.userData.baseEmissive, duration: 0.3 });
                        gsap.to(hovered.userData.scallop.material, { opacity: 0.85, duration: 0.3 });
                        gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
                    }
                    hovered = hit;
                    if (hovered) {
                        if (gsapOK) {
                            gsap.to(hovered.userData.mat, { emissiveIntensity: 0.95, duration: 0.3 });
                            gsap.to(hovered.userData.scallop.material, { opacity: 1.25, duration: 0.3 });
                            gsap.to(hovered.scale, { x: 1.04, y: 1.04, z: 1, duration: 0.3 });
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
