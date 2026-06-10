/**
 * SPINE cover v2 — "The Living Brain"
 * One three.js scene, index.html ONLY. Particle constellation sampled live
 * from the #brainMapSVG geometry, with PER-FACET region identity:
 *   - idle: gold engraving drifting in 3D, slow auto-rotation + breath
 *   - hover (SVG zone or TOC entry): that region's particles tint to its
 *     facet ink, swell, and pull together
 *   - click: 3D dolly-zoom INTO the region while its particles burst outward,
 *     then the facet-ink veil carries you into the chapter (spineNavigate)
 *
 * The SVG stays the accessible click/keyboard layer; canvas is aria-hidden.
 * Fallback: html.brain-static → SVG engraving only.
 */
(function () {
    'use strict';

    var html = document.documentElement;

    var ZONES = [
        { key: 'counselling', cls: 'zone-counselling', ink: 'sienna', color: [0.976, 0.451, 0.086] }, // #F97316
        { key: 'technology', cls: 'zone-technology', ink: 'tealink', color: [0.176, 0.831, 0.749] },  // #2DD4BF
        { key: 'project', cls: 'zone-project', ink: 'oxblood', color: [0.882, 0.114, 0.282] },        // #E11D48
        { key: 'education', cls: 'zone-education', ink: 'moss', color: [0.063, 0.725, 0.506] },       // #10B981
    ];

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

    function isDecorOnly(el) {
        return el.classList.contains('hit-area') ||
            el.classList.contains('connector-line') || el.classList.contains('connector-dot') ||
            (el.closest && el.closest('.brain-label-group') !== null);
    }

    /** Sample points per zone. Returns { pts: [[x,y,size,zoneIdx]...], vb } */
    function sampleSVG(svg, count) {
        var vb = svg.viewBox.baseVal;
        var raw = []; // [el, len, zoneIdx] for lineish; circles pushed directly
        var pts = [];

        function zoneOf(el) {
            var a = el.closest && el.closest('a.brain-section');
            if (!a) {
                var g = el.closest && el.closest('.brain-highlight [class*="zone-"]');
                a = g;
            }
            if (!a) return -1;
            for (var i = 0; i < ZONES.length; i++) {
                if (a.classList.contains(ZONES[i].cls)) return i;
            }
            return -1;
        }

        svg.querySelectorAll('line, path, polyline, circle').forEach(function (el) {
            if (isDecorOnly(el)) return;
            var z = zoneOf(el);
            if (el.tagName === 'circle') {
                if (!el.classList.contains('network-node')) return;
                pts.push([+el.getAttribute('cx'), +el.getAttribute('cy'), 1.7, z]);
            } else if (el.getTotalLength) {
                try {
                    var len = el.getTotalLength();
                    if (len > 0) raw.push([el, len, z]);
                } catch (e) { /* skip */ }
            }
        });

        var totalLen = raw.reduce(function (s, p) { return s + p[1]; }, 0) || 1;
        var remaining = Math.max(count - pts.length, 0);
        raw.forEach(function (trip) {
            var el = trip[0], len = trip[1], z = trip[2];
            var n = Math.max(2, Math.round(remaining * (len / totalLen)));
            // SVG line coordinates are inside <g transform="translate(40,0)">
            for (var i = 0; i < n; i++) {
                var p = el.getPointAtLength((i / (n - 1)) * len);
                pts.push([p.x, p.y, 1.0, z]);
            }
        });

        // The geometry lives in a translate(40,0) group; getPointAtLength/cx are
        // local coords, so apply the same offset before normalizing.
        var cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
        var scale = 2 / Math.max(vb.width, vb.height);
        return pts.map(function (p) {
            return [((p[0] + 40) - cx) * scale, -((p[1]) - cy) * scale, p[2], p[3]];
        });
    }

    async function boot() {
        var svg = document.getElementById('brainMapSVG');
        var mount = document.getElementById('brain-canvas-mount');
        if (!svg || !mount) { html.classList.add('brain-static'); return; }

        var THREE;
        try {
            THREE = await import('three');
        } catch (e) {
            html.classList.add('brain-static');
            return;
        }

        var isMobile = window.matchMedia('(max-width: 767px)').matches;
        var COUNT = isMobile ? 900 : 2600;
        var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

        var pts = sampleSVG(svg, COUNT);
        if (pts.length < 50) { html.classList.add('brain-static'); return; }

        // Per-zone centroids (for burst + dolly targets)
        var centroids = ZONES.map(function () { return { x: 0, y: 0, n: 0 }; });
        pts.forEach(function (p) {
            if (p[3] >= 0) { var c = centroids[p[3]]; c.x += p[0]; c.y += p[1]; c.n++; }
        });
        centroids = centroids.map(function (c) { return { x: c.n ? c.x / c.n : 0, y: c.n ? c.y / c.n : 0 }; });

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 10);
        camera.position.z = 2.3;

        var N = pts.length;
        var positions = new Float32Array(N * 3);
        var sizes = new Float32Array(N);
        var shades = new Float32Array(N);
        var zones = new Float32Array(N);
        pts.forEach(function (p, i) {
            positions[i * 3] = p[0];
            positions[i * 3 + 1] = p[1];
            positions[i * 3 + 2] = (Math.sin(i * 12.9898) * 0.5) * 0.22; // deeper Z spread — real volume
            sizes[i] = p[2];
            shades[i] = (Math.sin(i * 78.233) + 1) / 2;
            zones[i] = p[3];
        });

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aShade', new THREE.BufferAttribute(shades, 1));
        geo.setAttribute('aZone', new THREE.BufferAttribute(zones, 1));

        var zoneColors = ZONES.map(function (z) { return new THREE.Vector3(z.color[0], z.color[1], z.color[2]); });

        var mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: DPR },
                uHoverZone: { value: -1 },
                uHoverT: { value: 0 },
                uBurstZone: { value: -1 },
                uBurstT: { value: 0 },
                uBurstCenter: { value: new THREE.Vector2(0, 0) },
                uZoneColors: { value: zoneColors },
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute float aShade;',
                'attribute float aZone;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'uniform float uHoverZone;',
                'uniform float uHoverT;',
                'uniform float uBurstZone;',
                'uniform float uBurstT;',
                'uniform vec2 uBurstCenter;',
                'varying float vShade;',
                'varying float vZoneMix;',
                'varying float vZone;',
                'void main() {',
                '  vShade = aShade;',
                '  vZone = aZone;',
                '  float isHover = (aZone >= 0.0 && abs(aZone - uHoverZone) < 0.5) ? 1.0 : 0.0;',
                '  vZoneMix = isHover * uHoverT;',
                '  vec3 p = position;',
                '  p.x += sin(uTime * 0.6 + position.y * 4.0) * 0.012;',
                '  p.y += cos(uTime * 0.5 + position.x * 4.0) * 0.012;',
                '  p.z += sin(uTime * 0.4 + position.x * 6.0) * 0.03;',
                '  // hovered region breathes inward slightly — a synapse gathering',
                '  p.xy = mix(p.xy, p.xy * 0.985, vZoneMix);',
                '  // burst: the chosen region accelerates outward from its centroid',
                '  float isBurst = (aZone >= 0.0 && abs(aZone - uBurstZone) < 0.5) ? 1.0 : 0.0;',
                '  vec2 dir = normalize(p.xy - uBurstCenter + vec2(0.0001));',
                '  p.xy += dir * isBurst * uBurstT * 1.6;',
                '  p.z += isBurst * uBurstT * 1.2;',
                '  // non-burst regions recede during the dive',
                '  p.z -= (1.0 - isBurst) * uBurstT * 0.8;',
                '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
                '  float swell = 1.0 + vZoneMix * 0.8 + isBurst * uBurstT * 1.5;',
                '  gl_PointSize = aSize * 2.2 * swell * uPixelRatio * (1.6 / -mv.z);',
                '  gl_Position = projectionMatrix * mv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 uZoneColors[4];',
                'varying float vShade;',
                'varying float vZoneMix;',
                'varying float vZone;',
                'void main() {',
                '  vec2 uv = gl_PointCoord - 0.5;',
                '  float d = length(uv);',
                '  if (d > 0.5) discard;',
                '  float glow = smoothstep(0.5, 0.0, d);',
                '  vec3 gold = mix(vec3(0.722, 0.588, 0.353), vec3(0.831, 0.698, 0.455), vShade);',
                '  vec3 col = gold;',
                '  if (vZone >= -0.5 && vZone < 3.5 && vZoneMix > 0.001) {',
                '    int zi = int(vZone + 0.5);',
                '    vec3 zc = uZoneColors[0];',
                '    if (zi == 1) zc = uZoneColors[1];',
                '    else if (zi == 2) zc = uZoneColors[2];',
                '    else if (zi == 3) zc = uZoneColors[3];',
                '    col = mix(gold, zc, vZoneMix);',
                '  }',
                '  gl_FragColor = vec4(col, glow * (0.85 + vZoneMix * 0.15));',
                '}'
            ].join('\n')
        });

        var points = new THREE.Points(geo, mat);
        var group = new THREE.Group();
        group.add(points);
        scene.add(group);

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(DPR);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');

        function resize() {
            var w = mount.clientWidth || 1, h = mount.clientHeight || 1;
            renderer.setSize(w, h, false);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        // ---- Interaction state -------------------------------------------------
        var hover = { zone: -1, t: 0 };
        var gsapOK = typeof window.gsap !== 'undefined';

        function setHover(zoneIdx) {
            if (hover.zone === zoneIdx && zoneIdx !== -1) return;
            if (zoneIdx !== -1) mat.uniforms.uHoverZone.value = zoneIdx;
            if (gsapOK) {
                gsap.to(hover, {
                    t: zoneIdx === -1 ? 0 : 1,
                    duration: 0.45,
                    ease: 'power2.out',
                    onUpdate: function () { mat.uniforms.uHoverT.value = hover.t; },
                    onComplete: function () { if (zoneIdx === -1) hover.zone = -1; }
                });
            } else {
                hover.t = zoneIdx === -1 ? 0 : 1;
                mat.uniforms.uHoverT.value = hover.t;
            }
            if (zoneIdx !== -1) hover.zone = zoneIdx;
        }

        var diving = false;
        function diveInto(zoneIdx, href) {
            if (diving) return;
            diving = true;
            var z = ZONES[zoneIdx];
            var c = centroids[zoneIdx];
            mat.uniforms.uBurstZone.value = zoneIdx;
            mat.uniforms.uBurstCenter.value.set(c.x, c.y);

            if (!gsapOK || !window.spineNavigate) {
                if (window.spineNavigate) window.spineNavigate(href, z.ink);
                else location.href = href;
                return;
            }

            var burst = { t: 0 };
            var tl = gsap.timeline();
            // dolly the camera INTO the region while it bursts open
            tl.to(camera.position, { z: 1.05, duration: 0.85, ease: 'expo.in' }, 0);
            tl.to(group.position, { x: -c.x * 1.5, y: -c.y * 1.5, duration: 0.85, ease: 'expo.in' }, 0);
            tl.to(burst, {
                t: 1, duration: 0.85, ease: 'power3.in',
                onUpdate: function () { mat.uniforms.uBurstT.value = burst.t; }
            }, 0);
            // veil rises mid-dive so the colour handoff is seamless
            tl.call(function () { window.spineNavigate(href, z.ink); }, null, 0.38);
        }

        // SVG zones drive hover + dive
        ZONES.forEach(function (z, idx) {
            var a = svg.querySelector('a.' + z.cls);
            if (!a) return;
            a.addEventListener('mouseenter', function () { setHover(idx); });
            a.addEventListener('mouseleave', function () { setHover(-1); });
            a.addEventListener('focus', function () { setHover(idx); });
            a.addEventListener('blur', function () { setHover(-1); });
            a.setAttribute('data-no-wipe', '');   // transitions.js stands down; the dive owns this exit
            a.addEventListener('click', function (e) {
                e.preventDefault();
                diveInto(idx, a.getAttribute('href'));
            });
        });

        // TOC entries echo into the brain
        document.querySelectorAll('[data-zone]').forEach(function (el) {
            var idx = ZONES.findIndex(function (z) { return z.key === el.getAttribute('data-zone'); });
            if (idx === -1) return;
            el.addEventListener('mouseenter', function () { setHover(idx); });
            el.addEventListener('mouseleave', function () { setHover(-1); });
            el.addEventListener('focus', function () { setHover(idx); });
            el.addEventListener('blur', function () { setHover(-1); });
        });

        // Pointer parallax (desktop)
        var targetRX = 0, targetRY = 0;
        if (!isMobile) {
            window.addEventListener('pointermove', function (e) {
                var nx = (e.clientX / window.innerWidth) * 2 - 1;
                var ny = (e.clientY / window.innerHeight) * 2 - 1;
                targetRY = nx * 0.16;
                targetRX = ny * 0.10;
            });
        }

        var running = true;
        var clock = new THREE.Clock();
        var slowFrames = 0;
        var degraded = false;

        function frame() {
            if (!running) return;
            requestAnimationFrame(frame);
            var dt = clock.getDelta();
            var t = clock.elapsedTime;
            mat.uniforms.uTime.value = t;

            // slow autonomous rotation + pointer parallax — the brain floats in 3D
            var idleY = Math.sin(t * 0.22) * 0.10;
            var idleX = Math.cos(t * 0.17) * 0.05;
            group.rotation.y += ((targetRY + idleY) - group.rotation.y) * 0.05;
            group.rotation.x += ((targetRX + idleX) - group.rotation.x) * 0.05;

            var breath = 1 + Math.sin(t * (Math.PI * 2 / 8)) * 0.015;
            points.scale.setScalar(breath);
            renderer.render(scene, camera);

            if (!degraded) {
                if (dt > 0.024) { slowFrames++; } else { slowFrames = 0; }
                if (slowFrames >= 60) {
                    degraded = true;
                    geo.setDrawRange(0, Math.floor(N / 2));
                    targetRX = targetRY = 0;
                }
            }
        }
        frame();

        document.addEventListener('visibilitychange', function () {
            running = !document.hidden;
            if (running) { clock.getDelta(); frame(); }
        });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                var vis = entries[0].isIntersecting;
                if (vis && !running && !document.hidden) { running = true; clock.getDelta(); frame(); }
                if (!vis) running = false;
            }, { threshold: 0 }).observe(mount);
        }

        // restore on bfcache return (the dive left us zoomed in)
        window.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                diving = false;
                camera.position.z = 2.3;
                group.position.set(0, 0, 0);
                mat.uniforms.uBurstT.value = 0;
                mat.uniforms.uBurstZone.value = -1;
            }
        });

        html.classList.add('brain-gl');
    }

    if (!gatePasses()) {
        html.classList.add('brain-static');
        return;
    }

    function start() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(function () { boot(); }, { timeout: 1500 });
        } else {
            setTimeout(boot, 200);
        }
    }
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);
})();
