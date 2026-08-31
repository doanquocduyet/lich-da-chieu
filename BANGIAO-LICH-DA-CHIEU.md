# LỊCH ĐA CHIỀU — BẢN BÀN GIAO KỸ THUẬT & SẢN PHẨM
**Phiên bản:** V2.3 · **Ngày:** 17/08/2026 · **Trạng thái:** đã build, chưa deploy, user thật = 0

> **Một ngày — nhiều lăng kính.** One day. Many ways of seeing time.

---

## 0. TRIẾT LÝ SẢN PHẨM (đã khóa, không đổi)

> **Đơn giản cho người dùng. Chính xác ở bên trong.**
> *Complexity belongs in the engine, not in the user's head.*

**Nguyên tắc bất di bất dịch:**

1. Không phải "càng nhiều thông tin = càng tốt", mà **đúng thông tin, đúng lúc, đúng mức**.
2. Người thường dùng được trong **10 giây**; người hiểu sâu mở từng lớp kiểm tra được.
3. **Được hiển thị ý nghĩa truyền thống — không phán vận cá nhân.**
   - ĐƯỢC: "Theo truyền thống Kālacakra, tổ hợp này gọi là *bất hòa*."
   - CẤM: "Hôm nay bạn sẽ cãi nhau với người thân."
4. **Không để AI tự bịa giáo nghĩa.** Mỗi câu hoặc (a) trích nguồn kiểm chứng được, hoặc (b) biên tập từ chính dữ liệu ngày đó và **ghi rõ là biên tập**.
5. Có nguồn → dẫn nguồn. Không đủ nguồn → **"chưa có dữ liệu"**. Tuyệt đối không điền số cho đẹp UI.
6. Thuật ngữ kỹ thuật (kinh độ Mặt Trời, Phugpa/Janson, weather_code, datum, API, timezone) **không đưa ra giao diện chính** — chỉ nằm ở dòng nguồn cuối trang / mục "Nguồn & độ tin cậy".
7. **Code chạy được chỉ chứng minh code chạy được. Không chứng minh dữ liệu đúng.** Lịch là domain phải validation độc lập trước khi tin.

**Từ vựng khóa (dùng đúng, không đổi):**

| Dùng | Không dùng |
|---|---|
| Độ sáng | Illumination |
| Tiết khí | Kinh độ Mặt Trời / Solar longitude |
| Lịch Tạng (chi tiết mới ghi "Hệ lịch: Phugpa") | Tibetan Phugpa Calendar |
| Hỏa Ngựa | Male Fire Horse / "Hỏa Ngựa (dương)" |
| Phật lịch 2570 | (không gộp với ngày âm ở cùng bậc) |

---

## 1. KIẾN TRÚC THÔNG TIN — 5 TAB ĐÁY

Bottom navigation (app phone, ngón cái phải với tới được):

```
Hôm nay │ Lịch │ Đổi ngày │ Sự kiện │ Khám phá
   ◈    │  ▦   │    ⇄     │   ☸     │    ✧
```

### TAB 1 — HÔM NAY (2 tầng)

**Tầng 1 — nhìn 5–10 giây là hiểu:**

```
        THỨ HAI
          17          ← 122px, ĐỎ #B03A30, đậm 800
      Th8 · 2026
   [ Mùng 5 tháng Bảy ]   ← viên thuốc bo tròn
  Năm Bính Ngọ · ngày Quý Hợi

┌─────┬─────┬──────┬─────┐
│ GIỜ │NGÀY │THÁNG │ NĂM │   ← thanh Can Chi
│20:47│  5  │  7   │2026 │   ← giờ CHẠY THẬT (cập nhật 30s)
│Canh │Quý  │Bính  │Bính │
│Tuất │Hợi  │Thân  │Ngọ  │
└─────┴─────┴──────┴─────┘

T2  T3  T4  T5  T6  T7  CN     ← dải tuần, chạm để nhảy ngày
17  18  19  20  21  22  23     ← hôm nay nền đỏ, CN chữ đỏ
 5   6   7   8   9  10  11
```

**Tầng 2 — 5 HUB, mỗi hub một ngôn ngữ thị giác riêng** (KHÔNG được làm 5 thẻ giống nhau, KHÔNG dùng mũi tên `›` chung — mỗi hub có CTA riêng):

| # | Hub | Nội dung mặt trước | CTA |
|---|---|---|---|
| ① | Thời tiết | `28°` · Có mưa · **tên địa điểm thật** · cảm giác như / ẩm / gió · mặt trời mọc–lặn | Xem dự báo → |
| ② | Mặt trăng | trăng SVG 92px · Lưỡi liềm đầu · **23%** · ngày thứ N sau mùng Một | Xem chi tiết → |
| ③ | Tiết khí | **Lập Thu** · thanh tiến trình có chấm "hôm nay" · Xử Thử · **23.08** | Xem 24 tiết khí → |
| ④ | Phật lịch | **2570** · Ngày 5 tháng 7 âm lịch · tên lễ nếu có | Xem lịch Phật → |
| ⑤ | Lịch Tạng | **5** · Tháng 7 · **Hỏa Ngựa · 2153** · tổ hợp nguyên tố | Xem lịch Tạng → |

**Cuối màn:**

```
──────────────────────
    DÒNG CỦA NGÀY
"Trăng đang lớn — mỗi đêm phần sáng
 lại dày thêm cho đến kỳ trăng tròn."
 Thiên văn · Biên tập từ dữ liệu ngày
──────────────────────

[ Ngày mai · 18/8 ]  Mùng 6/7 âm · Lưỡi liềm đầu · Mưa 30% · Không có ngày lễ lớn
```

### TAB 2 — LỊCH

4 chế độ: **Ngày | Tuần | Tháng | Năm** (mặc định **Tháng**).

- Thanh điều hướng: `‹ | nhãn | Hôm nay | ›` — **mũi tên bước theo đúng đơn vị đang xem** (xem tháng → nhảy tháng, KHÔNG nhảy 1 ngày).
- Nhãn tháng bấm được → mở chế độ Năm.
- **Ô lịch cực sạch**: số lớn = dương (29px, đậm 900), số nhỏ = âm (13px), **chấm = có sự kiện**, đậm = mùng 1 & rằm. **KHÔNG nhét Can Chi/trăng/thời tiết vào ô.**
- Ô cao 80px, hôm nay nền đỏ có đổ bóng, Chủ Nhật chữ đỏ.
- **Dưới lưới tháng = danh sách sự kiện trong tháng.**
- Chạm ngày → **trang chi tiết ngày** (đủ Vạn Niên + Can Chi + Phật giáo + Tạng), có nút "‹ Quay lại".
- Chế độ Năm: 12 tháng mini, hôm nay khoanh tròn, chạm tháng → về chế độ Tháng.

### TAB 3 — ĐỔI NGÀY

4 chiều: **Dương→Âm · Âm→Dương · Dương→Tạng · Tạng→Dương**

Kết quả trả về đủ: dương lịch (kèm thứ), âm lịch, Can Chi ngày, Can Chi tháng·năm, Phật lịch, lịch Tạng + tên năm, tiết khí, pha trăng. Có nút **Chia sẻ kết quả** (dùng `navigator.share`, fallback copy).

Xử lý biên: âm lịch không tìm thấy → báo "kiểm tra tháng nhuận / ngày 30"; ngày Tạng bị khuyết (chad) → báo rõ "ngày này bị khuyết, không có ngày dương tương ứng".

### TAB 4 — SỰ KIỆN

Timeline 12 tháng tới. Mỗi dòng: ô ngày đỏ (dương + âm) + tên sự kiện + **badge nguồn**.

4 badge: `PHẬT GIÁO · VN` / `TẠNG · PHUGPA` / `ÂM LỊCH · TÍNH` / `VĂN HÓA · VN`

### TAB 5 — KHÁM PHÁ

6 mục: **Mặt trăng · Vũ trụ · Phật giáo · Lịch Tạng · Thời tiết · Thủy triều**

(Thủy triều chỉ hiện dữ liệu khi vị trí có; trong đất liền báo "không có dữ liệu".)

---

## 2. ENGINE DỮ LIỆU — ĐÃ KIỂM CHỨNG ĐỘC LẬP

