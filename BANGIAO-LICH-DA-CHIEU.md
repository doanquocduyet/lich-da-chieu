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

---

## 17. LỖI NẶNG NHẤT CỦA BẢN GIAO NÀY: NGƯỜI DÙNG LUÔN CHẬM MỘT BẢN (V3.9)

Chú Duyệt báo lỗi chuyển tab **vẫn chưa được** ngay sau khi tôi đã sửa và đẩy
lên. Tôi thử lại bằng chạm thật trên iPhone giả lập: **35/35 đúng**. Nghĩa là
code đã đúng — máy chú đang chạy bản khác.

### 17.1 Nguyên nhân, đã dựng lại được

`sw.js` lấy **cache trước** cho cả trang chính. Nên:

1. Mở app lần N → đọc `index.html` **từ cache cũ**.
2. Service worker mới tải bản mới về **ở nền**, `skipWaiting`, `claim`.
3. Nhưng trang đang hiển thị vẫn là bản cũ. Phải đến **lần mở N+1** mới thấy.

Thử nghiệm 3 lần mở liên tiếp, deploy xen giữa lần 1 và 2:

```
lần mở 1                   thấy: ldc-v50
→ deploy bản mới
lần mở 2 (ngay sau deploy) thấy: ldc-v50   ← vẫn bản cũ
lần mở 3                   thấy: BẢN-MỚI
```

**Mọi thứ sửa xong deploy xong, chú mở ra vẫn thấy y nguyên lỗi cũ.** Đây giải
thích phần lớn vòng lặp "cháu sửa rồi / chú bảo chưa được" của cả bản giao này.

### 17.2 Cách sửa

- `sw.js`: trang chính chuyển sang **lấy mạng trước**, cache chỉ là lưới đỡ.
  Chờ tối đa **2 giây**; quá thì lấy cache ra dùng ngay và vẫn ghi bản mới vào
  cache cho lần sau. `navigator.onLine === false` thì bỏ qua mạng luôn.
  Icon/manifest vẫn lấy cache trước (đổi rất ít).
- `index.html`: nếu bản mới cài xong lúc trang **đang mở**, hiện một dòng
  *"Đã có bản mới — Tải lại"*. Không tự nạp lại giữa chừng.
- Mỗi lần app từ nền quay lại, gọi `reg.update()`.

Kiểm lại: **thấy bản mới ngay lần mở kế tiếp**. Và vẫn mở được khi **ngắt mạng
hoàn toàn**.

> Chưa kiểm được ở đây: đường tắt `navigator.onLine === false`. Trình duyệt giả
> lập không báo trạng thái đó xuống service worker, nên lúc mất mạng nó vẫn chờ
> hết 2 giây. Trên máy thật (chế độ máy bay) thì phải nhanh hơn.

## 18. DỌN CODE DƯ THỪA — CÓ CHỨNG MINH

Chú Duyệt: *"rà kỹ chậm chắc tất cả bộ code, kiểm tra dư thừa, chồng chéo nhau"*.

| việc | kết quả |
|---|---|
| Lớp CSS chết (không xuất hiện ở đâu ngoài khối CSS) | xoá **70 selector** / 32 lớp |
| Cùng selector khai báo lại cùng thuộc tính (cái sau đè cái trước) | gộp **145 khai báo** |
| Chuỗi ngôn ngữ chết (`legendHtml`, chỉ VI có, giá trị là số `1`) | xoá |
| Hàm không ai gọi | **không có** |
| Chuỗi dùng mà chưa định nghĩa | **không có** |
| VI/EN lệch khoá | **không còn** |

**Cỡ file: 244 KB → 237 KB.**

### 18.1 Cách chứng minh không hỏng gì

Chụp "dấu vân tay" 23 thuộc tính CSS đã tính của **11.994 phần tử** trên **26
trạng thái màn hình** (2 ngôn ngữ × 5 tab × 4 chế độ lịch × 7 panel × chế độ
sửa), trước và sau khi dọn. Kết quả: **0 phần tử đổi kiểu dáng.**

### 18.2 Một chỗ dư thừa CỐ Ý GIỮ

`sunLong()` (radian, cho thuật toán âm lịch Hồ Ngọc Đức) và `sunLongDeg()` (độ,
cho 24 tiết khí + hoàng đạo) chép cùng một công thức Meeus.

Tôi đã thử gộp và kiểm trên **73.414 ngày (1900–2100)**: `getSunLong()` ra
**giống hệt, 0 ngày lệch**. Nhưng sai số còn **1,26e-13 radian**, không phải 0.
`getSunLong()` làm tròn con số đó xuống bội số của 30°, và nó quyết định **ranh
giới tháng âm và vị trí tháng nhuận**.

**Đổi 5 dòng lấy một sai số khác 0 trong đoạn code quan trọng nhất của app là đổi
lỗ.** Đã ghi chú ngay trên hàm để bản sau không "dọn gọn" nhầm.

---

## 19. PHẬT & TẠNG — HAI MÀN CỦA NGƯỜI DÙNG CHÍNH (V4.0)

Chú Duyệt: *"phần lịch Tạng và lịch Phật tôi đặc biệt đưa vào trọng tâm, vì đó
là đối tượng khách hàng chính."*

### 19.1 Chẩn đoán: app trả lời sai câu hỏi

| màn | app **đang** trả lời | người ta **thật sự** hỏi |
|---|---|---|
| Phật giáo | "Phật lịch 2570" (số to nhất màn) | **"Hôm nay có phải ngày chay không?"** |
| Lịch Tạng | "Ngày 17" | **"Hôm nay là ngày thực hành gì? Kỳ tới bao giờ?"** |

**Ngày ăn chay hoàn toàn không có trong app.** Đây là câu hỏi hằng ngày của Phật
tử Việt, và là lỗ hổng lớn nhất của bản giao này.

### 19.2 Lịch Phật — dựng lại

1. **Đầu đề là tên ngày người ta thật sự gọi**: "Đại lễ Vu Lan", "Rằm",
   "Mùng Một" — không phải "Ngày 15".
2. **Ô ăn chay ngay dưới đầu đề**: *Hôm nay là ngày chay* / *không phải*, kèm
   *ngày chay tới · Ngày 23 · còn 5 ngày*.
3. **Người dùng chọn lối giữ chay của mình** (lưu trên máy):

   | lối | ngày âm lịch |
   |---|---|
   | Nhị trai | 1, 15 |
   | Tứ trai | 1, 14, 15, 30 |
   | Lục trai | 8, 14, 15, 23, 29, 30 |
   | Thập trai | 1, 8, 14, 15, 18, 23, 24, 28, 29, 30 |
   | Chay trường | mọi ngày |

   **Tháng thiếu (29 ngày): ngày 30 giữ vào ngày 29** — đã xử lý, và app nói rõ.
