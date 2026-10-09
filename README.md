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
| `og-image.png` | Link-preview image for WhatsApp / LinkedIn / X |

## Things to do after you deploy
1. In `index.html`, change `og:image` / `twitter:image` to your full address, e.g. `https://yourname.github.io/og-image.png`
   (social sites need an absolute URL), and add `<link rel="canonical" href="https://…">`.
2. Optional — receive contact-form messages in your inbox without an email app: create a free form at
   Formspree or Web3Forms and paste its URL into `data-endpoint=""` on `<form id="contactForm">`.
3. After changing files on a live site, bump `VERSION` in `sw.js` so returning visitors get the update.

## Adding a project
Add an object to `projects.js`, then copy any `<article class="project-card">` in `index.html`
and change its `data-project` number, `data-groups`, `data-tools` and text. (Filter chip counts and the
hero chart's numbers are static in the HTML — update them if you add tools/projects.)

## Performance modes
`<html data-tier="high | mid | low">` is chosen automatically from the device (touch, cores, memory, data-saver)
and then tuned by a frame-rate check — visitors see nothing, it just stays smooth.
Test any mode yourself: `index.html?tier=low` (or `mid`, `high`).