### 2.1 Âm lịch Việt Nam
- **Thuật toán Hồ Ngọc Đức**, múi giờ +7 (kinh tuyến 105°E).
- Quy tắc: mùng 1 = ngày Sóc; Đông chí luôn trong tháng 11 âm; tháng nhuận = tháng đầu sau Đông chí không có Trung khí.
- **Kiểm chứng:** `01/01/2000 → 25/11/1999` ✓ · `10/02/2024 → 01/01/2024` ✓ · `17/08/2026 → 05/07/2026` ✓ (khớp nhiều nguồn lịch VN độc lập).

### 2.2 Can Chi
- Ngày: `(jd+9)%10`, `(jd+1)%12` · Năm: `(y+6)%10`, `(y+8)%12` · Tháng: `((ly*12+lm+3)%10)`, `(lm+1)%12`
- Giờ: can giờ `= (canNgày%5*2 + chiGiờ)%10`, giờ Tý bắt đầu 23h.
- **Nạp âm** bảng 60 hoa giáp (30 mục × 2 năm).
- **Giờ hoàng đạo**: bảng theo chi ngày, 6 giờ hoàng đạo / 6 hắc đạo, hiển thị đủ 12 giờ có chấm phân biệt.
- **Kiểm chứng:** `1984 = Giáp Tý` ✓ · `2026 = Bính Ngọ` ✓ · `17/08/2026 = ngày Quý Hợi, tháng Bính Thân` ✓ · `Giáp Tý → Hải Trung Kim` ✓ · `20:47 ngày 16/8 → giờ Canh Tuất` ✓ (khớp Lịch Việt).

### 2.3 24 tiết khí
- Tính từ **kinh độ Mặt Trời** vượt các mốc bội số 15° (0° = Xuân phân), múi giờ +7.
- **Kiểm chứng 2026:** Xuân phân 20/3 · Hạ chí 21/6 · Thu phân 23/9 · Đông chí 22/12 ✓ · Lập Thu → Xử Thử 23/8 ✓
- ⚠️ Hiển thị **ngày bắt đầu tiết sau** (23.08), KHÔNG dùng kiểu "còn N ngày" ở hub.

### 2.4 Pha Mặt Trăng — **thuật toán Meeus (ch.46–48)**
- Trước đây dùng công thức xấp xỉ, sai 2–3 điểm % → **đã thay bằng Meeus**.
- `moonAt(jd)`: góc pha `i = 180 - D - 6.289·sin(Mp) + 2.100·sin(M) - 1.274·sin(2D-Mp) - 0.658·sin(2D) - 0.214·sin(2Mp) - 0.110·sin(D)`; độ sáng `k = (1+cos i)/2`.
- Mốc giờ hiển thị: **12:00 ICT** (vì độ sáng đổi trong ngày).
- Tìm sóc/vọng bằng **quét đổi dấu + chia đôi** (không nhảy bước — cách nhảy bước từng nhảy sai chu kỳ).
- **Kiểm chứng với ephem/NASA:** `17/8 12h ICT = 22,8%` (ephem 22,77) ✓ · `16/8 = 14,6%` ✓ · `rằm 28/8 = 100%` ✓ · `sóc 11/9 = 0%` ✓ · sóc/vọng lệch < 30 phút.
- ⚠️ Giữ nguyên câu cảnh báo: *"Pha trăng là ước tính theo ngày, chưa phải thời điểm đổi pha chính xác."*

### 2.5 Lịch Tạng — **Phugpa thật**
- Nhúng trực tiếp thư viện **`tibetan-date-calculator` v1.2.3 (MIT, Eszter Hoffmann)**, hiện thực paper **Svante Janson "Tibetan calendar mathematics"** — đúng thư viện Lotsawa House dùng. Bản UMD minified ~7,7KB nhúng thẳng vào file, global `tibetanCalendarCalculator`.
- Xử lý đủ **tháng nhuận, ngày trùng (lhag), ngày khuyết (chad)**.
- ⚠️ **KHÔNG BAO GIỜ** quay lại cách cũ (`year = gregorian + 127`, mượn âm lịch VN) — cách đó từng cho ra **"Water Ox" SAI**.
- **Kiểm chứng:** `2153 = Male Fire Horse (Hỏa Ngựa)` ✓ (khớp CTA + Lotsawa + app Drukpa chính thức) · `Losar = 18/02/2026` ✓ · `Chökhor Düchen 4/6 = 18/07/2026` ✓ · `Saga Dawa 15/4 = 31/05/2026` ✓ · `Lhabab 22/9 = 01/11/2026` ✓ · `17/08/2026 = ngày 5 tháng 7` ✓ (khớp app Drukpa chính thức).
- **Ngày thực hành:** 8 (Dược Sư & Tara) · 10 (Guru Rinpoche) · 15 (rằm — A Di Đà) · 25 (Dakini) · 29 (Hộ pháp) · 30 (Thích Ca).
- **5 Düchen/Losar:** Losar 1/1 · Chötrul 15/1 · Saga Dawa 15/4 · Chökhor (Drukpa Teshi) 4/6 · Lhabab 22/9.
- Ghi chú bắt buộc: *"Phái Drukpa (Bhutan) theo biến thể Tsurphu nên một số ngày có thể lệch; nghi lễ chính thức đối chiếu lịch dòng truyền thừa hoặc Men-Tsee-Khang."*

### 2.6 Tổ hợp nguyên tố Kālacakra (khams kyi sbyor ba)
**Thuật toán:** nguyên tố của **thứ trong tuần** + nguyên tố của **chòm sao Mặt Trăng** → tra bảng 10 tổ hợp.

- Kinh độ Mặt Trăng: Meeus ch.47 (16 số hạng lớn).
- Chòm sao: `sidereal = (kinhĐộ − ayanamsa 24,21°) mod 360`, chia 27 phần.
- Nguyên tố thứ: `[CN Lửa, T2 Nước, T3 Lửa, T4 Nước, T5 Gió, T6 Đất, T7 Đất]`
- Nguyên tố 27 chòm sao: `wind,fire,fire,earth,wind,water,wind,fire,water,fire,fire,wind,wind,wind,wind,fire,earth,earth,water,water,earth,earth,water,earth,fire,water,water`

**Bảng 10 tổ hợp** (nguồn: kalacakra.org — E. Henning, theo Vimalaprabhā):

| Tổ hợp | Tạng | Phạn | Nghĩa | Tính |
|---|---|---|---|---|
| Đất + Đất | dngos grub | siddhi | Thành tựu | + |
| Nước + Nước | bdud rtsi | amṛita | Cam lồ | + |
| Đất + Nước | lang tsho | yauvana | Tuổi trẻ | + |
| Lửa + Lửa | 'phel 'gyur | pragati | Tăng tiến | + |
| Gió + Gió | phun tshogs | saṃpanna | Viên mãn | + |
| Lửa + Gió | stobs ldan | balayukta | Mạnh mẽ | + |
| Đất + Gió | mi phrod | alābha | Thiếu hụt | − |
| Nước + Gió | mi mthun | pratikūla | Bất hòa | − |
| Đất + Lửa | sreg pa | dahana | Thiêu đốt | − |
| Lửa + Nước | 'chi ba | maraṇa | Tử | − |

**Kiểm chứng khớp app Drukpa chính thức:** `17/8/2026 → Nước–Gió` ✓ · `18/8/2026 → Lửa–Gió` ✓

**28 Yoga (thứ × chòm sao):** CHỈ lấy **tên Tạng + nghĩa biểu tượng** (Hoan hỷ, Tràng phan chiến thắng, Cam lồ, Mũi tên, Voi…). **ĐÃ CỐ Ý LƯỢC BỎ** phần diễn giải hậu quả trong bảng gốc ("sợ hãi", "hao tổn tài sản"…) — đó là phán vận.

### 2.7 Phật lịch
- Quy ước phổ biến VN: **năm dương + 544**. Ghi rõ quy ước này trên giao diện.
- Bảng 14 ngày lễ/vía (Phật Đản 15/4, Vu Lan 15/7, Thành Đạo 8/12, các ngày vía Bồ Tát…).
- ⚠️ **NỢ (mục F):** phải đổi tên thành **"Lịch Phật giáo · Việt Nam · Bắc truyền"** và bổ sung trường `tradition`. Không được tuyên bố đây là "lịch Phật giáo chuẩn duy nhất".