4. **Lưới ngày trong tháng âm** — nhìn một cái thấy cả nhịp giữ chay của tháng.
5. Vía & lễ sắp tới (kèm ngày âm), rồi Phật lịch + câu kinh xuống dưới cùng.

Câu chữ: *"Chọn lối của bạn, app chỉ nhắc ngày — không xếp loại ai giữ nhiều hay
ít."* Không được để app trở thành cái thước đo đạo hạnh.

### 19.3 Lịch Tạng — dựng lại

1. **Đầu đề phải mang tin.** Ngày thực hành → tên ngày là đầu đề
   ("Lhabab Düchen", "Ngày Guru Rinpoche"). Ngày thường → số ngày Tạng là đầu
   đề. **Không bao giờ để dòng chữ to nhất ghi "không có gì đặc biệt".**
2. **Düchen** đổi nền đậm hơn + ô vàng: *"công đức của mọi việc lành trong ngày
   này được nhân lên gấp bội"*.
3. **"Kỳ tới · Ngày Dakini · còn 7 ngày"** — người tu hỏi câu này, không hỏi
   "hôm nay là ngày thứ mấy của tháng Tạng".
4. Ngày trùng/khuyết (lhag/chad) nằm ngay trong thẻ đầu, không phải cuối trang.
5. Năm & hệ lịch, rồi tổ hợp nguyên tố (yoga) — xuống dưới, là tra cứu.

### 19.4 `patch.py` mốc số 7 đã đổi

Panel Tạng chuyển từ template literal sang nối chuỗi, nên mốc cũ của chỗ vá số 7
không còn khớp — `patch.py` **dừng đúng như thiết kế** thay vì đoán bừa. Đã cập
nhật mốc trong `patch.py`, **không sửa tay `index.html`** (§8).

---

## 20. BỐN VIỆC CUỐI CỦA HAI HUB CHÍNH (V4.1)

Bốn việc này đến từ một bản nghiên cứu đối chiếu Drukpa Lunar Calendar và các
lịch âm Việt. Tôi đã đối chiếu từng điểm với code thật trước khi làm — phần
lớn phần **chẩn đoán** của bản đó mô tả app **trước V4.0**, nên chỉ bốn việc
dưới đây là khoảng trống có thật.

### 20.1 Mốc thời gian phải chạm được

Thấy *"Kỳ tới · Ngày Dakini · còn 7 ngày"* mà chạm vào không đi đâu là cụt.
Giờ chạm → cả app chuyển sang đúng ngày đó, vẫn ở nguyên màn đang xem.

Áp cho: **Kỳ tới** (Tạng) · **Ngày chay tới** (Phật) · **mọi dòng trong
"Ngày lễ sắp tới" và "Vía & lễ sắp tới"**. Mỗi mốc có mũi tên bo tròn để
người dùng biết nó dẫn đi đâu. Đã bấm thật đủ 6 loại mốc, tất cả nhảy đúng ngày.

### 20.2 Dải "hôm qua · hôm nay · ngày mai" cho lịch Tạng

Với lịch âm/Tạng, biết *"tôi đang ở đâu trong tháng"* quan trọng không kém biết
*"hôm nay là ngày mấy"*. Ba ô, số ngày Tạng, chấm vàng nếu là ngày thực hành,
chạm để đi.

### 20.3 "Tra ngày này sang lịch khác"

App **đã có** bộ chuyển đổi 4 chiều (kể cả Dương↔Tạng) ở tab Lịch. Vấn đề là
người dùng phải tự đi tìm. Giờ có một nút ngay trong hub, và **`cvInputs()` vốn
đọc thẳng `VIEW`** nên nó tự mang theo ngày đang xem — không bắt người dùng gõ
lại thứ app vừa biết.

### 20.4 Gập dữ liệu tra cứu vào "Chi tiết"

Thẻ "Tổ hợp nguyên tố" cao **838px** — khối lớn nhất màn Tạng, mà là tra cứu.
Giờ nó cùng "Năm · Rabjung · chu kỳ" nằm trong `<details>` gập sẵn. Người mới
không ngợp, người chuyên sâu không mất gì.

### 20.5 Màu: hạ độ bão hoà da Tạng một bậc

`#7E251C → #753A34`. Vẫn là đỏ tía Tạng, bớt "lửa" để đọc đoạn dài đỡ mỏi.
**Giữ nguyên hệ da theo từng hệ lịch** — đó là nét riêng của app, không đổi
sang accent-only.

Và một luật: **màu không được thay chữ.** Ngày Düchen phải có nhãn chữ
"✦ Ngày đặc biệt", không chỉ đổi nền rồi bắt người dùng tự đoán.

### 20.6 Ba việc CỐ Ý KHÔNG LÀM

| đề xuất | vì sao không |
|---|---|
| **Ảnh/thangka có nguồn cho ngày lớn** | App là **một file chạy offline**. Một ảnh tử tế 150–300 KB; thêm cho 4 Düchen + Losar + chục ngày vía là **nhân cỡ app lên 5–10 lần** và phá khả năng cài offline. Cộng nghĩa vụ bản quyền. Và ảnh thiêng gán sai ngày là xúc phạm, không phải lỗi thẩm mỹ. App đã có **9 hoa văn SVG** ~1 KB mỗi cái — muốn "phần thưởng cho ngày đáng nhớ" thì làm hoa văn riêng cho từng Düchen |
| **Serif cho tiêu đề** | Đi ngược yêu cầu "bo tròn hết / font số dễ thương dễ gần". Và serif đủ dấu tiếng Việt không có trong font hệ thống Android → phải tải ~100 KB → phá offline-first |
| **Bỏ hẳn "ngày tốt/xấu"** | Đồng ý về *lập trường*, không đồng ý *xoá*. App **đã** viết mô tả chứ không phán: *"Trực, sao và xung là cách sách lịch xưa phân loại ngày — app thuật lại nguyên văn, không khuyên việc riêng của bạn."* Grep toàn file: **không một câu nào** bảo người dùng nên làm gì. Xoá nội dung này là mất một phần lớn khán giả lịch Việt |

### 20.7 Hai lỗi tự gây ra trong lúc làm, đã sửa

- Đặt lớp `.tl` cho ô ngày, **trùng với `.tl` của dòng thời gian Vũ trụ** — lớp
  đó có `::before` vẽ một vạch nối dọc, nên mỗi con số mọc thêm một gạch. Đổi
  thành `.tcl/.tcn/.tcd`. Đúng loại chồng chéo vừa dọn ở §18 — **lớp mới phải
  kiểm tên trước khi đặt.**
- Khi đổi tên hàng loạt, đổi nhầm cả `<span class="tn">` của dòng thời gian Vũ
  trụ. Phát hiện vì đếm được **2 chỗ** thay vì 1.

### 20.8 `verify.js` phải mở mục gập trước khi quét

