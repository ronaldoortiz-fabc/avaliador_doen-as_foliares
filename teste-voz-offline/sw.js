const CACHE='laboratorio-voz-offline-v1';
const CORE=['./','./index.html','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('laboratorio-voz-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{let r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(resp=>{if(resp.ok){let clone=resp.clone();caches.open(CACHE).then(c=>c.put(r,clone));}return resp;})));});
