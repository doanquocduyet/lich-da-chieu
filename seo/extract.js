// Trích dữ liệu lịch cho các trang tĩnh, bằng CHÍNH engine trong index.html.
//
// Không viết lại thuật toán nào ở đây. Mở index.html trong Chromium rồi gọi thẳng
// các hàm của app (solarToLunar, ccDay, tibetan, moonPhase, dayEvents...). Một
// nguồn số liệu duy nhất: trang tĩnh và app không bao giờ lệch nhau được.
//
// Dùng: const data = await extract(rootDir, fromYear, toYear)

const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
  try { ({ chromium } = require(p)); break; } catch (e) { /* thử chỗ kế */ }
}

function serve(root, port) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.join(root, rel);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('404');
      }
      res.writeHead(200); fs.createReadStream(file).pipe(res);
    }).listen(port, () => ok(s));
  });
}

// Chạy TRONG trang. Chỉ dùng hàm và bảng chữ của app.
function inPage({ fromYear, toYear }) {
  const t = T.vi;
  const cc = a => t.can[a[0]] + ' ' + t.chi[a[1]];
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const days = [];
  let prevTerm = null;
  for (let d = new Date(fromYear, 0, 1, 12); d.getFullYear() <= toYear; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12)) {
    const L = solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), 7);
    const len = lunarMonthLen(d);
    const cD = ccDay(L.jd), cM = ccMonth(L.year, L.month), cY = ccYear(L.year);
    const termIdx = currentTermIdx(L.jd);
    if (prevTerm === null) prevTerm = currentTermIdx(L.jd - 1);
    const mp = moonPhase(d);
    const hd = dayHoangDao(d);
    let tib = null;
    try {
      const x = tibetan(d);
      tib = { y: x.year, m: x.month, leap: x.leap, d: x.day, leapDay: x.leapDay, doubled: x.doubled,
        prevSkipped: x.prevSkipped, yearName: tibYearShort(x), monthName: t.tibMonths[x.month - 1],
        special: drukSpecialName(x, t) || null, duchen: isDuchen(x) };
    } catch (e) { tib = null; }
    // Lễ ngày 30 (Vía Địa Tạng 30/7, Vía Dược Sư 30/9): tháng thiếu không có ngày
    // 30, lễ làm vào ngày 29 — đúng quy tắc app đã dùng cho ngày chay (chayDays).
    // So khớp đúng ngày 30 như app thì năm 2026 mất hẳn Vía Địa Tạng, 2027 mất
    // Vía Dược Sư. Tháng nhuận không lặp lễ của tháng chính.
    const hit = e => e[0] === L.month && !L.leap && (e[1] === L.day || (e[1] === 30 && len === 29 && L.day === 29));
    const cu = t.cult.find(hit);
    const be = t.buddhaEv.find(hit);
    const chay = [];
    for (let m = 0; m < 4; m++) { const c = chayDays(m, len); if (c && c.indexOf(L.day) >= 0) chay.push(m); }
    const tu = tu28(L.jd);
    days.push({
      iso: iso(d), dow: d.getDay(),
      lun: { d: L.day, m: L.month, y: L.year, leap: !!L.leap, len },
      cc: { day: cc(cD), month: cc(cM), year: cc(cY) },
      animal: t.animals[cY[1]],
      napam: t.napam[napAm(cD[0], cD[1])],
      term: t.terms[termIdx], termStart: termIdx !== prevTerm,
      moon: { name: t.phases[mp.idx], illum: mp.illum, age: mp.age },
      hd: { god: hd.god, good: hd.good },
      truc: TRUC_VI[truc12(L)],
      tu: { name: TU28_VI[tu], cat: TU28_CAT[tu] === 1 },
      tib,
      be: d.getFullYear() + 544,
      cult: cu ? cu[2] : null, buddha: be ? be[2] : null,
      chay,
    });
    prevTerm = termIdx;
  }
  // Düchen / Losar: tính giống hệt drukUpcoming() của app — đi từ ngày Tạng ra
  // ngày dương, nên vẫn ra ngày kể cả khi ngày Tạng đó bị khuyết.
  const duchen = [];
  const y0 = days[0].tib ? days[0].tib.y - 1 : 2152, y1 = days[days.length - 1].tib ? days[days.length - 1].tib.y + 1 : 2155;
  for (let yy = y0; yy <= y1; yy++) for (const e of DUCHEN) {
    try {
      const td = new TDC.TibetanDate({ year: yy, month: e[0], day: e[1] });
      duchen.push({ tibYear: yy, key: e[2], name: t[e[2]], iso: td.westernDateStr, skipped: !!td.isSkippedDay });
    } catch (err) { /* ngoài tầm thư viện */ }
  }
  return {
    days, duchen,
    names: { chay: t.chayNames, drukDays: t.drukDays, dow: ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] },
    notes: { drukNote: String(t.drukNote || '').replace(/<[^>]+>/g, '') },
  };
}

async function extract(root, fromYear, toYear) {
  if (!chromium) throw new Error('Thiếu playwright. Chạy: npm i playwright && npx playwright install chromium');
  const port = 8150 + Math.floor(Math.random() * 400);
  const server = await serve(root, port);
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext({ timezoneId: 'Asia/Ho_Chi_Minh' })).newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    if (errs.length) throw new Error('index.html lỗi JS: ' + errs.join(' | '));
    return await page.evaluate(inPage, { fromYear, toYear });
  } finally {
    await browser.close();
    server.close();
  }
}

module.exports = { extract };

if (require.main === module) {
  const y = +process.argv[2] || new Date().getFullYear();
  extract(path.resolve(__dirname, '..'), y, y).then(d => {
    const pick = d.days.filter(x => ['2026-09-18', '2026-09-26', '2026-02-17', '2026-09-25'].includes(x.iso));
    console.log(JSON.stringify(pick, null, 1));
    console.log('so ngay:', d.days.length, '· duchen:', d.duchen.length);
    console.log(JSON.stringify(d.duchen.filter(x => x.iso.startsWith(String(y))), null, 0));
  }).catch(e => { console.error(e); process.exit(1); });
}