### 2.8 Cosmic Calendar
- **Cố định**, KHÔNG phụ thuộc ngày đang xem: Big Bang = 1/1 00:00, hiện tại = **31/12 23:59:59**.
- Mốc: Ngân Hà 6/1 · Hệ Mặt Trời 31/8 · Sự sống 21/9 · Khủng long tuyệt chủng 29/12 · Loài người 31/12 05:48 · **BẠN Ở ĐÂY** 31/12 23:59:59.
- Số liệu phụ: 1 ngày vũ trụ ≈ 37,8 triệu năm · 1 giây ≈ 438 năm.
- ⚠️ Ẩn ô chọn ngày khi ở tab này.

### 2.9 Thời tiết
- **Open-Meteo** (không cần API key): `api.open-meteo.com/v1/forecast` — nhiệt độ, cảm giác như, độ ẩm, mưa, mã thời tiết, gió, 7 ngày, xác suất mưa, mặt trời mọc/lặn.
- **Tên địa điểm:** `geocoding-api.open-meteo.com/v1/search` (language=vi).
- Vị trí lấy qua GPS, **lưu trên máy** (`localStorage`), không gửi đi đâu. Nút: "Bật vị trí để xem trời hôm nay nơi bạn ở" — KHÔNG viết kiểu settings ("Bấm để bật thời tiết theo vị trí").

### 2.10 Thủy triều
- **Open-Meteo Marine**: `marine-api.open-meteo.com/v1/marine?hourly=sea_level_height_msl`
- Tự tìm cực đại/cực tiểu chuỗi giờ → nước lớn / nước ròng + độ cao (m) + đồ thị 48h.
- **NGUYÊN TẮC:** KHÔNG suy mực nước từ pha trăng. Phân kỳ triều cường/kém theo trăng có ghi rõ *"quy luật thiên văn — không phải mực nước dự báo tại trạm"*.
- Ghi nhãn bắt buộc: mô hình toàn cầu **~8 km**, mốc mực nước biển trung bình, **chỉ tham khảo, không dùng đi biển**, bản tin chính thức VN là **NCHMF**.
- Không có dữ liệu (đất liền / ngoài vùng phủ) → **"không có dữ liệu"**, không bịa số.
- ⚠️ **NỢ (mục F):** kiến trúc 3 tầng Astronomy → Marine model → Official station (NCHMF), kèm badge `OFFICIAL STATION` / `MODEL · REFERENCE`.

---

## 3. HỆ THỐNG THIẾT KẾ

### 3.1 Nền chung
```css
--cream: #FAF7F0   /* nền toàn app */
--ink:   #1C1B18   /* chữ chính */
--red:   #B03A30   /* đỏ trầm — hôm nay, CN, nhấn */
--jade:  #6F9585   /* xanh ngọc — giờ hoàng đạo, tích cực */
--bd:    #EDE6D8   /* viền */
--muted: #6E6A5E   /* chữ phụ */
```
Font: **Inter / system sans**. Cỡ nền 16px.

**Chống trình duyệt tự bôi đen (bắt buộc, đã từng gây lỗi):**
```html
<meta name="color-scheme" content="light only">
<meta name="theme-color" content="#FAF7F0">
```
```css
:root{color-scheme:light only}
html{color-scheme:light only;forced-color-adjust:none}
html,body{background:#FAF7F0 !important;color:#1C1B18 !important}
#bgfix{position:fixed;inset:0;background:#FAF7F0;z-index:-1}  /* lớp nền vật lý */
```

### 3.2 Kích thước (chuẩn Apple 44pt, đã đo)
| Thành phần | Cỡ |
|---|---|
| Số ngày Hôm nay | **122px**, đậm 800, ĐỎ |
| Số ngày ô lịch | **29px**, đậm 900 |
| Số âm trong ô | 13px, đậm 700 |
| Ô lịch | cao **80px** |
| Nút điều hướng | **44×44px** |
| Tab đáy | cao ~47px, icon 28px, chữ 12,5px |
| Chip chọn chế độ | cao ≥44px, chữ 14,5px |
| Chữ thẻ chính | 17,5px đậm 600 · phụ 13,5px |

### 3.3 BẢN SẮC 6 HUB — mỗi hub một thế giới

