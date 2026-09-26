// Dựng các trang tĩnh cho công cụ tìm kiếm và công cụ trả lời AI.
//
//     node seo/build.js            # năm hiện tại -1 .. +1
//     node seo/build.js 2026       # neo vào năm 2026
//
// Vì sao cần: index.html vẽ mọi thứ bằng JavaScript. Bot không chạy JS — Bing,
// và gần như mọi bot AI (GPTBot, ClaudeBot, PerplexityBot) — đọc trang chủ chỉ
// thấy đúng 40 ký tự "☾ Lịch Đa Chiều VI EN". Các trang ở đây là HTML thuần,
// đọc được không cần JS, số liệu lấy từ CHÍNH engine của app (seo/extract.js).
//
// ĐẦU RA PHẢI XÁC ĐỊNH: không nhúng ngày giờ chạy build vào đâu cả. Dựng lại mà
// engine không đổi thì không đổi một byte — không sinh commit rác, không tốn lượt
// deploy Vercel (gói miễn phí đã từng chạm trần, 25/9/2026).

const fs = require('fs');
const path = require('path');
const { extract } = require('./extract');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://duyet.online';
const BRAND = 'Lịch Đa Chiều';
const GEN_DIRS = ['ngay', 'thang', 'lich-am', 'lich-phat', 'lich-tang'];

// ── tiện ích ────────────────────────────────────────────────────────────────
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const P = n => String(n).padStart(2, '0');
const [yOf, mOf, dOf] = [iso => +iso.slice(0, 4), iso => +iso.slice(5, 7), iso => +iso.slice(8, 10)];
const dmy = iso => `${dOf(iso)}/${mOf(iso)}/${yOf(iso)}`;
const dm = iso => `${dOf(iso)}/${mOf(iso)}`;
const DOW = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const DOW_S = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const lunDayName = d => d === 1 ? 'mùng Một' : d === 15 ? 'rằm' : d <= 10 ? 'mùng ' + d : 'ngày ' + d;
const lunMonthName = (m, leap) => (m === 1 ? 'tháng Giêng' : m === 12 ? 'tháng Chạp' : 'tháng ' + m) + (leap ? ' nhuận' : '');
const lunShort = l => `${l.d}/${l.m}${l.leap ? ' nhuận' : ''}`;
const pct = x => Math.round(x * 100);
const dec1 = x => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
// Câu mở đầu dựng từ dữ liệu ĐÃ SỬA, cùng giọng với dayInWords() của app. Không
// mượn thẳng câu của app: app so khớp lễ đúng ngày 30 nên tháng thiếu mất lễ, và
// câu của nó sẽ ghi "không có lễ" ngay trên trang đang ghi lễ (thấy ở 10/9/2026).
const leadSentence = (x, events) => {
  const l = x.lun, am = `${lunDayName(l.d)} ${lunMonthName(l.m, l.leap)} âm lịch`;
  return events.length ? `Ngày này là ${events.join(' · ')} — ${am}.` : `Ngày này không có lễ lớn nào — ${am}.`;
};
const dayUrl = iso => `ngay/${iso}/`;
const monthUrl = (y, m) => `thang/${y}-${P(m)}/`;

// ── khung trang ─────────────────────────────────────────────────────────────
// Link tương đối (up = "../" theo độ sâu) để chạy được cả ở duyet.online lẫn bản
// sao GitHub Pages dưới /lich-da-chieu/. canonical thì luôn là duyet.online.
function page({ url, title, desc, h1, crumbs, body, faq, extraHead = '', scripts = '' }) {
  const depth = url ? url.split('/').filter(Boolean).length : 0;
  const up = '../'.repeat(depth);
  const canon = SITE + '/' + url;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: BRAND, url: '' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + '/' + c.url })),
  }];
  if (faq && faq.length) ld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a } })),
  });
  const faqHtml = faq && faq.length ? `<section><h2>Hỏi nhanh</h2>${faq.map(([q, a]) =>
    `<details class="faq" open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>` : '';
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#FAF7F0">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${up}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${up}apple-touch-icon.png">
<link rel="stylesheet" href="${up}trang.css">
${extraHead}<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>
</head>
<body>
<header class="top"><a class="brand" href="${up}">☾ ${BRAND}</a>
<nav><a href="${up}lich-am/">Lịch âm</a><a href="${up}lich-phat/">Lịch Phật</a><a href="${up}lich-tang/">Lịch Tạng</a><a class="app" href="${up}">Mở ứng dụng</a></nav></header>
<main>
<nav class="crumbs" aria-label="Đường dẫn"><a href="${up}">${BRAND}</a>${crumbs.map((c, i) =>
    i === crumbs.length - 1 ? ` › <span>${esc(c.name)}</span>` : ` › <a href="${up}${c.url}">${esc(c.name)}</a>`).join('')}</nav>
<h1>${h1}</h1>
${body.replace(/\{UP\}/g, up)}
${faqHtml}
</main>
<footer><p><b>Nguồn tính toán.</b> Âm lịch &amp; Can Chi: thuật toán Hồ Ngọc Đức, múi giờ UTC+7. Tiết khí và pha Mặt Trăng: theo kinh độ Mặt Trời/Mặt Trăng (Jean Meeus, <i>Astronomical Algorithms</i>). Lịch Tạng: hệ Phugpa theo Svante Janson, thư viện mở <i>tibetan-date-calculator</i>. Phật lịch: quy ước phổ biến tại Việt Nam, năm dương lịch + 544.</p>
<p>Trang này sinh tự động từ chính bộ tính của ứng dụng ${BRAND}, không nhập tay. <a href="${up}">Mở ứng dụng</a> · <a href="${up}lich-am/">Lịch âm</a> · <a href="${up}lich-phat/">Lịch Phật</a> · <a href="${up}lich-tang/">Lịch Tạng</a></p></footer>
${scripts.replace(/\{UP\}/g, up)}</body>
</html>
`;
}

