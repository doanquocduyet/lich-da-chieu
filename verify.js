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

  // index.html dùng content-visibility:auto để trình duyệt bỏ qua phần chưa nhìn
  // thấy (bấm đổi tab nhanh hơn gấp đôi). Nhưng innerText CŨNG bỏ qua phần đó —
  // nghĩa là mọi mục "hết chữ X" dưới đây sẽ đậu oan chỉ vì chữ đó nằm ngoài màn.
  // Tắt hẳn khi kiểm, để đọc được toàn bộ trang.
  await page.addStyleTag({ content: '*{content-visibility:visible !important}' });

  // Chu Duyet: "bo tron het". Mui ten / tam giac / dau nhan viet bang KY TU thi
  // moi may ve mot kieu, khong doi duoc net, khong doi duoc mau — dung van de
  // voi emoji. Chi soi NUT va nhan bam duoc: dau "×" trong cau "365 × ..." va
  // mui ten trong o chon "Duong → Am" la chu, khong phai icon.
  // Phai chay TREN TUNG MAN. Ban dau toi chi chay mot lan o cuoi -> no soi dung
  // mot man cuoi cung va bao xanh tren ca ban con day mui ten.
  const sharp = new Set();
  const sweepSharp = async () => {
    for (const x of await page.evaluate(() => {
      const re = /[→←↗↘⬇⬆✕✖▾▴▸◂‹›↩⌄⌃]/u, out = [];
      for (const el of document.querySelectorAll('button,.go2,.ear,.tla,.mnav .lbl,.backtoday,summary')) {
        const t = (el.textContent || '').trim();
        for (const ch of t) if (re.test(ch)) out.push(`${ch} trong <${el.tagName.toLowerCase()}`
          + (el.className ? '.' + String(el.className).split(' ')[0] : '') + `> "${t.slice(0, 22)}"`);
      }
      for (const g of document.querySelectorAll('svg path,svg line,svg polyline,svg polygon')) {
        const c = getComputedStyle(g);
        if (c.stroke !== 'none' && (c.strokeLinecap !== 'round' || c.strokeLinejoin !== 'round'))
          out.push(`nét cắt vuông trong <${g.tagName}> của .${(g.closest('svg').getAttribute('class') || '?')}`);
      }
      // Mui ten mo/dong cua <details> nam trong CSS content, khong co trong DOM
      for (const el of document.querySelectorAll('summary')) {
        const c = getComputedStyle(el, '::after').content;
        if (re.test(c)) out.push(`${c} trong ::after của <summary>`);
      }
      return out;
    })) sharp.add(x);
  };

  // Luật chạm (§31): mốc thời gian "còn/sau X ngày" phải nằm trong phần tử đi
  // tiếp được (onclick / button / link). Mốc mà chạm không đi đâu là cụt.
  // Cũng phải chạy trên từng màn — bài học của chốt bo tròn.
  const orphanTap = new Set();
  const sweepTap = async (tag) => {
    for (const x of await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.children.length > 0) return;
        const tx = (el.textContent || '').trim();
        if (!/(còn|sau) \d+ ngày|in \d+ days?\b|\b\d+ days? left\b/.test(tx)) return;
        if (el.closest('[onclick],button,a,summary,label')) return;
        out.push((el.className || el.tagName) + ' · "' + tx.slice(0, 48) + '"');
      });
      return out;
    })) orphanTap.add(`${tag}: ${x}`);
  };

  // V4.1 gap du lieu tra cuu vao <details class="more">. Chu ghi nguon van hien
  // (drukNote), nhung cac dong .row thi nam trong muc gap. innerText bo qua noi
  // dung trong <details> dong -> ba muc chu nghia bao do oan. Mo het ra khi kiem:
  // yeu cau cua spec la app CO thong tin do, khong phai no phai luon mo san.
  const scan = async (label) => {
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
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
    (document.querySelectorAll('details').forEach(d => d.open = true),
    [...document.querySelectorAll('.row')])
      .map(r => [r.querySelector('.k')?.innerText.trim(), r.querySelector('.v')?.innerText.trim()])
      .filter(([k, v]) => k && v)
  );

  // ── 1+2. Quét mọi màn, cả 2 ngôn ngữ ───────────────────────────────────
  let screens = 0;
  const all = { vi: [], en: [] };     // text của MỌI màn, không phải một màn
  const detailTxt = {};               // riêng trang chi tiết ngày, cho chốt 10
  const tibRows = {};                 // các dòng trên panel Tạng
  for (const lang of ['vi', 'en']) {
    await page.evaluate(l => setLang(l), lang); await page.waitForTimeout(350);
    for (let i = 0; i < 3; i++) {                      // Lịch: vạn niên / can chi / Phật lịch
      await page.evaluate(n => goCal(n), i); await page.waitForTimeout(500);
      all[lang].push(await scan(`${lang}/calendar/sub${i}`)); await sweepSharp(); await sweepTap(`${lang}/calendar/sub${i}`); screens++;
    }
    for (let i = 0; i < 6; i++) {                      // Khám phá: moon/cosmic/buddha/tibet/weather/tide
      await page.evaluate(n => goExp(n), i); await page.waitForTimeout(700);
      all[lang].push(await scan(`${lang}/systems/sub${i}`)); await sweepSharp(); await sweepTap(`${lang}/systems/sub${i}`); screens++;
      if (i === 3) tibRows[lang] = await rows();       // panel Tạng
    }
    for (const m of [0, 3, 4]) {                       // Hôm nay / Thời tiết / Sự kiện
      await page.evaluate(n => setMain(n), m); await page.waitForTimeout(700);
      all[lang].push(await scan(`${lang}/main${m}`)); await sweepSharp(); await sweepTap(`${lang}/main${m}`); screens++;
    }
    // Trang chi tiết ngày (MODE='day') — trước V5.1 vòng quét chưa vào đây,
    // mà đây là trang dày mốc thời gian nhất.
    await page.evaluate(() => { MODE = 'day'; goCal(1); }); await page.waitForTimeout(600);
    detailTxt[lang] = await scan(`${lang}/day-detail`);
    all[lang].push(detailTxt[lang]); await sweepSharp(); await sweepTap(`${lang}/day-detail`); screens++;
    await page.evaluate(() => { MODE = 'month'; setMain(0); }); await page.waitForTimeout(300);
  }

  // Man Lich o che do Thang/Nam co thanh chuyen thang — khong nam trong vong tren.
  for (const md of ['month', 'year', 'week']) {
    await page.evaluate(m => { goCal(0); setMode(m); }, md); await page.waitForTimeout(400);
    await sweepSharp();
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

  // ── 8. Dang mo mot panel, bam sang tab khac thi PHAI qua ────────────────
  // SUBEXP dung chung cho tab He lich va tab Thoi tiet. Truoc day setMain giu
  // EXPOPEN khi nhay giua hai tab do -> dang o panel Tang ma bam Thoi tiet thi
  // van thay panel Tang. Chu Duyet bao dung canh nay.
  const tabs = await page.evaluate(() => {
    const own = { 0:2, 1:2, 2:2, 3:2, 4:3, 5:3, 6:2 }, bad = [];
    const NM = ['trăng','vũ trụ','phật','tạng','thời tiết','triều','hoàng đạo'];
    for (const se of [0,1,2,3,4,5,6]) for (const to of [0,1,2,3,4]) {
      goExp(se); setMain(to);
      if (MAIN !== to) bad.push(`ở panel ${NM[se]}, bấm tab ${to} → vẫn ở tab ${MAIN}`);
      else if (EXPOPEN && !(to === own[se] && SUBEXP === se))
        bad.push(`ở panel ${NM[se]}, bấm tab ${to} → tab ${to} vẫn vẽ panel ${NM[SUBEXP]}`);
    }
    setMain(0);
    return bad;
  });

  // ── 10. Dữ liệu trạch nhật 28 tú + 12 trực (V5.2) ──────────────────────
  // Dữ liệu nhập tay từ nguồn đối chiếu — chốt bắt: thiếu entry, mục không có
  // bản dịch EN, cấu trúc sai, và engine ngoại lệ sót/oan Phục Đoạn / Diệt Một.
  const alm = await page.evaluate(() => {
    const out = { miss: [], bad: [], n28: 0, n12: 0, shape: false };
    if (typeof TU28_D === 'undefined' || typeof TRUC_D === 'undefined') return out;
    out.n28 = TU28_D.length; out.n12 = TRUC_D.length;
    const scan = a => { for (const e of a) for (const s of [...(e.n || []), ...(e.k || [])]) if (!ACT_EN[s]) out.miss.push(s); };
    scan(TU28_D); scan(TRUC_D);
    out.shape = TU28_D.every(e => Array.isArray(e.k) && (e.a || e.o || (e.n && e.n.length)))
      && TRUC_D.every(e => e.y && e.y.length === 2 && Array.isArray(e.n) && Array.isArray(e.k));
    for (let i = 0; i < 200; i++) {
      // du lieu thieu entry lam tu28Ex nem loi -> phai bao do co ten, khong sap harness
      try {
        const d = new Date(Date.now() + i * 864e5);
        const lun = solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), 7);
        const cyD = ccDay(lun.jd), idx = tu28(lun.jd), ex = tu28Ex(idx, lun, cyD, d);
        const isPD = TU28_PD[cyD[1]] === idx, dm = TU28_DM[idx];
        const isDM = dm ? (dm === 'e' ? lun.day === lunarMonthLen(d) : dm.indexOf(lun.day) >= 0) : false;
        if (isPD !== ex.act.some(r => r.t.indexOf('Phục Đoạn') === 0)) out.bad.push('PĐ ' + d.toDateString());
        if (isDM !== ex.act.some(r => r.t.indexOf('Diệt Một') === 0)) out.bad.push('DM ' + d.toDateString());
      } catch (e) { out.bad.push('THROW ngày +' + i + ': ' + e.message); break; }
    }
    return out;
  });
  const almSpecs = [
    [`TU28_D đủ 28 sao (${alm.n28}) · TRUC_D đủ 12 trực (${alm.n12})`, alm.n28 === 28 && alm.n12 === 12],
    ['Mọi mục nên/kiêng đều có bản dịch EN', alm.miss.length === 0, alm.miss.slice(0, 4).join(' | ')],
    ['Cấu trúc entry hợp lệ (kiêng là mảng; có nên hoặc cờ a/o)', alm.shape],
    ['Engine 200 ngày không sót/oan Phục Đoạn · Diệt Một', alm.bad.length === 0, alm.bad.slice(0, 4).join(' | ')],
    ['Trang chi tiết VI có bảng Nên · Kiêng', (detailTxt.vi || '').includes('Nên') && (detailTxt.vi || '').includes('Kiêng')],
    ['Trang chi tiết EN có Favorable · Avoid', (detailTxt.en || '').includes('Favorable') && (detailTxt.en || '').includes('Avoid')],
  ];

  // ── 11. Thu tu man He lich + bo nhan dien (favicon, og) ────────────────
  // Chu Duyet chot thu tu: Phat giao, Lich Tang, Mat trang, Hoang dao, Vu tru.
  const hub = await page.evaluate(() => {
    setLang('vi'); setMain(2);
    return [...document.querySelectorAll('.explist .enm')].map(e => e.innerText.trim());
  });
  await page.waitForTimeout(200);
  const wantHub = ['Phật giáo', 'Lịch Tạng', 'Mặt trăng', 'Hoàng đạo', 'Vũ trụ'];
  const headHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8').slice(0, 4000);
  const brandFiles = ['favicon.svg', 'favicon-32.png', 'og.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
  const missFiles = brandFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  const swTxt = fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8');
  const brandSpecs = [
    [`Hệ lịch đúng thứ tự (${hub.join(' · ')})`, JSON.stringify(hub) === JSON.stringify(wantHub)],
    ['Hết chữ "Hoàng đạo Tây"', !vi.includes('Hoàng đạo Tây')],
    [`Đủ file nhận diện${missFiles.length ? ': thiếu ' + missFiles.join(', ') : ''}`, missFiles.length === 0],
    ['Head khai báo favicon SVG + PNG', /rel="icon" href="favicon\.svg"/.test(headHtml) && /favicon-32\.png/.test(headHtml)],
    ['Head có og:image + twitter:card', /og:image/.test(headHtml) && /twitter:card/.test(headHtml)],
    ['og:image khai báo đủ (type, kích thước, alt, image_src)',
      /og:image:type/.test(headHtml) && /og:image:width/.test(headHtml)
      && /og:image:alt/.test(headHtml) && /rel="image_src"/.test(headHtml)],
    ['og.png đúng 1200×630', (() => {
      const b = fs.readFileSync(path.join(process.cwd(), 'og.png'));
      return b.readUInt32BE(16) === 1200 && b.readUInt32BE(20) === 630;
    })()],
    ['sw.js cache luôn favicon', swTxt.includes('favicon.svg')],
  ];

  const okYear = yearName === 'Hỏa Ngựa';
  const okSpec = specs.every(([, ok]) => ok) && boardSpecs.every(([, ok]) => ok) && sharp.size === 0 && tabs.length === 0 && orphanTap.size === 0 && almSpecs.every(([, ok]) => ok) && brandSpecs.every(([, ok]) => ok);
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
  console.log('7. Bo tròn ............... ' + (sharp.size
    ? '✗ còn ' + sharp.size + ' chỗ nhọn:\n   ' + [...sharp].join('\n   ')
    : '✓ không còn ký tự nhọn ở nút, không còn nét cắt vuông'));
  console.log('8. Chuyển tab ............ ' + (tabs.length
    ? '✗ ' + tabs.length + '/35 sai:\n   ' + tabs.slice(0, 8).join('\n   ')
    : '✓ cả 35 trường hợp panel × tab đều chuyển đúng'));
  console.log('9. Luật chạm ............. ' + (orphanTap.size
    ? '✗ ' + orphanTap.size + ' mốc "còn/sau X ngày" chạm không đi đâu:\n   ' + [...orphanTap].slice(0, 8).join('\n   ')
    : '✓ mọi mốc "còn/sau X ngày" đều đi tiếp được'));
  console.log('10. Trạch nhật 28 tú · 12 trực:');
  for (const [label, ok, why] of almSpecs) console.log(`   ${ok ? '✓' : '✗'} ${label}` + (!ok && why ? ' — ' + why : ''));
  console.log('11. Hệ lịch · nhận diện:');
  for (const [label, ok] of brandSpecs) console.log(`   ${ok ? '✓' : '✗'} ${label}`);
  console.log('\n' + (pass ? '>>> ĐẠT — deploy được.' : '>>> HỎNG — KHÔNG deploy.'));

  await browser.close();
  server.close();
  process.exit(pass ? 0 : 1);
})();
