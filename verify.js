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
    ['Footer không in HTML thô ra màn', !vi.includes('<span') && !en.includes('<span')],
    ['EN không có "1 days" sai số ít', !/\b1 days\b/.test(en)],
    // iOS ve nhung ky tu nay thanh emoji MAU -> lech han voi phan con lai cua giao dien.
    // Da thay bang icon SVG mot net; bay nay chan ban build sau dua emoji quay lai.
    ['Không còn emoji màu trên giao diện', !/[\u{1F300}-\u{1FAFF}\u{2600}\u{2638}\u{26C5}\u{2744}\u{26C8}]/u.test(vi + en)],
  ];

  // ── 5. Dấu build có mặt, và khớp tên cache trong sw.js ─────────────────
  // Bắt trường hợp trang phục vụ một index.html không đi cùng sw.js hiện tại.
  const build = await page.evaluate(() => window.LDC_BUILD || null);
  const swCache = (fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8')
    .match(/const C='(ldc-v\d+)';/) || [])[1] || null;
  const okBuild = !!build && !!swCache && build.startsWith(swCache + ' ');

  // ── 6. Bấm "+ Thêm nơi" phải mở được ô nhập VÀ KHÔNG ĐƯỢC làm app vẽ lại vô tận ─
  // Bản V3.3 có lỗi: khi đã có vị trí, nút này gọi openCityForm() mãi mỗi 60ms,
  // mỗi lần lại ép MAIN=3 -> app đứng hình, bấm tab khác bị kéo ngược về Thời tiết.
  // Chốt này diễn lại đúng thao tác đó.
  const board = await (async () => {
    const ctx2 = await browser.newContext({ timezoneId: 'Asia/Ho_Chi_Minh' });
    // Phải giả THÀNH CÔNG, không được chặn: chặn thì app rơi vào nhánh "lỗi thời tiết",
    // mà nhánh đó vốn đã tự vẽ ô nhập -> chốt sẽ báo xanh trên cả bản hỏng.
    // Cảnh gây treo là cảnh thời tiết CHẠY ĐƯỢC mà vẫn bấm "+ Thêm nơi".
    const dailyN = n => Array(7).fill(n);
    const WXOK = {
      utc_offset_seconds: 25200,
      current: { temperature_2m: 31, weather_code: 2, relative_humidity_2m: 70,
        apparent_temperature: 35, wind_speed_10m: 9, is_day: 1 },
      daily: { time: ['2026-08-29','2026-08-30','2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-04'],
        temperature_2m_max: dailyN(33), temperature_2m_min: dailyN(26), weather_code: dailyN(2),
        sunrise: dailyN('2026-08-29T05:30'), sunset: dailyN('2026-08-29T18:10'),
        precipitation_probability_max: dailyN(20), uv_index_max: dailyN(8) },
      hourly: { time: Array.from({ length: 48 }, (_, i) => `2026-08-29T${String(i % 24).padStart(2, '0')}:00`),
        temperature_2m: Array(48).fill(30), weather_code: Array(48).fill(2),
        precipitation_probability: Array(48).fill(10) },
    };
    await ctx2.route('**api.open-meteo.com/**', r => r.fulfill(
      { contentType: 'application/json', body: JSON.stringify(WXOK) }));
    await ctx2.route('**marine-api.open-meteo.com/**', r => r.fulfill(
      { contentType: 'application/json', body: '{"hourly":{"time":[],"sea_level_height_msl":[]}}' }));
    const p2 = await ctx2.newPage();
    await p2.addInitScript(() => {
      localStorage.setItem('ldc_loc', JSON.stringify({ la: 21.028, lo: 105.834 }));
      localStorage.setItem('ldc_places', JSON.stringify([{ n: 'Hà Nội', la: 21.028, lo: 105.834, me: false }]));
    });
    await p2.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(800);
    await p2.evaluate(() => { setMain(3); SUBEXP = 4; EXPOPEN = true; renderScreen(); });
    await p2.waitForTimeout(400);
    await p2.evaluate(() => { window.__n = 0; const o = renderScreen;
      window.renderScreen = function () { window.__n++; return o.apply(this, arguments); }; });
    const btn = p2.locator('.pbar button').filter({ hasText: 'Thêm nơi' }).first();
    const hasBtn = await btn.count() > 0;
    if (hasBtn) await btn.click();
    await p2.waitForTimeout(1200);
    const form = await p2.locator('#cityForm').count();
    const loops = await p2.evaluate(() => window.__n);
    await p2.evaluate(() => setMain(2));           // sang Hệ lịch
    await p2.waitForTimeout(700);
    const stay = await p2.evaluate(() => MAIN);    // phải ở lại tab 2
    const dup = await p2.evaluate(() => document.querySelectorAll('#cityForm').length);
    await ctx2.close();
    return { hasBtn, form, loops, stay, dup };
  })();
  const boardSpecs = [
    ['Bảng nơi quan tâm có nút "+ Thêm nơi"', board.hasBtn],
    ['Bấm "+" mở được ô nhập ngay tại chỗ', board.form === 1],
    [`Bấm "+" không vẽ lại vô tận (đếm được ${board.loops} lần, cho phép ≤3)`, board.loops <= 3],
    [`Bấm sang Hệ lịch thì ở lại Hệ lịch (đang ở tab ${board.stay})`, board.stay === 2],
    ['Chỉ có đúng một ô nhập #cityForm trên màn', board.dup <= 1],
  ];

  const okYear = yearName === 'Hỏa Ngựa';
  const okSpec = specs.every(([, ok]) => ok) && boardSpecs.every(([, ok]) => ok);
  const pass = errors.length === 0 && undefHits.length === 0 && okYear && okSpec && okBuild;

  console.log(`Đã quét ${screens} màn hình (2 ngôn ngữ × ${screens / 2} màn).\n`);
  console.log('1. Lỗi JS / console ....... ' + (errors.length ? '\n   ' + errors.join('\n   ') : 'KHÔNG CÓ'));
  console.log('2. Chuỗi "undefined" ...... ' + (undefHits.length ? '\n   ' + undefHits.join('\n   ') : 'KHÔNG MÀN NÀO CHỨA'));
  console.log(`3. tibYearName(2026-08-17)  ${JSON.stringify(yearName)}` + (okYear ? '  ✓' : '  ✗ phải là "Hỏa Ngựa"'));
  console.log('4. Chữ nghĩa theo spec:');
  for (const [label, ok] of specs) console.log(`   ${ok ? '✓' : '✗'} ${label}`);
  console.log(`5. Dấu build ............... ${build || 'KHÔNG CÓ'}` +
    (okBuild ? '  ✓' : `  ✗ phải bắt đầu bằng "${swCache}" (tên cache trong sw.js)`));
  console.log('6. Bảng nơi quan tâm:');
  for (const [label, ok] of boardSpecs) console.log(`   ${ok ? '✓' : '✗'} ${label}`);
  console.log('\n' + (pass ? '>>> ĐẠT — deploy được.' : '>>> HỎNG — KHÔNG deploy.'));

  await browser.close();
  server.close();
  process.exit(pass ? 0 : 1);
})();
