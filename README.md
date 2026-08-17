# Lịch Đa Chiều

**Một ngày — nhiều lăng kính.** Vạn niên, Can Chi, Phật lịch, Lịch Tạng, thiên văn.

Spec sản phẩm & kỹ thuật: [`BANGIAO-LICH-DA-CHIEU.md`](BANGIAO-LICH-DA-CHIEU.md) — đọc §0 (triết lý) và §8 (lỗi đã mắc) trước khi sửa bất cứ thứ gì.

## Deploy

6 file, tĩnh hoàn toàn, không cần server:

```
index.html · manifest.webmanifest · sw.js · icon-192.png · icon-512.png · apple-touch-icon.png
```

Đẩy cả 6 file lên bất kỳ host tĩnh nào (GitHub Pages, Netlify, Cloudflare Pages…). Phải chạy trên **http(s)** — mở file local thì service worker không đăng ký được.

> ⚠️ **Mỗi lần deploy phải bump tên cache trong `sw.js`** (`ldc-v26` → `ldc-v27` → …). Không bump thì máy đã cài vẫn giữ bản cũ.

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