const table = (head, rows) => `<div class="tw"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
  rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const dl = pairs => `<dl class="kv">${pairs.filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const todayBox = kind => `<div class="today" id="homnay" data-kind="${kind}"><a href="{UP}">Xem lịch hôm nay trong ứng dụng</a></div>`;
const todayScript = `<script src="{UP}du-lieu-ngay.js" defer></script><script src="{UP}hom-nay.js" defer></script>`;

// ── trang NGÀY ──────────────────────────────────────────────────────────────
function dayPage(x, prev, next, names) {
  const l = x.lun, t = x.tib;
  const dow = DOW[x.dow], date = dmy(x.iso);
  const events = [x.cult, x.buddha && x.buddha !== x.cult ? x.buddha : null].filter(Boolean);
  const tibSpecial = t && t.special;
  const chayNames = x.chay.map(i => names.chay[i]);
  const lunTxt = `${lunDayName(l.d)} ${lunMonthName(l.m, l.leap)} năm ${x.cc.year}`;
  const tibTxt = t ? `ngày ${t.d} tháng ${t.monthName}${t.leap ? ' nhuận' : ''} năm ${t.y} (${t.yearName})` : 'chưa có dữ liệu';
  const title = `Âm lịch ${date} — ngày ${lunShort(l)} năm ${x.cc.year} | ${BRAND}`;
  let desc = `${dow} ${date} là ${lunTxt} (âm lịch), ngày ${x.cc.day}, tiết ${x.term}.`
    + (events.length ? ' ' + events.join(', ') + '.' : '')
    + (t ? ` Lịch Tạng: ${t.d}/${t.m}/${t.y} ${t.yearName}.` : '')
    + ` Phật lịch ${x.be}.`;
  if (desc.length > 160) desc = desc.slice(0, 157).replace(/\s+\S*$/, '') + '…';

  const faq = [
    [`Ngày ${date} là ngày bao nhiêu âm lịch?`,
      `${dow} ${date} là ${lunTxt} theo âm lịch Việt Nam; Can Chi ngày ${x.cc.day}, tháng ${x.cc.month}, năm ${x.cc.year}.`],
    [`Ngày ${date} có lễ gì?`,
      events.length || tibSpecial
        ? [events.length ? events.join(', ') + ' (âm lịch Việt Nam / Phật giáo).' : '', tibSpecial ? `Theo lịch Tạng: ${tibSpecial}.` : ''].filter(Boolean).join(' ')
        : `Không có lễ lớn nào trong âm lịch Việt Nam, lịch Phật giáo hay lịch Tạng vào ngày ${date}.`],
    [`Ngày ${date} có phải ngày chay không?`,
      chayNames.length ? `Có — là ngày chay theo ${chayNames.join(', ')} (${lunTxt}).`
        : `Không — ngày ${l.d} âm lịch không nằm trong Nhị trai, Tứ trai, Lục trai hay Thập trai.`],
  ];

  const tibFlags = t ? [
    (t.doubled || t.leapDay) ? 'Ngày Tạng số này lặp hai lần liên tiếp (ngày trùng).' : '',
    t.prevSkipped ? 'Ngày Tạng liền trước bị khuyết (ngày khuyết).' : '',
  ].filter(Boolean).join(' ') : '';

  const body = `
<p class="lead">${esc(leadSentence(x, events))}</p>
<div class="hero"><div><span class="big">${dOf(x.iso)}</span><span class="sub">${dow}<br>${mOf(x.iso)}/${yOf(x.iso)}</span></div>
<div><span class="big red">${l.d}</span><span class="sub">${esc(lunMonthName(l.m, l.leap))}<br>${esc(x.cc.year)}</span></div></div>
<p class="cta"><a class="btn" href="{UP}?d=${x.iso}">Mở ngày này trong ứng dụng</a></p>

<section><h2>Âm lịch &amp; Can Chi</h2>
${dl([
    ['Dương lịch', `${dow}, ${date}`],
    ['Âm lịch', esc(`${lunDayName(l.d)} ${lunMonthName(l.m, l.leap)} (${l.d}/${l.m}${l.leap ? ' nhuận' : ''}), tháng ${l.len === 30 ? 'đủ 30' : 'thiếu 29'} ngày`)],
    ['Năm âm lịch', esc(`${x.cc.year} — năm con ${x.animal}`)],
    ['Can Chi ngày', esc(x.cc.day)],
    ['Can Chi tháng', esc(x.cc.month)],
    ['Nạp âm ngày', esc(x.napam)],
    ['Tiết khí', esc(x.term) + (x.termStart ? ' <b>(bắt đầu hôm nay)</b>' : '')],
  ])}</section>

<section><h2>Lễ, Phật lịch &amp; ngày chay</h2>
${dl([
    ['Lễ trong ngày', events.length ? events.map(esc).join(' · ') : 'Không có lễ lớn'],
    ['Phật lịch', `${x.be}`],
    ['Ngày chay', chayNames.length ? esc(chayNames.join(' · ')) : 'Không phải ngày chay (theo Nhị, Tứ, Lục, Thập trai)'],
  ])}</section>

<section><h2>Lịch Tạng</h2>
${dl([
    ['Ngày Tạng', esc(tibTxt)],
    tibSpecial ? ['Ngày đặc biệt', esc(tibSpecial)] : null,
    tibFlags ? ['Ghi chú', esc(tibFlags)] : null,
  ])}</section>

<section><h2>Mặt Trăng</h2>
${dl([
    ['Pha trăng (12 giờ trưa)', esc(x.moon.name)],
    ['Độ sáng', pct(x.moon.illum) + '%'],
    ['Tuổi trăng', dec1(x.moon.age) + ' ngày'],
  ])}</section>

<section><h2>Theo sách lịch truyền thống</h2>
${dl([
    ['Hoàng đạo / Hắc đạo', `${x.hd.good ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'} (${esc(x.hd.god)})`],
    ['Trực', esc('Trực ' + x.truc)],
    ['Sao (28 tú)', esc(`Sao ${x.tu.name}`) + (x.tu.cat ? ' — sách lịch xếp là cát tú' : ' — sách lịch xếp là hung tú')],
  ])}
