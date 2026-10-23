// Offline cache for Mon français. Bump V when you want every device to drop old files.
const V='mf-v1';
const CORE=['./','index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),same=u.origin===location.origin,fonts=/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!fonts)return;               // translation requests go straight to the network
  const keep=res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res};
  if(r.mode==='navigate'||(same&&u.pathname.endsWith('index.html'))){
    e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r).then(x=>x||caches.match('index.html'))));return;
  }
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(keep)));
});