`innerText` bỏ qua nội dung trong `<details>` đóng, nên ba mục chữ nghĩa của
spec báo đỏ oan. Yêu cầu của spec là **app CÓ thông tin đó**, không phải nó phải
luôn mở sẵn — và dòng ghi nguồn `drukNote` (kèm cảnh báo Drukpa/Bhutan theo
Tsurphu nên ngày có thể lệch) **vẫn luôn hiện**. Đã cho `verify.js` mở hết
`<details>` trước khi đọc. Cùng một bài học với `content-visibility` ở §18.

---

## 21. CHẠY 5 BÀI THỬ BẰNG MÁY — VÀ MỘT LỖ HỔNG ĐO ĐƯỢC (V4.2)

Bản nghiên cứu tiếp theo đề ra 5 bài thử người dùng và kết luận **đừng thêm UI
nữa, hãy đi test người thật**. Tôi đồng ý. Nhưng bốn trong năm bài đó **máy đo
được một phần** — và làm vậy thì không rơi vào bẫy "AI tự chấm AI".

### 21.1 Bài thử 4 — "ngày mà mọi thứ xảy ra cùng lúc"

Quét 400 ngày tìm ngày chồng chất nhất:

```
20/2/2027  Rằm + Rằm tháng Giêng + ngày chay + Chötrul Düchen
 6/2/2027  Mùng Một + Vía Di Lặc (Tết) + ngày chay + Ngày Phật Thích Ca
```

Rồi quét **cả năm** xem màn "Hôm nay" có trả lời câu hỏi của hai khách hàng
chính không:

| | trước V4.2 | sau |
|---|---|---|
| **118 ngày ăn chay** → mặt tiền nhắc | **0 ngày (0%)** | 118 (100%) khi đã chọn lối giữ chay |
| **72 ngày thực hành Tạng** → mặt tiền nhắc | 55 (76%) | **66 (92%)** |
| ngày im lặng hoàn toàn | 262 (72%) | 253 (69%) |

**Câu hỏi số một của khách hàng chính không hề có ở cửa trước.** Phải bấm
Hệ lịch → Phật giáo mới thấy. Đây không phải suy đoán — 0/118 là con số đếm được.

### 21.2 Lỗi thứ hai: danh sách chép tay bị lệch

Mục "điểm nhấn" ngày thực hành Tạng chép tay `[8,10,15,25,30]` — **thiếu ngày
29 (Hộ pháp)**, lệch với bảng dữ liệu thật `drukDays{8,10,15,25,29,30}`.
Đã đổi sang gọi thẳng `drukSpecialName()` nên hai chỗ không thể lệch nữa.
Đó là lý do con số nhảy 76% → 92%.

### 21.3 Cách sửa — và một quyết định về sự tôn trọng

Ngày ăn chay **không phải "tin đặc biệt"** để nhét vào ô điểm nhấn. Nó là việc
tu của riêng người đó. Nên:

> **Dòng ăn chay ở mặt tiền chỉ hiện khi người dùng đã TỰ CHỌN lối giữ chay.**

App không mặc định coi ai cũng giữ chay. Chưa chọn → mặt tiền im lặng đúng như
ngày thường. Đã chọn → mỗi sáng mở ra là thấy, và ngày không chay thì nó nói
luôn ngày chay tới còn mấy hôm.

Đo trên màn hình thật, 365 ngày:

| người dùng | kết quả |
|---|---|
| chưa chọn | mặt tiền **im lặng** — đúng |
| chọn Thập trai | 118/118 ngày đều nhắc |
| chọn Nhị trai | 24/24, ngày thường ghi *"Ngày chay tới · Mùng Một · còn 12 ngày"* |
| chọn Chay trường | *"Ngày nào cũng là ngày chay"*, không đếm ngược |

Dòng này đặt ngay dưới viên âm lịch, màu trầm, chạm được → sang hub Phật giáo.
**Không phá thứ bậc**: số ngày vẫn to nhất, dải Can Chi vẫn bậc hai.

### 21.4 Bài thử 5 thì máy chịu

*"Ba ngày sau, đưa máy và nói: mở app xem hôm nay là ngày gì."* Không có cách
nào giả lập. Đây là chỗ **phải có người thật**, và là việc đáng làm nhất bây giờ
— không phải sửa thêm giao diện.

Quy trình test đã ghi ở §13. `window.getStats()` trong Console đọc được số lần
mở từng tab, để chú đối chiếu với những gì người ta *nói*.

---

## 22. "XEM CHI TIẾT NGÀY" — TRANG LỊCH VẠN NIÊN ĐẦY ĐỦ (V4.3)

Chú Duyệt gửi ảnh một app lịch vạn niên phổ thông (nhiều quảng cáo) và nói:
*"Số đông xem lịch trang chủ sẽ thích và muốn xem những thông tin này. Nên thêm
một nút Xem chi tiết, trong đó có đầy đủ thông tin này."*

### 22.1 Phần lớn đã có sẵn, chỉ thiếu lối vào

Panel Can Chi (tab Lịch → Ngày) **đã tính sẵn**: 4 trụ can chi, nạp âm, trực
thần (hoàng đạo/hắc đạo), 12 trực, 28 tú (cát/hung), tuổi xung, 12 giờ hoàng
đạo. Cái thiếu là (a) hai mục phổ thông chưa có, và (b) **lối vào từ trang chủ**.

Đã thêm:
- **Nút "Xem chi tiết ngày"** ngay dưới dải Can Chi trên trang chủ →
  `MODE='day'; goCal(1)` — mang theo đúng ngày đang xem. (Lỗi lần đầu: quên
  đặt `MODE='day'` nên rơi vào màn Tháng.)
- **Giờ Lý Thuần Phong** (6 giờ: Đại An, Tốc Hỷ, Lưu Niên, Xích Khẩu, Tiểu Cát,
  Tuyệt Lộ). Công thức: `(tháng âm + ngày âm − 2 + giờ) mod 6`, khởi Đại An tại
  Tý.
- **Hướng xuất hành**: Hỷ thần + Tài thần theo can ngày (bảng Ngọc hạp thông
  thư bản phổ biến). **Không làm Hạc thần** — chu kỳ 60 ngày lang thang nhiều
  dị bản, không có nguồn kiểm được thì không ship (§8).
- **Dòng tiết khí** hiện tại + ngày sang tiết kế.

### 22.2 Kiểm chứng — ảnh của chú chính là bộ số đối chiếu

Ngày 31/8/2026 (19/7 âm, Đinh Sửu), so với ảnh lịch phổ thông:

- **12/12 giờ Lý Thuần Phong khớp** (Tý=Đại An … Hợi=Tuyệt Lộ)
- **Hỷ thần Nam ✓ · Tài thần Đông ✓**
- Khớp chéo phần có sẵn: **Minh Đường · ngày hoàng đạo ✓ · Trực Chấp ✓**

→ 14/14 + 2 đối chứng. Bộ số này ghi lại trong comment ngay trên công thức.