<p class="note">Đây là cách các sách lịch xưa xếp ngày, được thuật lại để tham khảo — không phải lời khuyên cho việc riêng của bạn.</p></section>

<nav class="pn">${prev ? `<a href="{UP}${dayUrl(prev.iso)}">‹ ${dmy(prev.iso)}</a>` : '<span></span>'}
<a href="{UP}${monthUrl(yOf(x.iso), mOf(x.iso))}">Cả tháng ${mOf(x.iso)}/${yOf(x.iso)}</a>
${next ? `<a href="{UP}${dayUrl(next.iso)}">${dmy(next.iso)} ›</a>` : '<span></span>'}</nav>`;

  return page({
    url: dayUrl(x.iso), title, desc,
    h1: `Âm lịch ngày ${esc(date)}`,
    crumbs: [{ name: 'Lịch âm', url: 'lich-am/' }, { name: `Tháng ${mOf(x.iso)}/${yOf(x.iso)}`, url: monthUrl(yOf(x.iso), mOf(x.iso)) },
      { name: date, url: dayUrl(x.iso) }],
    body, faq,
  });
}

// ── trang THÁNG ─────────────────────────────────────────────────────────────
function monthPage(y, m, mdays, prevYM, nextYM, names) {
  const first = mdays[0], lead = (first.dow + 6) % 7; // tuần bắt đầu thứ Hai
  let cells = Array(lead).fill('<td class="e"></td>');
  for (const x of mdays) {
    const l = x.lun, ev = x.cult || x.buddha || (x.tib && x.tib.duchen && x.tib.special);
    const lt = l.d === 1 ? `${l.d}/${l.m}${l.leap ? 'n' : ''}` : l.d;
    cells.push(`<td class="${l.d === 1 || l.d === 15 ? 'k ' : ''}${ev ? 'ev' : ''}"><a href="{UP}${dayUrl(x.iso)}" title="${esc(`${dmy(x.iso)} — âm ${lunShort(l)}${ev ? ' · ' + ev : ''}`)}"><b>${dOf(x.iso)}</b><small>${lt}</small></a></td>`);
  }
  while (cells.length % 7) cells.push('<td class="e"></td>');
  const rows = []; for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  const grid = `<div class="tw"><table class="grid"><thead><tr>${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

  const evRows = mdays.filter(x => x.cult || x.buddha).map(x =>
    [`<a href="{UP}${dayUrl(x.iso)}">${DOW_S[x.dow]} ${dm(x.iso)}</a>`, esc(lunShort(x.lun)),
      esc([x.cult, x.buddha !== x.cult ? x.buddha : null].filter(Boolean).join(' · '))]);
  const keyRows = mdays.filter(x => x.lun.d === 1 || x.lun.d === 15).map(x =>
    [`<a href="{UP}${dayUrl(x.iso)}">${DOW_S[x.dow]} ${dm(x.iso)}</a>`, x.lun.d === 1 ? 'Mùng Một' : 'Rằm', esc(lunMonthName(x.lun.m, x.lun.leap))]);
  const termRows = mdays.filter(x => x.termStart).map(x => [`<a href="{UP}${dayUrl(x.iso)}">${dm(x.iso)}</a>`, esc(x.term)]);
  const chay = mdays.filter(x => x.chay.includes(3)).map(x => `<a href="{UP}${dayUrl(x.iso)}">${dm(x.iso)}</a>`);
  const tibRows = mdays.filter(x => x.tib && x.tib.special).map(x =>
    [`<a href="{UP}${dayUrl(x.iso)}">${DOW_S[x.dow]} ${dm(x.iso)}</a>`, `${x.tib.d}/${x.tib.m}`, esc(x.tib.special)]);

  const lf = first.lun, ll = mdays[mdays.length - 1].lun;
  const faq = [
    [`Tháng ${m}/${y} dương lịch ứng với tháng mấy âm lịch?`,
      `Từ ${dm(first.iso)} (${lunShort(lf)} âm) đến ${dm(mdays[mdays.length - 1].iso)} (${lunShort(ll)} âm), năm ${first.cc.year}${first.cc.year !== mdays[mdays.length - 1].cc.year ? '/' + mdays[mdays.length - 1].cc.year : ''}.`],
    keyRows.length ? [`Rằm và mùng Một trong tháng ${m}/${y} là ngày nào?`,
      keyRows.map(r => `${r[1]} ${r[2]}: ${r[0].replace(/<[^>]+>/g, '')}`).join('; ') + '.'] : null,
  ].filter(Boolean);

  const body = `
<p class="lead">Lịch vạn niên tháng ${m} năm ${y}: ngày dương lịch kèm ngày âm lịch, lễ, rằm, mùng Một, tiết khí, ngày chay và ngày đặc biệt của lịch Tạng. Chạm vào một ngày để xem đầy đủ.</p>
${grid}
<p class="note">Số nhỏ là ngày âm lịch; "1/8" đánh dấu mùng Một của tháng âm mới.</p>
${evRows.length ? `<section><h2>Ngày lễ trong tháng ${m}/${y}</h2>${table(['Ngày', 'Âm lịch', 'Lễ'], evRows)}</section>` : ''}
${keyRows.length ? `<section><h2>Rằm &amp; mùng Một</h2>${table(['Ngày', '', 'Tháng âm'], keyRows)}</section>` : ''}
${termRows.length ? `<section><h2>Tiết khí bắt đầu trong tháng</h2>${table(['Ngày', 'Tiết khí'], termRows)}</section>` : ''}
${chay.length ? `<section><h2>Ngày chay (Thập trai)</h2><p>${chay.join(' · ')}</p></section>` : ''}
${tibRows.length ? `<section><h2>Lịch Tạng trong tháng</h2>${table(['Ngày', 'Ngày Tạng', ''], tibRows)}</section>` : ''}
<nav class="pn">${prevYM ? `<a href="{UP}${monthUrl(prevYM[0], prevYM[1])}">‹ Tháng ${prevYM[1]}/${prevYM[0]}</a>` : '<span></span>'}
<a href="{UP}lich-am/">Cả năm</a>
${nextYM ? `<a href="{UP}${monthUrl(nextYM[0], nextYM[1])}">Tháng ${nextYM[1]}/${nextYM[0]} ›</a>` : '<span></span>'}</nav>`;

  return page({
    url: monthUrl(y, m),
    title: `Lịch âm tháng ${m}/${y} — lịch vạn niên tháng ${m} năm ${y} | ${BRAND}`,
    desc: `Lịch âm tháng ${m} năm ${y}: âm lịch từng ngày (${lunShort(lf)} → ${lunShort(ll)} âm), ngày lễ, rằm, mùng Một, tiết khí, ngày chay và lịch Tạng.`,
    h1: `Lịch âm tháng ${m} năm ${y}`,
    crumbs: [{ name: 'Lịch âm', url: 'lich-am/' }, { name: `Tháng ${m}/${y}`, url: monthUrl(y, m) }],
    body, faq,
  });
}

