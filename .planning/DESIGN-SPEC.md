# DESIGN SPEC — "SPINE: A Monograph in Four Chapters"
**Project:** hermanchan portfolio redesign (index + 4 facet pages)
**Status:** FINAL — implementation-ready
**Date:** 2026-06-11
**Constraint baseline:** Static HTML/CSS/JS, no build step, GitHub Pages + local file server, Tailwind Play CDN, libraries via CDN only.

---

## 1. CONCEPT SUMMARY + DESIGN PRINCIPLES

### 1.1 The Big Idea
Herman's portfolio becomes a living **monograph**: one magazine-grade editorial system where the four personas are no longer four websites but **four chapters bound by a single spine**. The dark index is the book's **cover** — an engraved particle brain under an oversized serif thesis. Each facet page is a **chapter spread**, distinguished only by its accent ink, its ghosted chapter numeral, and one signature interactive motif.

**Stance on the four-theme problem: UNIFY — hard.** The story doesn't need four skins; it needs **four inks**. One typographic system, one grid, one paper surface, one motion grammar across all five pages. The dark/light split flips from "per-facet mood" to **cover-vs-chapter**: index = ink-on-paper inverted (dark); all four facets = paper-light.

### 1.2 Each chapter keeps exactly THREE differentiators
1. **Accent ink** — a harmonized, equal-lightness descendant of its legacy theme color (returning visitors still recognize "the orange one", "the teal one").
2. **Ghosted chapter numeral** (01–04) used as a structural background graphic.
3. **One signature interactive motif** — breathing ring / archive plates / cycle dial / journey line.

Everything else — type, spacing, hairlines, cards, nav, footer, transitions — is identical.

### 1.3 Design principles (build laws — violations are bugs)
- **P1 — One voice pair, everywhere.** Every Fraunces display headline carries a mono kicker (`// 03 — TOOLKIT` style: `FIG.`, `CH.`, index numbers). Every mono/terminal block gets one serif marginal annotation. This serif+mono pairing IS the "digital humanist" thesis rendered typographically. (Grafted from HEMISPHERES — judges scored it the cheapest site-wide binding device.)
- **P2 — Fallbacks are art-directed, not apologies.** The no-WebGL/reduced-motion variant of every moment must look intentional.
- **P3 — One pinned moment per facet page maximum.** Restraint is the award taste.
- **P4 — Protected files are sacred.** `js/explorer.js`, `js/github-cards.js` are NEVER edited (uncommitted feature work). `navbar.js` `initNavbar(...)` contract unchanged. All technology.html DOM IDs preserved.
- **P5 — Content is inventory.** Testimonials verbatim, all career timelines, all projects, contact info — nothing dropped, nothing paraphrased.
- **P6 — Mobile is the design target; desktop is the enhancement.** Designed at 375px first.
- **P7 — Protect the differentiators.** The engraved brain cover, the chapter-ink system, the breathing ring, and PLATES & FIGURES are the anti-"editorial-template" features. They are built FIRST, cut LAST.
- **P8 — The Builder chapter keeps its voltage.** (Addresses judge weakness: "the cyberpunk skin retires risks flattening the page that best proves he can build.") Chapter 02 is the most machine-voiced chapter: live typewriter terminal, mono-dominant layouts, teal phosphor ink. Same paper, same grid — but the terminal energy survives as "reproduced field equipment in a printed monograph," not as a separate theme.

---

## 2. DESIGN TOKENS