| Hub | Nền | Màu chính | Hoa văn (SVG vẽ tay, không dùng ảnh) |
|---|---|---|---|
| **Lịch Tạng** | đỏ tía tăng bào `#8C2A20 → #571714` | vàng kim `#E8C98B`, viền `#D4A017` | **dải cờ lungta 5 màu** trên đầu + **đường núi Himalaya** + **nút thắt vô tận** (dpal be'u) |
| **Phật giáo** | kem `#FDFAF3 → #F7F0E0` | nâu sồng `#5A4632`, vàng nghệ `#C9922E` | **hoa sen 8 cánh** nét mảnh + **bánh xe Pháp 8 nan** |
| **Vũ trụ** | đen thẳm `#1A1B33 → #0B0E17` | tím `#6D4FA8` → vàng `#D4AF37` | **3 vòng quỹ đạo đồng tâm** + 26 hạt sao mờ |
| **Mặt trăng** | đêm `#1C2130 → #12151F` | bạc `#F2EEE2` | **quầng sáng đồng tâm** + trăng SVG vẽ pha thật |
| **Thời tiết** | xanh khí quyển `#EAF1F4 → #F6F2E9` | xanh biển `#26414C` | **đường chân trời + vệt mây** |
| **Thủy triều** | lục ngọc `#EDF3F1 → #F7F4EC` | lục `#4E7565` | **đường sóng đôi** |

**Ngũ sắc lungta = ngũ đại** (dùng cho dải cờ và đĩa nguyên tố):
`lam #2E5C8A` (không) · `trắng #EFEAE0` (gió) · `đỏ #B03A30` (hỏa) · `lục #4E7565` (thủy) · `vàng #C89B3C` (địa)

### 3.4 Ô "Tổ hợp nguyên tố" — cách trình bày bắt buộc

Không được liệt kê chữ lạ khô khan. Phải đủ **3 tầng đọc**:

```
        ✦ (nút thắt vô tận, vàng kim)
   TỔ HỢP NGUYÊN TỐ CỦA NGÀY

   ●        +        ○
 Nước              Gió
của thứ         của chòm
trong tuần        sao

      Bất hòa            ← 30px đậm, đỏ (xấu) / lục (tốt)
   mi mthun · pratikūla

───────────────────────────
Hôm nay là Thứ Hai — trong lịch Tạng,
thứ này thuộc hành nước. Mặt Trăng đang
đi qua chòm sao Citrā, thuộc hành gió.
Hai hành gặp nhau tạo thành tổ hợp mà
truyền thống gọi tên là "bất hòa".

┃ Người Tạng dùng tổ hợp nguyên tố để chọn
┃ ngày cho các việc hệ trọng như lễ lạt,
┃ khởi công, đi xa. Mỗi ngày trong tháng đều
┃ có một tổ hợp — không có ngày nào "không có".

Yoga của ngày      Mũi tên · mda'
Chòm sao Mặt Trăng          Citrā

[ghi chú nguồn + ranh giới không phán vận]
```

---

## 4. DÒNG CỦA NGÀY

**Đúng MỘT câu** ở cuối màn Hôm nay. Không phải quote cho đẹp — mỗi ngày câu đó phải **có lý do tồn tại**.

**Logic chọn "lens" (thứ tự ưu tiên):**
1. Ngày thực hành Tạng (8/10/15/25/30) → **Lịch Tạng**
2. Rằm / mùng 1 → **Phật giáo** (trích Kinh Pháp Cú kèm số câu)
3. Ngày bắt đầu tiết khí → **Lịch Việt**
4. Mặc định → **Thiên văn** (theo trạng thái trăng: đang lớn / đang khuyết / tròn / không trăng)

Mỗi câu hiển thị: nội dung + `lens · nguồn`. Bấm vào → mở hub tương ứng.

**Corpus hiện có:**
- **Thiên văn** (biên tập từ dữ liệu): 4 câu theo pha trăng
- **Phật giáo** (trích nguồn): Kinh Pháp Cú câu 1, 5, 183
- **Lịch Tạng** (biên tập): 5 câu theo ngày thực hành
- **Vũ trụ** (biên tập): câu về thang thời gian
- **Ca dao nông lịch** (dân gian, trong panel Vạn Niên): 4 câu theo mùa

**Schema mở rộng sau này:**
```
daily_lines: id · date_rule · calendar · tradition · text_vi · text_en
             source · source_url · author · work · copyright_status · editorial_note
```

---

## 5. ANALYTICS (local, không server)

**ĐÚNG 5 event, không hơn:**
```
tab_open · date_select · language_change · first_visit · return_visit
```
Chi tiết lưu làm **metadata bên trong** event, không tạo event mới:
```json
{
  "events": {"tab_open": 12, "date_select": 3, "first_visit": 1},
  "meta": {"tab_open": {"today": 5, "calendar:month": 4, "explore:tibet": 3}},
  "days": ["2026-08-17"], "first": "2026-08-17", "last": "2026-08-17"
}
```
Lưu `localStorage` key `lich_analytics_v1`. Đọc bằng `window.getStats()`. Không gửi server, không cookie bên thứ ba, không thu thập thông tin cá nhân.

---

## 6. PWA

- `manifest.webmanifest`: display **standalone**, background & theme `#FAF7F0`, icon 192/512 (512 có `purpose: any maskable`), lang `vi`.
- `sw.js`: cache app shell, chiến lược cache-first + fallback `index.html`. **Bump tên cache mỗi lần deploy** (`ldc-v26` → `ldc-v27`…).
- Meta iOS: `apple-mobile-web-app-capable`, `apple-touch-icon.png` (180px).
- Đăng ký service worker **chỉ khi chạy http(s)** (mở file local sẽ lỗi).
- **Toàn bộ phép tính lịch chạy trên máy**, không cần server. Chỉ thời tiết/triều/tên địa điểm cần mạng.

**6 file deploy:** `index.html` · `manifest.webmanifest` · `sw.js` · `icon-192.png` · `icon-512.png` · `apple-touch-icon.png`

---

## 7. CHƯA LÀM — BACKLOG (mục F, tuyệt đối không làm trước deploy)

1. Bộ **test vector tự động 50–100 ngày biên** (sóc, rằm, tháng nhuận, giao thừa, Tết, năm biên, ngày trùng/khuyết Tạng).
2. **Audit dữ liệu Phật giáo** — đổi tên "Lịch Phật giáo · Việt Nam · Bắc truyền", thêm trường `tradition`, mở rộng Theravāda / Tây Tạng.
3. **Triều 3 tầng** + badge `OFFICIAL STATION` / `MODEL · REFERENCE`, tích hợp NCHMF.
4. **Bộ chọn giờ trong chi tiết ngày** để Can Chi giờ có nghĩa (hiện: ngày hôm nay dùng giờ thật, ngày khác mặc định giờ Tý).
5. Thời điểm chính xác chuyển tiết khí (giờ:phút ICT).
6. Nhật/nguyệt thực (cần nguồn chuẩn: NASA GSFC / IMCCE).
7. Ghi chú cá nhân, xuất Google/Apple Calendar, thông báo đẩy.
8. React Native — **chỉ khi số liệu người dùng thật đòi hỏi**, không làm trước.

**Chiến lược đã khóa:** `V2.3 → Deploy → 10–20 người thật dùng → đo bằng getStats() → mới quyết V3`

---

## 8. CÁC LỖI ĐÃ MẮC — ĐỪNG LẶP LẠI

| Lỗi | Hậu quả | Bài học |
|---|---|---|
| Năm Tạng tự chế `year+127` + công thức tự nghĩ | Ra **"Water Ox"** sai (đúng: Hỏa Ngựa) | Không tự chế thuật toán cho hệ lịch mình không nắm; dùng thư viện chuẩn |
| Pha trăng công thức xấp xỉ | Sai 2–3 điểm % | Dùng Meeus, đối chiếu ephem |
| Hàm dò sóc/vọng nhảy bước | Nhảy sai chu kỳ (ra 29/10 thay vì 11/9) | Quét đổi dấu + chia đôi |
| Gán nhãn sóc/vọng ngược | 28/8 gọi là sóc (thật ra là rằm) | Góc pha 0 = rằm, 180 = sóc |
| `moonPhase(new Date())` trong panel | Chọn ngày khác vẫn ra trăng hôm nay | Mọi hàm nhận `date` tham số |
| Thiếu `color-scheme` | Chrome/Safari tự bôi đen toàn app | Khai báo + lớp nền vật lý |
| Chèn code làm mất dòng `function hubWeather(t){` | Trắng app, "Illegal return statement" | Sau mỗi lần sửa lớn phải chạy test bắt `pageerror` |
| Thiếu chuỗi i18n | Hiện "undefined" trên giao diện | Test cả 2 ngôn ngữ, grep "undefined" |
| Bản build mới đè lên index.html, mất 7 chỗ đã vá | Lỗi ngày khuyết + sai spec chữ nghĩa quay lại, đã lặp ở V2.4 và V2.5 | **Không bao giờ chép thẳng bản build vào index.html.** Luôn qua `patch.py` — xem §11 |
| `sw.js` cache mọi request kể cả khác origin | Kết quả thời tiết lần đầu bị đóng băng vĩnh viễn (cộng `ignoreSearch:true`) | Chỉ cache request cùng origin; API ngoài để đi thẳng ra mạng |
| `openCityForm()` tự gọi lại bằng `setTimeout` không giới hạn khi không tìm thấy ô nhập | **Treo app.** Bấm "+ Thêm nơi" lúc thời tiết đang chạy được → vẽ lại toàn màn ~17 lần/giây và ép `MAIN=3`, bấm tab khác bị kéo ngược về Thời tiết. Người dùng báo là *hai* lỗi, thật ra là *một* | Không bao giờ để một hàm tự gọi lại vô hạn để "chờ" DOM. Đặt thứ cần bấm **ngay cạnh nút bấm nó** — ô nhập giờ nằm trong chính `placesBoard()`. Nếu buộc phải thử lại thì **đếm số lần** |
| Điều kiện gọi lại mạng là "chưa có dữ liệu" | Gọi hỏng cũng là chưa có dữ liệu → gọi lại mãi | So bằng **khoá của danh sách** (`PWQ !== placesKey()`), không so bằng "rỗng hay chưa" |
| `PW` xếp theo chỉ số của `PLACES` nhưng lượt gọi cũ về sau lượt mới | Thẻ đọc nhầm nhiệt độ của nhau khi vừa thêm/xoá nơi | Đánh số lượt gọi (`PWSEQ`), lượt cũ về thì bỏ; xoá nơi thì cắt luôn ô `PW` tương ứng |
| Chốt kiểm thử viết xong không thử trên bản hỏng | Chốt "bảng nơi quan tâm" đầu tiên **báo xanh trên cả bản có lỗi** (vì chặn mạng khiến app rơi vào nhánh khác) | **Mọi chốt mới phải chạy thử trên bản hỏng và thấy nó báo đỏ**, rồi mới tin |

---

## 9. NGUỒN THAM CHIẾU

| Hệ | Nguồn |
|---|---|
| Âm lịch VN | Thuật toán Hồ Ngọc Đức |
| Lịch Tạng | `tibetan-date-calculator` (MIT) · Svante Janson, *Tibetan calendar mathematics* · Lotsawa House Phugpa Calculator |
| Tổ hợp nguyên tố / 28 yoga | kalacakra.org — Edward Henning, theo *Vimalaprabhā* |
| Ngày Düchen / thực hành | Drukpa Plouray, Central Tibetan Administration, Bộ Giáo dục Bhutan (Drukpa Teshi 4/6) |
| Pha trăng | Jean Meeus, *Astronomical Algorithms* ch.46–48 (đối chiếu pyephem) |
| 24 tiết khí | Kinh độ Mặt Trời — nguyên lý theo Hong Kong Observatory |
| Thời tiết / Triều | Open-Meteo (Forecast, Marine, Geocoding) — không cần key |
| Triều chính thức VN | NCHMF (đối chiếu, chưa tích hợp) |
| Kinh Pháp Cú | Bản dịch phổ biến tại VN, ghi số câu |
| Màu ngũ đại | Hệ cờ lungta / ngũ trí Như Lai |

---

## 10. TRẠNG THÁI FILE HIỆN TẠI

- 1 file HTML độc lập ~188 KB, đã nhúng sẵn thư viện Tạng (~7,7 KB minified).
- Song ngữ Việt/Anh đầy đủ, chuyển bằng nút VI/EN góc trên.
- Đã test: không lỗi JS, không "undefined", chạy đúng cả 2 ngôn ngữ, 5 tab + 6 mục Khám phá + 4 chế độ lịch + 4 chiều đổi ngày.
- Thư mục gốc: `index.html` · `sw.js` · `manifest.webmanifest` · 3 icon · `README.md` · `patch.py` · `verify.js` · `.github/workflows/guard.yml` (+ file spec này).

### Đang chạy ở hai nơi — biết để khỏi lẫn

| | |
|---|---|
| Trang chính | **https://duyet.online** |
| Bản sao | https://doanquocduyet.github.io/lich-da-chieu/ |

Tra DNS ngày 29/8/2026:

```
duyet.online            -> 216.198.79.1              (dải anycast của Vercel)
www.duyet.online        -> 216.198.79.65, 64.29.17.65
doanquocduyet.github.io -> 185.199.108-111.153       (dải của GitHub Pages)
```

`duyet.online` **không** phục vụ từ GitHub Pages, và repo cũng không có file `CNAME` —
nó nằm trên Vercel. Nội dung khớp với bản build của repo này, nên nhiều khả năng là một
project Vercel nối thẳng vào repo, tự deploy mỗi khi `main` đổi. **Chưa xác nhận được** —
sandbox chặn truy cập cả hai tên miền nên không đối chiếu trực tiếp được.

Đáng kiểm một lần cho chắc: so **dấu build** (xem §11) ở cuối `duyet.online` với
`grep -o 'window.LDC_BUILD=[^;]*' index.html` trong repo. Trùng nghĩa là cùng một đường.

**Việc tiếp theo duy nhất: phát cho 10–20 người → đọc `getStats()` → quyết V3.**

---

## 11. CẬP NHẬT BẢN BUILD MỚI — GITHUB TỰ LO

Bản build sinh ra từ nguồn ngoài repo **luôn rơi mất 7 chỗ đã vá** (đã lặp ở V2.4 và V2.5).

**Không phải nhớ gì cả.** Cứ đưa bản build mới vào `index.html` bằng bất kỳ cách nào —
kéo thả trên web GitHub, `git push`, gì cũng được. Workflow `.github/workflows/guard.yml`
sẽ tự chạy và làm hết:

```
index.html đổi
   └─ patch.py vá lại chỗ nào thiếu, bump ldc-vNN trong sw.js
   └─ commit + push bản vá ngược lại main
   └─ gọi Pages build lại (push bằng GITHUB_TOKEN không tự kích hoạt Pages)
   └─ verify.js mở Chromium quét 24 màn hình, kiểm 4 nhóm điều kiện
   └─ patch.py --check soát lại mã nguồn
```

Bản build đủ 7 chỗ thì nó không commit gì, chỉ chạy kiểm tra. Bản build thiếu thì nó vá,
và trong tab Actions hiện dòng notice *"Bản build thiếu 7 chỗ vá — đã vá lại"*.

Hỏng ở đâu là workflow đỏ và ghi rõ hỏng mục nào.

### Đã diễn tập thật, không phải suy đoán

Commit `da4d62b` cố tình đẩy bản build **thiếu cả 7 chỗ** lên `main`. Kết quả đo được:

| | |
|---|---|
| Bot tự vá và tự đẩy | `e16c0fd` — tác giả `github-actions[bot]` |
| File bot vá ra | **trùng md5 tuyệt đối** với bản vá tay (`e2279692…`) |
| Cache | tự bump `ldc-v36` → `ldc-v37` |
| Pages | build lại và lên web |
| Tổng thời gian | **56 giây**, mọi bước xanh |

Hai điều học được từ lần chạy thật, khác với dự đoán ban đầu:

- **Pages VẪN tự build khi bot đẩy bằng `GITHUB_TOKEN`**, dù quy tắc chung của GitHub là
  push bằng token đó không kích hoạt workflow. Bước gọi API vẫn giữ làm lưới an toàn —
  bản trùng bị GitHub tự huỷ, không hại gì.
- `verify.js` lúc đầu **đậu oan 4/8 điều kiện**: nó dò chuỗi bằng `innerText.includes()`,
  mà "Hệ lịch" là tên tab 3 nên luôn hiện ở thanh tab, còn "Phugpa (Janson)" nằm sẵn
  trong dòng footer. Nay điều kiện "có" đọc đúng cặp nhãn/giá trị từ DOM, điều kiện "hết"
  soi text gộp của cả 24 màn. **Bài học: kiểm thử phải được thử bằng ca âm tính** —
  chạy nó trên bản hỏng đã biết, xem nó có thật sự báo hỏng không.

> ⚠️ Workflow cần **Settings › Actions › General › Workflow permissions = "Read and write permissions"**.
> Không bật thì bước commit đỏ với lỗi 403.

### Chạy tay ở máy (không bắt buộc)

```bash
python3 patch.py "index (18).html"   # vá bản build mới -> index.html
python3 patch.py index.html --check  # chỉ soát, không ghi gì
node verify.js                       # tự dựng server, không cần http-server
```

`patch.py` **chạy lại bao nhiêu lần cũng được**: chỗ nào đã vá thì bỏ qua, không ghi file,
không bump cache oan. Chỗ nào không nhận ra được ở cả hai dạng (chưa vá / đã vá) thì nó
**dừng hẳn, không vá gì**, và in ra vùng code quanh đó — nghĩa là bản build đã đổi cấu trúc,
**cập nhật `PATCHES` trong `patch.py`, tuyệt đối không sửa tay `index.html`** (sửa tay thì
lần build sau lại mất).

### 7 chỗ vá là gì

| # | Vá gì | Vì sao |
|---|---|---|
| 1 | Chặn ngày khuyết bằng `isSkippedDay` | Thư viện Tạng **không ném lỗi** với ngày chad mà vẫn trả về một ngày dương — ngày đó thật ra thuộc ngày Tạng trước. Không chặn là đổi ngày ra kết quả sai lặng lẽ |
| 2 | `tibYearName` trả về `tibYearShort` | Bỏ đuôi cấm "Hỏa Ngựa (dương)" |
| 3–4 | Bỏ chữ Phugpa khỏi nhãn, đẩy xuống dòng riêng | Màn chính không phô tên hệ lịch; chi tiết nằm ở panel |
| 5 | "Tính năm: Dương/Âm" | Không phải "Giới tính năm: Nam/Nữ" |
| 6 | EN "Brightness" | Không phải "Illumination" |
| 7 | Thêm dòng "Hệ lịch: Phugpa (Janson)" | Chỗ đặt tên hệ lịch sau khi gỡ khỏi nhãn |

### Dấu build — nhìn là biết trang đang chạy bản nào

Cuối trang có một dòng mờ, ví dụ `ldc-v45 · c51540ae`. Console cũng in ra, và có
`window.LDC_BUILD` với đúng chuỗi đó.

- Phần đầu là **tên cache** trong `sw.js`.
- Phần sau là **8 ký tự đầu md5 của chính `index.html`** sau khi gỡ dấu ra. Tính từ nội
  dung nên file không đổi thì dấu không đổi — `patch.py` chạy lại không sinh commit rác.

Đối chiếu: `grep -o 'window.LDC_BUILD=[^;]*' index.html` ở repo, so với dòng cuối trang
thật. Lệch nghĩa là trang phục vụ bản khác — hoặc service worker cache cũ (mở tab ẩn danh
để loại trừ), hoặc host lấy file từ nơi khác.

**Vì sao có dấu này.** Ngày 29/8/2026 tôi nhìn ảnh chụp `duyet.online`, thấy panel Tạng ghi
*"Tính chất năm: năm Dương"* trong khi bản local của tôi render *"Tính năm: Dương"*, rồi
kết luận trang đang chạy một bản không có trong repo. **Sai.** Tôi quên `git fetch` — chuỗi
đó vào repo từ commit `3753559` (V2.6), local của tôi dừng ở `bafaa0e`. Suy luận từ chênh
lệch nội dung mà không chắc mình đang cầm bản mới nhất thì dẫn tới kết luận sai. Dấu build
cắt đứt chuyện đó: hai chuỗi bằng nhau hay không, không phải suy đoán.

### `verify.js` kiểm những gì

Timezone `Asia/Ho_Chi_Minh`, quét 24 màn hình (2 ngôn ngữ × 12 màn:
`goCal(0..2)` + `goExp(0..5)` + `setMain(0,3,4)`):

1. **Không `pageerror`, không console error** ở màn nào.
2. **`document.body.innerText` không chứa "undefined"** ở màn nào.
3. Sau `setLang('vi')`: `tibYearName(tibetan(new Date(2026,7,17,12)))` phải ra đúng **`"Hỏa Ngựa"`**.
4. **11 điều kiện chữ nghĩa nhìn thấy trên màn hình thật** — dòng "Hệ lịch: Phugpa (Janson)"
   ở cả VI/EN, tính chất năm là Dương/Âm, hết "Lịch Tạng · Phugpa", hết "Giới tính năm",
   tên năm không kèm "(dương)", EN "Brightness", footer không in HTML thô, không có
   "1 days", và không còn emoji màu trên giao diện.
5. **Dấu build có mặt và khớp tên cache** trong `sw.js`.

Mục 4 quan trọng hơn `--check` của `patch.py`: nó soi **kết quả render**, nên bắt được cả
trường hợp chuỗi có trong mã nguồn mà không hiện ra màn hình.

Deploy xong nhớ: máy đã cài giữ service worker cũ, **lần load đầu vẫn ra bản cũ**,
tới lần thứ hai mới thấy bản mới. Muốn thấy ngay thì mở tab ẩn danh hoặc Ctrl+Shift+R.

### Việc vẫn nên làm ở gốc

Workflow chữa được triệu chứng một cách đáng tin, nhưng 7 chỗ này lẽ ra phải nằm trong
**chính nguồn sinh ra bản build**. Khi nào xử được gốc, workflow sẽ chạy mà không commit
gì nữa — lúc đó bỏ `patch.py` đi được, còn `verify.js` thì giữ.

---

## 12. KHẢO SÁT UX 8 LĂNG KÍNH (V2.8) — BẢN BUILD SAU PHẢI KẾ THỪA

Khảo sát bằng 8 agent độc lập trên bản đang chạy (mỗi lăng kính tự chụp màn hình,
tự đo bằng Chromium): người mới 10 giây · ergonomics ngón tay · phân cấp thị giác ·
chữ nghĩa song ngữ · hiệu năng đo thật · lý-do-quay-lại · tiếp cận WCAG · trạng thái
biên. Thu 53 phát hiện, đã tự phản biện từng cái trước khi sửa.

### 12.1 Đã sửa trong V2.8 — bản build sau KHÔNG ĐƯỢC làm mất lại

Nhóm lỗi thật (đều đã kiểm chứng bằng trình duyệt trước/sau):

1. **Footer in HTML thô** — `footNote` gán bằng `textContent` trong khi chuỗi chứa
   `<span class='ablink'>` → mọi màn hiện mã thô, link "Về ứng dụng" chết. Phải gán
   `innerHTML`. (verify.js đã có bẫy.)
2. **EN thiếu `subExp[6]`** → panel Hoàng đạo Tây hiện "undefined" ở bản EN.
3. **`moonRise/moonSet` định nghĩa 2 lần** trong cùng object i18n — khóa sau đè khóa
   trước, hàng "Đêm nay" ra chữ sai. Khóa chữ thường tách riêng: `mrLow/msLow`.
4. **Chữ đậm vô hình trên skin tối** — `.row .v b` ghim màu `#222`; 3 skin tối phải
   override (`#F5F2E8`).
5. **"Mùng" dùng cho ngày âm >10** ở ô Ngày mai + ảnh chia sẻ. Quy tắc: 1–10 = "Mùng",
   11+ = "Ngày". (Đầu trang đã đúng từ trước, hai chỗ này sót.)
6. **Đúng ngày rằm tự mâu thuẫn**: tiêu đề "Trăng tròn · 100%" nhưng ghi chú "Trăng
   đang khuyết". Chọn ghi chú theo độ sáng trước (`>0.985` = câu trăng tròn, `<0.015`
   = câu không trăng), rồi mới xét đang lớn/khuyết.