// ── gom theo năm ────────────────────────────────────────────────────────────
function monthCards(days, y) {
  const out = [];
  for (let m = 1; m <= 12; m++) {
    const md = days.filter(x => yOf(x.iso) === y && mOf(x.iso) === m);
    if (!md.length) continue;
    out.push(`<a class="mc" href="{UP}${monthUrl(y, m)}"><b>Tháng ${m}</b><small>âm ${lunShort(md[0].lun)} → ${lunShort(md[md.length - 1].lun)}</small></a>`);
  }
  return `<div class="months">${out.join('')}</div>`;
}
const linkDay = x => `<a href="{UP}${dayUrl(x.iso)}">${DOW_S[x.dow]} ${dmy(x.iso)}</a>`;

// ── trang LỊCH ÂM ───────────────────────────────────────────────────────────
function lichAm(days, Y) {
  const years = [Y, Y + 1];
  const evTable = y => table(['Lễ', 'Âm lịch', `Dương lịch ${y}`],
    days.filter(x => yOf(x.iso) === y && x.cult).map(x => [esc(x.cult), esc(lunShort(x.lun)), linkDay(x)]));
  const termTable = y => table(['Tiết khí', 'Bắt đầu'],
    days.filter(x => yOf(x.iso) === y && x.termStart).map(x => [esc(x.term), linkDay(x)]));
  const tet = y => days.find(x => yOf(x.iso) === y && x.lun.d === 1 && x.lun.m === 1 && !x.lun.leap);
  const trungthu = y => days.find(x => yOf(x.iso) === y && x.lun.d === 15 && x.lun.m === 8 && !x.lun.leap);
  const leapMonths = [...new Set(days.filter(x => x.lun.leap).map(x => `${x.lun.y}:${x.lun.m}`))].map(s => s.split(':').map(Number));
  const cy = y => days.find(x => yOf(x.iso) === y && mOf(x.iso) === 7);
  const faq = [
    ...years.map(y => tet(y) && [`Tết Nguyên Đán ${y} là ngày nào?`,
      `Tết Nguyên Đán ${y} (mùng Một tháng Giêng năm ${tet(y).cc.year}) rơi vào ${DOW[tet(y).dow]}, ngày ${dmy(tet(y).iso)}.`]),
    [`Năm ${Y} là năm con gì?`, `Năm ${Y} là năm ${cy(Y).cc.year} (con ${cy(Y).animal}) theo âm lịch, tính từ Tết ${tet(Y) ? dmy(tet(Y).iso) : ''}.`],
    trungthu(Y) && [`Tết Trung Thu ${Y} là ngày nào?`, `Rằm tháng Tám năm ${Y} — Tết Trung Thu — là ${DOW[trungthu(Y).dow]}, ${dmy(trungthu(Y).iso)}.`],
    leapMonths.length ? ['Năm nào có tháng nhuận?', leapMonths.map(([y, m]) => `Năm âm lịch ${y} có ${lunMonthName(m, true)}`).join('; ') + ' (trong khoảng năm trang này bao phủ).'] : null,
  ].filter(Boolean);
  const body = `
${todayBox('am')}
<p class="lead">Âm lịch Việt Nam tra theo từng ngày, tháng, năm: ngày âm, Can Chi, tiết khí, ngày lễ và rằm, mùng Một. Số liệu tính theo múi giờ Hà Nội (UTC+7) — vì vậy có năm lệch lịch Trung Quốc một ngày, như Tết 1985.</p>
${years.map(y => `<section><h2>Lịch âm ${y} theo tháng</h2>${monthCards(days, y)}</section>`).join('')}
${years.map(y => `<section><h2>Các ngày lễ âm lịch năm ${y}</h2>${evTable(y)}</section>`).join('')}
<section><h2>24 tiết khí năm ${Y}</h2>${termTable(Y)}</section>
<section><h2>Âm lịch Việt Nam được tính thế nào</h2>
<p>Mỗi tháng âm bắt đầu vào ngày có trăng mới (sóc) theo giờ Việt Nam. Tháng có 29 hoặc 30 ngày tùy khoảng cách giữa hai lần trăng mới. Năm âm có 12 tháng, hoặc 13 tháng khi có tháng nhuận — tháng nhuận là tháng không chứa trung khí nào. Can Chi ngày, tháng, năm chạy theo vòng 60.</p>
<p>Các trang ngày và tháng ở đây được sinh từ cùng một bộ tính với ứng dụng ${BRAND}, dùng thuật toán của Hồ Ngọc Đức — thuật toán âm lịch Việt Nam được dùng rộng rãi nhất.</p></section>`;
  return page({
    url: 'lich-am/',
    title: `Lịch âm hôm nay — Lịch âm ${Y}, ${Y + 1} đầy đủ | ${BRAND}`,
    desc: `Xem lịch âm hôm nay và âm lịch ${Y}, ${Y + 1} theo từng ngày: Can Chi, tiết khí, ngày lễ, rằm, mùng Một. Tính theo giờ Việt Nam, thuật toán Hồ Ngọc Đức.`,
    h1: `Lịch âm hôm nay — Lịch âm ${Y}, ${Y + 1}`,
    crumbs: [{ name: 'Lịch âm', url: 'lich-am/' }],
    body, faq, scripts: todayScript,
  });
}