### 2.1 Theming architecture (CRITICAL — read before touching tailwind-config.js)
Judges verified that "reskin by remapping existing token hexes" **does not work**: `github-cards.js` hardcodes `text-white` (Tailwind core, unreachable via `extend`), `bg-slate-950` (NOT in our config — comes from Tailwind's default palette), and `slate.*` is the shared dark base used by the dark index AND navbar.js dark mode. Therefore:

**LAW 1 — Tokens are ADDED, never renamed, never remapped.** Existing names (`slate.*`, `cyber.*`, `emerald.*`, `sky.*`, `void`, `cream`) keep their current hex values forever. All JS-built class strings in explorer.js / github-cards.js / navbar.js stay valid byte-for-byte.

**LAW 2 — The new system lives in ~15 CSS custom properties** (grafted from HEMISPHERES — the canonical Play-CDN-compatible theming layer), defined once in `css/spine.css` and overridden per page via a `data-chapter` attribute on `<html>`:

```css
:root {
  --paper:    #FAF7F2;   /* chapter base surface */
  --ink:      #16161A;   /* cover base + all body text */
  --ink-soft: #4A4A52;   /* secondary text on paper */
  --paper-soft:#F1ECE3;  /* raised card on paper */
  --hairline: rgba(22,22,26,.14);
  --hairline-inv: rgba(250,247,242,.16);
  --accent:   #B8965A;   /* per-chapter override below */
  --accent-soft: rgba(184,150,90,.12);
  --gold:     #B8965A;   /* cover/index only — never on chapters */
  --grain-opacity: .03;
  --measure:  66ch;
  --pad-section: clamp(96px, 14vh, 200px);
  --dur-enter: .9s; --dur-struct: .75s; --dur-micro: .3s;
}
html[data-chapter="counselling"] { --accent:#C2571B; --accent-soft:rgba(194,87,27,.10); }
html[data-chapter="technology"]  { --accent:#0F766E; --accent-soft:rgba(15,118,110,.10); }
html[data-chapter="project"]     { --accent:#9F1F45; --accent-soft:rgba(159,31,69,.10); }
html[data-chapter="education"]   { --accent:#2F6B4F; --accent-soft:rgba(47,107,79,.10); }
html[data-chapter="cover"]       { --accent:#B8965A; }
```

**LAW 3 — New Tailwind tokens are ADDITIVE** in `js/tailwind-config.js` (append, do not touch existing keys):

```js
// APPEND inside colors:{} — do not modify existing entries
paper:   { DEFAULT:'#FAF7F2', soft:'#F1ECE3' },
inkbase: { DEFAULT:'#16161A', soft:'#4A4A52' },
sienna:  { DEFAULT:'#C2571B', deep:'#9C4514' },   // CH 01
tealink: { DEFAULT:'#0F766E', deep:'#0B5953' },   // CH 02
oxblood: { DEFAULT:'#9F1F45', deep:'#7E1836' },   // CH 03
moss:    { DEFAULT:'#2F6B4F', deep:'#24533D' },   // CH 04
gold:    { DEFAULT:'#B8965A', bright:'#D4B274' }, // cover only
// APPEND inside fontFamily:{} — do not modify existing entries
display: ['Fraunces', 'Georgia', 'serif'],
```
Note `mono` already maps to Space Grotesk — keep it; Space Grotesk is promoted to the site-wide annotation voice.

**LAW 4 — Technology chapter re-skin = scoped CSS override layer, honestly budgeted.** The injected explorer/modal markup keeps emitting dark classes (`bg-slate-800/50`, `bg-slate-950`, `text-white`, `bg-cyber-600` …). A dedicated stylesheet `css/chapter-tech-overrides.css`, loaded ONLY on technology.html AFTER Tailwind, re-paints those utilities **scoped under the protected containers**:

```css
/* Scope: only inside the protected injected regions */
#explorer-grid .bg-slate-800\/50, #project-modal .bg-slate-800,
#keyword-modal .bg-slate-800 { background-color: var(--paper-soft) !important; }
#project-modal .bg-slate-950, #keyword-modal .bg-slate-950 { background-color: var(--paper) !important; }
#explorer-grid .text-white, #project-modal .text-white,
#keyword-modal .text-white { color: var(--ink) !important; }
#explorer-grid [class*="text-slate-3"], #explorer-grid [class*="text-slate-4"],
#project-modal [class*="text-slate-3"], #project-modal [class*="text-slate-4"],
#project-modal [class*="text-slate-5"], #project-modal [class*="text-slate-6"]
  { color: var(--ink-soft) !important; }
#explorer-grid [class*="bg-cyber-"], #project-modal [class*="bg-cyber-"]
  { background-color: var(--accent) !important; color: #FAF7F2 !important; }
#explorer-grid [class*="border-slate-"], #project-modal [class*="border-slate-"],
#keyword-modal [class*="border-slate-"] { border-color: var(--hairline) !important; }
```
Budget this layer at **~150–250 lines** (it is substantial — plan for it; do not pretend it's a token remap). QA checklist in §9.3 covers the modal flows. The `/50`-opacity dark utilities must be tested individually on paper — anything muddy gets an explicit per-class override.

### 2.2 Color system (full)

| Token | Hex | Role |
|---|---|---|
| Paper | `#FAF7F2` | Chapter page base; cover text color |
| Paper-soft | `#F1ECE3` | Raised cards/plates on paper |
| Ink | `#16161A` | Cover base; all body text on paper |
| Ink-soft | `#4A4A52` | Secondary text on paper (7.2:1 on paper) |
| Hairline | `rgba(22,22,26,.14)` | 1px rules on paper |
| Hairline-inv | `rgba(250,247,242,.16)` | 1px rules on cover |
| **Gold** | `#B8965A` (bright `#D4B274`) | Cover/index ONLY: particles, italic emphasis, TOC ticks |
| **Sienna — CH 01 Counselling** | `#C2571B` (deep `#9C4514`) | 4.51:1 on paper (use `deep` for body-size text: 6.3:1) |
| **Teal-ink — CH 02 Technology** | `#0F766E` (deep `#0B5953`) | 5.2:1 on paper |
| **Oxblood — CH 03 Project Mgmt** | `#9F1F45` (deep `#7E1836`) | 7.0:1 on paper |
| **Moss — CH 04 Education** | `#2F6B4F` (deep `#24533D`) | 6.1:1 on paper |

Contrast rule: accent DEFAULT is for ≥24px display text, rules, fills; accent `deep` for body-size colored text and links. All four inks pass 4.5:1 on `#FAF7F2`; verify after any tweak with WebAIM.

**No gradients** anywhere except the accent-ink page-wipe veil. No glassmorphism. No pill buttons. Shadows: none on paper (hairlines do the work); the only permitted shadow is the modal scrim `rgba(22,22,26,.55)`.

**Texture:** one 128×128 base64 PNG noise tile (generated offline, ≤4KB), tiled via a `body::after` fixed overlay at `opacity: var(--grain-opacity)` (3%), `pointer-events:none`. NOT SVG feTurbulence (too costly on mobile). Same tile on cover (5% opacity, blended `overlay`).

### 2.3 Typography

**Google Fonts (3 voices, loaded with `display=swap`, preconnect to fonts.gstatic.com):**

| Voice | Font | Cuts loaded | Role |
|---|---|---|---|
| Display (human) | **Fraunces** | `opsz,wght@144,600` + `ital,opsz,wght@1,144,500` (two static cuts — NOT full variable, keeps ≤120KB) | All display headlines, pull quotes, chapter titles. Italic for emphasis words + testimonial excerpts. |
| Body/UI | **Outfit** | 400, 500, 600 (already loaded — token contract kept) | Body copy, UI labels, nav links |
| Annotation (machine) | **Space Grotesk** | 400, 500 (already loaded as `font-mono`) | Site-wide annotation voice: kickers, `FIG. 02`, running headers, timestamps, terminal, metrics, captions |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,144,600;1,144,500&family=Outfit:wght@400;500;600&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">
```

**Scale (clamp-driven, 8px base):**

| Style | Spec |
|---|---|
| Display XL (hero thesis) | Fraunces 600, `clamp(2.75rem, 9vw, 9rem)`, lh 1.02, tracking −0.02em |
| Display L (chapter title) | Fraunces 600, `clamp(2.25rem, 6vw, 5.5rem)`, lh 1.05 |
| Display M (section head) | Fraunces 600, `clamp(1.75rem, 4vw, 3.25rem)`, lh 1.1 |
| Pull quote | Fraunces 500 italic, `clamp(1.5rem, 3vw, 2.5rem)`, lh 1.3 |
| Body | Outfit 400, 17px / 1.65, max-width `66ch` |
| Body small | Outfit 400, 15px / 1.6 |
| Kicker / annotation | Space Grotesk 500, 11px, letter-spacing 0.14em, UPPERCASE |
| Caption (under plates) | Space Grotesk 400, 12px / 1.5, color `--ink-soft` |
| Ghost numeral | Fraunces 600, `clamp(8rem, 18vw, 22rem)`, outline: 1px `--accent` stroke via `-webkit-text-stroke`, fill transparent, opacity .35 |

### 2.4 Spacing, grid, radii, frames
- **Base unit:** 8px. Section vertical padding: `var(--pad-section)` = `clamp(96px, 14vh, 200px)`.
- **Grid:** 12-col, `max-width:1400px`, 24px gutters, `padding-inline: clamp(20px, 4vw, 48px)`.
- **Prose measure:** 66ch.
- **Radii:** 0px everywhere (sharp editorial frames). Exceptions: the breathing ring (circle), avatar plates (2px).
- **Plates (image frames):** locked to 4:5 (portrait) and 3:2 (landscape) ratios, 1px `--hairline` keyline, mono caption beneath (`FIG. NN — description`), `overflow:hidden` for inner parallax.
- **Hairline rules:** 1px, `--hairline`; section dividers are full-bleed hairlines with a small mono running label sitting on them.

---

## 3. MOTION SYSTEM

### 3.1 Stack
- **GSAP 3.13** core + ScrollTrigger + SplitText (free since 3.13 — pin the version, see §8).
- **Lenis** smooth scroll, **desktop-only** (`(min-width:768px) and (pointer:fine)`), synced to ScrollTrigger via `gsap.ticker`. Native scroll on touch. **Feature-flagged** (`const USE_LENIS = true` at top of `js/motion.js`) — the site must ship and feel correct with the flag off; if iOS-adjacent jank appears in QA, flip it off, no redesign needed.
- One shared module **`js/motion.js`** loaded on every page (defer). One **`js/transitions.js`** for the wipe veil.

### 3.2 Easing grammar (one dialect, used everywhere — named constants in motion.js)
| Name | Value | Use | Duration |
|---|---|---|---|
| `EASE_ENTER` | `power4.out` | All entrances, line reveals | 0.9–1.2s |
| `EASE_STRUCT` | `expo.inOut` | Pins, page wipes, modal expand | 0.7–0.8s |
| `EASE_MICRO` | `power2.out` | Hovers, underlines, ticks | 0.25–0.35s |
| `EASE_AMBIENT` | `sine.inOut` | Breathing loops, idle drift | 4–8s yoyo |

Stagger constants: lines 80ms; cards/plates 60ms; never more than 8 staggered items per trigger.

### 3.3 Core behaviors (in `js/motion.js`)
1. **`.reveal-lines`** — SplitText masked line reveal: `type:'lines', mask:'lines', autoSplit:true`; `yPercent:110→0`, `EASE_ENTER` 1.1s, 80ms stagger, triggered at 80% viewport. Applied to every display heading and pull quote. Never per-character animation except the index hero.
2. **`ScrollTrigger.batch('.plate')`** — fade-up (y:24, opacity 0→1, 0.9s, 60ms stagger).
3. **`[data-parallax]`** — inner `img` pre-scaled 1.12, `yPercent:-8→8`, `scrub:true`.
4. **Navbar condense** — wrapper around (never inside) initNavbar output: at scroll>80px tween `#navbar` height 80px→64px and border-bottom alpha 0→1, scrubbed. Zero edits to navbar.js.
5. **Counters** — `[data-count]` numbers tween with `snap:{textContent:1}`, 1.2s `power2.out`, mono tabular figures, trigger at 70% viewport.
6. **Pins** — wrapped in `gsap.matchMedia('(min-width:768px)')`. Mobile receives identical content as non-pinned staggered reveals. Every pinned tween is transform/opacity ONLY.
7. **Refresh discipline** — `document.fonts.ready.then(() => ScrollTrigger.refresh())` (fixes Play-CDN/Fraunces pin mis-measurement), plus a `MutationObserver` on `#explorer-grid` that calls `ScrollTrigger.refresh()` and runs `ScrollTrigger.batch` entrances on injected children after explorer.js renders — **zero edits to protected files**.

### 3.4 Page transitions (MPA wipe — `js/transitions.js`)
- Click on internal nav → full-screen fixed veil in the **destination** chapter's accent ink slides up (`transform: translateY(100%)→0`, `EASE_STRUCT` 0.7s desktop / 0.5s mobile) → `sessionStorage.setItem('wipe', JSON.stringify({to:'technology', t:Date.now()}))` → navigate.
- Destination page: inline `<head>` script reads the flag **before paint**; if present AND fresh (`Date.now()-t < 2500ms`), sets the veil visible in the same accent, then reveals top-down 0.5s after `DOMContentLoaded`. If stale or absent (deep link, slow load), flag is deleted and NO veil ever shows.
- **`pageshow` listener** (bfcache restore): `if (e.persisted) killAllVeils()` — no stuck overlays on back-button. (Grafted from HEMISPHERES — judges flagged this as a real MPA bug the winner missed.)
- The wipe doubles as the luminance bridge for the dark-cover→light-chapter jump (judge weakness #4): the eye never sees a raw black→white cut; it always passes through the accent ink.

### 3.5 Reduced motion (single global gate)
`const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;` checked by every init, plus `gsap.matchMedia('(prefers-reduced-motion: reduce)')` block that:
- Disables Lenis; kills all ScrollTriggers; replaces every timeline with instant `gsap.set` end-states.
- Wipes become 0.3s opacity fades.
- Particle brain never boots → static SVG engraving (no line-draw).
- Breathing ring, dial, route line render in their completed states.
- Full content parity in every tier.

---

## 4. THREE.JS USAGE SPEC

### 4.1 Scope: ONE scene, index.html ONLY. Chapter pages ship ZERO WebGL.

**The Engraved Brain (cover hero):**
- `THREE.Points` constellation sampled at load from the existing hand-coded SVG brain paths via `getPointAtLength()` (no baked data file; WebGL hero and SVG fallback are literally the same shape).
- **Counts:** 2,500 points desktop / 900 mobile. Gold-ink (`#B8965A`→`#D4B274` per-point variation) 2px round sprites, additive blending.
- **Animation:** cheap curl-noise drift in the vertex shader (time uniform); whole group lerps toward pointer, max 3–4° rotation, `lerp factor 0.06`. Slow 8s "breath" scale 1↔1.03 (`EASE_AMBIENT` equivalent in shader or GSAP on group.scale). Hovering a TOC entry pulls that brain region's particles subtly toward cursor (per-region attractor uniform, strength 0.15).
- **Renderer:** alpha canvas, `antialias:false`, DPR `min(devicePixelRatio, 1.5)` desktop / `1` mobile, no postprocessing (glow faked in the point shader).
- **Lifecycle:** module loaded via dynamic `import()` AFTER LCP (`requestIdleCallback` fallback `setTimeout 200ms post-load`); paused by ScrollTrigger when hero leaves viewport AND on `visibilitychange`.

### 4.2 Interaction contract (a11y — non-negotiable)
The existing SVG brain stays in the DOM as the **invisible accessible click layer** (the current `zone-*` anchors), layered ABOVE the canvas. three.js is texture, not interaction. Keyboard/screen-reader routing to the four facets is byte-for-byte identical to today. Visible focus states on the zones (see §9.2).

### 4.3 Capability gate + fallback chain (decided BEFORE any three.js bytes load)
```
SKIP three.js entirely if ANY:
  - no WebGL context
  - prefers-reduced-motion
  - navigator.connection?.saveData
  - (navigator.deviceMemory ?? 8) < 4
```
**Fallback = first-class art direction:** the existing SVG brain rendered as a static fine-line "engraving" — gold 1px strokes on ink — with a one-time CSS `stroke-dashoffset` line-draw on load (skipped under reduced motion → fully static). Hotspots, hover legend, and routing identical in every tier.

### 4.4 Perf budget
three.js ≈150KB gz, index-only, deferred post-LCP. Hero LCP element is the live-HTML Fraunces headline (paints before any canvas). Target: 60fps on a 2022 mid-range Android; if frame time >24ms for 60 consecutive frames, auto-degrade: halve point count, drop pointer parallax.

---

## 5. SHARED COMPONENTS

### 5.1 Navbar
- `initNavbar` contract UNTOUCHED. Per-page call args only: chapters pass `isDark:false` + their accent token name (`themeColor:'sienna'|'tealink'|'oxblood'|'moss'` — these exist after the additive token append, and navbar's template literals `text-${themeColor}-600` resolve because each new token also gets numbered aliases:
  ```js
  // in tailwind-config append — numbered aliases so navbar template strings resolve
  sienna:{...,400:'#D9763B',500:'#C2571B',600:'#9C4514',800:'#7A3610',900:'#5E2A0D',100:'#F7E4D6'},
  tealink:{...,400:'#14998F',500:'#0F766E',600:'#0B5953',800:'#08433E',900:'#063330',100:'#D8ECEA'},
  oxblood:{...,400:'#C04568',500:'#9F1F45',600:'#7E1836',800:'#621229',900:'#4A0E1F',100:'#F5DDE5'},
  moss:{...,400:'#4C8A6C',500:'#2F6B4F',600:'#24533D',800:'#1B402F',900:'#143123',100:'#DFEBE4'},
  gold:{...,400:'#D4B274',500:'#B8965A',600:'#96793F',800:'#6E5527',900:'#54401D',100:'#F3EBDC'},
  ```
  Index passes `isDark:true, themeColor:'gold'`.
- CSS layer restyles the navbar shell: paper/ink surfaces, hairline bottom border, mono uppercase links at 11px/0.14em tracking, underline-grow hover. Logo "HC" block becomes a 1px-keyline mono stamp.
- Add (outside navbar.js, in shared HTML partial pattern) a **mono running header** above the nav on desktop: `HERMAN CHAN — THE DIGITAL HUMANIST — CH. 0N — [CHAPTER NAME]`, 10px, sitting on the top hairline.

### 5.2 Footer — "The Colophon" (NEW, identical on all 5 pages)
Currently the site has no unified footer. Add to every page, paper surface on chapters / ink surface on index:
```
─ hairline ─────────────────────────────────────
COLOPHON                                  (kicker)
Herman Koon Kiu "Joseph" Chan             (Fraunces M)
The Digital Humanist — Hong Kong          (body)

CORRESPONDENCE          ARCHIVE            CHAPTERS
hermanchan_925@hotmail.com   github.com/herman925   01 Counselling
                                                    02 Technology
                                                    03 Project Management
                                                    04 Education & Culture
─ hairline ─────────────────────────────────────
Set in Fraunces & Outfit. Bound in Hong Kong. © 2026   (mono caption)
```
Email `hermanchan_925@hotmail.com` as `mailto:`; GitHub `@herman925` linked. Chapter links use the wipe transition. Mono caption row is the colophon flourish (judges: credibility + memorability).

### 5.3 Section headers
Every section opens with the same assembly:
1. Full-bleed hairline rule.
2. Mono kicker on the rule: `FIG. 04 — TOOLKIT` / `CH. 02 § FIELD NOTES` (accent-ink tick `▪` before it).
3. Fraunces Display M headline with `.reveal-lines`.
4. Optional serif italic standfirst, 66ch.

### 5.4 Cards & plates
- **Plate** (image): hairline keyline frame, locked ratio, inner parallax, mono `FIG. NN` caption below. 4:5 or 3:2 only.
- **Letter card** (testimonials + impact stories): paper-soft surface, hairline border, mono sender header (`FROM: DR. — 2023`), Fraunces italic excerpt, small 2px-radius photo plate, gold/accent seal dot. Opens full quote via `clip-path: inset()` expand from the clicked card, 0.6s `EASE_STRUCT`. Existing testimonial modal DOM/IDs reused; quotes verbatim.
- **Ledger row** (timelines): hairline-separated rows — mono year column, Fraunces role, body description; expandable rows animate `height` via GSAP with `clip-path` mask.

### 5.5 Buttons & links
- **No pill buttons.** Primary action = "editorial link": mono uppercase 12px label + `→`, underline-grow on hover (`background-size: 0% 1px → 100% 1px`, `EASE_MICRO`), accent-deep color.
- Secondary = same without arrow. Focus state: 2px solid `--accent` outline, 2px offset (§9.2).

### 5.6 Chapter dock (mobile, grafted from HEMISPHERES)
Sticky bottom-right vertical dock on facet pages (<768px): four 12px accent-ink dots (44px tap targets), current chapter filled, others outlined; tapping hops chapters via the wipe. Hidden on index (the TOC serves that role). `env(safe-area-inset-bottom)` respected.

### 5.7 FOUC guard (every page)
~2KB inline critical CSS in `<head>`: surface colors, font stacks, hero layout skeleton, veil styles. Plus `<html class="loading">` → `opacity:0` on `main`, released when Tailwind Play CDN signals ready (poll for a generated class or `window.tailwind` hook) with a 800ms hard timeout so nothing can stay hidden.

---

## 6. PER-PAGE BLUEPRINTS

### 6.0 Page title plate (shared pattern, sections 1 of each chapter)
Ghost numeral (§2.3) positioned behind; chapter title Display L; mono kicker `CHAPTER 0N`; serif standfirst; accent bar `scaleX 0→1` scrubbed.

---

### 6.1 index.html — "The Cover" (`data-chapter="cover"`, ink surface)

| # | Section | Treatment |
|---|---|---|
| 0 | First-visit intro | 0.7s gold hairline draws across ink-black. `sessionStorage`-gated: returning visitors skip straight to the assembled cover. |
| 1 | **Hero / Cover** | Full-bleed `#16161A`. Top hairline + mono running header `HERMAN CHAN — THE DIGITAL HUMANIST — HONG KONG`. Center: the breathing gold particle brain (§4) behind the verbatim thesis in Fraunces 9vw, two masked lines: "A technologist born from humility." / "A leader driven by empathy." — words *humility* and *empathy* in italic gold. SplitText line reveal at t≈0.9s (no 2.2s dead air — judge weakness: don't delay the thesis; headline starts as soon as the hairline finishes). Bottom: **Table of Contents** — `01 COUNSELLING · 02 TECHNOLOGY · 03 PROJECT MANAGEMENT · 04 EDUCATION & CULTURE`, mono, accent-ink tick per entry; hover pulls that brain region's particles toward cursor; entries ARE the existing zone links restyled (routing contract intact). 1px vertical SCROLL rule loops below. |
| 2 | **Chapter spreads** ×4 | One pinned section per chapter (desktop): ghosted 12vw outline numeral, accent bar wipes `scaleX 0→1` scrubbed, one-sentence chapter thesis in Fraunces splitting in, one plate image, `OPEN CHAPTER →` editorial link (wipe transition). Mobile: non-pinned stacked spreads. |
| 3 | **Correspondence** (testimonials) | All 4 testimonials as letter cards (§5.4), photos intact, text verbatim, existing modal DOM/IDs; clip-path expand open. |
| 4 | **Colophon** | §5.2 footer, ink variant (hairline-inv, paper text). |

Sections preserved: all current index content (headline verbatim, 4 zones, 4 testimonials + photos, particle ambience reborn as the constellation).

---

### 6.2 counselling.html — "Chapter 01 · The Listener" (sienna, paper)

| # | Section | Treatment |
|---|---|---|
| 1 | Title plate | Ghost `01`, "The Listener", standfirst from current hero copy. |
| 2 | **Memoir (pinned — the page's ONE pin)** | The three story beats (teen mental-health struggle → ISS refugee work → becoming a counsellor) as scrubbed crossfading plates, 180vh pin, sienna progress rule filling left edge, mono beat markers `// BEAT 01 — THE STRUGGLE`. All existing story text carried over. Mobile: three stacked plate+text blocks. |
| 3 | Philosophy | Person-Centered Therapy statement as full-width Fraunces pull quote, `.reveal-lines`; existing philosophy copy as 66ch body after. |
| 4 | Toolkit | CBT / Play Therapy / Mindfulness as three plates with mono captions (`FIG. 01 — COGNITIVE BEHAVIOURAL THERAPY`), batch reveal. All existing toolkit copy. |
| 5 | **SIGNATURE — The Breathing Ring** | Full-viewport paper section. Thin sienna circle scaling 1→1.35 on an 8s `sine.inOut` yoyo loop; mono annotations `INHALE — 4S` / `EXHALE — 4S` crossfade in sync; serif line: "Before anything else, we breathe." The only moving element on screen. Reduced motion: ring static at mid-scale, both labels shown. (Protected feature — P7.) |
| 6 | Impact stories | Letter cards (§5.4), existing impact content verbatim. |
| 7 | Colophon | §5.2. |

---

### 6.3 technology.html — "Chapter 02 · The Builder" (teal-ink, paper)

**HARD RULE: `#explorer-grid`, `#project-modal`, `#keyword-modal`, `#broadcast-carousel`, terminal DOM ids and `js/explorer.js` / `js/github-cards.js` are untouched.** All restyling = additive tokens + `css/chapter-tech-overrides.css` (§2.1 LAW 4). Entrance animations attach post-injection via MutationObserver (§3.3.7).

| # | Section | Treatment |
|---|---|---|
| 1 | Title plate | Ghost `02`, "The Builder". The most machine-voiced chapter (P8): kicker density doubled, teal mono everywhere. |
| 2 | **FIELD NOTES (terminal)** | The existing animated typewriter career-log JS untouched; its shell reframed: teal phosphor mono on paper inside a 1px hairline frame with a mono header bar `FIELD NOTES — CAREER LOG — REPRODUCED AT 1:1`, blinking block cursor kept, scrubbed teal rule down the left edge. One serif marginal annotation beside it ("this is where I taught myself to code"). The terminal ENERGY survives — recast as reproduced field equipment in a monograph. |
| 3 | **PLATES & FIGURES (explorer)** | `#explorer-grid` becomes a numbered museum-catalog archive: override layer adds `FIG. NN` mono counters via CSS counters on the grid children, hairline frames, paper-soft cards, teal hover keyline. `#project-modal` styled as full-bleed plate spread (paper, hairline columns); `#keyword-modal` as a mono index card. Batch entrance post-injection. ALL project content from explorer.js untouched. |
| 4 | **BROADCASTS** | `#broadcast-carousel` DOM/JS untouched; reskinned shell: hairline frame, mono index counter `BROADCAST 03 / 07`, teal progress ticks. All Bilibili content intact. |
| 5 | Origin story | Existing 5-node timeline becomes a scrubbed SVG line-draw (`stroke-dashoffset`), teal, nodes pinging as the line reaches them. (This page's "one pin" budget is spent here OR nothing is pinned — line-draw is scrub-only, no pin, preferred.) All node copy preserved. |
| 6 | Career timeline | Ledger rows (§5.4), all entries preserved. |
| 7 | Contact + Colophon | Existing contact block folds into the colophon: `hermanchan_925@hotmail.com`, GitHub `@herman925`. |

---

### 6.4 project-management.html — "Chapter 03 · The Architect" (oxblood, paper)

| # | Section | Treatment |
|---|---|---|
| 1 | Title plate | Ghost `03`, "The Architect"; Anticipatory Leadership manifesto in oversized Fraunces (existing copy verbatim). |
| 2 | **SIGNATURE — The Cycle Dial (pinned — the page's ONE pin)** | The 4-step Anticipatory Leadership cycle as a pinned SVG dial, 200vh: circle stroke draws one quadrant per scroll quarter (oxblood), step copy crossfades alongside, mono step counter `STEP 02 / 04`. Mobile: unpinned — four stacked quadrant cards, each drawing its arc on entry. All 4-step content preserved. |
| 3 | Kanban competency board | Kept as content; reset as a typographic table — hairline columns, mono column heads, Outfit body rows; columns slide in with 60ms stagger. All competencies preserved. |
| 4 | Impact metrics | 6 tiles as count-up stats (§3.3.5) over oxblood hairline rules, mono tabular numerals, serif captions. All 6 metrics preserved. |
| 5 | Career timeline | Expandable indexed ledger (mono years, Fraunces roles, clip-path expand). All entries preserved. |
| 6 | Colophon | §5.2. |

---

### 6.5 education-culture.html — "Chapter 04 · The Bridge" (moss, paper)

| # | Section | Treatment |
|---|---|---|
| 1 | Title plate | Ghost `04`, "The Bridge"; Counselor-Educator thesis headline (existing copy). |
| 2 | **SIGNATURE — The Journey Line** | Third-culture-kid origin as a scrubbed SVG route line stitching place names (mono caps) down/across the page, moss waypoints pinging on arrival; existing origin narrative as body text alongside. Scrub-only — no pin needed (or pin ≤150vh on desktop if the layout demands; that consumes the page's pin budget). |
| 3 | Teaching timeline | Alternating ledger entries with `.reveal-lines`; all entries preserved. |
| 4 | Media | Press/media items as parallax plates with mono press captions (`FIG. 03 — [OUTLET], [YEAR]`). All media preserved. |
| 5 | Return spread | Full-width closing: "Return to the Spine" editorial link back to index (gold tick — the one place gold appears on a chapter, as the cover's calling card). |
| 6 | Colophon | §5.2. |

---

## 7. MOBILE STRATEGY (per page)

**Global:** designed at 375px; pins desktop-only via `gsap.matchMedia('(min-width:768px)')`; no horizontal scroll-jacking anywhere; Lenis off on touch; tap targets ≥44px; plates go full-bleed edge-to-edge with captions below; type clamps land Fraunces display ≈44px at 375px; page wipes kept (single transform) at 0.5s; chapter dock (§5.6) on all facet pages.

| Page | Mobile specifics |
|---|---|
| index | Brain at 900 points, DPR 1, no pointer parallax (no gyro — permission prompts kill first impressions); capability gate may drop to static engraving. TOC becomes four full-bleed stacked chapter cards (accent hairline + numeral, 56px tall). Chapter spreads unpinned → stacked. Testimonial modal = full-screen sheet. |
| counselling | Memoir unpinned → 3 stacked beats with progress ticks. Breathing ring kept (cheap transform loop) at 60vw. |
| technology | Explorer grid already responsive — only entrance anims differ. Terminal frame full-bleed, font-size floor 13px, horizontal overflow scrolls natively inside the frame. Origin line-draw kept (scrub works on native scroll). Carousel = native overflow-x + scroll-snap if not already. |
| project-mgmt | Dial unpinned → stacked quadrant cards. Kanban table → stacked column groups with mono heads. Counters unchanged. |
| education | Journey line kept as a vertical scrubbed line down the left margin connecting waypoints. Media plates stack full-bleed. |

**Mobile perf budget:** facet pages JS ≈90KB gz (GSAP+ST+SplitText+motion.js); index adds three.js ~150KB gz deferred post-LCP only when the gate passes. 60fps scroll on a 2022 mid-ranger.

---

## 8. CDN LIBRARIES (exact tags, pinned)

```html
<!-- Tailwind Play CDN (existing) + tokens -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="js/tailwind-config.js"></script>

<!-- GSAP 3.13.0 — core + ScrollTrigger + SplitText (SplitText free since 3.13) — every page -->
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>

<!-- Lenis 1.3.4 — desktop smooth scroll, feature-flagged — every page -->
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>

<!-- three.js 0.165.0 — index.html ONLY, loaded lazily as a module AFTER LCP + capability gate -->
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js" } }
</script>
<!-- js/brain-cover.js does: const THREE = await import('three') inside the gate -->

<!-- Site modules -->
<script defer src="js/motion.js"></script>
<script defer src="js/transitions.js"></script>
<!-- index only: --> <script type="module" src="js/brain-cover.js"></script>
<!-- technology only, AFTER tailwind: --> <link rel="stylesheet" href="css/chapter-tech-overrides.css">
```
Notes: three.js ≥0.161 ships ESM-only — the importmap + dynamic `import()` pattern is the no-build-step path and works on GitHub Pages and local file servers. Pin all versions exactly; never `@latest`. Lucide (existing, used by navbar) stays as-is.

---

## 9. PERFORMANCE + ACCESSIBILITY BUDGET

### 9.1 Performance (enforced — measure with Lighthouse mobile, mid-tier throttling)
| Metric | Budget |
|---|---|
| LCP (all pages) | < 2.5s — LCP element is always live HTML text (hero headline), never canvas/image |
| Lighthouse mobile | ≥ 90 chapters; ≥ 85 index (with WebGL active; ≥90 in fallback tier) |
| Total JS gz | chapters ≤ 120KB site JS (excl. Tailwind CDN + protected files); index ≤ 280KB incl. deferred three.js |
| Fonts | Fraunces 2 static cuts ≤ 120KB total, `display=swap`, preconnect |
| CLS | < 0.05 — plates have locked aspect-ratio boxes; SplitText reveals reserve height via mask, not display:none |
| Grain | 1 inline base64 PNG tile ≤ 4KB |
| Frame rate | 60fps scroll on 2022 mid-range Android; auto-degrade rule §4.4 |

### 9.2 Accessibility
- **Contrast:** body ink on paper 14.8:1; ink-soft 7.2:1; all four accent `deep` values ≥ 5:1 for body-size text; gold on ink used only ≥18px (4.6:1 for `#D4B274` on `#16161A` — use `bright` for small gold text). Verify every accent usage against §2.2 table.
- **Focus:** every interactive element gets `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`. Brain zones keep keyboard focus + visible focus ring over the canvas.
- **Reduced motion:** single global gate (§3.5), full content parity, tested as a first-class variant.
- **Modals:** existing testimonial/project/keyword modals keep (and where missing, gain via wrapper) focus trap, `Esc` close, `aria-modal`, focus return to trigger. Wrapper-level only for protected modals.
- **Semantics:** one `h1` per page (chapter title), sections labeled via `aria-labelledby` on section headers; mono kickers are presentational (`aria-hidden` where duplicative); SVG brain zones keep accessible names ("Open Chapter 01 — Counselling").
- **Touch:** ≥44px targets; no hover-only information anywhere (mobile reveals on in-view).

### 9.3 QA gate (must pass before ship)
1. technology.html: open/close `#project-modal` and `#keyword-modal`, run carousel, trigger keyword filters — with override CSS active, on desktop + 375px. No white text on paper, no dark cards.
2. Deep-link every page directly (no wipe flag) — no veil flash. Back/forward through all 5 pages — no stuck veil (`pageshow` path).
3. `prefers-reduced-motion` walkthrough of all 5 pages — all content reachable, nothing animating.
4. No-WebGL (force via devtools) index — engraving fallback renders, all 4 zones route.
5. `document.fonts.ready` + resize: pinned sections re-measure correctly (SplitText `autoSplit` reverts).
6. Lighthouse runs per §9.1 on throttled mobile.

---

## 10. BUILD ORDER (priority = protect the differentiators, P7)
1. `css/spine.css` (vars, type, grid, components) + additive tokens + FOUC guard → all 5 pages on the system, statically.
2. `js/motion.js` (reveals, batch, parallax, counters, navbar condense, fonts.ready, MutationObserver) + `js/transitions.js` (wipe + bfcache).
3. Index cover: hero text + TOC + SVG engraving fallback FIRST, then `js/brain-cover.js` three.js layer.
4. Signature motifs: breathing ring → PLATES & FIGURES override layer → cycle dial → journey line.
5. Letter cards/testimonials, colophon, chapter dock.
6. QA gate §9.3, perf passes, reduced-motion pass.