7. **Dòng của ngày bỏ qua lễ lớn** — đúng hôm Tết Trung Thu lại ra câu trăng. Ưu tiên 0
   (trước cả ngày thực hành Tạng): lễ trong `cult`/`buddhaEv` → "Hôm nay là {tên lễ} —
   ngày d/m âm lịch."
8. **CTA "Xem 24 tiết khí →" dẫn tới màn không có 24 tiết khí** — đã thêm bảng 24 tiết
   khí + ngày bắt đầu (tính từ engine, tô đậm tiết hiện tại) vào cuối panel thiên văn.
9. **Hub Lịch Tạng nền xanh đen** — sinh đôi với hub Mặt trăng, trái §3.3. Đã về đỏ tía
   tăng bào `#8C2A20→#571714`, chữ phụ vàng kim `#E8C98B/#F0D9A8`.
10. **Chuỗi bật vị trí dùng nguyên văn câu §2.9 cấm** ("Bấm để bật…"), màn Thủy triều
    mượn nguyên nút Thời tiết → dùng "Bật vị trí để xem trời hôm nay nơi bạn ở" /
    `tideAsk` riêng. `wxPrivacy` bỏ "máy chủ riêng"/"Open-Meteo" khỏi màn chính (§0.6).
11. **EN**: tab "Calendars" đứng cạnh "Calendar" → "Explore" · "Sexagenary/Perpetual" →
    "Stems & Branches"/"Almanac" · "5 into the sign°" → "5° into the sign" · nhãn
    "Solar longitude" (từ cấm §0) → "Sun's position" · "In 1 days" → "1 day" ·
    "Month 9/2026" → "Sep 2026" · "My memorials" → "My dates" · "Year gender" →
    "Polarity" · ca dao EN bỏ ngoặc kép (là lời tả, không phải trích) · CTA thêm động từ.
