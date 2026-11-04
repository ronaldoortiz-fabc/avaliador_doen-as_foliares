/* Cache de interface - nenhuma avaliação é enviada ao Service Worker. */
const CACHE = 'ficha-voz-ui-v3-multi';
const ASSETS = ['./','./index.html','./drive-sync.js','./ensaios.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req=event.request, url=new URL(req.url);
  if(req.method!=='GET' || url.origin!==self.location.origin) return;
  event.respondWith(fetch(req).then(resp=>{ if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}return resp; }).catch(()=>caches.match(req)));
});
