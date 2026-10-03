// オフライン用：初回アクセス時にアプリ一式を端末に保存し、以後はネットなしで起動する
const CACHE='fxdemo-v7';
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return r;}).catch(()=>hit||caches.match('index.html'));
    return hit||net;
  }));
});