### 22.3 Giữ đúng lập trường câu chữ

Lời giải của 6 giờ viết MỘT dòng mô tả ("dễ cãi cọ, miệng tiếng"), không chép
đoạn văn phán dài của app phổ thông ("Nghiệp khó thành, cầu tài mờ mịt…").
Ghi chú dưới mỗi mục: *"App thuật lại nguyên văn cách sách xếp — không khuyên
việc riêng của bạn"*, và *"Riêng Tài thần mỗi sách một dị bản"*. Số đông có đủ
thông tin họ quen xem; app không biến thành thầy phán.

---

## 23. NGÀY ĐANG XEM LÀ STATE TRUNG TÂM (V4.4)

Bản chốt tiếp theo khẳng định đúng hướng V4.3 và thêm một nguyên tắc:
*"Hôm nay → Xem chi tiết → chi tiết của CHÍNH NGÀY ĐANG XEM. Nếu từ một mốc
Kỳ tới nhảy đến 6/9 → Xem chi tiết phải là 6/9."* Soi lại thì còn bốn khoảng
hở thật — và hai chỗ **app đang nói dối** khi xem ngày khác.

### 23.1 Đã thêm

1. **Dòng mồi ở mặt tiền**: `Hành Thủy · Trực Chấp · Sao Nguy` — nhỏ, mờ, ngay
   dưới dòng can chi. Ba giá trị này trùng khớp với ảnh app phổ thông (Giản Hạ
   **Thủy**, Trực **Chấp**, sao **Nguy**) — thêm một lần đối chứng dữ liệu.
   Hành lấy từ **chữ cuối tên nạp âm tiếng Việt** ("Hải Trung Kim" → Kim),
   không lấy từ bản EN ("Gold in the Sea" → "Sea" là sai).
2. **Xung theo tháng** trong trang chi tiết (theo chi — phần kiểm chứng được;
   danh sách can-chi cụ thể của app phổ thông mỗi sách một dị bản, không ship).
3. **Nút "Xem chi tiết ngày" trong hub Phật và hub Tạng** — nhảy tới 6/9 bằng
   "Kỳ tới" rồi bấm là ra chi tiết của đúng 6/9. Đã kiểm cả chuỗi.
4. **Trang chi tiết ngày cũng hiện dòng chay** của chính ngày đang xem
   (vẫn theo luật opt-in §21).

### 23.2 Hai chỗ nói dối đã sửa

- Dải ba ô ở panel Tạng ghi **"Hôm qua · Hôm nay · Ngày mai"** kể cả khi đang
  xem 6/9 — "Hôm nay 17" mà không phải hôm nay. Giờ: xem ngày khác thì ghi
  **"Trước · Đang xem · Sau"**.
- Màn Phật ghi nhãn **"HÔM NAY"** cho mọi ngày được xem. Giờ: ngày khác thì ghi
  **"Ngày đang xem"**. Dòng chay cũng thôi nói "Hôm nay" khi xem ngày khác.

Quy tắc rút ra: **chữ "hôm nay" chỉ được xuất hiện khi `sameDay(VIEW, new Date())`.**

---

## 24. TÊN ĐẦY ĐỦ 28 SAO — VÀ RANH GIỚI DỮ LIỆU (V4.5)

Chú Duyệt gửi thêm ảnh trang chi tiết sao/trực của app phổ thông. Ảnh cho hai
bộ số đối chiếu mới, cả hai app đều **khớp tuyệt đối**:

- **Giờ hoàng đạo** ngày Đinh Sửu: Dần, Mão, Tỵ, Thân, Tuất, Hợi — app khớp 6/6.
- **Sao Nguy = "Nguy Nguyệt Yến, chủ trị ngày thứ 2"** — tức thất diệu của sao
  phải trùng thứ trong tuần. Quét 3650 ngày liên tiếp: **0 lệch**. Chu kỳ 28 sao
  của app chuẩn, nên ghép tên đầy đủ là an toàn.

### 24.1 Đã thêm

Dòng Sao trong trang chi tiết giờ ghi đủ ba thành phần truyền thống:
**Nguy Nguyệt Yến · tướng tinh chim én · chủ trị thứ hai** (khớp từng chữ với
lịch phổ thông). Tên = [tên sao] + [thất diệu, suy từ chỉ số mod 7] + [tướng
tinh theo bảng mục truyền thống Giác Mộc Giao … Chẩn Thủy Dẫn].

### 24.2 Thứ CỐ Ý CHƯA làm — cần chú cấp nguồn

Các trang **"Nên làm / Kiêng cử / Ngoại lệ"** của 12 trực và 28 sao, cùng bài
thơ cổ mỗi sao. Đây là **văn bản tra cứu tôn giáo–văn hóa**; tôi nhớ được đại ý
nhưng không dám chép từ trí nhớ — sai một dòng "kiêng cử" với đúng nhóm người
dùng này là hỏng lòng tin cả app (§8).

Cách làm đúng: **chú chụp đủ các trang** (12 trực + 28 sao) từ một nguồn chú
tin — sách lịch vạn niên giấy hoặc app chú đang đối chiếu — tôi sẽ nhập nguyên
văn, soát chính tả, và ghi rõ nguồn trong app. Đó là việc nhập liệu một buổi,
không phải việc thuật toán.

---

## 25. HAI CHỈNH THEO LỜI CHÚ (V4.6)

1. **"Xem chi tiết ngày" lên ô đầu tiên trang chủ** — viên thuốc màu điểm nhấn,
   ngay dưới dòng Hành · Trực · Sao, học theo vị trí của lịch phổ thông chú đối
   chiếu. Bỏ nút cũ dưới dải Can Chi (không để hai nút trùng việc).
2. **Lịch Tạng bỏ ô "Hôm qua"** — hôm nay là chính (ô to, số vàng), ngày mai là
   phụ (ô nhỏ, nhạt hơn, vẫn mang chấm ngày thực hành). Nhãn thật thà khi xem
   ngày khác vẫn giữ: "Đang xem · Sau".

---

## 26. NGÀY CHAY VỀ ĐÚNG NHÀ (V4.7)

Chú Duyệt: *"vụ ngày chay để lịch Phật, liên quan gì trang chủ."*

Đã gỡ dòng ăn chay khỏi **trang chủ** (thêm ở §21) và khỏi phần vạn niên của
trang chi tiết. Ngày chay giờ chỉ sống trong **Lịch Phật** — gồm hub Phật giáo
và phần Phật giáo bên trong trang "Xem chi tiết ngày" (trang đó xếp chồng cả
bốn phần vạn niên + can chi + Phật + Tạng, nên chay xuất hiện ở đó là đúng nhà).

Hàm `chayLine` + `chayĐãChọn` + CSS `.chayline` hết người dùng → **xoá hẳn**
(luật chống code chết §18). Bộ máy tính ngày chay giữ nguyên — hub Phật vẫn
đầy đủ: chọn lối giữ chay, trạng thái hôm nay, ngày chay tới, lưới tháng.

