/* Avaliador Fitopatologico: HTML autonomo, versao 9. */
const CACHE = 'ficha-voz-ui-v9-campo-voz';
const PREFIX = 'ficha-voz-ui-';
const ASSETS = ['./index.html', './', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // A nova versao so ativa apos todos os recursos essenciais estarem disponiveis.
    await cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})));
    for(const path of ASSETS){if(!await cache.match(path)) throw Error('Pacote offline incompleto: '+path);}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event=>{
  event.waitUntil((async()=>{
    await self.clients.claim();
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin || !url.pathname.startsWith(scope.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const nav=event.request.mode==='navigate';
    const indexUrl=new URL('index.html',self.registration.scope).href;
    // Navegacoes internas sempre recebem o HTML autonomo, mesmo com modo aviao.
    const canonical=nav ? indexUrl : event.request;
    const cached=await cache.match(canonical,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const res=await fetch(event.request);
      return res;
    }catch(e){
      if(nav){const fallback=await cache.match(indexUrl);if(fallback)return fallback;}
      return new Response('Recurso indisponivel offline',{status:503});
    }
  })());
});
