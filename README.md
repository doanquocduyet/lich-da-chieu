# Lịch Đa Chiều

**Một ngày — nhiều lăng kính.** Vạn niên, Can Chi, Phật lịch, Lịch Tạng, thiên văn.

Spec sản phẩm & kỹ thuật: [`BANGIAO-LICH-DA-CHIEU.md`](BANGIAO-LICH-DA-CHIEU.md) — đọc §0 (triết lý) và §8 (lỗi đã mắc) trước khi sửa bất cứ thứ gì.

## Deploy

6 file, tĩnh hoàn toàn, không cần server:

```
index.html · manifest.webmanifest · sw.js · icon-192.png · icon-512.png · apple-touch-icon.png
```

Đẩy cả 6 file lên bất kỳ host tĩnh nào (GitHub Pages, Netlify, Cloudflare Pages…). Phải chạy trên **http(s)** — mở file local thì service worker không đăng ký được.

`patch.py` và file spec không nằm trong 6 file trên — chúng chỉ phục vụ lúc phát triển, host tĩnh bỏ qua cũng được.

> ⚠️ **Mỗi lần deploy phải bump tên cache trong `sw.js`** (`ldc-v26` → `ldc-v27` → …). Không bump thì máy đã cài vẫn giữ bản cũ. `patch.py` tự làm việc này.

## Có bản build mới

Đừng chép thẳng vào `index.html` — bản build từ nguồn ngoài luôn rơi mất 7 chỗ đã vá:

```bash
python3 patch.py "index (18).html"   # vá 7 chỗ + tự bump cache
```

Rồi chạy 3 mục kiểm tra bắt buộc. Chi tiết ở §11 của file spec.

Toàn bộ phép tính lịch chạy trên máy người dùng. Chỉ thời tiết / thủy triều / tên địa điểm mới cần mạng (Open-Meteo, không cần API key).

## Chạy thử tại chỗ

```bash
npx http-server -p 8099 -c-1 .
# mở http://127.0.0.1:8099/index.html
```

## Đo người dùng

Analytics chạy local, không gửi server, không cookie bên thứ ba. Mở DevTools Console:

```js
getStats()
```

Đúng 5 event: `tab_open` · `date_select` · `language_change` · `first_visit` · `return_visit`.

## Việc tiếp theo

`Deploy → 10–20 người thật dùng → đọc getStats() → mới quyết V3.`

Backlog §7 **chưa làm và không làm trước khi có số liệu người dùng thật**.