**Ghi chú cho bản sau:** phép đo §21 ("118 ngày chay, mặt tiền nhắc 0") từng là
lý do đưa chay lên trang chủ. Chủ app đã quyết khác — trang chủ là màn đa lăng
kính, chay là chuyện riêng của lăng kính Phật, cách đúng một cú chạm. **Đừng
"sửa lại" chuyện này như thể nó là lỗi.**

---

## 27. TRANG CHI TIẾT NGÀY MẶC BỘ KHUNG LỊCH PHỔ THÔNG (V4.8)

Chú Duyệt: *"vào mục chi tiết ngày nhìn màu sắc và thiết kế nghèo nàn chán quá,
bắt chước y hệt cái hình tôi gửi."*

### 27.1 Bộ khung học theo ảnh

- **Da riêng `sk-alm`**: nền xanh ngọc nhạt, thẻ trắng — đúng kiến trúc "mỗi thế
  giới một da" của app. Chỉ bật ở chế độ Ngày của tab Lịch, rời đi là trả lại.
- **Từng khối có tiêu đề XANH in hoa + icon tròn xám** (dùng lại bộ icon một nét).
- **Tốt xanh lá `#1E7A34` · xấu đỏ `#C03A2B` · nhãn xanh dương `#1D6FB8`.**
- Đầu trang: bảng **NGÀY · THÁNG · NĂM** (can chi, chữ xanh to) + hàng
  **Hành · Trực · Sao**.
- **GIỜ HOÀNG ĐẠO**: lưới 2 cột, vòng tròn tên chi + con giáp đậm + khung giờ.
- **GIỜ LÝ THUẦN PHONG**: tên giờ tô xanh lá/đỏ theo tốt xấu, kèm nghĩa một dòng.
- **HƯỚNG XUẤT HÀNH · THẬP NHỊ KIẾN TRỪ · NHỊ THẬP BÁT TÚ · TIẾT KHÍ**.
- **TUỔI XUNG THEO NGÀY / THÁNG**: hộp viền tên chi + con giáp, như ảnh.

`panelCanChi` cũ bị `almanac()` thay hẳn và đã xoá (hết người gọi — luật §18).

### 27.2 Khác ảnh ở đâu, vì sao

- **Không có mục "Sao tốt sao xấu" (bách kỵ) và "Nên làm/Kiêng cử"** — chưa có
  nguồn kiểm được (§8, §24.2). Có nguồn là ghép vào đúng bộ khung này.
- **Không icon con giáp vẽ hình** — vẽ 12 con thú một nét mà xấu thì tệ hơn
  không vẽ; thay bằng vòng tròn tên chi + tên con giáp chữ. Không quảng cáo.

---

## 28. HÀNH ĐỘNG TRƯỚC, GIẢI THÍCH SAU, NGUỒN CUỐI (V4.9)

Bản nhận định tiếp theo chấm "thứ tự thông tin 7.5, khả năng hành động 7" và
nói *"nút thắt không còn là CSS — là information hierarchy."* Lọc ra bốn ý làm
được ngay, đã làm:

1. **TÓM TẮT NGÀY** ngay dưới bảng đầu — app phổ thông đưa dữ liệu rồi bắt
   người dùng tự tổng hợp; ô này tổng hợp sẵn: *"ngày hắc đạo (Thiên Hình) ·
   sao Thất — cát tú · trực Phá"*, viền trái xanh/đỏ theo trực thần. Kèm dòng:
   *"Tóm từ các bảng bên dưới — sách lịch xếp, app thuật lại"* — *tổng hợp mô
   tả*, không phải lời khuyên.
2. **"Bây giờ · giờ Tý 23–01h · Hoàng đạo · Tốc Hỷ"** — người ta không cần đọc
   12 giờ nếu chỉ muốn biết *bây giờ* có tốt không. Chỉ hiện khi xem đúng hôm
   nay (luật §23: chữ "bây giờ/hôm nay" phải thật).
3. **Đảo thứ tự**: tóm tắt → giờ → xuất hành → tuổi xung (hành động) → kiến trừ
   → bát tú → tiết khí (giải thích) → **NGUỒN · PHƯƠNG PHÁP** (cuối).
4. **Mục Nguồn**: Hồ Ngọc Đức · Meeus · bảng sách lịch truyền thống · Ngọc hạp
   thông thư, kèm ghi chú đã đối chiếu mẫu 31/8/2026. Người ta có thể đem thông
   tin đi quyết việc thật — phải minh bạch nó đến từ đâu.

**Chưa làm, đúng chủ ý**: mục "NÊN LÀM / KIÊNG CỬ" — chính bản nhận định cũng
viết *"phải làm đủ và chuẩn, chứ không làm nửa mùa"*. Chờ nguồn của chú
(§24.2); khung và vị trí (ngay sau tóm tắt) đã chừa sẵn.

---

## 29. ĐƯỜNG ĐỌC TRỌN TRANG CHI TIẾT (V5.0)

Bản nhận định tiếp theo soi nhầm file cũ (`index (27).html`, trước V4.8) nên
phần chẩn đoán không còn đúng — nhưng ba ý chưa có thì thật, đã làm:

1. **Đường đọc trọn trang đúng bản 10/10**: NGÀY → TÓM TẮT → BÂY GIỜ → GIỜ →
   XUẤT HÀNH → TUỔI XUNG → KIẾN TRỪ → BÁT TÚ → TIẾT KHÍ → *các lịch khác*
   (vạn niên · Phật · Tạng) → **NGUỒN cuối cùng** (vì nó nói về tất cả bên trên).
2. **Hết trùng lặp**: 3 dòng Can Chi trong thẻ vạn niên trùng với bảng đầu
   trang — xoá. "Can Chi ngày" giờ xuất hiện đúng 1 lần.
3. **Hết nút tự trỏ**: trong trang chi tiết từng còn nút "Xem chi tiết ngày"
   (trong phần Phật/Tạng nhúng vào) trỏ về chính trang đó. Thêm cờ `INDETAIL`:
   ở hub thì nút còn, vào trang chi tiết thì ẩn — *"chi tiết ngày phải là nơi
   nội dung đã mở đầy đủ."* Nút "Tra ngày sang lịch khác" giữ (nó dẫn đi nơi khác).
4. Mục **Nguồn** mở rộng đủ 6 hệ (thêm Phật lịch, Lịch Tạng Phugpa/Janson) và
   câu chốt: *"App thuật lại dữ liệu, phân biệt rõ dữ liệu tính toán với diễn
   giải truyền thống."*

---

## 30. QUY TRÌNH DỮ LIỆU 12 TRỰC · 28 TÚ (V5.1 — chốt trước khi có dữ liệu)

