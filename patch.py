#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vá bản build mới thành index.html deploy được.

    python3 patch.py "index (18).html"    # vá bản build mới -> ghi ra index.html
    python3 patch.py index.html           # vá tại chỗ (GitHub Actions dùng cái này)
    python3 patch.py index.html --check   # chỉ báo trạng thái, không ghi gì

Bản build sinh ra từ nguồn ngoài repo LUÔN rơi mất 7 chỗ dưới đây — đã lặp ở
V2.4 và V2.5. Script này vá lại chúng rồi tự bump cache trong sw.js.

Script CHẠY LẠI ĐƯỢC NHIỀU LẦN mà không hỏng gì: file đã vá đủ thì nó báo
"không có gì để vá" rồi thoát, không ghi file, không bump cache oan.

Mỗi chỗ vá có 2 dấu hiệu: chuỗi CŨ (chưa vá) và chuỗi ĐÃ VÁ. Chỗ nào không
nhận ra được ở cả hai dạng thì DỪNG HẲN, không vá gì cả, và in ra vùng code
quanh đó để sửa PATCHES cho nhanh. Đừng sửa tay đoán mò.
"""

import io
import re
import sys

# name  : tên chỗ vá, để in ra
# old   : chuỗi lúc CHƯA vá — phải khớp đúng 1 lần
# new   : thay bằng chuỗi này
# done  : dấu hiệu ĐÃ vá rồi — dùng để chạy lại nhiều lần mà không lỗi
# probe : regex khoanh vùng code, chỉ dùng để in chẩn đoán khi cả old lẫn done đều trượt
PATCHES = [
    {
        "name": "1. Chặn ngày khuyết (chad) bằng isSkippedDay",
        "old": """    try{const td=new TDC.TibetanDate({year:y,month:m,day:d});D=new Date(td.westernDateStr+'T12:00:00');}
    catch(e){err=t.cvSkip;}""",
        "new": """    // Ngay khuyet (chad): thu vien KHONG nem loi ma van tra ve mot ngay duong -
    // ngay do that ra thuoc ngay Tang truoc do. Phai chan bang co isSkippedDay.
    try{
      const td=new TDC.TibetanDate({year:y,month:m,day:d});
      if(td.isSkippedDay)err=t.cvSkip;
      else D=new Date(td.westernDateStr+'T12:00:00');
    }catch(e){err=t.cvSkip;}""",
        "done": "if(td.isSkippedDay)err=t.cvSkip;",
        "probe": r"new TDC\.TibetanDate\(\{year:y.{0,400}",
    },
    {
        "name": "2. Bỏ đuôi giới tính khỏi tên năm Tạng",
        "old": """function tibYearName(tib){
  return LANG=='vi'
    ?`${tibElVi[tib.element]} ${tibAnVi[tib.animal]} (${tibGenVi[tib.gender]})`
    :`${tib.gender} ${tib.element} ${tib.animal}`;
}""",
        "new": """function tibYearName(tib){return tibYearShort(tib);}""",
        "done": "function tibYearName(tib){return tibYearShort(tib);}",
        "probe": r"function tibYearName\(tib\)\{.{0,300}",
    },
    {
        "name": "3. VI — bỏ chữ Phugpa khỏi nhãn, thêm chuỗi Hệ lịch",
        "old": 'termNow:"Đang trong tiết khí này",tibLbl:"Lịch Tạng · Phugpa",',
        "new": 'termNow:"Đang trong tiết khí này",tibLbl:"Lịch Tạng",tibSystem:"Hệ lịch",tibSystemV:"Phugpa (Janson)",',
        "done": 'tibLbl:"Lịch Tạng",tibSystem:"Hệ lịch"',
        "probe": r'termNow:"Đang trong tiết khí này".{0,160}',
    },
    {
        "name": "4. EN — bỏ chữ Phugpa khỏi nhãn, thêm chuỗi Calendar system",
        "old": 'termNow:"Currently in this solar term",tibLbl:"Tibetan · Phugpa",',
        "new": 'termNow:"Currently in this solar term",tibLbl:"Tibetan calendar",tibSystem:"Calendar system",tibSystemV:"Phugpa (Janson)",',
        "done": 'tibLbl:"Tibetan calendar",tibSystem:"Calendar system"',
        "probe": r'termNow:"Currently in this solar term".{0,160}',
    },
    {
        "name": '5. "Tính năm: Dương/Âm" thay cho "Giới tính năm: Nam/Nữ"',
        "old": 'tibGender:"Giới tính năm",gMale:"Nam",gFemale:"Nữ",',
        "new": 'tibGender:"Tính năm",gMale:"Dương",gFemale:"Âm",',
        "done": 'tibGender:"Tính năm",gMale:"Dương",gFemale:"Âm",',
        "probe": r"tibGender:\".{0,120}",
    },
    {
        "name": '6. EN — "Brightness" thay cho "Illumination"',
        "old": 'astroTitle:"The Moon",illum:"Illumination",moonAge:"Moon age",days:"days",',
        "new": 'astroTitle:"The Moon",illum:"Brightness",moonAge:"Moon age",days:"days",',
        "done": 'illum:"Brightness"',
        "probe": r'astroTitle:"The Moon".{0,140}',
    },
    {
        "name": "7. Thêm dòng Hệ lịch: Phugpa (Janson) vào panel Tạng",
        "old": """      <div class="row"><span class="k">${t.tibGender}</span><span class="v">${tib.gender==='Male'?t.gMale:t.gFemale}</span></div>""",
        "new": """      <div class="row"><span class="k">${t.tibGender}</span><span class="v">${tib.gender==='Male'?t.gMale:t.gFemale}</span></div>
      <div class="row"><span class="k">${t.tibSystem}</span><span class="v">${t.tibSystemV}</span></div>""",
        "done": '<span class="k">${t.tibSystem}</span>',
        "probe": r"\$\{t\.tibGender\}.{0,260}",
    },
]

TODO, DONE, LOST = "TODO", "DONE", "LOST"


def survey(s):
    """Xem từng chỗ vá đang ở trạng thái nào."""
    out = []
    for p in PATCHES:
        n_old, n_done = s.count(p["old"]), s.count(p["done"])
        # Phải hỏi "đã vá chưa" TRƯỚC. Chỗ vá 7 là chèn thêm một dòng ngay dưới
        # dòng cũ, nên chuỗi cũ vẫn còn sau khi vá — cứ nhìn chuỗi cũ là chạy lần
        # nào cũng chèn thêm một dòng trùng.
        if n_done >= 1:
            st = DONE
        elif n_old == 1:
            st = TODO
        else:
            st = LOST
        out.append((p, st, n_old, n_done))
    return out


def report_lost(s, rows):
    print("\nDỪNG — không nhận ra được các chỗ sau, KHÔNG vá gì cả:\n", file=sys.stderr)
    for p, st, n_old, n_done in rows:
        if st != LOST:
            continue
        print("  ✗ %s" % p["name"], file=sys.stderr)
        print("      chuỗi cũ khớp %d lần (cần 1), dấu hiệu đã-vá khớp %d lần"
              % (n_old, n_done), file=sys.stderr)
        m = re.search(p["probe"], s, re.S)
        print("      vùng code hiện tại: %s"
              % (repr(m.group(0)[:240]) if m else "KHÔNG TÌM THẤY — bản build đổi nhiều"),
              file=sys.stderr)
    print("\nBản build đã đổi cấu trúc. Đọc vùng code ở trên rồi cập nhật PATCHES trong\n"
          "patch.py. Tuyệt đối đừng sửa tay index.html — lần build sau lại mất.\n",
          file=sys.stderr)


def bump_sw(path="sw.js"):
    s = io.open(path, encoding="utf-8").read()
    m = re.search(r"const C='ldc-v(\d+)';", s)
    if not m:
        raise SystemExit("DỪNG — không thấy dòng const C='ldc-vNN'; trong %s" % path)
    old = int(m.group(1))
    io.open(path, "w", encoding="utf-8").write(
        s.replace("ldc-v%d" % old, "ldc-v%d" % (old + 1))
    )
    return old, old + 1


def main(argv):
    check_only = "--check" in argv
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 1:
        raise SystemExit(__doc__.strip().split("\n\n")[1])
    src = args[0]
    dst = "index.html"

    s = io.open(src, encoding="utf-8").read()
    rows = survey(s)

    if any(st == LOST for _, st, _, _ in rows):
        report_lost(s, rows)
        return 1

    todo = [(p, st) for p, st, _, _ in rows if st == TODO]
    for p, st, _, _ in rows:
        print("  %s %s" % ("→" if st == TODO else "✓", p["name"]))

    if check_only:
        if todo:
            print("\n%d/%d chỗ CHƯA vá — index.html chưa deploy được." % (len(todo), len(PATCHES)))
            return 1
        print("\nĐủ %d/%d chỗ vá. File deploy được." % (len(PATCHES), len(PATCHES)))
        return 0

    if not todo:
        print("\nKhông có gì để vá — cả %d chỗ đã có sẵn. Không ghi file, không bump cache."
              % len(PATCHES))
        if src != dst:
            io.open(dst, "w", encoding="utf-8").write(s)
            print("Đã chép %s -> %s." % (src, dst))
        return 0

    # Chỗ vá 2 gọi tibYearShort — bản build thiếu hàm này là vá xong trắng app.
    if s.count("function tibYearShort") != 1:
        raise SystemExit("DỪNG — bản build thiếu function tibYearShort.")

    for p, _ in todo:
        s = s.replace(p["old"], p["new"])
    io.open(dst, "w", encoding="utf-8").write(s)
    old, new = bump_sw()

    print("\nĐã vá %d chỗ vào %s. Cache sw.js: ldc-v%d -> ldc-v%d" % (len(todo), dst, old, new))
    print("CHƯA XONG — chạy `node verify.js` trước khi deploy.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
