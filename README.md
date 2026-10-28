# Mubeen Salman — Portfolio

Plain HTML / CSS / JavaScript. No build step: open `index.html`, or upload the folder to any static host
(GitHub Pages, Netlify, Vercel). Offline/PWA support activates automatically on https.

## Files
| File | What it does |
|---|---|
| `index.html` | Page structure and content |
| `style.css` | Liquid-glass design system, light + dark themes, performance tiers |
| `main.js` | Interactions, filters, dialogs, theme, adaptive performance |
| `projects.js` | **Project data** (cards' dialog, hero chart, filters) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support + "install as app" |
| `certificates/` | Each certificate has `-preview.webp` (row image), `-full.webp` (viewer) and the original (download) |
| `og-image.png` | Link-preview image for WhatsApp / LinkedIn / X |

## Things to do after you deploy
1. In `index.html`, change `og:image` / `twitter:image` to your full address, e.g. `https://yourname.github.io/og-image.png`
   (social sites need an absolute URL), and add `<link rel="canonical" href="https://…">`.
2. Optional — receive contact-form messages in your inbox without an email app: create a free form at
   Formspree or Web3Forms and paste its URL into `data-endpoint=""` on `<form id="contactForm">`.
3. After changing files on a live site, bump `VERSION` in `sw.js` so returning visitors get the update.

## Design notes
- Palette: paper `#F2EEE5`, ink `#14181A`, one vermilion accent. Dark mode uses the same three ideas. Change the look in the `:root` / `html[data-theme="light"]` blocks at the top of `style.css`.
- Type: Newsreader (headings and text) and IBM Plex Mono (labels, dates, numbers), loaded from Google Fonts.
- Liquid glass is kept: translucent panels with backdrop blur, a bright rim and soft shadow, over three flat shapes and a graph-paper grid. Reading text sits on glass; only large display type sits directly on the shapes.
- Placeholders still to fill in: your photo (see below) and, if you want them shown, Fiverr prices and delivery times (search `PLACEHOLDER` in `index.html`).

## Optional features you switch on yourself
| Feature | Where | What to do |
|---|---|---|
| Your photo | `index.html`, search for `profile-placeholder.svg` | Save your photo as `images/profile.jpg` (square, 600x600+) and change that one `src` to `images/profile.jpg` |
| Contact form to your inbox | `<form id="contactForm" data-endpoint="">` | Create a free Formspree form and paste its URL into `data-endpoint`. For Web3Forms use `https://api.web3forms.com/submit` and put your key in `data-access-key` |
| Visitor stats | `<meta name="stats-endpoint" content="">` | Create a free GoatCounter site and paste `https://YOURNAME.goatcounter.com/count` into `content`. Stays off on localhost and for visitors with Do Not Track |
| Verify buttons | each certificate's `cert-actions` block | Copy an existing `Verify` link line and change the `href` (only for certificates that have a public verify page) |
| Services text | `<section id="services">` | Edit the six service cards |

Search (Ctrl+K / the magnifier in the nav) and the GitHub activity card need no setup.

## Built-in helpers (no setup)
- Project search box next to the filters; it combines with the filter buttons.
- Skills with a small number (like Python 14) are links: they show every project that uses that tool. Tools inside a project dialog work the same way.
- "Copy link" in a project dialog copies a link that opens that exact project.
- Tap a certificate ID or student ID to copy it.
- If you ever change the layout width, the left ink bar sizes itself to the page margin and hides when there is no room.
The GitHub card uses the username in `data-user="MuhammadMubeen04"`.

## Adding a project
Add an object to `projects.js`, then copy any `<article class="project-card">` in `index.html`
and change its `data-project` number, `data-groups`, `data-tools` and text. (Filter chip counts and the
hero chart's numbers are static in the HTML — update them if you add tools/projects.)

## Performance modes
`<html data-tier="high | mid | low">` is chosen automatically from the device (touch, cores, memory, data-saver)
and then tuned by a frame-rate check — visitors see nothing, it just stays smooth.
Test any mode yourself: `index.html?tier=low` (or `mid`, `high`).
