// Csillagkör: az oldal offline is megnyílik; a friss változatot mindig a hálózatról próbálja először.
const CACHE="csillagkor-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png",
  "https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||/googleapis\.com|firebase|gstatic\.com\/firebasejs/.test(u.href)&&!/fonts\./.test(u.host))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||/jsdelivr|fonts\./.test(u.host))){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
