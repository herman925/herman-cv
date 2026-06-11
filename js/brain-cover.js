/**
 * SPINE cover v3 — "The Living Brain"
 * index.html ONLY. A procedurally generated anatomical brain (side profile):
 *   - cerebrum + cerebellum + stem silhouette built from an implicit shape,
 *     ~3,400 points with a dense luminous cortex shell and sparse inner matter
 *   - four lobes = the four chapters; each lobe idles faintly in its facet
 *     ink, lights fully on hover (SVG zone or TOC), swells, and gathers
 *   - NEURONS FIRE: random cortex points flash continuously in the shader
 *   - SIGNALS TRAVEL: bright pulses arc between lobes along bezier paths,
 *     lerping their colour from the source lobe's ink to the destination's
 *   - click a lobe: the camera dives into it while it bursts, the facet-ink
 *     veil rises mid-dive (window.spineNavigate) and lands in the chapter
 *
 * The SVG (#brainMapSVG) remains the accessible hover/click/keyboard layer;
 * in GL tier its strokes hide (the canvas is the art), labels still appear.
 * Fallback (html.brain-static): the SVG engraving, untouched.
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
    // Lobe bands (brain-local x) mirroring the SVG hit-area layout:
    // education far left (occipital/cerebellum) → counselling → technology → project (frontal)
    function zoneAt(x, y, seed) {
        var wob = Math.sin(y * 9.1 + seed * 6.28) * 0.05; // organic boundary wobble
        var xx = x + wob;
        if (xx < -0.42) return 3;       // education
        if (xx < 0.02) return 0;        // counselling
        if (xx < 0.44) return 1;        // technology
        return 2;                       // project
    }

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

    /* ---- implicit brain silhouette (side profile, facing right) ---------- */
    function brainField(x, y) {
        // returns 0..1 inside (1 = boundary), >1 outside; min over parts
        // cerebrum: tilted, frontal bulge right, flatter base
        var cx = x - 0.05, cy = y - 0.16;
        var a = Math.cos(-0.10), b = Math.sin(-0.10);
        var rx = cx * a - cy * b, ry = cx * b + cy * a;
        var taper = 1 - Math.max(0, rx) * 0.12;           // gentle frontal taper
        var ryR = ry >= 0 ? 0.50 * taper : 0.40 * taper;  // flatter underside
        var f1 = Math.pow(Math.abs(rx / 0.88), 2.6) + Math.pow(Math.abs(ry / ryR), 2.2);
        // cerebellum — a distinct bulge at the lower back
        var f2 = Math.pow((x + 0.52) / 0.26, 2) + Math.pow((y + 0.40) / 0.165, 2);
        // brain stem — short taper below
        var f3 = Math.pow((x + 0.16) / 0.11, 2) + Math.pow((y + 0.54) / 0.16, 2);
        return Math.min(f1, f2, f3);
    }

    function generateBrain(count) {
        var pts = [];
        var guard = 0;
        while (pts.length < count && guard++ < count * 30) {
            var x = Math.random() * 2.1 - 1.1;
            var y = Math.random() * 1.6 - 0.82;
            var f = brainField(x, y);
            if (f > 1) continue;
            var shell = Math.pow(f, 2.2);            // 0 center → 1 boundary
            // cortex denser, but the matter inside stays present
            if (Math.random() > 0.52 + shell * 0.48) continue;
            var depth = 0.30 * Math.sqrt(Math.max(0, 1 - f * 0.8));
            var z = (Math.random() * 2 - 1) * depth;
            // gyri banding — curling cortical folds (also drives brightness)
            var gyri = 0.5 + 0.5 * Math.sin(x * 15.0 + Math.sin(y * 6.5) * 2.2 + z * 5.0);
            var w = Math.sin(x * 9.0 + z * 6.0) * Math.sin(y * 7.0 - z * 4.0);
            x += w * 0.018; y += w * 0.014;
            var seed = Math.random();
            pts.push({ x: x, y: y, z: z, shell: shell, gyri: gyri, seed: seed, zone: zoneAt(x, y, seed) });
        }
        return pts;
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
        var COUNT = isMobile ? 1600 : 4200;
        var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

        var pts = generateBrain(COUNT);
        if (pts.length < 200) { html.classList.add('brain-static'); return; }
        var N = pts.length;

        // per-zone centroids + shell node lists (signal terminals)
        var centroids = ZONES.map(function () { return { x: 0, y: 0, n: 0 }; });
        var zoneShell = [[], [], [], []];
        pts.forEach(function (p, i) {
            var c = centroids[p.zone];
            c.x += p.x; c.y += p.y; c.n++;
            if (p.shell > 0.6) zoneShell[p.zone].push(i);
        });
        centroids = centroids.map(function (c) { return { x: c.n ? c.x / c.n : 0, y: c.n ? c.y / c.n : 0 }; });

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 10);
        camera.position.z = 2.3;

        /* ---- brain points ------------------------------------------------ */
        var positions = new Float32Array(N * 3);
        var aShell = new Float32Array(N);
        var aSeed = new Float32Array(N);
        var aZone = new Float32Array(N);
        var aGyri = new Float32Array(N);
        pts.forEach(function (p, i) {
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            aShell[i] = p.shell;
            aSeed[i] = p.seed;
            aZone[i] = p.zone;
            aGyri[i] = p.gyri;
        });

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aShell', new THREE.BufferAttribute(aShell, 1));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
        geo.setAttribute('aZone', new THREE.BufferAttribute(aZone, 1));
        geo.setAttribute('aGyri', new THREE.BufferAttribute(aGyri, 1));

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
                'attribute float aShell;',
                'attribute float aSeed;',
                'attribute float aZone;',
                'attribute float aGyri;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'uniform float uHoverZone;',
                'uniform float uHoverT;',
                'uniform float uBurstZone;',
                'uniform float uBurstT;',
                'uniform vec2 uBurstCenter;',
                'varying float vShell;',
                'varying float vZone;',
                'varying float vHover;',
                'varying float vFire;',
                'varying float vGyri;',
                'void main() {',
                '  vShell = aShell;',
                '  vZone = aZone;',
                '  vGyri = aGyri;',
                '  float isHover = abs(aZone - uHoverZone) < 0.5 ? 1.0 : 0.0;',
                '  vHover = isHover * uHoverT;',
                '  // continuous neuron firing: shell points flash on their own clocks',
                '  float clk = fract(uTime * (0.05 + aSeed * 0.16) + aSeed * 19.7);',
                '  vFire = smoothstep(0.94, 0.985, clk) * (1.0 - smoothstep(0.985, 1.0, clk));',
                '  vFire *= step(0.45, aShell);',
                '  vec3 p = position;',
                '  // ambient cortical drift',
                '  p.x += sin(uTime * 0.5 + position.y * 5.0 + aSeed * 6.28) * 0.008;',
                '  p.y += cos(uTime * 0.45 + position.x * 5.0) * 0.008;',
                '  p.z += sin(uTime * 0.4 + aSeed * 6.28) * 0.012;',
                '  // hovered lobe gathers slightly',
                '  p.xy = mix(p.xy, p.xy * 0.985, vHover);',
                '  // burst dive',
                '  float isBurst = abs(aZone - uBurstZone) < 0.5 ? 1.0 : 0.0;',
                '  vec2 dir = normalize(p.xy - uBurstCenter + vec2(0.0001));',
                '  p.xy += dir * isBurst * uBurstT * 1.6;',
                '  p.z += isBurst * uBurstT * 1.2 - (1.0 - isBurst) * uBurstT * 0.8;',
                '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
                '  float size = mix(1.7, 2.5, aShell);',
                '  size *= 1.0 + vHover * 0.7 + vFire * 1.6 + isBurst * uBurstT * 1.5;',
                '  gl_PointSize = size * 2.0 * uPixelRatio * (1.6 / -mv.z);',
                '  gl_Position = projectionMatrix * mv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 uZoneColors[4];',
                'varying float vShell;',
                'varying float vZone;',
                'varying float vHover;',
                'varying float vFire;',
                'varying float vGyri;',
                'void main() {',
                '  vec2 uv = gl_PointCoord - 0.5;',
                '  float d = length(uv);',
                '  if (d > 0.5) discard;',
                '  float glow = smoothstep(0.5, 0.0, d);',
                '  vec3 gold = mix(vec3(0.58, 0.48, 0.30), vec3(0.831, 0.698, 0.455), vShell);',
                '  int zi = int(vZone + 0.5);',
                '  vec3 zc = uZoneColors[0];',
                '  if (zi == 1) zc = uZoneColors[1];',
                '  else if (zi == 2) zc = uZoneColors[2];',
                '  else if (zi == 3) zc = uZoneColors[3];',
                '  // lobes idle with a hint of their ink, fully ignite on hover',
                '  vec3 col = mix(gold, zc, 0.18 + vHover * 0.82);',
                '  // neuron flash: white-hot',
                '  col = mix(col, vec3(1.0, 0.98, 0.92), vFire * 0.85);',
                '  // gyri banding — cortical folds read as light/shadow stripes',
                '  float band = 0.55 + 0.45 * vGyri;',
                '  float alpha = glow * band * (0.62 + vShell * 0.28 + vHover * 0.14 + vFire * 0.5);',
                '  gl_FragColor = vec4(col, alpha);',
                '}'
            ].join('\n')
        });

        var points = new THREE.Points(geo, mat);
        var group = new THREE.Group();
        group.add(points);
        scene.add(group);

        /* ---- faint connective tissue (short gold filaments) -------------- */
        (function () {
            var maxSegs = isMobile ? 220 : 520;
            var segPos = [];
            var shellIdx = [];
            pts.forEach(function (p, i) { if (p.shell > 0.5) shellIdx.push(i); });
            var tries = 0;
            while (segPos.length / 6 < maxSegs && tries++ < maxSegs * 40) {
                var i = shellIdx[(Math.random() * shellIdx.length) | 0];
                var j = shellIdx[(Math.random() * shellIdx.length) | 0];
                if (i === j) continue;
                var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
                if (dx * dx + dy * dy + dz * dz > 0.012) continue;
                segPos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
            }
            var lgeo = new THREE.BufferGeometry();
            lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segPos), 3));
            var lmat = new THREE.LineBasicMaterial({
                color: 0xB8965A, transparent: true, opacity: 0.10,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            group.add(new THREE.LineSegments(lgeo, lmat));
        })();

        /* ---- traveling signals (inter-lobe pulses) ----------------------- */
        var PULSES = isMobile ? 8 : 16;
        var TRAIL = 6;
        var PPTS = PULSES * (1 + TRAIL);
        var pulsePos = new Float32Array(PPTS * 3);
        var pulseCol = new Float32Array(PPTS * 3);
        var pulseSize = new Float32Array(PPTS);
        var pulseGeo = new THREE.BufferGeometry();
        pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3).setUsage(THREE.DynamicDrawUsage));
        pulseGeo.setAttribute('aColor', new THREE.BufferAttribute(pulseCol, 3).setUsage(THREE.DynamicDrawUsage));
        pulseGeo.setAttribute('aSize', new THREE.BufferAttribute(pulseSize, 1).setUsage(THREE.DynamicDrawUsage));
        var pulseMat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: { uPixelRatio: { value: DPR }, uOpacity: { value: 1 } },
            vertexShader: [
                'attribute vec3 aColor;', 'attribute float aSize;',
                'uniform float uPixelRatio;', 'varying vec3 vColor;',
                'void main() {',
                '  vColor = aColor;',
                '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
                '  gl_PointSize = aSize * uPixelRatio * (1.6 / -mv.z);',
                '  gl_Position = projectionMatrix * mv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform float uOpacity;', 'varying vec3 vColor;',
                'void main() {',
                '  vec2 uv = gl_PointCoord - 0.5;',
                '  float d = length(uv);',
                '  if (d > 0.5) discard;',
                '  float glow = smoothstep(0.5, 0.0, d);',
                '  gl_FragColor = vec4(vColor, glow * uOpacity);',
                '}'
            ].join('\n')
        });
        group.add(new THREE.Points(pulseGeo, pulseMat));

        var hoverState = { zone: -1, t: 0 };

        function nodeOf(zone) {
            var list = zoneShell[zone];
            var p = pts[list[(Math.random() * list.length) | 0]];
            return new THREE.Vector3(p.x, p.y, p.z);
        }
        function makePulse() {
            var zi = (Math.random() * 4) | 0;
            // a hovered lobe talks more: bias source to it
            if (hoverState.zone >= 0 && Math.random() < 0.55) zi = hoverState.zone;
            var zj = (zi + 1 + ((Math.random() * 3) | 0)) % 4;
            var a = nodeOf(zi), b = nodeOf(zj);
            var mid = a.clone().add(b).multiplyScalar(0.5);
            var out = mid.clone().sub(new THREE.Vector3(0.02, 0.05, 0)).normalize();
            var ctrl = mid.add(out.multiplyScalar(0.28 + Math.random() * 0.22));
            ctrl.z += (Math.random() * 2 - 1) * 0.35;
            return {
                a: a, b: b, c: ctrl,
                t: -Math.random() * 0.6,          // stagger starts
                dur: 1.3 + Math.random() * 1.4,
                ci: zoneColors[zi], cj: zoneColors[zj]
            };
        }
        var pulses = [];
        for (var pi = 0; pi < PULSES; pi++) pulses.push(makePulse());

        var bez = new THREE.Vector3();
        function bezier(out, p, t) {
            var u = 1 - t;
            out.set(
                u * u * p.a.x + 2 * u * t * p.c.x + t * t * p.b.x,
                u * u * p.a.y + 2 * u * t * p.c.y + t * t * p.b.y,
                u * u * p.a.z + 2 * u * t * p.c.z + t * t * p.b.z
            );
            return out;
        }

        function updatePulses(dt) {
            for (var k = 0; k < PULSES; k++) {
                var p = pulses[k];
                p.t += dt / p.dur;
                if (p.t > 1.15) { pulses[k] = makePulse(); p = pulses[k]; }
                var base = k * (1 + TRAIL);
                for (var s = 0; s <= TRAIL; s++) {
                    var tt = Math.min(Math.max(p.t - s * 0.035, 0), 1);
                    var idx = (base + s) * 3;
                    var live = (p.t >= 0 && p.t <= 1.15) ? 1 : 0;
                    bezier(bez, p, tt);
                    pulsePos[idx] = bez.x; pulsePos[idx + 1] = bez.y; pulsePos[idx + 2] = bez.z;
                    // colour lerps source ink → destination ink as it travels
                    var mixT = tt;
                    var r = p.ci.x + (p.cj.x - p.ci.x) * mixT;
                    var g = p.ci.y + (p.cj.y - p.ci.y) * mixT;
                    var b2 = p.ci.z + (p.cj.z - p.ci.z) * mixT;
                    if (s === 0) { r = r * 0.45 + 0.55; g = g * 0.45 + 0.55; b2 = b2 * 0.45 + 0.55; } // white-hot head
                    pulseCol[idx] = r; pulseCol[idx + 1] = g; pulseCol[idx + 2] = b2;
                    pulseSize[base + s] = live * (s === 0 ? 5.0 : 3.4 * (1 - s / (TRAIL + 1)));
                }
            }
            pulseGeo.attributes.position.needsUpdate = true;
            pulseGeo.attributes.aColor.needsUpdate = true;
            pulseGeo.attributes.aSize.needsUpdate = true;
        }

        /* ---- renderer ----------------------------------------------------- */
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

        /* ---- interaction --------------------------------------------------- */
        var gsapOK = typeof window.gsap !== 'undefined';

        function setHover(zoneIdx) {
            if (hoverState.zone === zoneIdx && zoneIdx !== -1) return;
            if (zoneIdx !== -1) mat.uniforms.uHoverZone.value = zoneIdx;
            if (gsapOK) {
                gsap.to(hoverState, {
                    t: zoneIdx === -1 ? 0 : 1,
                    duration: 0.45,
                    ease: 'power2.out',
                    onUpdate: function () { mat.uniforms.uHoverT.value = hoverState.t; },
                    onComplete: function () { if (zoneIdx === -1) hoverState.zone = -1; }
                });
            } else {
                hoverState.t = zoneIdx === -1 ? 0 : 1;
                mat.uniforms.uHoverT.value = hoverState.t;
            }
            if (zoneIdx !== -1) hoverState.zone = zoneIdx;
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
            tl.to(camera.position, { z: 1.05, duration: 0.85, ease: 'expo.in' }, 0);
            tl.to(group.position, { x: -c.x * 1.5, y: -c.y * 1.5, duration: 0.85, ease: 'expo.in' }, 0);
            tl.to(burst, {
                t: 1, duration: 0.85, ease: 'power3.in',
                onUpdate: function () { mat.uniforms.uBurstT.value = burst.t; }
            }, 0);
            tl.to(pulseMat.uniforms.uOpacity, { value: 0, duration: 0.4 }, 0);
            tl.call(function () { window.spineNavigate(href, z.ink); }, null, 0.38);
        }

        ZONES.forEach(function (z, idx) {
            var a = svg.querySelector('a.' + z.cls);
            if (!a) return;
            a.addEventListener('mouseenter', function () { setHover(idx); });
            a.addEventListener('mouseleave', function () { setHover(-1); });
            a.addEventListener('focus', function () { setHover(idx); });
            a.addEventListener('blur', function () { setHover(-1); });
            a.setAttribute('data-no-wipe', '');
            a.addEventListener('click', function (e) {
                e.preventDefault();
                diveInto(idx, a.getAttribute('href'));
            });
        });

        document.querySelectorAll('[data-zone]').forEach(function (el) {
            var idx = ZONES.findIndex(function (z) { return z.key === el.getAttribute('data-zone'); });
            if (idx === -1) return;
            el.addEventListener('mouseenter', function () { setHover(idx); });
            el.addEventListener('mouseleave', function () { setHover(-1); });
            el.addEventListener('focus', function () { setHover(idx); });
            el.addEventListener('blur', function () { setHover(-1); });
        });

        var targetRX = 0, targetRY = 0;
        if (!isMobile) {
            window.addEventListener('pointermove', function (e) {
                var nx = (e.clientX / window.innerWidth) * 2 - 1;
                var ny = (e.clientY / window.innerHeight) * 2 - 1;
                targetRY = nx * 0.18;
                targetRX = ny * 0.11;
            });
        }

        var running = true;
        var clock = new THREE.Clock();
        var slowFrames = 0;
        var degraded = false;

        function frame() {
            if (!running) return;
            requestAnimationFrame(frame);
            var dt = Math.min(clock.getDelta(), 0.05);
            var t = clock.elapsedTime;
            mat.uniforms.uTime.value = t;

            updatePulses(dt);

            var idleY = Math.sin(t * 0.20) * 0.12;
            var idleX = Math.cos(t * 0.16) * 0.05;
            group.rotation.y += ((targetRY + idleY) - group.rotation.y) * 0.05;
            group.rotation.x += ((targetRX + idleX) - group.rotation.x) * 0.05;

            var breath = 1 + Math.sin(t * (Math.PI * 2 / 8)) * 0.014;
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

        window.addEventListener('pageshow', function (e) {
            if (e.persisted) {
                diving = false;
                camera.position.z = 2.3;
                group.position.set(0, 0, 0);
                mat.uniforms.uBurstT.value = 0;
                mat.uniforms.uBurstZone.value = -1;
                pulseMat.uniforms.uOpacity.value = 1;
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
