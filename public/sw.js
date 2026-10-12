/* Study Hub service worker: network-first for pages, stale-while-revalidate for hashed assets. */
const CACHE = 'studyhub-v7';
const ROOT = new URL('./', self.registration.scope).toString();
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.add(new Request(ROOT, { cache: 'reload' }))).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const put = (key) => (r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); } return r; };
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(put(ROOT)).catch(() => caches.match(ROOT))); return; }
  e.respondWith(caches.match(req).then((m) => { const net = fetch(req).then(put(req)).catch(() => m); return m || net; }));
});