Bản nghiên cứu của chú (đối chiếu nhiều nguồn về 12 Trực + 28 Tú) chốt các
nguyên tắc sau — đây là **luật dữ liệu**, không phải gợi ý:

1. **Không lấy bảng "Nên làm / Kiêng cữ" trôi nổi trên mạng** rồi gắn nhãn
   chung. Các hệ sách không thống nhất; cùng một Trực/Tú có danh sách khác
   nhau tùy sách. Ảnh app đối thủ chỉ là tham khảo UX — *không phải nguồn văn bản*.
   "Đừng để một app phổ thông trở thành sách gốc của Lịch Đa Chiều."
2. **Không đơn giản hoá** "Trực A tốt / Trực B xấu", và với 28 Tú không gom
   "sao tốt = mọi việc tốt". Mẫu câu chuẩn: *"Theo sách lịch, thường được dùng
   cho: ... Kiêng: ... Nguồn: ..."* — mô tả theo nguồn, không phán.
3. **Cấu trúc 3 tầng cho mỗi Trực/Tú** khi nhập:
   tầng 1 tóm gọn (nên/kiêng chính) → tầng 2 "Xem đầy đủ" (nên làm · kiêng cữ
   · ngoại lệ · điều kiện theo Địa chi, Diệt Một...) → tầng 3 **bài quyết/nguyên
   văn kèm nguồn**. Bài quyết GIỮ, không bỏ — nó là cách cổ thư ghi nhớ nội dung.
4. **Nguồn phải cụ thể đến bản sách/bản dịch**, không ghi chung chung "Ngọc Hạp
   Thông Thư". Mục Nguồn sẽ có dòng riêng: "12 Trực · theo [bản cụ thể]",
   "28 Tú · theo [bản cụ thể]".
5. **Quy trình nhập** (chỉ khi chú gửi ảnh trang sách chú tin): ảnh → đọc
   nguyên văn → đối chiếu chéo → xác định bản → giữ nguyên thuật ngữ → tách
   Nên/Kiêng/Ngoại lệ/Bài quyết → UX 3 tầng → ghi nguồn. Sai một chữ tệ hơn
   thiếu một mục — không bịa phần thiếu cho "đủ tính năng".
6. Trong lúc chờ, mục Nguồn của trang chi tiết đã ghi rõ (V5.1): phần nên
   làm/kiêng cữ chưa hiển thị vì chưa chốt bản nguồn — minh bạch thay vì im lặng.
7. **Đừng thêm tính năng nữa** — chuẩn mới của chú: "làm 20 thứ hiện có nhẹ hơn
   20%". Không nhồi Nakshatra, không thêm bảng/biểu tượng mới trước khi có
   người dùng thật trả lời 6 câu kiểm tra (§13/§21, bổ sung: có lý do quay lại
   mỗi ngày không; màu có "tĩnh" không hay vẫn "app kỹ thuật").

## 31. LUẬT CHẠM TOÀN APP (V5.1)

"Bất cứ thứ gì nói *kỳ tới / còn X ngày / ngày mai* đều phải có khả năng đi
tiếp." Rà toàn bộ và vá 4 chỗ còn cụt:

- **Rằm tới / Mùng 1 tới** (thẻ vạn niên): thành hàng chạm được `goDayOff(n)`,
  kèm chevron. Khi n=0 ("hôm nay") thì không gắn chạm — không có chỗ để đi.
- **"✦ lễ gần nhất · còn X ngày"** (trang chủ): trước trỏ `setMain(3)` (nhảy
  tab, lạc đề) — giờ `goDay(...)` nhảy đúng ngày đó, ở nguyên màn.
