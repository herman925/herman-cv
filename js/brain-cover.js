/**
 * SPINE cover v5 — "The Living Brain"
 * index.html ONLY.
 *
 * The head is the owner-supplied icon: outer silhouette + inner brain-fold
 * outline, sampled at runtime into gold wireframe lines. The particle brain
 * is generated INSIDE the icon's own brain region (point-in-polygon against
 * the inner path), so cloud and outline always match.
 *
 *  - four lobes (x-bands l→r: education, counselling, technology, project)
 *    idle faintly in their facet inks, ignite on hover
 *  - neurons fire across the whole volume (interior included)
 *  - cascades: a burst starts at one origin and expands through branching
 *    neighbour paths, recoloring as it crosses lobes, flashing each node
 *  - hover/click picking is true pointer→world math on the canvas (the SVG
 *    zones stay as the keyboard / screen-reader layer; labels re-aim their
 *    connector lines at the projected lobe centroids)
 *  - click: camera dives into the lobe, facet-ink veil carries you in
 *
 * Fallback (html.brain-static): the original SVG engraving.
 */
(function () {
    'use strict';

    var html = document.documentElement;

    var ZONES = [
        { key: 'education', cls: 'zone-education', ink: 'moss', href: 'education-culture.html', color: [0.063, 0.725, 0.506] },   // #10B981
        { key: 'counselling', cls: 'zone-counselling', ink: 'sienna', href: 'counselling.html', color: [0.976, 0.451, 0.086] },   // #F97316
        { key: 'technology', cls: 'zone-technology', ink: 'tealink', href: 'technology.html', color: [0.176, 0.831, 0.749] },     // #2DD4BF
        { key: 'project', cls: 'zone-project', ink: 'oxblood', href: 'project-management.html', color: [0.882, 0.114, 0.282] },   // #E11D48
    ];
    // lobe bands as fractions of the brain's width, left → right
    var BANDS = [0.27, 0.52, 0.76];

    var GROUP_SCALE = 0.74;

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

    /* ---- the owner-supplied head icon ------------------------------------ */
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

    function pointInPoly(px, py, poly) {
        var inside = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
        }
        return inside;
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
        var COUNT = isMobile ? 1800 : 5200;
        var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

        /* ---- sample the head icon ----------------------------------------- */
        var outerRaw = samplePathPoints(HEAD_OUTER_D, 300);
        var innerRaw = samplePathPoints(HEAD_INNER_D, 240);
        if (outerRaw.length < 50 || innerRaw.length < 50) {
            html.classList.add('brain-static');
            return;
        }
        var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
        outerRaw.forEach(function (p) {
            if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
            if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
        });
        var hcx = (minX + maxX) / 2, hcy = (minY + maxY) / 2;
        var hs = 2 / Math.max(maxX - minX, maxY - minY);
        function toGL(x, y) { return { x: (x - hcx) * hs, y: -(y - hcy) * hs }; }

        /* ---- generate the brain INSIDE the icon's inner region ------------ */
        // brain region = the inner loop's upper portion (below that the loop
        // traces the face/jaw, which is not brain)
        var iMinX = 1e9, iMaxX = -1e9, iMinY = 1e9, iMaxY = -1e9;
        innerRaw.forEach(function (p) {
            if (p[0] < iMinX) iMinX = p[0]; if (p[0] > iMaxX) iMaxX = p[0];
            if (p[1] < iMinY) iMinY = p[1]; if (p[1] > iMaxY) iMaxY = p[1];
        });
        var cutY = iMinY + (iMaxY - iMinY) * 0.66;     // icon Y grows downward
        var brainPoly = innerRaw;                       // full loop for inside test
        var bandPts = innerRaw.filter(function (p) { return p[1] < cutY + 10; });

        // bbox of the actual brain portion (poly points above the cut)
        var bMinX = 1e9, bMaxX = -1e9, bMinY = 1e9, bMaxY = -1e9;
        bandPts.forEach(function (p) {
            if (p[0] < bMinX) bMinX = p[0]; if (p[0] > bMaxX) bMaxX = p[0];
            if (p[1] < bMinY) bMinY = p[1]; if (p[1] > bMaxY) bMaxY = p[1];
        });
        var bW = bMaxX - bMinX, bH = bMaxY - bMinY;
        var shellBand = bW * 0.085;

        function nearestBoundary(x, y) {
            var best = 1e18;
            for (var i = 0; i < bandPts.length; i++) {
                var dx = x - bandPts[i][0], dy = y - bandPts[i][1];
                var d = dx * dx + dy * dy;
                if (d < best) best = d;
            }
            return Math.sqrt(best);
        }

        var pts = [];
        var guard = 0;
        while (pts.length < COUNT && guard++ < COUNT * 40) {
            var rx = bMinX + Math.random() * bW;
            var ry = bMinY + Math.random() * bH;
            if (ry > cutY) continue;
            if (!pointInPoly(rx, ry, brainPoly)) continue;
            var dist = nearestBoundary(rx, ry);
            var shell = Math.max(0, 1 - dist / shellBand);
            shell = Math.pow(shell, 0.8);
            // luminous cortex, but the interior matter is fully present
            if (Math.random() > 0.66 + shell * 0.34) continue;
            var g = toGL(rx, ry);
            var nx = (rx - bMinX) / bW, ny = (ry - bMinY) / bH;
            var zone = nx < BANDS[0] ? 0 : nx < BANDS[1] ? 1 : nx < BANDS[2] ? 2 : 3;
            // organic boundary wobble between lobes
            var wob = Math.sin(ny * 9.1 + nx * 17.0) * 0.04;
            var nxw = nx + wob;
            zone = nxw < BANDS[0] ? 0 : nxw < BANDS[1] ? 1 : nxw < BANDS[2] ? 2 : 3;
            var depth = 0.16 * (1 - shell * 0.8);
            pts.push({
                x: g.x, y: g.y,
                z: (Math.random() * 2 - 1) * depth,
                shell: shell,
                gyri: 0.5 + 0.5 * Math.sin(nx * 22.0 + Math.sin(ny * 9.0) * 2.4),
                seed: Math.random(),
                zone: zone,
                nx: nx
            });
        }
        if (pts.length < 200) { html.classList.add('brain-static'); return; }
        var N = pts.length;

        // brain bbox in GL coords (for pointer picking)
        var gMinX = 1e9, gMaxX = -1e9, gMinY = 1e9, gMaxY = -1e9;
        pts.forEach(function (p) {
            if (p.x < gMinX) gMinX = p.x; if (p.x > gMaxX) gMaxX = p.x;
            if (p.y < gMinY) gMinY = p.y; if (p.y > gMaxY) gMaxY = p.y;
        });

        // zone-picking grid: each cell holds the majority zone of the particles
        // inside it (-1 = no brain there) — picking matches the cloud exactly
        var GW = 56, GH = 40;
        var zoneGrid = new Int8Array(GW * GH);
        (function () {
            var counts = new Uint16Array(GW * GH * 4);
            pts.forEach(function (p) {
                var gx = Math.min(GW - 1, Math.max(0, ((p.x - gMinX) / (gMaxX - gMinX) * GW) | 0));
                var gy = Math.min(GH - 1, Math.max(0, ((p.y - gMinY) / (gMaxY - gMinY) * GH) | 0));
                counts[(gy * GW + gx) * 4 + p.zone]++;
            });
            for (var ci = 0; ci < GW * GH; ci++) {
                var best = -1, bestN = 0;
                for (var zi = 0; zi < 4; zi++) {
                    var n = counts[ci * 4 + zi];
                    if (n > bestN) { bestN = n; best = zi; }
                }
                zoneGrid[ci] = best;
            }
            // one dilation pass so tiny gaps between particles do not flicker
            var copy = zoneGrid.slice();
            for (var gy2 = 0; gy2 < GH; gy2++) {
                for (var gx2 = 0; gx2 < GW; gx2++) {
                    var idx = gy2 * GW + gx2;
                    if (copy[idx] !== -1) continue;
                    var found = -1;
                    for (var oy = -1; oy <= 1 && found === -1; oy++) {
                        for (var ox = -1; ox <= 1 && found === -1; ox++) {
                            var nx2 = gx2 + ox, ny2 = gy2 + oy;
                            if (nx2 < 0 || ny2 < 0 || nx2 >= GW || ny2 >= GH) continue;
                            if (copy[ny2 * GW + nx2] !== -1) found = copy[ny2 * GW + nx2];
                        }
                    }
                    zoneGrid[idx] = found;
                }
            }
        })();

        // per-zone centroids
        var centroids = ZONES.map(function () { return { x: 0, y: 0, n: 0 }; });
        pts.forEach(function (p) {
            var c = centroids[p.zone];
            c.x += p.x; c.y += p.y; c.n++;
        });
        centroids = centroids.map(function (c) { return { x: c.n ? c.x / c.n : 0, y: c.n ? c.y / c.n : 0 }; });

        /* ---- scene --------------------------------------------------------- */
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 10);
        camera.position.z = 2.3;

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
                '  // neurons fire EVERYWHERE — interior matter included',
                '  float clk = fract(uTime * (0.05 + aSeed * 0.18) + aSeed * 19.7);',
                '  vFire = smoothstep(0.94, 0.985, clk) * (1.0 - smoothstep(0.985, 1.0, clk));',
                '  vec3 p = position;',
                '  p.x += sin(uTime * 0.5 + position.y * 5.0 + aSeed * 6.28) * 0.006;',
                '  p.y += cos(uTime * 0.45 + position.x * 5.0) * 0.006;',
                '  p.z += sin(uTime * 0.4 + aSeed * 6.28) * 0.010;',
                '  p.xy = mix(p.xy, p.xy * 0.985, vHover);',
                '  float isBurst = abs(aZone - uBurstZone) < 0.5 ? 1.0 : 0.0;',
                '  vec2 dir = normalize(p.xy - uBurstCenter + vec2(0.0001));',
                '  p.xy += dir * isBurst * uBurstT * 1.6;',
                '  p.z += isBurst * uBurstT * 1.2 - (1.0 - isBurst) * uBurstT * 0.8;',
                '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
                '  float size = mix(1.9, 2.5, aShell);',
                '  size *= 1.0 + vHover * 0.7 + vFire * 1.8 + isBurst * uBurstT * 1.5;',
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
                '  vec3 col = mix(gold, zc, 0.18 + vHover * 0.82);',
                '  col = mix(col, vec3(1.0, 0.98, 0.92), vFire * 0.9);',
                '  float band = 0.68 + 0.32 * vGyri;',
                '  float alpha = glow * band * (0.68 + vShell * 0.24 + vHover * 0.14 + vFire * 0.55);',
                '  gl_FragColor = vec4(col, alpha);',
                '}'
            ].join('\n')
        });

        var points = new THREE.Points(geo, mat);
        var group = new THREE.Group();
        group.add(points);
        group.scale.setScalar(GROUP_SCALE);
        scene.add(group);

        /* ---- head wireframe ------------------------------------------------ */
        var headMat = new THREE.LineBasicMaterial({
            color: 0xB8965A, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        var outerPts = outerRaw.map(function (p) { var g = toGL(p[0], p[1]); return new THREE.Vector3(g.x, g.y, 0); });
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outerPts), headMat));
        var innerPts3 = innerRaw.map(function (p) { var g = toGL(p[0], p[1]); return new THREE.Vector3(g.x, g.y, 0); });
        var innerMat = headMat.clone();
        innerMat.opacity = 0.12;
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(innerPts3), innerMat));
        var dotPts = [];
        for (var di = 0; di < outerPts.length; di += 8) dotPts.push(outerPts[di]);
        var dotMat = new THREE.PointsMaterial({
            color: 0xD4B274, size: 2.2, sizeAttenuation: false,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dotPts), dotMat));

        /* ---- faint connective tissue --------------------------------------- */
        (function () {
            var maxSegs = isMobile ? 220 : 520;
            var segPos = [];
            var shellIdx = [];
            pts.forEach(function (p, i) { if (p.shell > 0.45) shellIdx.push(i); });
            var tries = 0;
            while (segPos.length / 6 < maxSegs && tries++ < maxSegs * 40) {
                var i = shellIdx[(Math.random() * shellIdx.length) | 0];
                var j = shellIdx[(Math.random() * shellIdx.length) | 0];
                if (i === j) continue;
                var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
                if (dx * dx + dy * dy + dz * dz > 0.008) continue;
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

        /* ---- neural cascades ----------------------------------------------
           A burst begins at one origin (interior nodes included) and expands
           outward through branching paths, recoloring across lobes.
        ------------------------------------------------------------------- */
        var PPTS = 560;
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

        // cascade node graph — drawn from the WHOLE volume so firing travels
        // through the interior, not just the surface
        var nodeIdx = [];
        for (var ni = 0; ni < N; ni++) {
            if (pts[ni].shell > 0.25 || pts[ni].seed > 0.5) nodeIdx.push(ni);
        }
        var NODE_CAP = isMobile ? 360 : 900;
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
        var HOP2 = 0.009;
        var adj = [];
        for (var ai = 0; ai < NN; ai++) {
            var nbrs = [];
            for (var aj = 0; aj < NN && nbrs.length < 7; aj++) {
                if (ai === aj) continue;
                var ddx = nodeX[ai] - nodeX[aj], ddy = nodeY[ai] - nodeY[aj], ddz = nodeZ[ai] - nodeZ[aj];
                if (ddx * ddx + ddy * ddy + ddz * ddz < HOP2) nbrs.push(aj);
            }
            adj.push(nbrs);
        }

        // Divergence, not haste: one origin fans out like ink in wet paper —
        // each generation triggers several more, unhurried, over seconds.
        var HOP_DUR = 0.55;
        var LEVEL_GAP = 0.42;
        var FLASH_DUR = 0.8;
        var MAX_CASCADES = isMobile ? 1 : 2;
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
            var EDGE_CAP = isMobile ? 60 : 110;
            for (var depth = 0; depth < 7 && frontier.length; depth++) {
                var next = [];
                for (var fi = 0; fi < frontier.length; fi++) {
                    var n = frontier[fi];
                    var cand = adj[n];
                    // the multiplier effect: the first spark fans wide, every
                    // later node keeps branching to 2-3 more
                    var want = depth === 0 ? 4 : 2 + ((Math.random() * 2) | 0);
                    for (var ci2 = 0; ci2 < cand.length * 2 && want > 0; ci2++) {
                        var m = cand[(Math.random() * cand.length) | 0];
                        if (visited[m]) continue;
                        visited[m] = true;
                        edges.push({ a: n, b: m, depth: depth });
                        next.push(m);
                        want--;
                    }
                    if (edges.length > EDGE_CAP) break;
                }
                frontier = next;
                if (edges.length > EDGE_CAP) break;
            }
            if (!edges.length) return null;
            return { edges: edges, t0: simTime, oz: nodeZoneArr[origin] };
        }

        function updatePulses(dt) {
            simTime += dt;
            if (simTime >= spawnAt && cascades.length < MAX_CASCADES) {
                var c = spawnCascade();
                if (c) cascades.push(c);
                spawnAt = simTime + 2.2 + Math.random() * 1.6;
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
                        var f = 1 - (tt - 1) / (FLASH_DUR / HOP_DUR);
                        put(nodeX[ed.b], nodeY[ed.b], nodeZ[ed.b],
                            cj.x * 0.6 + 0.4 * f, cj.y * 0.6 + 0.4 * f, cj.z * 0.6 + 0.4 * f,
                            5.5 * f);
                    } else if (tt < 0) {
                        alive = true;
                    }
                }
                if (!alive) cascades.splice(k, 1);
            }
            for (var z2 = slot; z2 < PPTS; z2++) pulseSize[z2] = 0;
            pulseGeo.attributes.position.needsUpdate = true;
            pulseGeo.attributes.aColor.needsUpdate = true;
            pulseGeo.attributes.aSize.needsUpdate = true;
        }

        /* ---- renderer ------------------------------------------------------ */
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
            aimConnectors();
        }

        /* ---- interaction ---------------------------------------------------- */
        var gsapOK = typeof window.gsap !== 'undefined';
        var zoneAnchors = ZONES.map(function (z) { return svg.querySelector('a.' + z.cls); });

        function setHover(zoneIdx) {
            if (hoverState.zone === zoneIdx) return;
            zoneAnchors.forEach(function (a, i) {
                if (a) a.classList.toggle('zone-hot', i === zoneIdx);
            });
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
            hoverState.zone = zoneIdx;
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
            tl.to(group.position, {
                x: -c.x * GROUP_SCALE * 1.5, y: -c.y * GROUP_SCALE * 1.5,
                duration: 0.85, ease: 'expo.in'
            }, 0);
            tl.to(burst, {
                t: 1, duration: 0.85, ease: 'power3.in',
                onUpdate: function () { mat.uniforms.uBurstT.value = burst.t; }
            }, 0);
            tl.to(pulseMat.uniforms.uOpacity, { value: 0, duration: 0.4 }, 0);
            tl.call(function () { window.spineNavigate(href, z.ink); }, null, 0.38);
        }

        /* true pointer picking: screen → world (z=0 plane) → group-local via
           worldToLocal (handles scale AND the soft idle rotation), then the
           particle-density grid decides which lobe — or none — is underneath */
        var frameEl = mount.parentElement || mount;
        var pickV = new THREE.Vector3();
        function pointerZone(e) {
            var rect = renderer.domElement.getBoundingClientRect();
            if (!rect.width || !rect.height) return -1;
            var ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            var ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            var halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            var halfW = halfH * camera.aspect;
            pickV.set(ndcX * halfW, ndcY * halfH, 0);
            group.worldToLocal(pickV);
            var fx = (pickV.x - gMinX) / (gMaxX - gMinX);
            var fy = (pickV.y - gMinY) / (gMaxY - gMinY);
            if (fx < -0.03 || fx > 1.03 || fy < -0.03 || fy > 1.03) return -1;
            var gx = Math.min(GW - 1, Math.max(0, (fx * GW) | 0));
            var gy = Math.min(GH - 1, Math.max(0, (fy * GH) | 0));
            return zoneGrid[gy * GW + gx];
        }
        frameEl.addEventListener('pointermove', function (e) {
            if (diving) return;
            var z = pointerZone(e);
            frameEl.style.cursor = z >= 0 ? 'pointer' : '';
            setHover(z);
        });
        frameEl.addEventListener('pointerleave', function () { setHover(-1); frameEl.style.cursor = ''; });
        frameEl.addEventListener('click', function (e) {
            var z = pointerZone(e);
            if (z >= 0) {
                e.preventDefault();
                diveInto(z, ZONES[z].href);
            }
        });

        // SVG anchors stay the keyboard / screen-reader path
        ZONES.forEach(function (z, idx) {
            var a = zoneAnchors[idx];
            if (!a) return;
            a.addEventListener('focus', function () { setHover(idx); });
            a.addEventListener('blur', function () { setHover(-1); });
            a.setAttribute('data-no-wipe', '');
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

        /* re-aim each SVG label's connector line at its lobe's centroid ------- */
        function aimConnectors() {
            var canvasRect = renderer.domElement.getBoundingClientRect();
            var svgRect = svg.getBoundingClientRect();
            if (!canvasRect.width || !svgRect.width) return;
            var vb = svg.viewBox.baseVal;
            ZONES.forEach(function (z, idx) {
                var a = zoneAnchors[idx];
                if (!a) return;
                var line = a.querySelector('.connector-line');
                var dot = a.querySelector('.connector-dot');
                if (!line || !dot) return;
                // project centroid (world = local * GROUP_SCALE) to screen px
                var v = new THREE.Vector3(centroids[idx].x * GROUP_SCALE, centroids[idx].y * GROUP_SCALE, 0);
                v.project(camera);
                var sxPx = canvasRect.left + (v.x + 1) / 2 * canvasRect.width;
                var syPx = canvasRect.top + (1 - (v.y + 1) / 2) * canvasRect.height;
                // screen px → svg viewBox units, minus the inner translate(40,0)
                var sx = (sxPx - svgRect.left) / svgRect.width * vb.width + vb.x - 40;
                var sy = (syPx - svgRect.top) / svgRect.height * vb.height + vb.y;
                if (!isFinite(sx) || !isFinite(sy)) return;
                var dx = parseFloat(dot.getAttribute('cx'));
                var dy = parseFloat(dot.getAttribute('cy'));
                var elbowX = dx + (sx - dx) * 0.45;
                line.setAttribute('d', 'M ' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
                    ' L ' + elbowX.toFixed(1) + ' ' + sy.toFixed(1) +
                    ' L ' + dx + ' ' + dy);
                // the rewritten path's length no longer matches the original
                // dash-draw setup — fade via opacity instead
                line.style.strokeDasharray = 'none';
                line.style.strokeDashoffset = '0';
            });
        }

        resize();
        window.addEventListener('resize', resize);
        setTimeout(aimConnectors, 300);

        /* ---- frame loop ----------------------------------------------------- */
        var targetRX = 0, targetRY = 0;
        if (!isMobile) {
            window.addEventListener('pointermove', function (e) {
                var nx = (e.clientX / window.innerWidth) * 2 - 1;
                var ny = (e.clientY / window.innerHeight) * 2 - 1;
                targetRY = nx * 0.14;
                targetRX = ny * 0.08;
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

            var idleY = Math.sin(t * 0.20) * 0.08;
            var idleX = Math.cos(t * 0.16) * 0.04;
            group.rotation.y += ((targetRY + idleY) - group.rotation.y) * 0.05;
            group.rotation.x += ((targetRX + idleX) - group.rotation.x) * 0.05;

            var breath = 1 + Math.sin(t * (Math.PI * 2 / 8)) * 0.012;
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