12. **Vùng chạm**: ⓘ giải nghĩa 17×15px → ~40px (padding+margin âm) · nút VI/EN 33px →
    ≥39px · hàng chip chế độ tab Lịch `flex-wrap` để chip thứ 5 "Tra ngày" không trôi
    khỏi mép phải (trước đó cuộn ngang nhưng giấu thanh cuộn — không ai biết mà cuộn).
13. **Hai tiêu đề gần trùng** "HÔM NAY CÓ GÌ ĐẶC BIỆT"/"HÔM NAY CÓ GÌ" cạnh nhau →
    tiêu đề hub thành "NĂM LĂNG KÍNH HÔM NAY" (bám tagline).
14. **sw.js**: `cache.addAll` đi vòng HTTP cache (`{cache:'reload'}`) — không thì trên
    GitHub Pages (max-age=600) SW có thể cache đúng bản cũ vừa bị thay.

### 12.2 Cho bản build sau (chưa làm — cần thiết kế, không chỉ vá)

- **Vuốt ngang đổi ngày/tháng** — app lịch phone-first mà mọi điều hướng đều phải bấm nút.
- **Xem lại cặp tab "Lịch"/"Hệ lịch"** — người mới không đoán được khác nhau gì.
- **Ô đếm ngược sự kiện**: lễ có tên (Trung Thu) phải thắng mốc thường (Mùng Một) dù xa hơn.
- **Ô "Ngày mai" kết bằng phủ định** "Không có ngày lễ lớn" 13/14 ngày — đổi thành chi
  tiết dương tính (trăng, tiết khí kế, giờ hoàng đạo đầu tiên của mai…).
