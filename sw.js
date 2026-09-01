// Lich Da Chieu - service worker: app shell offline, engine chay hoan toan tren may
// Ten cache PHAI doi moi lan deploy, khong doi thi may da cai van giu ban cu.
// patch.py tu tang so cuoi moi khi co gi duoc va - dung sua tay dong duoi.
const C='ldc-v69';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.svg','./favicon-32.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});

// TRANG CHINH: LAY MANG TRUOC, cache chi la luoi do khi mat mang.
//
// Truoc day trang cung lay cache truoc. Do la loi nang nhat cua ban giao nay:
// mo app lan N thi doc cache cu, service worker moi tai ban moi ve NEN, phai den
// lan mo N+1 moi thay. Nguoi dung LUON CHAM DUNG MOT BAN — moi thu vua sua xong
// deploy xong, ho mo ra van thay y nguyen loi cu. Da dung lai duoc bang thu
// nghiem 3 lan mo lien tiep.
//
// Doi lai: neu mang cham thi cho toi 3 giay. Qua 3 giay thi lay cache ra dung
// ngay, va van tiep tuc ghi ban moi vao cache cho lan sau. Mat mang han thi
// chay hoan toan bang cache nhu cu.
const TIMEOUT=2000;
function isDoc(req,u){
  return req.mode==='navigate' || u.pathname==='/' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html');
}
function fromCacheDoc(){ return caches.match('./index.html',{ignoreSearch:true}); }
function netFirst(req){
  return new Promise(resolve=>{
    let xong=false;
    const gio=setTimeout(()=>{ if(xong)return; xong=true;
      fromCacheDoc().then(r=>resolve(r||fetch(req))); },TIMEOUT);
    fetch(req).then(res=>{
      const cp=res.clone();
      caches.open(C).then(c=>c.put('./index.html',cp));   // ghi lai cho lan sau
      if(xong)return; xong=true; clearTimeout(gio); resolve(res);
    }).catch(()=>{ if(xong)return; xong=true; clearTimeout(gio);
      fromCacheDoc().then(r=>resolve(r||Response.error())); });
  });
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Thoi tiet / trieu / ten dia diem (Open-Meteo): KHONG dung vao, luon de di thang ra mang.
  // Neu cache nhung request nay thi du lieu cu se hien ra nhu du lieu moi.
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  if(isDoc(e.request,u)){
    // May bao dang khong co mang: khoi thu goi ra ngoai, lay cache ngay.
    // Khong co dong nay thi luc mat mang phai cho het 3 giay moi mo duoc app.
    if(self.navigator&&self.navigator.onLine===false){
      e.respondWith(fromCacheDoc().then(r=>r||fetch(e.request)));return;
    }
    e.respondWith(netFirst(e.request)); return;
  }
  // Icon, manifest: doi rat it, lay cache truoc cho nhanh.
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
      const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;
    }).catch(()=>fromCacheDoc()))
  );
});
