# Laszlo Edgar Dobra | Personal Portfolio

Welcome to the repository for my personal website! This site is my digital resume and portfolio, showcasing my work as a Chemical Engineering student and Semiconductor Engineering minor at the University of Illinois Urbana-Champaign. 

## Who am I?
I am completely obsessed with the world of semiconductors and process automation! I love using Python to model complex systems and finding creative ways to turn molecular science into high-tech manufacturing. My goal is to build incredible tools that solve real problems. When I am not in the lab or coding a new project, you can definitely find me at my espresso machine trying to dial in the perfect shot. Let's build something awesome together!

## What is in here?
This repository contains the source code for my interactive portfolio, which features:
* **Custom Physics Simulation:** A 2D liquid flow simulation built straight into the canvas.
* **Interactive Project Galleries:** High-resolution, zoomable viewers for my research posters and MEMS cleanroom fabrication designs. 
* **GPC Deconvolution Tool:** Links out to my custom Python web app that accelerates polymer data analysis by 50x!
* **Integrated Resume Viewer:** A seamless PDF viewer for my latest experience.

## Featured Experience
* **R&D Intern at Rust-Oleum:** Formulated the company's first silicate-based waterborne paint and engineered a massive 90% reduction in product viscosity!
* **Undergraduate Research Assistant in Polymer Synthesis:** Designed custom liquid handler robotics for automated, high-throughput polymer synthesis and automated complex air and moisture sensitive polymerizations. 
* **Student Ambassador:** Facilitated over 500 student and employer interactions for the School of Chemical Sciences Career Services.

## Tech Stack
* HTML5 & CSS3
* JavaScript and Canvas 2D for the bead simulation

## Local preview and maintenance

No package installation or build step is needed to serve the site:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/en/` (or `/hu/`, `/de/`). GitHub Pages serves these same static files from `main`.

Shared page markup is maintained in `en/index.html`; translated text remains in `json/en.json`, `json/hu.json`, and `json/de.json`. After changing the markup or translation files, sync the three HTML pages:

```sh
python scripts/update-translations.py
python scripts/update-translations.py --check
node --check js/script.js
node --check js/language.js
node --check js/liquid-flow.js
node --test tests/liquid-flow.test.mjs tests/liquid-flow-lifecycle.test.mjs
```

Translations are written into the HTML so each language appears immediately, including without JavaScript. The root page redirects to the browser's language and offers language links as a fallback.

## Performance and colors

The palette pairs forest-green text and navigation with a deeper sage hero, muted sage panels, and warm neutral page backgrounds. All surfaces are solid colors, with normal text contrast of at least 4.5:1 in the primary states. The color tokens are `--bg` for the page, `--bg-light` for the hero, and `--surface` for cards and alternating sections.

Responsive WebP previews in `images/optimized/` replace 5.73 MB of inline originals with at most 408 KB (93% fewer image bytes). The portrait has high loading priority; project images are lazy-loaded with dimensions reserved to avoid layout shifts. Original gallery files remain available through normal links and load when opened in the viewer.

Fonts (Epilogue and Be Vietnam Pro, Latin and Latin Extended), flags, and SVG icons are served locally. Font licenses are included in `fonts/`. Viewer.js 1.11.6 and its MIT license are in `js/vendor/`; its JavaScript and CSS load on the first gallery interaction. The desktop PDF embed loads only near the resume section; mobile visitors use the download link.

The bead animation uses cached Canvas 2D sprites instead of loading Three.js. It keeps the original green/brown colors, 6/8-pixel radii, translucent appearance, and reagent-merging behavior. The physics engine in `js/liquid-flow-physics.mjs` uses a bounded particle pool and neighboring grid cells for collisions. Damped bounces, gentle drift, and recovery to the normal downward speed prevent jitter and lingering upward motion after pointer interactions. A fixed 60 Hz physics step with render interpolation keeps motion consistent on higher-refresh displays.

Only exposed beads within the viewport are drawn. The animation stops when opaque panels cover the entire strip, when the tab is hidden, on mobile layouts, or with reduced-motion/data preferences. Scroll and pointer handlers avoid layout reads; resize work is coalesced. A seeded initial flow avoids waiting for beads to reach lower sections after following deep links. Tests cover collision behavior, pool stability, frame-rate independence, covered/hidden states, resizing, and page-cache restoration.