- **Nới corpus Dòng của ngày**: thiên văn 4 câu → 12+ (theo tuổi trăng), Pháp Cú 3 câu
  → 10+ (nhóm đi chùa gặp lại đúng 3 câu sau ~6 tuần).
- **Ghi chú giỗ/sinh nhật đang giấu trong `<details>`** — hook giữ chân số 1 của lịch
  Việt, đáng có mặt ở màn Hôm nay khi sắp tới ngày.
- **Toast "có bản mới — chạm để tải lại"** khi SW đổi phiên bản (hiện phải mở app 2 lần).
- **Skeleton màn Hôm nay** — mạng chậm hiện nền trống ~1,1s trước khi JS vẽ.
- Lưới tháng: hệ chấm màu (sự kiện/hoàng đạo/…) đang 6 loại gần trùng — cần chú giải
  hoặc gom loại; "Vũ trụ" và "Hoàng đạo Tây" trong menu Hệ lịch gần như sinh đôi;
  thang bo góc 12/14/16/20/22px cần chốt một thang.
- EN chi tiết ngày còn trộn Hán-Việt chưa dịch ("Day deity: Tư Mệnh", "Mansion: Ngưu").

Đo được nhưng KHÔNG cần sửa: `renderScreen()` vẽ lại toàn bộ innerHTML — đo thật không
giật, đừng chuyển sang virtual DOM (phát hiện của lăng kính hiệu năng, giữ làm bằng chứng
chống tối ưu thừa).

### 12.3 Để dành V3 (khóa theo §7)

Widget/notification, export calendar, React Native, tích hợp NCHMF, chọn giờ chi tiết —
tất cả vẫn chờ số liệu người dùng thật như §7 đã chốt.

---

## 13. KHÓA THIẾT KẾ (V3.1) — DỪNG TỐI ƯU, CHỜ NGƯỜI THẬT

### 13.1 Trạng thái: khóa

Bản V3.1 đã đi hết những gì **suy ra được** mà không cần người dùng:

| Cách tối ưu | Trạng thái |
|---|---|
| Bằng dữ liệu (đo mực, đo khung, đo 16px) | đã làm |
| Bằng logic (spec §0, quy ước ngôn ngữ) | đã làm |
| Bằng hồi quy (`patch.py`, `verify.js`, `guard`) | đã làm |
| **Bằng cảm giác người thật** | **chưa có dữ liệu** |

**Icon tab: KHÓA.** Cỡ quang học lệch 1,2px ở 16px, đã kiểm bằng ảnh phóng
từng điểm ảnh, hết emoji màu.

**Icon app: KHÓA** (phương án C — ba vòng mềm, không vòng ôm ngoài).

**Không thêm tính năng mới** chỉ vì nghĩ "có thể hay hơn".

> ⛔ **Không sửa icon nữa chỉ vì nhìn 10 phút rồi thấy "hình như vẫn đẹp hơn
> được".** Đó là bẫy perfectionism. Chỉ sửa khi có người thật lặp lại cùng một
> vấn đề — xem §13.3.

### 13.2 Cách test người thật (làm đúng, không thành một vòng phỏng đoán mới)

Đưa máy cho người dùng. **KHÔNG** giới thiệu "đây là app lịch đa chiều", không
giải thích Cosmic Calendar, không giải thích Lịch Tạng, không chỉ nút nào.

Chỉ nói đúng một câu:

> "Đây là một app mới. Anh/chị cứ dùng thử như bình thường."

Rồi **im lặng quan sát**. Ghi lại đúng 3 khoảnh khắc:

1. **5 giây đầu** — mắt họ nhìn đâu?
2. **Lần đầu họ tự bấm** — họ chọn gì?
3. **Sau ~2 phút** — câu đầu tiên họ nói là gì?

Sau đó hỏi đúng một câu:

> "Nếu app này ở trên điện thoại anh/chị, ngày mai anh/chị có mở lại không?
> Vì sao?"

Câu trả lời đó quan trọng hơn mọi điểm 9.x tự chấm.

**Ghi nguyên văn, không diễn giải.** "Nó rối" ≠ "người dùng thấy IA phức tạp".
Câu thứ hai là suy đoán của người ghi, không phải dữ liệu.

**Test trên máy CỦA HỌ, và cài vào màn hình chính.** App chạy trong tab Safari
khác hẳn app đã cài: có thanh địa chỉ, không toàn màn hình, không offline. Test
sai môi trường thì dữ liệu thu được cũng sai.

### 13.3 Cách đọc phản hồi — đừng sửa vội

Người thật nói **"Tôi không hiểu cái này"** → ĐỪNG sửa ngay. Hỏi tiếp:
> "Chỗ nào làm anh/chị không hiểu?"

Người thật nói **"Tôi không cần cái này"** → ĐỪNG xóa ngay. Hỏi tiếp:
> "Nếu bỏ nó đi, anh/chị có thấy app tốt hơn không?"

**Chỉ sửa khi nhiều người ĐỘC LẬP lặp lại cùng một vấn đề.** Một người nói một
lần là giai thoại, không phải dữ liệu. Ba người không quen nhau cùng vấp một
chỗ mới là tín hiệu.

### 13.4 Mức hoàn thiện — nói cho đúng

Bản này **không phải 10/10 tuyệt đối**. Nó là:

> **10/10 ở mức mà dữ liệu hiện có cho phép xác nhận.**

Phần còn lại không suy ra được bằng AI. Phải lấy từ hành vi thật.

---

## 14. MÀN THỜI TIẾT DỰNG LẠI (V3.5) — CÓ CHỦ Ý, ĐỪNG "DỌN GỌN" LẠI

§13 khoá thiết kế **icon tab và icon app**. Khoá đó vẫn còn hiệu lực.
Mục này là chuyện khác: chú Duyệt xem bản V3.4 rồi nói thẳng
*"Nhìn còn đơn giản quá chưa dễ chịu, chưa bắt mắt / Thiết kế và đồ hoạ
giống web chuyên này"* kèm ảnh app Thời tiết iOS. Đây là yêu cầu của người
dùng, không phải AI tự thấy "hình như đẹp hơn được".

### 14.1 Những thứ bản build sau KHÔNG ĐƯỢC làm mất

| Thứ | Vì sao có |
|---|---|
| **Nền trời đổi theo dữ liệu** (`skyClass`) — nắng / nhiều mây / mưa / bão / tuyết / đêm | Liếc một cái là biết trời thế nào trước khi đọc chữ nào. Không phải trang trí |
| **Thanh nhiệt độ 7 ngày** đặt trong khoảng min–max của cả tuần, chấm trắng = nhiệt độ hiện tại ở hàng Hôm nay | Đây là đồ hoạ duy nhất cho thấy *quan hệ giữa các ngày*. Bảng số suông không làm được |
| **Vòng gió, cung mặt trời, thang UV** vẽ bằng SVG, đầu tròn, không mũi nhọn | §8: chú Duyệt không chịu được góc nhọn |
| **Thẻ kính KHÔNG dùng `backdrop-filter`** | Hơn mười thẻ mờ nền cùng lúc là bắt đầu giật khi cuộn trên iPhone. Đặt trên nền chuyển màu mượt thì nhìn không khác gì |
| Icon từng ô đúng nghĩa: nhiệt kế / gió / hoàng hôn / giọt nước / đồng hồ | Bản nháp đầu dùng icon **sét** cho ô Gió và **mưa phùn** cho ô Độ ẩm — sai nghĩa còn tệ hơn không có icon |
| Không ô nào lặp lại nội dung ô bên cạnh | Bản nháp đầu: ô UV ghi giờ mọc/lặn y hệt ô Mặt trời lặn ngay cạnh; ô Độ ẩm ghi lại "cảm giác như" của ô Cảm nhận |

### 14.2 Ba chỗ sửa cho mượt tay — đo được, không phải cảm giác

Đo ở CPU giả lập chậm 4× (gần với điện thoại):

- `content-visibility:auto` cho thẻ → bấm đổi tab, khung tệ nhất **117ms → 67ms**
- `.screen` mờ dần **250ms → 160ms**
- `touch-action:manipulation` → bỏ độ trễ chạm 300ms của iOS