- **Ngày của tôi** (2 chỗ: dải nhắc trên trang chủ + danh sách trong "Hôm nay
  còn gì"): từng hàng chạm được, nhảy đúng ngày giỗ/sinh nhật đó.
- CSS chung `.rtap` (cursor + active + chevron mờ) — một class, mọi mốc.

Đã chạm được từ trước: ngày chay tới (nút `.chay`), kỳ thực hành Tạng
(nút `.nextp`), vía Phật sắp tới. Chuẩn đối chiếu: goDay giữ nguyên màn đang
xem — trang chủ vẽ theo VIEW nên chạm trên trang chủ là trang chủ đổi ngày.

---

## 32. NÊN LÀM · KIÊNG CỮ · NGOẠI LỆ — 28 TÚ + 12 TRỰC (V5.2)

Chú quyết định (1/9/2026): **"ko có ảnh chụp, AI tự tìm hiểu sâu tất cả và
làm"** — thay quy trình chờ ảnh sách của §30 bằng quy trình nghiên cứu đối
chiếu chéo. Đã làm đúng 5 bước trong bản nhận định chú gửi:

1. **Kênh lấy nguồn**: proxy sandbox chặn mở web trực tiếp (curl, WebFetch đều
   bị 403/EGRESS_BLOCKED với mọi domain lịch) — chỉ còn WebSearch. Mỗi sao một
   truy vấn riêng, lọc domain về đúng hai loạt bài chép trọn bộ văn bản:
   xemvm.com (bài 460–492, "Sao X tốt hay xấu") và blogphongthuy.com (loạt
   cùng tên). Hai nguồn độc lập chép CÙNG một bộ văn bản trạch nhật lưu
   truyền (gốc Ngọc Hạp Thông Thư) — đó là căn cứ "đối chiếu chéo khớp".
2. **Sổ đối chiếu**: `DOICHIEU-TRACH-NHAT.md` (trong repo) ghi từng sao DRAFT→CONFIRMED,
   các CONFLICT và cách phân xử. Đáng ghi:
   - Đê Thổ Lạc: xemvm + blogphongthuy nhất trí "hung, không có việc chi hạp";
     bản sonchu từng nói "thuận mai táng" là thiểu số → loại.
   - Khuê, Tinh, Sâm, Tỉnh: nguồn ghi "nửa cát nửa hung / tốt trung bình" →
     giữ nhãn nhị phân của bảng 14 cát tú, thêm nhãn phụ `m` trong thẻ.
   - 12 Trực: dùng NGUYÊN bảng chú gửi 1/9 (một hệ nhất quán). Loạt bài
     Hiệp Kỷ của xemvm có chỗ lệch (Mãn: nên/kiêng uống thuốc ngược nhau) —
     KHÔNG trộn hai hệ. Trực Trừ: nguồn nói "có điều kiêng riêng" mà không
     liệt kê → phần kiêng hiển thị đúng câu "nguồn không chép rõ — chưa nhập".
   - **Bài quyết cổ: CHƯA nhập** — kênh search không trả nguyên văn bài thơ
     nào; "sai một chữ tệ hơn thiếu một mục". Mục Nguồn nói thẳng điều này.
     Khi nào đối chiếu được nguyên văn (hoặc chú gửi ảnh) thì thêm tầng 3.
3. **Dữ liệu trong app** (`TU28_D`, `TRUC_D`, `ACT_EN`): mỗi sao/trực có
   nên `n`, kiêng `k`, cờ `a` (trăm việc tốt) / `o` (không việc chi hạp),
   nhãn phụ `m`, ngoại lệ `x` = [điều kiện, chú VI, chú EN]. Điều kiện là DỮ
   LIỆU (chi ngày `c`, can-chi `s`, ngày âm `d`, cuối tháng âm `e`) — không
   phải câu chú thích chết. Song ngữ qua từ điển `ACT_EN` (mỗi chuỗi VI phải
   có mặt — chốt 10 bắt thiếu).
4. **Engine `tu28Ex`**: date → sao → bảng gốc → soi điều kiện → render. Ba bảng
   điều kiện chung: Phục Đoạn Sát 12 cặp chi+sao (`TU28_PD`), Diệt Một 5 cặp
   sao+ngày-âm (`TU28_DM`, Lâu = ngày cuối tháng), Đăng Viên nằm trong `x`
   từng sao. Ngày rơi đúng điều kiện → callout vàng "Ngày này rơi vào ngoại
   lệ" trong mục 28 tú + một dòng trong TÓM TẮT; bảng đầy đủ nằm trong
   `<details>` "Ngoại lệ của sao X". Trường hợp kép giữ nguyên như cổ thư:
   Hư+Tý, Đẩu+Sửu... = "Đăng Viên rất tốt — nhưng cùng lúc phạm Phục Đoạn".
5. **Chốt 10 verify.js** (đã thấy đỏ trên bản hỏng trước khi tính): đủ 28+12
   entry; mọi mục có bản dịch EN; cấu trúc hợp lệ; engine quét 200 ngày không
   sót/oan Phục Đoạn·Diệt Một (bọc try/catch để dữ liệu thiếu BÁO ĐỎ CÓ TÊN
   chứ không sập harness); trang chi tiết hai ngôn ngữ có bảng Nên·Kiêng.
   Bản hỏng thử: cắt 1 entry + xoá 1 từ điển → 3 dòng đỏ đúng chỗ.

Giọng chữ giữ nguyên triết lý: mọi bảng đều mở đầu/kết thúc bằng "sách lịch
xếp, app thuật lại, không phán việc riêng của bạn". Không có chữ "ĐẠI CÁT"
đập vào mặt; cát/hung luôn kèm "sách lịch xếp:".

---

## 33. RÀ THIẾT KẾ V5.3 — PHÂN TẦNG "BẤM ĐƯỢC / CHỈ ĐỌC"

Chụp và soi lại toàn bộ 13 màn (390px, x2). Tổng thể da từng thế giới đã theo
đúng ngôn ngữ ảnh mẫu (nền bạc hà, thẻ trắng bo lớn, tiêu đề xanh in hoa kèm
icon tròn, xanh lá/đỏ đúng nghĩa). Ba chỗ sửa:

1. **Ăn chay** — chú chỉ đúng: nút chọn lối (Nhị/Tứ/Lục/Thập trai, Chay trường)
   BẤM ĐƯỢC nhưng trông y hệt ô số 1–29 chỉ-để-đọc bên dưới. Sửa hai phía:
   nút ra dáng nút (viền 1.5px, bóng nhẹ, nút đang chọn tô vàng + icon check
   một nét — thêm `check` vào bộ ICON); lưới ngày làm phẳng (ô thường trong
   suốt, chỉ ngày chay có nền vàng) + nhãn ghi rõ "· bảng chỉ để xem".
   Đây là LUẬT chung từ nay: thứ bấm được phải có viền/bóng/nền nút; bảng
   chỉ đọc phải phẳng, không mang dáng nút.
2. **Tuổi xung**: hai khối rời (theo ngày / theo tháng), mỗi khối một ô lẻ
   lệch trái -> gộp một khối "TUỔI XUNG", hai ô có nhãn nhỏ in hoa đứng giữa
   card như ảnh mẫu. Bỏ 2 chuỗi i18n aXungN/aXungT hết dùng.
3. **Tiết khí**: "Giữa Xử thử — Bạch lộ · sang Bạch lộ sau 6 ngày" lặp tên
   hai lần -> "· còn 6 ngày ›" (tái dùng chuỗi dLeft, vẫn chạm được).
   Bỏ chuỗi termNext2 hết dùng. Trực Phá hết hiện "Phá · phá" (ẩn nghĩa khi
   trùng tên — sửa cùng đợt V5.2).

---

## 34. THỨ TỰ HỆ LỊCH · NGUỒN 12 TRỰC · BỘ NHẬN DIỆN (V5.4)

1. **Thứ tự màn Hệ lịch** (chú chốt 1/9): Phật giáo → Lịch Tạng → Mặt trăng →
   Hoàng đạo → Vũ trụ. Đổi đúng một chỗ: `screenExplore()` dùng
   `hubScreen([2,3,0,6,1])`. **Không đụng chỉ số SUBEXP nội bộ** (0=trăng…
   6=hoàng đạo) vì EXP_TAB, skins, fns, chốt tab 35 ô đều neo theo chỉ số đó —
   đổi index là gãy cả bốn nơi. Muốn đổi thứ tự lần sau: chỉ sửa mảng ids này.
2. **"Hoàng đạo Tây" → "Hoàng đạo"** (i18n VI). Trong trang chi tiết vẫn có
   "ngày hoàng đạo" (trực thần) — hai thứ khác nhau, khác màn, không gộp.
3. **Nguồn 12 Trực** (theo bản nghiên cứu của chú): Ngọc Hạp Thông Thư có
   *cách tính* trực nhưng không có bảng nên–kiêng dạng 12 card; nên mục Nguồn
   giờ ghi tách bạch: *"cách tính khởi theo nguyệt kiến (Hiệp Kỷ Biện Phương
   Thư) · bảng nên–kiêng theo bản lưu truyền"*. Engine app tính trực bằng
   `(chi ngày − chi tháng) mod 12` — đúng phép khởi theo nguyệt kiến đó.
   Vẫn giữ luật: không gắn nhãn "theo Ngọc Hạp" cho phần app không lấy từ đó.
4. **Bộ nhận diện mới**: dấu ba vòng giao nhau (đúng motif cũ, đảo màu) — nền
   đỏ #B03A30, nét kem #FAF7F0, chấm tâm = "một ngày ở giữa nhiều hệ lịch".
   - `favicon.svg` (vector, full-bleed) + `favicon-32.png` dự phòng
   - `apple-touch-icon.png` 180 full-bleed; `icon-192/512.png` **maskable**
     (hình thu 76% cho vùng an toàn — Android bo tròn không cắt mất vòng)
   - `og.png` 1200×630: dấu + tên + một câu + 6 chip, nền kem như app
   - head: `rel=icon` (svg + png), og:*, twitter:* trỏ `https://duyet.online/og.png`
   Đã render thử ở 16/32px trước khi chốt (nét 30 + chấm 26 là bản đọc được ở
   16px mà vẫn sạch ở 32px) — không chọn bằng mắt trên bản 512.