// ── trang LỊCH PHẬT ─────────────────────────────────────────────────────────
function lichPhat(days, Y, names) {
  const years = [Y, Y + 1];
  const evTable = y => table(['Ngày vía / lễ', 'Âm lịch', `Dương lịch ${y}`],
    days.filter(x => yOf(x.iso) === y && x.buddha).map(x => [esc(x.buddha), esc(lunShort(x.lun)), linkDay(x)]));
  // Rằm & mùng Một theo tháng âm của năm âm Y
  const byLunMonth = y => {
    const rows = [], seen = new Map();
    for (const x of days) if (x.lun.y === y && (x.lun.d === 1 || x.lun.d === 15)) {
      const k = x.lun.m + (x.lun.leap ? 'n' : '');
      if (!seen.has(k)) { seen.set(k, [esc(lunMonthName(x.lun.m, x.lun.leap)), '', '']); rows.push(seen.get(k)); }
      seen.get(k)[x.lun.d === 1 ? 1 : 2] = linkDay(x);
    }
    return rows;
  };
  const chayTable = y => {
    const rows = new Map();
    for (const x of days) if (x.lun.y === y && x.chay.includes(3)) {
      const k = x.lun.m + (x.lun.leap ? 'n' : '');
      if (!rows.has(k)) rows.set(k, [esc(lunMonthName(x.lun.m, x.lun.leap)), []]);
      rows.get(k)[1].push(`<a href="{UP}${dayUrl(x.iso)}">${dm(x.iso)}</a>`);
    }
    return table(['Tháng âm', 'Ngày chay Thập trai (dương lịch)'], [...rows.values()].map(([a, b]) => [a, b.join(' · ')]));
  };
  const find = (y, name) => days.find(x => yOf(x.iso) === y && x.buddha && x.buddha.indexOf(name) >= 0);
  const vulan = find(Y, 'Vu Lan'), dan = find(Y, 'Đản') , dan1 = find(Y + 1, 'Đản');
  const faq = [
    [`Phật lịch năm ${Y} là bao nhiêu?`, `Năm ${Y} là Phật lịch ${Y + 544}, theo quy ước phổ biến tại Việt Nam (năm dương lịch + 544). Thái Lan và Myanmar dùng +543, nên ghi ${Y + 543}.`],
    vulan && [`Lễ Vu Lan ${Y} vào ngày nào?`, `Rằm tháng Bảy âm lịch — ${DOW[vulan.dow]}, ${dmy(vulan.iso)}.`],
    dan && [`Lễ Phật Đản ${Y} vào ngày nào?`, `${dan.buddha}: ${DOW[dan.dow]}, ${dmy(dan.iso)} (${lunShort(dan.lun)} âm lịch).`],
    dan1 && [`Lễ Phật Đản ${Y + 1} vào ngày nào?`, `${dan1.buddha}: ${DOW[dan1.dow]}, ${dmy(dan1.iso)} (${lunShort(dan1.lun)} âm lịch).`],
    ['Thập trai là những ngày nào?', 'Thập trai là mười ngày chay mỗi tháng âm lịch: mùng 1, 8, 14, 15, 18, 23, 24, 28, 29 và 30. Tháng thiếu (29 ngày) thì ngày 29 thay cho ngày 30.'],
    ['Nhị trai, Tứ trai, Lục trai là gì?', 'Nhị trai: mùng 1 và rằm. Tứ trai: mùng 1, 14, 15, 30. Lục trai: mùng 8, 14, 15, 23, 29, 30. Tháng thiếu thì ngày cuối tháng thay cho ngày 30.'],
  ].filter(Boolean);
  const body = `
${todayBox('phat')}
<p class="lead">Lịch Phật giáo năm ${Y} (Phật lịch ${Y + 544}): các ngày vía và lễ lớn, rằm và mùng Một từng tháng, ngày chay Thập trai — đổi sẵn ra dương lịch.</p>
${years.map(y => `<section><h2>Ngày vía &amp; lễ Phật giáo năm ${y}</h2>${evTable(y)}</section>`).join('')}
<section><h2>Rằm &amp; mùng Một năm âm lịch ${Y}</h2>${table(['Tháng âm', 'Mùng Một', 'Rằm'], byLunMonth(Y))}</section>
${years.map(y => `<section><h2>Ngày chay Thập trai năm âm lịch ${y}</h2>${chayTable(y)}</section>`).join('')}
<section><h2>Về Phật lịch</h2>
<p>Phật lịch đếm năm kể từ khi Đức Phật nhập Niết bàn. Tại Việt Nam, quy ước phổ biến là lấy năm dương lịch cộng 544; Thái Lan và Myanmar cộng 543. Các ngày vía, lễ và ngày chay đều theo âm lịch, nên mỗi năm rơi vào một ngày dương lịch khác nhau.</p>
<p>Danh sách ngày vía ở đây theo truyền thống Phật giáo Bắc truyền phổ biến tại Việt Nam; một số chùa và truyền thống khác có thể ghi khác.</p></section>`;
  return page({
    url: 'lich-phat/',
    title: `Lịch Phật giáo ${Y} — ngày vía, rằm, mùng Một, ngày chay | ${BRAND}`,
    desc: `Lịch Phật giáo ${Y}, Phật lịch ${Y + 544}: ngày vía và lễ lớn, rằm, mùng Một, ngày chay Thập trai từng tháng — đổi sẵn ra dương lịch.`,
    h1: `Lịch Phật giáo ${Y} — Phật lịch ${Y + 544}`,
    crumbs: [{ name: 'Lịch Phật', url: 'lich-phat/' }],
    body, faq, scripts: todayScript,
  });
}

