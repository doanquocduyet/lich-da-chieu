/* Lịch Đa Chiều — service worker
 * Chiến lược: cache-first cho app shell, fallback index.html cho mọi điều hướng.
 * ⚠️ BUMP tên cache MỖI LẦN DEPLOY (ldc-v26 → ldc-v27 → …), nếu không máy cũ giữ bản cũ.
 */
const CACHE = 'ldc-v26';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Thời tiết / triều / tên địa điểm: luôn lấy từ mạng, KHÔNG cache.
  // Dữ liệu cũ hiện ra như dữ liệu mới là sai (§0.5).
  if (url.origin !== self.location.origin) return;

  // Điều hướng: mạng trước, hỏng thì trả app shell — mở offline vẫn vào được app.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Tài nguyên trong app shell: cache trước, thiếu thì lấy mạng rồi cache lại.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.status === 200 && r.type === 'basic') {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return r;
    }))
  );
});