5. **Chốt 11 verify.js**: thứ tự 5 mục Hệ lịch đúng danh sách, hết chữ "Hoàng
   đạo Tây", đủ 6 file nhận diện, head khai báo favicon + og:image + twitter,
   sw.js cache favicon.

---

## 35. ẢNH OG KHÔNG HIỆN KHI GỬI LINK — CHẨN ĐOÁN (V5.5)

Thẻ trong `index.html` đã đủ và có chốt canh (chốt 11: og:image, secure_url,
type, width/height, alt, `link rel=image_src`, twitter:card, og.png đúng
1200×630). Nên khi ảnh không hiện, lỗi nằm ở **hai chỗ ngoài repo**:

1. **Máy chủ chưa có file `og.png`.** Thẻ trỏ `https://duyet.online/og.png`.
   Nếu duyet.online (Vercel) được cập nhật bằng cách up tay index.html + sw.js
   thì 4 file mới (og.png, favicon.svg, favicon-32.png, icon-192/512,
   apple-touch-icon) **chưa hề có trên đó** → link ảnh 404 → Zalo/FB không
   hiện gì. Cách thử 10 giây: mở thẳng `https://duyet.online/og.png` — không
   ra ảnh nghĩa là thiếu file.
2. **Zalo/Facebook đã lưu bản cũ.** Một link từng gửi trước khi có thẻ OG sẽ
   bị nhớ là "không ảnh", gửi lại vẫn trống. Phải xoá cache:
   - Facebook: developers.facebook.com/tools/debug → dán link → **Scrape Again**
   - Zalo: developers.zalo.me/tools/open-graph → dán link → làm mới
   Mẹo thử nhanh không đụng cache: gửi link kèm tham số lạ, ví dụ
   `duyet.online/?v=2` — Zalo/FB coi là link mới, đọc lại từ đầu.

Sandbox không kiểm được (proxy chặn mọi domain ngoài) — đây là loại lỗi phải
kiểm trên máy chú. Nếu duyet.online chuyển sang deploy thẳng từ GitHub thì
cả hai vấn đề tự hết cho các lần sau.

---

## 36. GỌN LẠI TRANG CHỦ (V5.6)

Chú rà trang chủ, bảy chỗ, đã làm hết:

1. **"Ngày giỗ · sinh nhật của tôi" → "Ngày quan trọng"** — chú: *"nghe xám và
   sai quá"*. EN: "Important dates". Nội dung bên trong không đổi.
2. **Bỏ tiết khí khỏi trang chủ** (`hubTerm` xoá hẳn — hết chỗ dùng). Tiết khí
   vẫn còn nguyên trong trang chi tiết ngày, chỗ nó thuộc về.
3. **Mặt trăng xuống cuối**, sau Lịch Tạng: Thời tiết → Phật lịch → Lịch Tạng
   → Mặt trăng. Vì hai đối tượng chính là người Phật tử và người dùng lịch Tạng.
4. **Bỏ "Dòng của ngày"** (`dailyLineHtml` + CSS `.dline/.dl-*` + chuỗi
   `dayLine` xoá). Hàm `dailyLine()` GIỮ — ảnh chia sẻ (shareDay) vẫn dùng.
5. **"Th9 · 2026" đậm lên**: 17px/thường → 20px/700, màu đậm hơn. Chú:
   *"ngày tháng quan trọng mà không làm rõ"*.
6. **Bỏ viên "Ngày 20 tháng Bảy"** dưới hero — bảng NGÀY·THÁNG·NĂM ngay bên
   dưới đã nói đúng thông tin đó, không lặp hai lần.
7. **Bảng NGÀY·THÁNG·NĂM bớt đậm**: 28px/800 → 26px/600. Nó là thông tin phụ,
   không được cạnh tranh với số ngày dương lịch.

Kéo theo: tiêu đề "Năm lăng kính hôm nay" thành **"Các lăng kính hôm nay"** —
bỏ tiết khí thì còn bốn, để nguyên chữ "Năm" là sai. Dọn luôn biến chết
(`season`, `nt`, `curTerm`, `lday`) trong screenToday theo §18.

---

## 37. Ô PHẬT LỊCH · Ô GIỜ · VŨ TRỤ · THẺ NƠI (V5.7)

1. **Ô Phật lịch trên trang chủ "chìm quá"** — đúng: nền #FBF7EE gần như trắng,
   số BE 46px/300, đứng cạnh ô thời tiết (số 64px/800) và ô Tạng (nền đỏ đậm)
   thì mất hút. Sửa theo hướng *nổi mà vẫn tĩnh*: nền chuyển sắc giấy vàng ấm
   (#FFF7E6 → #F0DFBA), viền vàng nhạt, bóng đổ rất mềm; số BE 56px/600 màu nâu
   vàng #6B5320; hoa sen (ornLotus 150px, opacity .16) làm nền góc phải; dòng
   lễ vía thành viên bo tròn nền trắng. Không dùng đỏ/đen mạnh — giữ chất an yên.
2. **Ô GIỜ đậm hơn một chút**: `.ccstrip .cc:first-child .cv` lên 700, ba ô còn
   lại giữ 600 (giờ là thứ đổi từng phút, được nhìn nhiều nhất trong bảng).
3. **Mục Vũ trụ**: phụ đề "BẠN Ở ĐÂY · 31/12 23:59:59" — ngày nào cũng y hệt,
   không nói được gì. Thay bằng `cosmicScale` ("Nếu 13,8 tỷ năm nén thành 1
   năm") — mô tả đúng việc của mục thay vì giả vờ là thông tin của hôm nay.
4. **Thẻ nơi (thời tiết)**: dòng phụ từng là "giờ địa phương · thời tiết · đang
   xem". Giờ địa phương chỉ có nghĩa khi nơi đó **lệch múi giờ** với máy; cùng
   múi thì nó lặp lại đồng hồ ngay trên đầu màn → bỏ. "Đang xem" tách khỏi
   chuỗi, thành nhãn viền bo tròn cạnh tên. Nhãn `flex:0 0 auto` để không bị
   cắt khi tên nơi dài (bản đầu bị cắt thành "ĐANG X…" vì nằm trong ô cắt chữ).
5. **Bấm vào chính nơi đang xem bị tải lại** — `placeUse()` luôn xoá WX/TD rồi
   gọi mạng, kể cả khi bấm đúng nơi đang xem: màn nháy "đang tải" rồi về y cũ,
   người dùng tưởng app lỗi. Nay so toạ độ trước, trùng thì **thoát ngay**.
   Đo bằng harness: bấm nơi đang xem → 0 lần vẽ lại, 0 lần gọi mạng; bấm nơi
   khác vẫn đổi bình thường.
