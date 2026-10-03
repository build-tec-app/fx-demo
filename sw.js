// オフライン対応：ネットにつながっていれば常に最新版を表示し、つながっていなければ保存済みの版で起動する
const CACHE='fxdemo-v10';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const isPage=req.mode==='navigate'||/\/(index\.html)?$/.test(new URL(req.url).pathname);
  if(isPage){
    /* ページ本体：ネット優先（3秒で応答がなければ保存済みを使う） */
    e.respondWith(new Promise(resolve=>{
      let done=false;const fallback=()=>caches.match('index.html').then(r=>{if(!done){done=true;resolve(r||Response.error());}});
      const timer=setTimeout(fallback,3000);
      fetch(req,{cache:'no-store'}).then(r=>{clearTimeout(timer);if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));}if(!done){done=true;resolve(r);}}).catch(()=>{clearTimeout(timer);fallback();});
    }));
    return;
  }
  /* アイコンなど：保存済み優先 */
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
