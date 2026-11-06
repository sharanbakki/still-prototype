// Cache-first so the prototype keeps working without wifi once opened.
const CACHE = 'still-v5';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const data = await (await fetch('data.json', { cache: 'no-cache' })).json();
    const files = ['./', 'index.html', 'data.json', 'manifest.webmanifest', 'apple-touch-icon.png', 'favicon.png',
      'icons/icon-192.png', 'icons/icon-512.png', 'icons/qr.svg',
      'fonts/DMSans-400-latin-ext.woff2', 'fonts/DMSans-400-latin.woff2', 'fonts/DMSans-500-latin-ext.woff2', 'fonts/DMSans-500-latin.woff2', 'fonts/DMSans-600-latin-ext.woff2', 'fonts/DMSans-600-latin.woff2', 'fonts/Newsreader-400-latin-ext.woff2', 'fonts/Newsreader-400-latin.woff2', 'fonts/fonts.css',
      ...Object.values(data.screens).map(s => s.img)];
    await c.addAll(files);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    const res = await fetch(e.request);
    if (res.ok && new URL(e.request.url).origin === location.origin) {
      (await caches.open(CACHE)).put(e.request, res.clone());
    }
    return res;
  })());
});
