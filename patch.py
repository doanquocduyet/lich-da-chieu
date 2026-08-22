#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vá bản build mới thành index.html deploy được.

    python3 patch.py "index (18).html"

Bản build sinh ra từ nguồn ngoài repo LUÔN rơi mất 7 chỗ dưới đây — đã lặp lại ở
V2.4 và V2.5. Script này vá lại chúng, rồi tự bump cache trong sw.js.

Mỗi chỗ vá có assert đếm số lần khớp. Không khớp đúng 1 lần thì DỪNG, báo lỗi,
KHÔNG vá gì cả. Tuyệt đối đừng sửa tay đoán mò khi assert fail: nghĩa là bản
build đã đổi cấu trúc, phải đọc lại đoạn đó trước khi cập nhật script.

Vá xong BẮT BUỘC chạy kiểm tra trước khi deploy (xem §11 trong BANGIAO-LICH-DA-CHIEU.md).
"""

import io
import re
import sys

# (tên chỗ vá, chuỗi cũ, chuỗi mới) — thứ tự không quan trọng, mỗi chuỗi cũ phải khớp đúng 1 lần.
PATCHES = [
    (
        "1. Chặn ngày khuyết (chad) bằng isSkippedDay",
        """    try{const td=new TDC.TibetanDate({year:y,month:m,day:d});D=new Date(td.westernDateStr+'T12:00:00');}
    catch(e){err=t.cvSkip;}""",
        """    // Ngay khuyet (chad): thu vien KHONG nem loi ma van tra ve mot ngay duong -
    // ngay do that ra thuoc ngay Tang truoc do. Phai chan bang co isSkippedDay.
    try{
      const td=new TDC.TibetanDate({year:y,month:m,day:d});
      if(td.isSkippedDay)err=t.cvSkip;
      else D=new Date(td.westernDateStr+'T12:00:00');
    }catch(e){err=t.cvSkip;}""",
    ),
    (
        "2. Bỏ đuôi giới tính khỏi tên năm Tạng",
        """function tibYearName(tib){
  return LANG=='vi'
    ?`${tibElVi[tib.element]} ${tibAnVi[tib.animal]} (${tibGenVi[tib.gender]})`
    :`${tib.gender} ${tib.element} ${tib.animal}`;
}""",
        """function tibYearName(tib){return tibYearShort(tib);}""",
    ),
    (
        "3. VI — bỏ chữ Phugpa khỏi nhãn, thêm chuỗi Hệ lịch",
        'termNow:"Đang trong tiết khí này",tibLbl:"Lịch Tạng · Phugpa",',
        'termNow:"Đang trong tiết khí này",tibLbl:"Lịch Tạng",tibSystem:"Hệ lịch",tibSystemV:"Phugpa (Janson)",',
    ),
    (
        "4. EN — bỏ chữ Phugpa khỏi nhãn, thêm chuỗi Calendar system",
        'termNow:"Currently in this solar term",tibLbl:"Tibetan · Phugpa",',
        'termNow:"Currently in this solar term",tibLbl:"Tibetan calendar",tibSystem:"Calendar system",tibSystemV:"Phugpa (Janson)",',
    ),
    (
        '5. "Tính năm: Dương/Âm" thay cho "Giới tính năm: Nam/Nữ"',
        'tibGender:"Giới tính năm",gMale:"Nam",gFemale:"Nữ",',
        'tibGender:"Tính năm",gMale:"Dương",gFemale:"Âm",',
    ),
    (
        '6. EN — "Brightness" thay cho "Illumination"',
        'astroTitle:"The Moon",illum:"Illumination",moonAge:"Moon age",days:"days",',
        'astroTitle:"The Moon",illum:"Brightness",moonAge:"Moon age",days:"days",',
    ),
    (
        "7. Thêm dòng Hệ lịch: Phugpa (Janson) vào panel Tạng",
        """      <div class="row"><span class="k">${t.tibGender}</span><span class="v">${tib.gender==='Male'?t.gMale:t.gFemale}</span></div>""",
        """      <div class="row"><span class="k">${t.tibGender}</span><span class="v">${tib.gender==='Male'?t.gMale:t.gFemale}</span></div>
      <div class="row"><span class="k">${t.tibSystem}</span><span class="v">${t.tibSystemV}</span></div>""",
    ),
]


def patch_index(src, dst="index.html"):
    s = io.open(src, encoding="utf-8").read()

    # Chỗ vá 2 gọi tibYearShort — bản build nào thiếu hàm này là vá xong sẽ trắng app.
    assert s.count("function tibYearShort") == 1, "Bản build thiếu function tibYearShort — dừng."

    for name, old, new in PATCHES:
        hits = s.count(old)
        if hits != 1:
            already = new.count(old) == 0 and new[:40] in s
            raise SystemExit(
                "DỪNG — %s: chuỗi cũ khớp %d lần (phải đúng 1).%s\n"
                "Đọc lại đoạn đó trong bản build rồi cập nhật PATCHES, đừng sửa tay."
                % (name, hits, "  Có vẻ chỗ này đã được vá sẵn." if already else "")
            )
        s = s.replace(old, new)
        print("  ✓ %s" % name)

    io.open(dst, "w", encoding="utf-8").write(s)
    return len(PATCHES)


def bump_sw(path="sw.js"):
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"const C='ldc-v(\d+)';", s)
    if not m:
        raise SystemExit("DỪNG — không tìm thấy dòng const C='ldc-vNN'; trong %s" % path)
    old, new = int(m.group(1)), int(m.group(1)) + 1
    s = s.replace("ldc-v%d" % old, "ldc-v%d" % new)
    io.open(path, "w", encoding="utf-8").write(s)
    return old, new


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit('Dùng: python3 patch.py "index (18).html"')

    print("Vá %s -> index.html" % sys.argv[1])
    n = patch_index(sys.argv[1])
    old, new = bump_sw()

    print("\nĐã vá %d chỗ. Cache sw.js: ldc-v%d -> ldc-v%d" % (n, old, new))
    print("\nCHƯA XONG — phải kiểm tra trước khi deploy:")
    print("  npx http-server -p 8099 -c-1 .")
    print("  rồi chạy 3 mục kiểm tra ở §11 BANGIAO-LICH-DA-CHIEU.md")
