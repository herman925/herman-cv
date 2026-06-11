# herman-cv

Static portfolio for Herman Chan — *"SPINE: A Monograph in Four Chapters"* — with four facet pages (counselling, project management, education & culture, technology).

🌐 **Live site:** https://herman925.github.io/herman-cv/

## Quick Start
- Serve locally: `python -m http.server 8000` then open http://localhost:8000.
- Entry page: `index.html` routes to all four chapter pages.

## GitHub Pages
The site is deployed from the `main` branch root to:

**https://herman925.github.io/herman-cv/**

To re-deploy or fork: open **Settings → Pages**, set Source to **Deploy from a branch**, Branch **main**, folder **/ (root)**, and save.

## File Structure
```
index.html                  # Cover / entry (data-chapter="cover")
counselling.html            # Chapter 1
project-management.html     # Chapter 2
education-culture.html      # Chapter 3
technology.html             # Chapter 4
global.css                  # Base resets & shared utilities
css/
  spine.css                 # Design-system tokens & layout engine
  chapter-tech-overrides.css  # Technology chapter paint overrides
js/
  tailwind-config.js        # Tailwind theme extension
  motion.js                 # GSAP reveal animations (data-attribute driven)
  transitions.js            # Page-wipe transitions
  brain-cover.js            # three.js gold particle brain (cover only)
  navbar.js                 # Shared navigation bar
  github-cards.js           # GitHub activity cards (technology page)
  explorer.js               # Interactive project explorer
  carousel.js               # Testimonial / media carousel
.planning/DESIGN-SPEC.md    # Full design specification
```

## Notes
- `.gitignore` excludes personal CV documents (`Herman CV.*`), the `PRD/` folder, and `IT Examples/`.
- No build step needed; site runs on vanilla HTML/CSS/JS with Tailwind CDN and GSAP CDN.
- Legacy `theme-*.css` and `style.css` files remain in the root but are **not loaded** by any page.

## Design System — "SPINE: A Monograph in Four Chapters"
- **Spec:** `.planning/DESIGN-SPEC.md`.
- **Theme engine:** CSS custom properties in `css/spine.css`, activated per page via `<html data-chapter="cover|counselling|technology|project|education">`.
- **Motion:** GSAP 3.13 + ScrollTrigger + SplitText (CDN, pinned versions) driven by data attributes (`data-reveal-lines`, `.plate-reveal`, `data-count`, `data-accent-bar`) in `js/motion.js`; page wipes in `js/transitions.js`; three.js gold particle brain (cover page only, capability-gated) in `js/brain-cover.js`.
- **Protected files** (do not restyle by editing directly): `js/explorer.js`, `js/github-cards.js`, `js/navbar.js`. The technology chapter is restyled exclusively via `css/chapter-tech-overrides.css`.
