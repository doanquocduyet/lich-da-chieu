// Kiểm các trang tĩnh do seo/build.js sinh ra. Hỏng bất kỳ mục nào là exit 1.
//
//     node seo/check.js
//
// Đã thử bằng ca âm tính (làm hỏng trang có chủ đích, xem nó có báo không) —
// một bộ kiểm tra chỉ biết gật đầu thì tệ hơn không có.

const fs = require('fs');
const path = require('path');
const { extract } = require('./extract');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://duyet.online';
const GEN = ['ngay', 'thang', 'lich-am', 'lich-phat', 'lich-tang'];

const fails = [];
const bad = (group, msg) => fails.push(`[${group}] ${msg}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out); else if (e.name === 'index.html') out.push(f);
  }
  return out;
}
const pages = GEN.flatMap(d => fs.existsSync(path.join(ROOT, d)) ? walk(path.join(ROOT, d)) : []);
const urlOf = f => path.relative(ROOT, path.dirname(f)).split(path.sep).join('/') + '/';
const pick = (s, re) => { const m = s.match(re); return m ? m[1] : null; };

// ── 1. từng trang: thẻ đầu đủ và đúng ────────────────────────────────────────
const titles = new Map(), descs = new Map();
for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8'), u = urlOf(f);
  const title = pick(s, /<title>([^<]*)<\/title>/), desc = pick(s, /<meta name="description" content="([^"]*)"/);
  const canon = pick(s, /<link rel="canonical" href="([^"]*)"/);
  if (!/<html lang="vi">/.test(s)) bad('thẻ', `${u}: thiếu lang="vi"`);
  if (!title) bad('thẻ', `${u}: thiếu <title>`); else if (title.length > 75) bad('thẻ', `${u}: title ${title.length} ký tự (>75)`);
  if (!desc) bad('thẻ', `${u}: thiếu description`); else if (desc.length < 50 || desc.length > 165) bad('thẻ', `${u}: description ${desc.length} ký tự`);
  if (canon !== SITE + '/' + u) bad('thẻ', `${u}: canonical sai (${canon})`);
  const h1 = (s.match(/<h1>/g) || []).length; if (h1 !== 1) bad('thẻ', `${u}: ${h1} thẻ <h1>`);
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { bad('ld+json', `${u}: JSON-LD hỏng — ${e.message}`); }
  }
  if (/undefined|NaN|\[object Object\]|null<|>null/.test(s.replace(/<script[\s\S]*?<\/script>/g, ''))) bad('nội dung', `${u}: có chữ undefined/NaN/null lọt ra trang`);
  if (/\{UP\}/.test(s)) bad('nội dung', `${u}: còn sót ký hiệu {UP}`);
  if (title) titles.set(title, (titles.get(title) || []).concat(u));
  if (desc) descs.set(desc, (descs.get(desc) || []).concat(u));
}
for (const [t, us] of titles) if (us.length > 1) bad('trùng', `title trùng ở ${us.length} trang: "${t}"`);
for (const [d, us] of descs) if (us.length > 1) bad('trùng', `description trùng ở ${us.length} trang: ${us.slice(0, 3).join(', ')}`);

// ── 2. không link nội bộ nào chết ───────────────────────────────────────────
const exists = rel => {
  const p = path.join(ROOT, rel);
  return (fs.existsSync(p) && fs.statSync(p).isFile()) || fs.existsSync(path.join(p, 'index.html'));
};
let linkCount = 0;
for (const f of [...pages, path.join(ROOT, 'index.html')]) {
  const s = fs.readFileSync(f, 'utf8'), dir = path.dirname(f);
  for (const m of s.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|data:|\/\/)/.test(h)) continue;
    linkCount++;
    const target = path.relative(ROOT, path.resolve(dir, h.split('?')[0] || '.'));
    if (target.startsWith('..')) { bad('link', `${path.relative(ROOT, f)}: "${h}" trỏ ra ngoài gốc site`); continue; }
    if (!exists(target === '' ? '.' : target)) bad('link', `${path.relative(ROOT, f)}: "${h}" không tồn tại`);
  }
}

// ── 3. sitemap, robots, llms ────────────────────────────────────────────────
const sm = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8') : '';
const smUrls = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
if (!smUrls.size) bad('sitemap', 'không có sitemap.xml hoặc sitemap rỗng');
if (!smUrls.has(SITE + '/')) bad('sitemap', 'sitemap thiếu trang chủ');
for (const f of pages) if (!smUrls.has(SITE + '/' + urlOf(f))) bad('sitemap', `thiếu ${urlOf(f)}`);
for (const u of smUrls) if (!exists(u.slice(SITE.length + 1) || '.')) bad('sitemap', `${u} không có tệp`);
const robots = fs.existsSync(path.join(ROOT, 'robots.txt')) ? fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) bad('robots', 'robots.txt không trỏ tới sitemap');
if (/^Disallow:\s*\/\s*$/m.test(robots)) bad('robots', 'robots.txt đang chặn toàn site');
if (!fs.existsSync(path.join(ROOT, 'llms.txt'))) bad('llms', 'thiếu llms.txt');

// ── 4. trang chủ còn lớp SEO (bản build mới đè lên là mất) ───────────────────
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!/<link rel="canonical" href="https:\/\/duyet\.online\/">/.test(idx)) bad('trang chủ', 'thiếu canonical');
if (!/<title>[^<]*Lịch âm[^<]*<\/title>/.test(idx)) bad('trang chủ', 'title không có "Lịch âm"');
for (const u of ['lich-am/', 'lich-phat/', 'lich-tang/']) if (!idx.includes(`href="${u}"`)) bad('trang chủ', `không có link tĩnh tới ${u}`);
if (!/\?d=|\[\?&\]d=/.test(idx)) bad('trang chủ', 'thiếu liên kết sâu ?d=');

// ── 5. số liệu trên trang tĩnh == engine của app ────────────────────────────
// Bắt trường hợp index.html đổi thuật toán mà quên dựng lại trang tĩnh.
(async () => {
  const dayFiles = pages.filter(f => urlOf(f).startsWith('ngay/')).map(urlOf).sort();
  let checked = 0;
  if (dayFiles.length) {
    const years = [...new Set(dayFiles.map(u => +u.slice(5, 9)))];
    const data = await extract(ROOT, Math.min(...years), Math.max(...years));
    const byIso = new Map(data.days.map(x => [x.iso, x]));
    // mẫu cố định: cứ 23 ngày lấy một, cộng các ngày biên đã biết
    const sample = dayFiles.filter((_, i) => i % 23 === 0).map(u => u.slice(5, 15))
      .concat(['2026-02-17', '2026-09-10', '2026-09-25', '2027-02-06', '2025-07-25'].filter(i => byIso.has(i)));
    for (const iso of sample) {
      const x = byIso.get(iso), f = path.join(ROOT, 'ngay', iso, 'index.html');
      if (!x || !fs.existsSync(f)) { bad('số liệu', `${iso}: thiếu trang hoặc thiếu dữ liệu engine`); continue; }
      const s = fs.readFileSync(f, 'utf8');
      const need = [
        [`âm lịch ${x.lun.d}/${x.lun.m}`, `(${x.lun.d}/${x.lun.m}${x.lun.leap ? ' nhuận' : ''})`],
        ['Can Chi ngày', `<dt>Can Chi ngày</dt><dd>${x.cc.day}</dd>`],
        ['năm âm', `${x.cc.year} — năm con ${x.animal}`],
        ['tiết khí', `<dt>Tiết khí</dt><dd>${x.term}`],
        ['Phật lịch', `<dt>Phật lịch</dt><dd>${x.be}</dd>`],
      ];
      if (x.tib) need.push(['ngày Tạng', `ngày ${x.tib.d} tháng ${x.tib.monthName}`]);
      for (const [what, str] of need) if (!s.includes(str)) bad('số liệu', `${iso}: ${what} trên trang khác engine (cần "${str}")`);
      checked++;
    }
    // quy tắc lễ ngày 30 khi tháng thiếu — lỗi thật đã tìm ra 26/9/2026
    const dt = path.join(ROOT, 'ngay', '2026-09-10', 'index.html');
    if (fs.existsSync(dt) && !fs.readFileSync(dt, 'utf8').includes('Vía Địa Tạng'))
      bad('số liệu', '2026-09-10 (29/7 âm, tháng thiếu) phải có Vía Địa Tạng');
  }

  console.log(`Đã kiểm ${pages.length} trang tĩnh · ${linkCount} link nội bộ · sitemap ${smUrls.size} URL · đối chiếu engine ${checked} ngày.`);
  if (fails.length) {
    console.log(`\n>>> HỎNG — ${fails.length} lỗi:`); for (const f of fails.slice(0, 40)) console.log('  ✗ ' + f);
    if (fails.length > 40) console.log(`  … và ${fails.length - 40} lỗi nữa`);
    process.exit(1);
  }
  console.log('>>> ĐẠT.');
})().catch(e => { console.error(e); process.exit(1); });