// ── trang LỊCH TẠNG ─────────────────────────────────────────────────────────
function lichTang(days, duchen, Y, names) {
  const inRange = x => x.iso >= days[0].iso && x.iso <= days[days.length - 1].iso;
  const dd = duchen.filter(inRange);
  const byIso = new Map(days.map(x => [x.iso, x]));
  const tibYears = [...new Set(dd.map(x => x.tibYear))].sort();
  const duRows = dd.filter(x => yOf(x.iso) >= Y).map(x => {
    const day = byIso.get(x.iso);
    return [esc(x.name), `năm ${x.tibYear}`, day ? linkDay(day) : esc(dmy(x.iso)) + (x.skipped ? ' *' : '')];
  });
  // mùng Một từng tháng Tạng (ngày đầu tiên của mỗi tháng trong dải ngày)
  const starts = [];
  for (let i = 1; i < days.length; i++) {
    const a = days[i - 1].tib, b = days[i].tib;
    if (a && b && (a.m !== b.m || a.leap !== b.leap || a.y !== b.y) && yOf(days[i].iso) >= Y && yOf(days[i].iso) <= Y + 1)
      starts.push([`tháng ${esc(b.monthName)}${b.leap ? ' nhuận' : ''} năm ${b.y}`, linkDay(days[i]), `${b.d}/${b.m}`]);
  }
  const practice = Object.entries(names.drukDays).map(([d, n]) => `<li><b>Ngày ${d}</b> — ${esc(n)}</li>`).join('');
  const odd = days.filter(x => yOf(x.iso) === Y && x.tib && (x.tib.doubled || x.tib.leapDay || x.tib.prevSkipped))
    .map(x => [linkDay(x), `${x.tib.d}/${x.tib.m}`, (x.tib.doubled || x.tib.leapDay) ? 'ngày trùng' : 'ngày ngay sau một ngày khuyết']);
  const losar = y => dd.find(x => x.key === 'losar' && yOf(x.iso) === y);
  const cur = days.find(x => x.iso === `${Y}-07-01`);
  const nextYearName = (() => { const l = losar(Y + 1); const x = l && byIso.get(l.iso); return x && x.tib ? x.tib.yearName : null; })();
  const faq = [
    losar(Y) && [`Losar ${Y} (Tết Tạng) là ngày nào?`, `Losar — năm mới Tạng ${losar(Y).tibYear} — rơi vào ${dmy(losar(Y).iso)} theo hệ Phugpa.`],
    losar(Y + 1) && [`Losar ${Y + 1} là ngày nào?`, `Losar năm Tạng ${losar(Y + 1).tibYear}${nextYearName ? ' (' + nextYearName + ')' : ''} rơi vào ${dmy(losar(Y + 1).iso)} theo hệ Phugpa.`],
    cur && cur.tib && [`Năm ${Y} là năm gì theo lịch Tạng?`, `Phần lớn năm ${Y} thuộc năm Tạng ${cur.tib.y} — năm ${cur.tib.yearName}.`],
    ...['duchen2', 'duchen3', 'duchen4', 'duchen1'].map(k => {
      const x = dd.find(e => e.key === k && yOf(e.iso) === Y);
      return x && [`${x.name.split(' — ')[0]} ${Y} là ngày nào?`, `${x.name} năm ${Y} rơi vào ${dmy(x.iso)} (hệ Phugpa).`];
    }),
    ['Vì sao ngày lễ Tạng ở các nguồn đôi khi lệch nhau một ngày?',
      'Lịch Tạng có nhiều hệ tính (Phugpa, Tsurphu, và lịch của Men-Tsee-Khang) và có ngày khuyết, ngày trùng. Trang này dùng hệ Phugpa theo thuật toán của Svante Janson; hãy đối chiếu với lịch của truyền thống bạn theo cho các ngày quan trọng.'],
  ].filter(Boolean);
  const body = `
${todayBox('tang')}
<p class="lead">Lịch Tạng (Tây Tạng) năm ${Y} – ${Y + 1} theo hệ Phugpa: Losar, bốn ngày Düchen, mùng Một từng tháng Tạng, ngày thực hành hằng tháng, ngày khuyết và ngày trùng — đổi sẵn ra dương lịch.</p>
<section><h2>Losar &amp; bốn ngày Düchen</h2>${table(['Lễ', 'Năm Tạng', 'Dương lịch'], duRows)}
${dd.some(x => x.skipped) ? '<p class="note">* Ngày Tạng này bị khuyết trong năm đó.</p>' : ''}</section>
<section><h2>Ngày thực hành hằng tháng</h2><ul class="plain">${practice}</ul>
<p>Các ngày này lặp lại mỗi tháng Tạng; xem ngày dương lịch cụ thể trong <a href="{UP}${monthUrl(Y, 1)}">lịch từng tháng</a>.</p></section>
<section><h2>Mùng Một các tháng Tạng ${Y} – ${Y + 1}</h2>${table(['Tháng Tạng', 'Bắt đầu (dương lịch)', 'Ngày Tạng'], starts)}</section>
${odd.length ? `<section><h2>Ngày khuyết &amp; ngày trùng năm ${Y}</h2>${table(['Dương lịch', 'Ngày Tạng', ''], odd)}
<p class="note">Lịch Tạng khớp ngày theo chuyển động Mặt Trăng, nên có ngày số bị bỏ qua (khuyết) và có ngày số lặp lại hai lần (trùng).</p></section>` : ''}
<section><h2>Về lịch Tạng hệ Phugpa</h2>
<p>Lịch Tạng là âm dương lịch: tháng theo Mặt Trăng, năm gọi theo ngũ hành và 12 con giáp, đếm năm từ năm 127 trước Công nguyên. Phugpa là hệ được dùng rộng rãi nhất, gồm cả Men-Tsee-Khang (Dharamsala) — dù đôi khi hai nguồn vẫn ghi lệch một ngày.</p>
<p>Ngày ở đây tính bằng thuật toán Phugpa đầy đủ theo nghiên cứu của Svante Janson (<i>Tibetan calendar mathematics</i>), qua thư viện mở <i>tibetan-date-calculator</i>.</p></section>`;
  return page({
    url: 'lich-tang/',
    title: `Lịch Tạng ${Y} – ${Y + 1}: Losar, Saga Dawa, Düchen | ${BRAND}`,
    desc: `Lịch Tạng ${Y} – ${Y + 1} hệ Phugpa: Losar, Saga Dawa, Chökhor và Lhabab Düchen, mùng Một từng tháng Tạng, ngày khuyết, ngày trùng — đổi ra dương lịch.`,
    h1: `Lịch Tạng ${Y} – ${Y + 1} (hệ Phugpa)`,
    crumbs: [{ name: 'Lịch Tạng', url: 'lich-tang/' }],
    body, faq, scripts: todayScript,
  });
}

