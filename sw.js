/* Offline support. HTML/CSS/JS are network-first (so deploys show up immediately);
   images and fonts are cache-first (they rarely change). Bump VERSION to force a refresh. */
const VERSION = 'v1';
const CORE = `core-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;
const PRECACHE = [
  './', 'index.html', 'style.css', 'main.js', 'projects.js', 'manifest.webmanifest',
  'favicon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png',
  'images/arch-technologies.jpg', 'images/big-brains.jpg', 'images/decodelabs.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![CORE, RUNTIME].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !isFont) return;

  const isCode = req.mode === 'navigate' || /\.(?:html|css|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (isCode) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CORE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