**Bẫy đi kèm:** `content-visibility:auto` khiến `innerText` **bỏ qua** phần
chưa nhìn thấy — mọi mục "hết chữ X" trong `verify.js` sẽ đậu oan. `verify.js`
giờ chèn `*{content-visibility:visible !important}` trước khi quét chữ.
Bản build sau đổi chỗ này thì phải giữ nguyên dòng đó.

### 14.3 Chưa kiểm được ở đây

Máy dựng bản này không có SF Pro Rounded và không phải Safari. Dáng số bo
tròn, độ mượt thật khi cuộn, và `backdrop-filter` của thanh dưới cùng
**chỉ iPhone mới nói được**.

---

## 15. RÀ TOÀN SITE (V3.7) — ĐỐI CHIẾU TỪNG YÊU CẦU

Chú Duyệt: *"rà toàn site theo những gì tôi chỉnh sửa xem có cái nào chưa làm không"*.
Dưới đây là kết quả rà bằng máy, không phải bằng mắt.

### 15.1 "Bo tròn hết" — một luật, không vá từng hình

Vá từng hình thì lần sau lại sót. Nên có **một luật CSS cho cả app**:

```css
svg,svg *{stroke-linecap:round;stroke-linejoin:round}
```

Luật CSS đè lên cả thuộc tính viết thẳng trong thẻ SVG, nên **mọi nét trong app —
kể cả hoa văn nền và bản build sau — đều có đầu tròn và góc nối tròn**, không cần
nhớ khai báo.

Ngoài ra 16 ký tự nhọn do **font hệ điều hành** vẽ đã thay bằng SVG một nét:
`‹ › ▾ → ↗ ⬇ ⬆ ✕ ↩ ⌄ ⌃`. Đây cùng một vấn đề với emoji — *"quyền kiểm soát giao
diện bị trao cho hệ điều hành"*: mỗi máy vẽ một kiểu, không đổi được nét, không
đổi được màu theo skin.

Còn lại **có chủ ý giữ**:
- `×` trong câu `"365 × 24 × 3600"` — phép nhân trong câu văn, không phải icon.
- `♍︎` và 11 dấu hoàng đạo khác — đã kèm sẵn `U+FE0E` ép về dạng chữ đen, không
  thành emoji màu. Thay 12 dấu này bằng SVG là việc riêng, chưa ai yêu cầu.
- Dãy núi ở panel Tạng: vẫn là núi, nhưng đỉnh đã mài tròn bằng
  `stroke-linejoin:round` trên chính đường viền của hình đặc.

### 15.2 Font số — ranh giới đã chọn

`--fnum` (ui-rounded → SF Pro Rounded trên máy Apple) áp cho **ô là con số**:
số ngày, nhiệt độ, giờ, phần trăm, năm, thanh Can Chi, bảng 7 ngày, dải theo giờ…

**Không** áp cho **câu văn có lẫn số** (`"Dự báo có mưa vào khoảng 22:00"`,
`"Nén 13,8 tỷ năm vào một năm"`). Tròn cả chữ lẫn số là đổi font toàn app —
đó là quyết định khác, chưa ai yêu cầu. Nếu chú muốn cả app tròn thì nói một câu.

### 15.3 Hai chốt mới trong `verify.js`

- **Mục 7 — bo tròn:** soi mọi nút và nhãn bấm được trên **từng màn**, cộng với
  mọi nét SVG. Chạy thử trên bản cũ: báo đỏ **25 chỗ** — và tìm ra một chỗ tôi
  đã bỏ sót khi sửa tay (nút `⬆ Nhập bản sao`).
- Lần đầu viết chốt này tôi chỉ chạy **một lần ở cuối** → nó soi đúng một màn
  cuối cùng và **báo xanh trên cả bản còn đầy mũi tên**. Đây là lần thứ hai mắc
  đúng lỗi đó trong dự án. Quy tắc: **chốt nào chưa thấy nó báo đỏ trên bản
  hỏng thì chưa tính là chốt.**

### 15.4 Việc còn treo, cần người thật

- **duyet.online** — nằm trên Vercel, chưa xác nhận được có nối vào repo này
  không. Sandbox chặn cả hai tên miền. Cách kiểm: so dấu build ở cuối trang.
- **Dáng số bo tròn thật** — máy dựng bản này không có SF Pro Rounded.
- **Độ mượt thật khi cuộn** trên Safari iOS.

---

## 16. HOÀNG ĐẠO TÂY — VÌ SAO GIỮ LẠI (V3.8)

Chú Duyệt: *"Mục hoàng đạo Tây không liên quan gì tới ngày giờ và hệ lịch. Nếu
nghiên cứu sâu có nhiều nội dung liên quan đến lịch thì làm và chỉnh sửa cho hữu
ích, không thì bỏ."*

Nhận xét đúng với **bản cũ**: nó chỉ ghi tên cung và khoảng ngày, không nối vào
đâu cả. Nhưng đào sâu thì nó dính rất chặt — chặt hơn mọi mục khác trong app.

### 16.1 Mối liên hệ, đã kiểm bằng số

Kinh độ Mặt Trời là **một** con số. Phương Tây cắt vòng đó thành 12 cung × 30°.
Phương Đông cắt **đúng vòng đó** thành 24 tiết khí × 15°. Nên:

| cung | độ | tiết khí mở cung = **trung khí** | tiết thứ hai |
|---|---|---|---|
| Bạch Dương | 0° | **Xuân phân** | Thanh minh |
| Cự Giải | 90° | **Hạ chí** | Tiểu thử |
| Xử Nữ | 150° | **Xử thử** | Bạch lộ |
| Thiên Bình | 180° | **Thu phân** | Hàn lộ |
| Ma Kết | 270° | **Đông chí** | Tiểu hàn |

12 mốc "Mặt Trời vào cung mới" **chính là** 12 trung khí (中氣). 12 tiết còn lại
là tiết khí thường (節氣).

Và quy tắc đặt tháng nhuận của lịch Việt Nam — *tháng âm nào không chứa trung khí
thì là tháng nhuận* — đọc lại bằng chữ hoàng đạo là: **tháng âm nào Mặt Trời
không bước sang cung mới thì là tháng nhuận.**

**Đã kiểm chứng**, không phải nói suông: so quy tắc này với tháng nhuận mà
`solarToLunar` (Hồ Ngọc Đức) tự tính ra, trên 5 mốc gồm 2 tháng nhuận thật
(tháng 6 nhuận 2025, tháng 2 nhuận 2023) — **khớp 5/5**.

### 16.2 Màn mới có gì

1. Cung, ký hiệu, kinh độ Mặt Trời, đi được bao nhiêu độ, nguyên tố.
2. **Vòng tròn chung**: 12 vạch dài = mốc vào cung = trung khí; 12 vạch ngắn =
   tiết khí thường; chấm vàng = Mặt Trời hôm nay.
3. Ngày vào cung này (kèm tên trung khí) · ngày sang cung sau · hai tiết khí
   trong cung.
4. **Ô "Chỗ nó dính vào âm lịch Việt Nam"**: tính sống tháng âm đang xem, tìm
   trong tháng đó có mốc vào cung nào không, và kết luận nhuận / không nhuận.
5. Vẫn giữ dòng: đây là dữ kiện thiên văn, app không suy ra vận mệnh.

### 16.3 Lỗi chuyển tab đi kèm

`SUBEXP` dùng chung cho tab **Hệ lịch** và tab **Thời tiết**, mà `setMain` lại
giữ `EXPOPEN` khi nhảy giữa hai tab đó → đang mở panel Tạng mà bấm Thời tiết thì
tab sáng lên nhưng **màn vẫn vẽ panel Tạng**. Sửa bằng bảng `EXP_TAB` (panel nào
thuộc tab nào) + chặn lớp hai ngay chỗ vẽ trong `hubScreen`.
`goExp()` cũng luôn gọi `setMain(2)`, nên bấm hub Thời tiết ở màn Hôm nay thì
sáng nhầm tab Hệ lịch — đã sửa.

`verify.js` mục 8 duyệt đủ **35 cặp panel × tab**. Chạy trên bản cũ: báo đỏ đúng
7 trường hợp.