// ── tệp phụ ─────────────────────────────────────────────────────────────────
const CSS = `:root{--bg:#FAF7F0;--ink:#1C1B18;--mut:#6E6A5E;--red:#B03A30;--bd:#EDE6D8;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#171513;--ink:#EDE8DF;--mut:#A39C8E;--red:#E07A6E;--bd:#35302A;--card:#1F1C19}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
a{color:var(--red);text-underline-offset:2px}
.top{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;max-width:760px;margin:0 auto;padding:14px 16px}
.brand{font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:13px;color:var(--ink);text-decoration:none}
.top nav{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:14px}.top nav a{text-decoration:none}
.top nav .app{background:var(--red);color:#fff;padding:5px 12px;border-radius:999px}
main{max-width:760px;margin:0 auto;padding:4px 16px 32px}
.crumbs{font-size:13px;color:var(--mut)}.crumbs a{color:var(--mut)}
h1{font-size:clamp(24px,5vw,32px);line-height:1.2;margin:10px 0 8px}
h2{font-size:18px;margin:28px 0 10px;padding-top:14px;border-top:1px solid var(--bd)}
.lead{font-size:17px}.note{font-size:13px;color:var(--mut)}
.hero{display:flex;gap:12px;margin:16px 0}.hero>div{flex:1;background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:14px 16px;display:flex;align-items:center;gap:12px}
.big{font-size:52px;font-weight:800;line-height:1;font-family:ui-rounded,-apple-system,system-ui,sans-serif;font-variant-numeric:tabular-nums}.red{color:var(--red)}.sub{font-size:14px;color:var(--mut);white-space:nowrap}
.cta{margin:8px 0 4px}.btn{display:inline-block;background:var(--red);color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600}
.kv{display:grid;grid-template-columns:minmax(120px,38%) 1fr;gap:0;margin:0;background:var(--card);border:1px solid var(--bd);border-radius:14px;overflow:hidden}
.kv dt,.kv dd{margin:0;padding:9px 14px;border-top:1px solid var(--bd)}.kv dt{color:var(--mut)}.kv dt:first-of-type,.kv dt:first-of-type+dd{border-top:0}
.tw{overflow-x:auto;background:var(--card);border:1px solid var(--bd);border-radius:14px}
table{border-collapse:collapse;width:100%;font-size:15px}th,td{padding:8px 12px;text-align:left;border-top:1px solid var(--bd);vertical-align:top}thead th{border-top:0;color:var(--mut);font-weight:600;font-size:13px}
.grid th,.grid td{text-align:center;padding:4px 2px}.grid td a{display:block;text-decoration:none;color:var(--ink);padding:6px 0;border-radius:10px}
.grid td b{display:block;font-size:17px;font-variant-numeric:tabular-nums}.grid td small{color:var(--mut);font-size:12px}
.grid td.k small{color:var(--red);font-weight:700}.grid td.ev a{background:rgba(176,58,48,.09)}.grid td.e{border-top:1px solid var(--bd)}
.months{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.mc{display:block;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:10px 12px;text-decoration:none;color:var(--ink)}.mc small{display:block;color:var(--mut)}
.pn{display:flex;justify-content:space-between;gap:10px;margin:28px 0 0;font-size:15px}
.faq{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:10px 14px;margin:8px 0}.faq summary{font-weight:600;cursor:pointer}.faq p{margin:6px 0 0}
.plain{padding-left:18px}
.today{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:14px 16px;margin:12px 0}.today b{color:var(--red)}
footer{max-width:760px;margin:0 auto;padding:18px 16px 40px;font-size:13px;color:var(--mut);border-top:1px solid var(--bd)}
`;

