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

        // The brain sits inside a human head wireframe: shrink + lift it into
        // the cranium (zones were assigned from raw coords before this).
        var BS = 0.72, BOX = -0.04, BOY = 0.30;
        pts.forEach(function (p) {
            p.x = p.x * BS + BOX;
            p.y = p.y * BS + BOY;
            p.z = p.z * BS;
        });

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
        group.scale.setScalar(0.8);   // fit head profile inside the camera frame
        scene.add(group);

        /* ---- the human head: gold wireframe sampled from the head icon ---- */
        // Owner-supplied head-with-brain SVG (viewBox content ~0..560 x 0..612).
        // Subpath 1 = outer head silhouette; subpath 2 = inner brain-fold outline.
        var HEAD_OUTER_D = 'M542.346,235.523c-6.647-76.801-52.108-147.626-115.793-190.052c-34.9-23.249-75.336-37.519-116.84-42.917 C195.319-12.325,74.841,37.92,31.685,150.284c-37.099,96.597-0.52,192.495,65.913,265.632 c23.974,26.393,27.298,76.017,27.298,109.446v67.792c0,10.408,8.438,18.846,18.846,18.846h245.301 c9.929,0,18.135-7.704,18.806-17.61c0.903-13.335,2.386-25.062,2.386-25.062c5.129-21.996,23.884-39.634,63.768-33.231 c41.844,6.713,68.237-5.756,70.584-33.617c0.774-9.191,1.273-87.695,1.273-87.695c1.999-1.142,15.117-3.75,34.236-8.097 c14.867-3.38,20.103-21.838,9.263-32.561c-43.469-43.001-49.299-63.047-50.378-67.362 C533.598,285.327,544.296,258.049,542.346,235.523z';
        var HEAD_INNER_D = 'M461.327,209.858c-6.039,7.651-12.918,9.146-16.556,9.346 c-1.198,0.066-2.033,1.206-1.706,2.36c1.868,6.582,3.768,24.711-28.687,31.77c-30.438,6.615-48.844,30.29-60.863,42.313 c-9.233,9.225-21.723,13.495-34.183,16.299c-12.729,2.864-25.341,5.37-35.384,14.415c-10.577,9.527-25.495,61.985-28.027,71.104 c-0.222,0.801-0.951,1.352-1.783,1.352h-15.621c-0.877,0-1.636-0.614-1.817-1.473l-7.569-35.803 c-0.318-1.504-73.698,4.534-79.347-28.22c-0.198-1.149-1.359-1.862-2.456-1.466c-7.056,2.546-29.692,8.81-41.91-10.122 c-8.663-13.423-6.362-25.955-5.155-30.282c0.25-0.896-0.2-1.828-1.055-2.196c-6.225-2.677-28.719-15.289-25.669-56.784 c2.461-33.448,25.085-48.273,21.922-53.417c-9.124-14.837-1.193-39.431,17.5-44.921c0.753-0.221,1.288-0.888,1.359-1.67 l0.789-8.719c2.596-30.743,42.991-50.226,70.455-37.445c1.059,0.493,2.318-0.032,2.67-1.145 c3.438-10.898,10.377-13.898,12.226-14.938c8.515-4.791,19.572-4.199,28.374-0.586c0.712,0.292,1.523,0.114,2.048-0.448 c2.501-2.679,12.756-11.182,29.739-11.182c17.42,0,26.275,8.465,29.371,10.835c0.569,0.435,1.334,0.513,1.972,0.188 c3.919-2.004,18.228-8.411,32.554-3.476c10.818,3.732,16.959,13.578,18.893,17.161c0.413,0.766,1.281,1.157,2.128,0.957 c5.137-1.217,22.902-4.629,37.827,2.111c15.772,7.13,20.693,17.433,21.948,20.887c0.255,0.703,0.914,1.174,1.662,1.204 c3.42,0.136,12.858,0.964,18.691,5.866c10.3,8.66,9.294,15.488,8.108,18.41c-0.361,0.89,0.038,1.91,0.901,2.333 c4.704,2.307,17.892,9.927,26.073,26.112C472.011,182.884,467.505,202.031,461.327,209.858z';

        function samplePathPoints(d, n) {
            var NS = 'http://www.w3.org/2000/svg';
            var tmp = document.createElementNS(NS, 'svg');
            tmp.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden');
            var pathEl = document.createElementNS(NS, 'path');
            pathEl.setAttribute('d', d);
            tmp.appendChild(pathEl);
            document.body.appendChild(tmp);
            var out = [];
            try {
                var len = pathEl.getTotalLength();
                for (var i = 0; i <= n; i++) {
                    var p = pathEl.getPointAtLength((i / n) * len);
                    out.push([p.x, p.y]);
                }
            } catch (e) { /* ignore */ }
            document.body.removeChild(tmp);
            return out;
        }

        var headTransform = null;   // raw icon coords → scene coords
        (function () {
            var outer = samplePathPoints(HEAD_OUTER_D, 300);
            var inner = samplePathPoints(HEAD_INNER_D, 220);
            if (outer.length < 50) return;
            // normalize over the outer silhouette; face points right in the icon
            var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
            outer.forEach(function (p) {
                if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
                if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
            });
            var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
            var s = 2 / Math.max(maxX - minX, maxY - minY);
            headTransform = function (p) {
                return new THREE.Vector3((p[0] - cx) * s, -(p[1] - cy) * s, 0);
            };
            var headMat = new THREE.LineBasicMaterial({
                color: 0xB8965A, transparent: true, opacity: 0.22,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            var outerPts = outer.map(headTransform);
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outerPts), headMat));
            // the inner brain-fold outline, fainter — the skull's drawing of itself
            var innerPts = inner.map(headTransform);
            var innerMat = headMat.clone();
            innerMat.opacity = 0.12;
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(innerPts), innerMat));
            // sparse shimmer dots along the silhouette
            var dotPts = [];
            for (var di = 0; di < outerPts.length; di += 8) dotPts.push(outerPts[di]);
            var dotMat = new THREE.PointsMaterial({
                color: 0xD4B274, size: 2.2, sizeAttenuation: false,
                transparent: true, opacity: 0.35,
                blending: THREE.AdditiveBlending, depthWrite: false
            });
            group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dotPts), dotMat));

            // refit the particle brain into the icon's inner brain region
            var iMinX = 1e9, iMaxX = -1e9, iMinY = 1e9, iMaxY = -1e9;
            innerPts.forEach(function (v) {
                if (v.x < iMinX) iMinX = v.x; if (v.x > iMaxX) iMaxX = v.x;
                if (v.y < iMinY) iMinY = v.y; if (v.y > iMaxY) iMaxY = v.y;
            });
            // brain cloud raw bounds (post BS/BOX/BOY transform)
            var bMinX = 1e9, bMaxX = -1e9, bMinY = 1e9, bMaxY = -1e9;
            for (var bi = 0; bi < N; bi++) {
                var px = positions[bi * 3], py = positions[bi * 3 + 1];
                if (px < bMinX) bMinX = px; if (px > bMaxX) bMaxX = px;
                if (py < bMinY) bMinY = py; if (py > bMaxY) bMaxY = py;
            }
            var fit = Math.min((iMaxX - iMinX) / (bMaxX - bMinX), (iMaxY - iMinY) / (bMaxY - bMinY)) * 0.94;
            var bcx = (bMinX + bMaxX) / 2, bcy = (bMinY + bMaxY) / 2;
            var icx = (iMinX + iMaxX) / 2, icy = (iMinY + iMaxY) / 2 + (iMaxY - iMinY) * 0.03;
            for (var bj = 0; bj < N; bj++) {
                positions[bj * 3] = (positions[bj * 3] - bcx) * fit + icx;
                positions[bj * 3 + 1] = (positions[bj * 3 + 1] - bcy) * fit + icy;
                positions[bj * 3 + 2] *= fit;
                pts[bj].x = positions[bj * 3];
                pts[bj].y = positions[bj * 3 + 1];
                pts[bj].z = positions[bj * 3 + 2];
            }
            geo.attributes.position.needsUpdate = true;
            // recompute zone centroids in the new frame
            var cAcc = ZONES.map(function () { return { x: 0, y: 0, n: 0 }; });
            pts.forEach(function (p) {
                var c = cAcc[p.zone];
                c.x += p.x; c.y += p.y; c.n++;
            });
            centroids = cAcc.map(function (c) { return { x: c.n ? c.x / c.n : 0, y: c.n ? c.y / c.n : 0 }; });
        })();

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

        /* ---- neural cascades --------------------------------------------
           Real firing: a burst begins at one origin and EXPANDS outward
           through branching paths, hop by hop, the signal recoloring as it
           crosses into other lobes; each arrival flashes the node.
        ------------------------------------------------------------------- */
        var PPTS = 260;   // pooled sprite slots (heads + trails + node flashes)
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

        /* node graph over the cortex (cascade pathways) */
        var nodeIdx = [];
        for (var ni = 0; ni < N; ni++) {
            if (pts[ni].shell > 0.55) nodeIdx.push(ni);
        }
        // thin to a manageable graph
        var NODE_CAP = isMobile ? 320 : 640;
        if (nodeIdx.length > NODE_CAP) {
            var step = nodeIdx.length / NODE_CAP;
            var thinned = [];
            for (var ti = 0; ti < NODE_CAP; ti++) thinned.push(nodeIdx[(ti * step) | 0]);
            nodeIdx = thinned;
        }
        var NN = nodeIdx.length;
        var nodeX = new Float32Array(NN), nodeY = new Float32Array(NN), nodeZ = new Float32Array(NN);
        var nodeZoneArr = new Uint8Array(NN);
        nodeIdx.forEach(function (pi2, k) {
            nodeX[k] = pts[pi2].x; nodeY[k] = pts[pi2].y; nodeZ[k] = pts[pi2].z;
            nodeZoneArr[k] = pts[pi2].zone;
        });
        var nodesByZone = [[], [], [], []];
        for (var nz = 0; nz < NN; nz++) nodesByZone[nodeZoneArr[nz]].push(nz);
        // adjacency: up to 5 neighbours within hop radius
        var HOP2 = 0.012;
        var adj = [];
        for (var ai = 0; ai < NN; ai++) {
            var nbrs = [];
            for (var aj = 0; aj < NN && nbrs.length < 5; aj++) {
                if (ai === aj) continue;
                var ddx = nodeX[ai] - nodeX[aj], ddy = nodeY[ai] - nodeY[aj], ddz = nodeZ[ai] - nodeZ[aj];
                if (ddx * ddx + ddy * ddy + ddz * ddz < HOP2) nbrs.push(aj);
            }
            adj.push(nbrs);
        }

        var HOP_DUR = 0.24;      // travel time per hop
        var LEVEL_GAP = 0.17;    // next branch generation starts this much later
        var FLASH_DUR = 0.45;
        var MAX_CASCADES = isMobile ? 2 : 3;
        var cascades = [];
        var simTime = 0;
        var spawnAt = 0.5;

        function spawnCascade() {
            var origin;
            if (hoverState.zone >= 0 && Math.random() < 0.6 && nodesByZone[hoverState.zone].length) {
                var zl = nodesByZone[hoverState.zone];
                origin = zl[(Math.random() * zl.length) | 0];
            } else {
                origin = (Math.random() * NN) | 0;
            }
            var visited = {};
            visited[origin] = true;
            var frontier = [origin];
            var edges = [];
            for (var depth = 0; depth < 5 && frontier.length; depth++) {
                var next = [];
                for (var fi = 0; fi < frontier.length; fi++) {
                    var n = frontier[fi];
                    var cand = adj[n];
                    var want = depth === 0 ? 3 : 1 + ((Math.random() * 2) | 0);
                    for (var ci2 = 0; ci2 < cand.length && want > 0; ci2++) {
                        // random pick order
                        var m = cand[(Math.random() * cand.length) | 0];
                        if (visited[m]) continue;
                        visited[m] = true;
                        edges.push({ a: n, b: m, depth: depth });
                        next.push(m);
                        want--;
                    }
                    if (edges.length > 34) break;
                }
                frontier = next;
                if (edges.length > 34) break;
            }
            if (!edges.length) return null;
            return { edges: edges, t0: simTime, oz: nodeZoneArr[origin] };
        }

        function updatePulses(dt) {
            simTime += dt;
            if (simTime >= spawnAt && cascades.length < MAX_CASCADES) {
                var c = spawnCascade();
                if (c) cascades.push(c);
                spawnAt = simTime + 0.55 + Math.random() * 0.9;
            }
            var slot = 0;
            function put(x, y, z, r, g, b, size) {
                if (slot >= PPTS) return;
                var o = slot * 3;
                pulsePos[o] = x; pulsePos[o + 1] = y; pulsePos[o + 2] = z;
                pulseCol[o] = r; pulseCol[o + 1] = g; pulseCol[o + 2] = b;
                pulseSize[slot] = size;
                slot++;
            }
            for (var k = cascades.length - 1; k >= 0; k--) {
                var cas = cascades[k];
                var age = simTime - cas.t0;
                var alive = false;
                var ci = zoneColors[cas.oz];
                for (var e = 0; e < cas.edges.length; e++) {
                    var ed = cas.edges[e];
                    var start = ed.depth * LEVEL_GAP;
                    var tt = (age - start) / HOP_DUR;
                    var cj = zoneColors[nodeZoneArr[ed.b]];
                    if (tt >= 0 && tt <= 1) {
                        alive = true;
                        // traveling head + two trail sparks along the hop
                        for (var s = 0; s < 3; s++) {
                            var ts = Math.max(tt - s * 0.16, 0);
                            var x = nodeX[ed.a] + (nodeX[ed.b] - nodeX[ed.a]) * ts;
                            var y = nodeY[ed.a] + (nodeY[ed.b] - nodeY[ed.a]) * ts;
                            var z = nodeZ[ed.a] + (nodeZ[ed.b] - nodeZ[ed.a]) * ts;
                            var r = ci.x + (cj.x - ci.x) * ts;
                            var g = ci.y + (cj.y - ci.y) * ts;
                            var b2 = ci.z + (cj.z - ci.z) * ts;
                            if (s === 0) { r = r * 0.4 + 0.6; g = g * 0.4 + 0.6; b2 = b2 * 0.4 + 0.6; }
                            put(x, y, z, r, g, b2, s === 0 ? 4.6 : 2.8 - s * 0.7);
                        }
                    } else if (tt > 1 && tt <= 1 + FLASH_DUR / HOP_DUR) {
                        alive = true;
                        // arrival flash at the node, fading in the local lobe's ink
                        var f = 1 - (tt - 1) / (FLASH_DUR / HOP_DUR);
                        put(nodeX[ed.b], nodeY[ed.b], nodeZ[ed.b],
                            cj.x * 0.6 + 0.4 * f, cj.y * 0.6 + 0.4 * f, cj.z * 0.6 + 0.4 * f,
                            5.5 * f);
                    } else if (tt < 0) {
                        alive = true; // not started yet
                    }
                }
                if (!alive) cascades.splice(k, 1);
            }
            // clear unused slots
            for (var z2 = slot; z2 < PPTS; z2++) pulseSize[z2] = 0;
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
