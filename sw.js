// Lich Da Chieu - service worker: app shell offline, engine chay hoan toan tren may
// Ten cache PHAI doi moi lan deploy, khong doi thi may da cai van giu ban cu.
// patch.py tu tang so cuoi moi khi co gi duoc va - dung sua tay dong duoi.
const C='ldc-v40';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Thoi tiet / trieu / ten dia diem (Open-Meteo): KHONG dung vao, luon de di thang ra mang.
  // Neu cache nhung request nay thi du lieu cu se hien ra nhu du lieu moi.
  if(new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
      const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
