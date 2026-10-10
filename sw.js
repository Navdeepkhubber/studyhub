/* Study Compass service worker: refresh pages online, keep a copy for offline use. */
const CACHE='study-compass-v9';
const ASSETS=['./','./index.html','./styles.css?v=18','./app.js?v=18','./guide.js?v=7','./weekly-resources.js?v=2','./dsa-sheet.js?v=1','./roadmap.json?v=2','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'||url.pathname.endsWith('roadmap.json')){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok&&url.origin===location.origin){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone))}return r}).catch(()=>caches.match(e.request).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r.ok&&url.origin===location.origin){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone))}
    return r;
  })));
});
