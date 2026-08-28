// Kiểm tra index.html trước khi deploy. Hỏng bất kỳ mục nào là exit 1.
//
//     node verify.js
//
// Tự dựng server tĩnh, không cần http-server. Cần playwright:
//     npm i playwright && npx playwright install chromium
//
// GitHub Actions chạy đúng file này (xem .github/workflows/guard.yml), nên
// mọi thứ kiểm được ở máy thì cũng kiểm được trên GitHub và ngược lại.

const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
  try { ({ chromium } = require(p)); break; } catch (e) { /* thử chỗ kế */ }
}
if (!chromium) {
  console.error('Thiếu playwright. Chạy: npm i playwright && npx playwright install chromium');
  process.exit(2);
}

const PORT = 8099;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml',
};

function serve(root) {
  return http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('404');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(PORT);
}

(async () => {
  const server = serve(process.cwd());
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ timezoneId: 'Asia/Ho_Chi_Minh' })).newPage();

  const errors = [], undefHits = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const scan = async (label) => {
    const txt = await page.evaluate(() => document.body.innerText);
    if (txt.includes('undefined')) {
      const i = txt.indexOf('undefined');
      undefHits.push(`${label}: ...${txt.slice(Math.max(0, i - 70), i + 40).replace(/\n/g, ' | ')}...`);
    }
    return txt;
  };

  // Đọc các dòng "nhãn : giá trị" đang hiện, để kiểm đúng cấu trúc thay vì
  // dò chuỗi trong innerText. Dò chuỗi suông thì đậu oan: "Hệ lịch" là tên
  // tab 3 nên luôn hiện ở thanh tab, "Phugpa (Janson)" nằm sẵn ở dòng footer.
  const rows = () => page.evaluate(() =>
    [...document.querySelectorAll('.row')]
      .map(r => [r.querySelector('.k')?.innerText.trim(), r.querySelector('.v')?.innerText.trim()])
      .filter(([k, v]) => k && v)
  );

  // ── 1+2. Quét mọi màn, cả 2 ngôn ngữ ───────────────────────────────────
  let screens = 0;
  const all = { vi: [], en: [] };     // text của MỌI màn, không phải một màn
  const tibRows = {};                 // các dòng trên panel Tạng
  for (const lang of ['vi', 'en']) {
    await page.evaluate(l => setLang(l), lang); await page.waitForTimeout(350);
    for (let i = 0; i < 3; i++) {                      // Lịch: vạn niên / can chi / Phật lịch
      await page.evaluate(n => goCal(n), i); await page.waitForTimeout(500);
      all[lang].push(await scan(`${lang}/calendar/sub${i}`)); screens++;
    }
    for (let i = 0; i < 6; i++) {                      // Khám phá: moon/cosmic/buddha/tibet/weather/tide
      await page.evaluate(n => goExp(n), i); await page.waitForTimeout(700);
      all[lang].push(await scan(`${lang}/systems/sub${i}`)); screens++;
      if (i === 3) tibRows[lang] = await rows();       // panel Tạng
    }
    for (const m of [0, 3, 4]) {                       // Hôm nay / Thời tiết / Sự kiện
      await page.evaluate(n => setMain(n), m); await page.waitForTimeout(700);
      all[lang].push(await scan(`${lang}/main${m}`)); screens++;
    }
  }

  // ── 3. Tên năm Tạng ────────────────────────────────────────────────────
  await page.evaluate(() => setLang('vi')); await page.waitForTimeout(400);
  const yearName = await page.evaluate(() => {
    try { return tibYearName(tibetan(new Date(2026, 7, 17, 12))); }
    catch (e) { return 'THROW: ' + e.message; }
  });

  // ── 4. Chữ nghĩa đúng spec, đọc từ màn hình thật ───────────────────────
  // "có" => tìm đúng cặp nhãn/giá trị trên panel Tạng, không phải dò chuỗi.
  // "hết" => soi text của MỌI màn, không phải một màn.
  const vi = all.vi.join('\n'), en = all.en.join('\n');
  const eq = (pat, s) => (pat instanceof RegExp ? pat.test(s) : s === pat);
  const row = (lang, k, v) => (tibRows[lang] || []).some(([a, b]) => eq(k, a) && eq(v, b));

  const specs = [
    ['VI có dòng "Hệ lịch: Phugpa (Janson)"', row('vi', 'Hệ lịch', 'Phugpa (Janson)')],
    ['EN có dòng "Calendar system: Phugpa (Janson)"', row('en', 'Calendar system', 'Phugpa (Janson)')],
    ['VI có dòng tính chất năm = Dương/Âm', row('vi', /^Tính (chất )?năm$/, /^(năm )?(Dương|Âm)$/)],
    ['VI hết "Lịch Tạng · Phugpa"',       !vi.includes('Lịch Tạng · Phugpa')],
    ['EN hết "Tibetan · Phugpa"',         !en.includes('Tibetan · Phugpa')],
    ['VI hết "Giới tính năm"',            !vi.includes('Giới tính năm')],
    ['VI hết tên năm kèm "(dương/âm)"',   !/\((dương|âm)\)/i.test(vi)],
    ['EN có "Brightness", hết "Illumination"', en.includes('Brightness') && !en.includes('Illumination')],
  ];

  const okYear = yearName === 'Hỏa Ngựa';
  const okSpec = specs.every(([, ok]) => ok);
  const pass = errors.length === 0 && undefHits.length === 0 && okYear && okSpec;

  console.log(`Đã quét ${screens} màn hình (2 ngôn ngữ × ${screens / 2} màn).\n`);
  console.log('1. Lỗi JS / console ....... ' + (errors.length ? '\n   ' + errors.join('\n   ') : 'KHÔNG CÓ'));
  console.log('2. Chuỗi "undefined" ...... ' + (undefHits.length ? '\n   ' + undefHits.join('\n   ') : 'KHÔNG MÀN NÀO CHỨA'));
  console.log(`3. tibYearName(2026-08-17)  ${JSON.stringify(yearName)}` + (okYear ? '  ✓' : '  ✗ phải là "Hỏa Ngựa"'));
  console.log('4. Chữ nghĩa theo spec:');
  for (const [label, ok] of specs) console.log(`   ${ok ? '✓' : '✗'} ${label}`);
  console.log('\n' + (pass ? '>>> ĐẠT — deploy được.' : '>>> HỎNG — KHÔNG deploy.'));

  await browser.close();
  server.close();
  process.exit(pass ? 0 : 1);
})();