// Ô "hôm nay" trên ba trang lớn: HTML tĩnh không biết hôm nay là ngày nào (và
// không được biết — xem đầu tệp), nên ô này do trình duyệt tự điền lúc mở trang.
const HOMNAY_JS = `(function(){var el=document.getElementById('homnay'),D=window.LDC_DAYS;if(!el||!D)return;
var n=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Ho_Chi_Minh'})),p=function(x){return(x<10?'0':'')+x},
iso=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate()),r=D[iso];if(!r)return;
var up=el.querySelector('a').getAttribute('href'),k=el.getAttribute('data-kind'),
h='<b>Hôm nay</b> '+n.getDate()+'/'+(n.getMonth()+1)+'/'+n.getFullYear()+' · ';
if(k==='tang')h+='lịch Tạng '+r[3]+(r[4]?' · <b>'+r[4]+'</b>':'');
else if(k==='phat')h+='âm lịch '+r[0]+' · Phật lịch '+r[6]+(r[2]?' · <b>'+r[2]+'</b>':'')+(r[5]?' · ngày chay '+r[5]:'');
else h+='âm lịch '+r[0]+' năm '+r[7]+' · ngày '+r[1]+(r[2]?' · <b>'+r[2]+'</b>':'');
el.innerHTML=h+'<br><a href="'+up+'ngay/'+iso+'/">Xem đầy đủ ngày hôm nay</a> · <a href="'+up+'?d='+iso+'">Mở trong ứng dụng</a>';})();
`;

function llms(Y, days) {
  return `# ${BRAND}

> Ứng dụng lịch miễn phí, chạy offline trên trình duyệt: âm lịch Việt Nam & Can Chi, lịch Phật giáo (Phật lịch, ngày vía, ngày chay), lịch Tạng hệ Phugpa (Losar, Düchen), tiết khí và pha Mặt Trăng — cùng một ngày nhìn qua nhiều hệ lịch.

Mọi số liệu trên các trang dưới đây sinh tự động từ cùng một bộ tính với ứng dụng, không nhập tay.

## Trang chính
- [Ứng dụng](${SITE}/): mở một ngày bất kỳ bằng ${SITE}/?d=YYYY-MM-DD
- [Lịch âm hôm nay, lịch âm ${Y}–${Y + 1}](${SITE}/lich-am/): ngày lễ âm lịch, 24 tiết khí, lịch từng tháng
- [Lịch Phật giáo ${Y}](${SITE}/lich-phat/): Phật lịch ${Y + 544}, ngày vía, rằm, mùng Một, ngày chay Thập trai
- [Lịch Tạng ${Y}–${Y + 1}](${SITE}/lich-tang/): Losar, bốn ngày Düchen, mùng Một từng tháng Tạng, ngày khuyết và ngày trùng

## Tra một ngày
- Mỗi ngày từ ${days[0].iso} đến ${days[days.length - 1].iso} có một trang: ${SITE}/ngay/YYYY-MM-DD/ — âm lịch, Can Chi ngày/tháng/năm, nạp âm, tiết khí, lễ, ngày chay, Phật lịch, ngày Tạng, pha trăng và độ sáng.
- Mỗi tháng có một trang: ${SITE}/thang/YYYY-MM/

## Phương pháp & nguồn
- Âm lịch & Can Chi: thuật toán Hồ Ngọc Đức, múi giờ UTC+7 (có năm lệch lịch Trung Quốc một ngày).
- Tiết khí, pha Mặt Trăng: Jean Meeus, Astronomical Algorithms.
- Lịch Tạng: hệ Phugpa, Svante Janson "Tibetan calendar mathematics", thư viện mở tibetan-date-calculator. Các hệ khác (Tsurphu, Men-Tsee-Khang) đôi khi lệch một ngày.
- Phật lịch: quy ước tại Việt Nam = năm dương lịch + 544 (Thái Lan, Myanmar: +543).
- Hoàng đạo, trực, 28 tú: thuật lại cách sách lịch truyền thống xếp ngày, không phải lời khuyên cá nhân.
`;
}

// ── chạy ────────────────────────────────────────────────────────────────────
async function main() {
  const Y = +process.argv[2] || +new Date().toLocaleString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 4);
  const data = await extract(ROOT, Y - 1, Y + 1);
  const days = data.days;

  for (const d of GEN_DIRS) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
  const out = (rel, s) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
  const urls = ['', 'lich-am/', 'lich-phat/', 'lich-tang/'];

  days.forEach((x, i) => { out(dayUrl(x.iso) + 'index.html', dayPage(x, days[i - 1], days[i + 1], data.names)); urls.push(dayUrl(x.iso)); });
  const months = [];
  for (let y = Y - 1; y <= Y + 1; y++) for (let m = 1; m <= 12; m++) months.push([y, m]);
  months.forEach(([y, m], i) => {
    const md = days.filter(x => yOf(x.iso) === y && mOf(x.iso) === m);
    out(monthUrl(y, m) + 'index.html', monthPage(y, m, md, months[i - 1], months[i + 1], data.names));
    urls.push(monthUrl(y, m));
  });
  out('lich-am/index.html', lichAm(days, Y));
  out('lich-phat/index.html', lichPhat(days, Y, data.names));
  out('lich-tang/index.html', lichTang(days, data.duchen, Y, data.names));

  out('trang.css', CSS);
  out('hom-nay.js', HOMNAY_JS);
  const map = {};
  for (const x of days) map[x.iso] = [lunShort(x.lun), x.cc.day, x.cult || x.buddha || '',
    x.tib ? `${x.tib.d}/${x.tib.m}/${x.tib.y}` : '', x.tib && x.tib.special || '',
    x.chay.includes(3) ? 'Thập trai' : '', x.be, x.cc.year];
  out('du-lieu-ngay.js', '// Sinh bởi seo/build.js — dữ liệu cho ô "hôm nay" trên các trang lịch.\nwindow.LDC_DAYS=' + JSON.stringify(map) + ';\n');
  out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    urls.map(u => `<url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  out('robots.txt', `# ${BRAND} — mọi công cụ tìm kiếm và công cụ trả lời AI đều được chào đón.\nUser-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  out('llms.txt', llms(Y, days));

  console.log(`Đã dựng: ${days.length} trang ngày · ${months.length} trang tháng · 3 trang chủ đề · sitemap ${urls.length} URL (năm ${Y - 1}–${Y + 1})`);
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
