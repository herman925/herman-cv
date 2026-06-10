# herman-cv

Static portfolio for Herman Chan with four facet pages (counselling, project management, education & culture, technology).

## Quick Start
- Serve locally: `pwsh -Command "python -m http.server 8000"` then open http://localhost:8000.
- Entry page: `index.html` routes to facet pages.

## GitHub Pages
1. Create a repo named `herman-cv` and push this folder.
2. In GitHub, open **Settings → Pages**.
3. Source: **Deploy from a branch**; Branch: **main** (or the default) and **/root** folder.
4. Save; Pages will publish at `https://<your-username>.github.io/herman-cv/`.
5. Test navigation from `index.html` to each facet.

## Notes
- `.gitignore` excludes personal CV documents (`Herman CV.*`) and the `PRD/` folder.
- No build step needed; site runs on vanilla HTML/CSS/JS with Tailwind CDN.

## Design system — "SPINE: A Monograph in Four Chapters"
- Spec: `.planning/DESIGN-SPEC.md`. Theme engine: CSS custom properties in `css/spine.css`, switched per page via `<html data-chapter="cover|counselling|technology|project|education">`.
- Motion: GSAP 3.13 + ScrollTrigger + SplitText (CDN, pinned versions) driven by data attributes (`data-reveal-lines`, `.plate-reveal`, `data-count`, `data-accent-bar`) in `js/motion.js`; page wipes in `js/transitions.js`; three.js gold particle brain (index only, capability-gated) in `js/brain-cover.js`.
- Protected files (never restyle by editing): `js/explorer.js`, `js/github-cards.js`, `js/navbar.js`. technology.html is repainted purely via `css/chapter-tech-overrides.css`.
- Old `theme-*.css` files and `style.css` are no longer loaded by any page.
