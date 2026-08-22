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
- **Đã deploy** GitHub Pages: https://doanquocduyet.github.io/lich-da-chieu/ — bản V2.5, cache `ldc-v36`.
- Thư mục gốc đúng 8 file: `index.html` · `sw.js` · `manifest.webmanifest` · 3 icon · `README.md` · `patch.py` (+ file spec này).

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

### `verify.js` kiểm những gì

Timezone `Asia/Ho_Chi_Minh`, quét 24 màn hình (2 ngôn ngữ × 12 màn:
`goCal(0..2)` + `goExp(0..5)` + `setMain(0,3,4)`):

1. **Không `pageerror`, không console error** ở màn nào.
2. **`document.body.innerText` không chứa "undefined"** ở màn nào.
3. Sau `setLang('vi')`: `tibYearName(tibetan(new Date(2026,7,17,12)))` phải ra đúng **`"Hỏa Ngựa"`**.
4. **8 điều kiện chữ nghĩa nhìn thấy trên màn hình thật** — có "Hệ lịch", có "Phugpa (Janson)",
   hết "Lịch Tạng · Phugpa", có "Tính năm", hết "Giới tính năm", tên năm không có "(dương)",
   EN có "Calendar system", EN hết "Tibetan · Phugpa".

Mục 4 quan trọng hơn `--check` của `patch.py`: nó soi **kết quả render**, nên bắt được cả
trường hợp chuỗi có trong mã nguồn mà không hiện ra màn hình.

Deploy xong nhớ: máy đã cài giữ service worker cũ, **lần load đầu vẫn ra bản cũ**,
tới lần thứ hai mới thấy bản mới. Muốn thấy ngay thì mở tab ẩn danh hoặc Ctrl+Shift+R.

### Việc vẫn nên làm ở gốc

Workflow chữa được triệu chứng một cách đáng tin, nhưng 7 chỗ này lẽ ra phải nằm trong
**chính nguồn sinh ra bản build**. Khi nào xử được gốc, workflow sẽ chạy mà không commit
gì nữa — lúc đó bỏ `patch.py` đi được, còn `verify.js` thì giữ.
