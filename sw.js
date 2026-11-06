/* Aplicativo Fitopatologia - pacote offline atomico. */
const CACHE = 'ficha-voz-ui-v7-offline-atomico';
const PREFIX = 'ficha-voz-ui-';
const FILES = ['./', './index.html', './drive-sync.js', './ensaios.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Se um arquivo falhar, a instalacao do novo worker falha e o anterior permanece ativo.
    await cache.addAll(FILES.map(p => new Request(p, {cache:'reload'})));
    const checks = await Promise.all(FILES.map(p => cache.match(p)));
    if (checks.some(x => !x || !x.ok)) throw new Error('Pacote offline incompleto');
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if(event.data?.type === 'OFFLINE_STATUS') {
    event.waitUntil((async()=>{
      const cache=await caches.open(CACHE);
      const all=await Promise.all(FILES.map(f=>cache.match(f)));
      event.source?.postMessage({type:'OFFLINE_STATUS',ready:all.every(Boolean),version:CACHE});
    })());
  }
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method !== 'GET') return;
  const url=new URL(request.url);
  if(url.origin !== self.location.origin) return;
  const scope=new URL(self.registration.scope);
  if(!url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    // HTML e JavaScript sao servidos do mesmo pacote validado, sem depender da rede.
    const pathname=url.pathname;
    const appRoot=scope.pathname;
    const indexPath=appRoot+'index.html';
    const isNavigation=request.mode==='navigate';
    const canonical=isNavigation && (pathname===appRoot || pathname===indexPath)
      ? new URL('./index.html',self.registration.scope).href : request;
    const cached=await cache.match(canonical, {ignoreSearch:true});
    if(cached) return cached;
    // Outros recursos nao essenciais podem usar a rede quando disponivel.
    try {return await fetch(request);} catch(e) {
      if(isNavigation) {
        const home=await cache.match('./index.html');
        if(home) return home;
      }
      return new Response('Recurso nao disponivel offline', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
