/**
 * Builds "The Ultimate Phrasal Verbs Guide (YDS & YÖKDİL)" from content/phrasal-verbs into
 *   content/ebooks/netfener-phrasal-verbs.pdf           (the book, private)
 *   public/ebooks/phrasal-verbs.jpg                     (cover)
 *   public/ebooks/previews/phrasal-verbs-{1..10}.jpg    (preview pages) and phrasal-verbs.pdf
 * in the same visual system as the other Netfener books (navy band, gold rule, cream page).
 *
 *   npx tsx scripts/build-phrasal-verbs-book.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { UNITS } from "../content/phrasal-verbs/index";
import type { PhrasalVerb, Unit } from "../content/phrasal-verbs/types";

const ROOT = process.cwd();
const SLUG = "phrasal-verbs";
const TITLE = "The Ultimate Phrasal Verbs Guide";
const PER_PAGE = 4;
const SEP_LABEL = { A: "AYRILABİLİR", Ç: "AYRILMAZ", N: "NESNE ALMAZ" } as const;
const OPTION = ["A", "B", "C", "D", "E"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (n: number) => String(n).padStart(2, "0");
const upper = (s: string) => s.toLocaleUpperCase("en-US");
/** Object placeholders in a headword; the longest alternatives first so "sb/sth" goes as a whole. */
const OBJ = /\s(?:sb\/sth|doing sth|oneself|sth|sb)\b/g;
/** "carry out sth" → "CARRY OUT" + " sth" in a lighter weight; "(on sth)" parts stay lower-case too. */
const pvHtml = (pv: string) => {
  const m = pv.match(/^(.*?)((?:\s(?:\([^)]*\)|sb\/sth|doing sth|oneself|sth|sb))+)?$/);
  return `${esc(upper(m?.[1] ?? pv))}${m?.[2] ? `<span class="obj">${esc(m[2])}</span>` : ""}`;
};
/** Stable shuffle so the book is identical on every build. */
function seeded<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const LIGHTHOUSE = (size: number, beam = "#d9a52b", body = "#ffffff", stripe = "#14243a") => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
  <g stroke="${beam}" stroke-width="2.4" stroke-linecap="round">
    <path d="M8 18 L22 23"/><path d="M8 28 L22 26"/><path d="M56 18 L42 23"/><path d="M56 28 L42 26"/>
  </g>
  <path d="M32 6 l2 3h-4z" fill="${body}"/>
  <rect x="26" y="15" width="12" height="9" rx="1.5" fill="${beam}"/>
  <path d="M25 13h14l-2-3H27z" fill="${body}"/>
  <path d="M26.5 24h11l3 32h-17z" fill="${body}"/>
  <path d="M27.4 33h9.4l.9 8H26.5z" fill="${stripe}"/>
  <path d="M30 49h4v7h-4z" fill="${stripe}"/>
  <rect x="21" y="56" width="22" height="3.5" rx="1" fill="${body}"/>
</svg>`;

type Page = { kind: string; html: string };
const pages: Page[] = [];
const add = (kind: string, html: string) => pages.push({ kind, html });

const band = (eyebrow: string, title: string, right: string, logo = false) => `
<header class="band">
  ${logo ? `<div class="band-logo">${LIGHTHOUSE(46)}</div>` : ""}
  <div class="band-text"><p class="band-eyebrow">${eyebrow}</p><h1 class="band-title">${title}</h1></div>
  <p class="band-right">${right}</p>
</header>`;
const footer = (n: number) => `<footer class="pfoot">netfener.com · ${pad(n)}</footer>`;

// ---------- page numbering is known up front: front matter, then 7 pages a unit ----------
const FRONT = 8; // cover, title, copyright, how-to, contents ×2, particle guide ×2
const entryPages = (u: Unit) => Math.ceil(u.verbs.length / PER_PAGE);
const unitStart: number[] = [];
{
  let p = FRONT + 1;
  for (const u of UNITS) {
    unitStart.push(p);
    p += 1 + entryPages(u) + 2;
  }
}
const verbPage = new Map<string, { unit: number; page: number }>();
UNITS.forEach((u, ui) => u.verbs.forEach((v, vi) => verbPage.set(v.pv, { unit: ui + 1, page: unitStart[ui] + 1 + Math.floor(vi / PER_PAGE) })));
const TOTAL_VERBS = UNITS.reduce((n, u) => n + u.verbs.length, 0);
const TOTAL_QUESTIONS = UNITS.reduce((n, u) => n + u.questions.length, 0);

// ---------- front matter ----------
add("cover", `
<div class="cover">
  <div class="cover-panel">
    <div class="cover-top">${LIGHTHOUSE(70)}<p class="cover-brand"><span></span>NETFENER<span></span></p></div>
    <h1 class="cover-title"><span>THE ULTIMATE</span><span class="gold">PHRASAL VERBS</span><span>GUIDE</span></h1>
    <p class="cover-exam"><span></span>YDS &amp; YÖKDİL<span></span></p>
    <p class="cover-tag">MEANING · SYNONYM · CONTEXT · EXAM DECISIONS</p>
    <div class="cover-cloud">
      <span style="left:8%;top:12%">carry out</span><span class="b" style="left:52%;top:4%">bring about</span>
      <span style="left:62%;top:30%">rule out</span><span class="b" style="left:14%;top:38%">account for</span>
      <span style="left:40%;top:58%">set up</span><span style="left:4%;top:72%">put off</span>
      <span class="b" style="left:58%;top:76%">point out</span><span style="left:30%;top:88%">deal with</span>
    </div>
    <p class="cover-count">${TOTAL_VERBS} phrasal verb · ${UNITS.length} ünite · ${TOTAL_QUESTIONS} özgün soru</p>
  </div>
  <p class="cover-site"><span></span>netfener.com<span></span></p>
</div>`);

add("title", `
<div class="titlepage">
  <p class="tp-brand">N E T F E N E R</p>
  <h1 class="tp-title">THE ULTIMATE<br><span class="gold">PHRASAL VERBS</span><br>GUIDE</h1>
  <p class="tp-exam">Y D S &amp; Y Ö K D İ L</p>
  <p class="tp-tag">MEANING · SYNONYM · CONTEXT · EXAM DECISIONS</p>
  <p class="tp-sub">Sınavda En Sık Karşılaşılan Phrasal Verb'ler</p>
  <p class="tp-count">${TOTAL_VERBS} phrasal verb · ${UNITS.length} tematik ünite · ${TOTAL_QUESTIONS} özgün soru</p>
  <p class="tp-site">n e t f e n e r . c o m</p>
</div>`);

add("copyright", `
<div class="copyright">
  <div class="cr-block">
    ${LIGHTHOUSE(56, "#d9a52b", "#14243a", "#ffffff")}
    <p class="cr-title">${TITLE} · YDS &amp; YÖKDİL</p>
    <p>Sınavda en sık karşılaşılan ${TOTAL_VERBS} phrasal verb — ${UNITS.length} tematik ünite</p>
    <p>© 2026 Netfener. Tüm hakları saklıdır. Bu yayının hiçbir bölümü yayıncının yazılı izni olmadan çoğaltılamaz, dağıtılamaz veya elektronik ortamda paylaşılamaz.</p>
    <p><b>Özgünlük beyanı:</b> Bu kitaptaki tüm açıklamalar, örnek cümleler, paragraflar ve sorular Netfener için özgün olarak hazırlanmıştır. Kitap, ÖSYM tarafından yayımlanmış sınav sorularından veya başka yayınevlerinin içeriklerinden alıntı içermez. Phrasal verb listesi, YDS ve YÖKDİL'in kelime, cümle tamamlama, çeviri ve paragraf bölümlerinde sık görülen yapılar esas alınarak hazırlanmıştır.</p>
    <p>Yayıncı: Netfener · <b>netfener.com</b><br>Birinci baskı (e-kitap): 2026</p>
  </div>
  ${footer(3)}
</div>`);

add("howto", `
${band("NETFENER", "BU KİTAP NASIL ÇALIŞILIR?", "NETFENER PHRASAL ROTASI")}
<div class="body">
  <section class="card">
    <p class="kicker">KİTABIN MANTIĞI</p>
    <p>YDS ve YÖKDİL'de phrasal verb'ler iki yoldan karşına çıkar: kelime sorusunda doğrudan şık olarak ve çeviri, cümle tamamlama ya da paragraf sorularında anlamı taşıyan yapı olarak. Sınav çoğu zaman phrasal verb'ün <b>tek kelimelik akademik karşılığını</b> da şıklara koyar: <i>carry out = conduct</i>, <i>put off = postpone</i>, <i>rule out = exclude</i>. Bu kitap her yapıyı anlamıyla, akademik eşiyle ve bir cümle içinde öğretir; her ünitenin sonunda da seni bir sınav kararı vermeye zorlar.</p>
  </section>
  <p class="kicker mt">DÖRT ADIMLI ROTA</p>
  <div class="steps4">
    <div class="step"><span>1</span><b>ANLAMI GÖR</b><p>Fiili ve edatı ayrı ayrı değil, tek bir anlam bloğu olarak oku. Türkçe karşılığı ezberleme; cümledeki durumu hayal et.</p></div>
    <div class="step"><span>2</span><b>EŞİNİ BUL</b><p>Her yapının yanındaki <b>=</b> işaretli akademik eşi öğren. Sınav şıklarında çoğu zaman o kelime çıkar.</p></div>
    <div class="step"><span>3</span><b>EDATI OKU</b><p>Edatın anlama kattığı yönü yakala: <i>up</i> tamamlar, <i>out</i> ortaya çıkarır, <i>off</i> ayırır ya da başlatır.</p></div>
    <div class="step"><span>4</span><b>SINAVDA SEÇ</b><p>Özgün soruyu çöz, sonra en güçlü çeldiricinin neden yanlış olduğunu açıkla.</p></div>
  </div>
  <p class="kicker mt">HER ÜNİTE YEDİ SAYFA</p>
  <div class="grid2">
    <section class="card">
      <p class="kicker teal">AÇILIŞ · 1 SAYFA</p>
      <p>Ünitenin teması, ${UNITS[0].verbs.length} yapının listesi ve <b>edatın mantığı</b> kutusu.</p>
      <p class="kicker teal mt-s">YAPILAR · 4 SAYFA</p>
      <p>Her yapı için Türkçe anlam, akademik eş (=), ayrılabilirlik ve özgün örnek cümle ile çevirisi.</p>
    </section>
    <section class="card">
      <p class="kicker teal">IN ACTION · 1 SAYFA</p>
      <p>Bağlam içinde okuma, paragraf izi, şıklara bakmadan cloze testi ve eş anlam eşleştirme.</p>
      <p class="kicker teal mt-s">SINAVDA KARAR ANI · 1 SAYFA</p>
      <p>YDS/YÖKDİL tarzında 4 özgün soru; her biri için cevap gerekçesi ve çeldirici analizi.</p>
    </section>
  </div>
  <section class="dark mt">
    <div>
      <p class="kicker gold">AYRILABİLİRLİK İŞARETLERİ</p>
      <p><span class="badge">AYRILABİLİR</span> Nesne araya girebilir: <i>carry the plan out</i> · zamir mutlaka araya girer: <i>carry it out</i>.</p>
      <p><span class="badge">AYRILMAZ</span> Nesne her zaman edattan sonra gelir: <i>look into the matter</i>.</p>
      <p><span class="badge">NESNE ALMAZ</span> Nesnesiz kullanılır: <i>the plan fell through</i>.</p>
    </div>
    <div>
      <p class="kicker gold">ÖNERİLEN TEMPO</p>
      <p>Günde bir ünite (yaklaşık 60–75 dakika).<br>Tekrar: 1. gün · 3. gün · 7. gün.<br>Kitabın sonundaki <b>Alfabetik Dizin</b> ile istediğin yapıyı sayfasıyla bul.</p>
    </div>
  </section>
</div>
${footer(4)}`);

// Contents: two pages, units split evenly.
const half = Math.ceil(UNITS.length / 2);
[UNITS.slice(0, half), UNITS.slice(half)].forEach((group, gi) => {
  add("contents", `
${band("NETFENER", "İÇİNDEKİLER", `${UNITS.length} ÜNİTE · ${TOTAL_VERBS} PHRASAL VERB`)}
<div class="body">
  ${gi === 0 ? `<div class="toc-row toc-front"><span class="toc-no">—</span><div><b>Edatların Mantığı</b><p>up · out · off · down · on · in · over · away · back · through</p></div><span class="toc-page">07</span></div>` : ""}
  ${group
    .map((u, i) => {
      const n = gi * half + i;
      return `<div class="toc-row"><span class="toc-no">ÜNİTE ${pad(n + 1)}</span><div><b>${esc(u.title)}</b><p>${u.verbs.slice(0, 6).map((v) => esc(upper(v.pv.replace(OBJ, "")))).join(" · ")} …</p></div><span class="toc-page">${pad(unitStart[n])}</span></div>`;
    })
    .join("")}
  ${gi === 1 ? `<div class="toc-row toc-front"><span class="toc-no">—</span><div><b>Alfabetik Dizin</b><p>${TOTAL_VERBS} yapı, ünite ve sayfa numarasıyla</p></div><span class="toc-page">${pad(unitStart[UNITS.length - 1] + 7)}</span></div>` : ""}
</div>
${footer(5 + gi)}`);
});

// Particle guide.
const PARTICLES: { p: string; core: string; ex: string[] }[] = [
  { p: "UP", core: "Tamamlama, artış, ortaya çıkma, yukarı yön", ex: ["use up · tüketmek", "step up · artırmak", "turn up · ortaya çıkmak"] },
  { p: "OUT", core: "Dışarı çıkarma, sonuna kadar yapma, ortadan kaldırma", ex: ["carry out · yürütmek", "find out · öğrenmek", "rule out · olasılık dışı bırakmak"] },
  { p: "OFF", core: "Ayrılma, kesilme, başlama, iptal", ex: ["call off · iptal etmek", "set off · tetiklemek", "cut off · kesmek"] },
  { p: "DOWN", core: "Azalma, durma, kayda geçirme, bastırma", ex: ["cut down · azaltmak", "break down · bozulmak", "write down · not almak"] },
  { p: "ON", core: "Devam, bağlılık, üzerine ekleme", ex: ["carry on · sürdürmek", "rely on · dayanmak", "take on · üstlenmek"] },
  { p: "IN / INTO", core: "İçeri alma, katılma, derinlemesine inceleme, dönüşüm", ex: ["take in · kavramak", "look into · araştırmak", "turn into · dönüşmek"] },
  { p: "OVER", core: "Baştan sona gözden geçirme, devralma, aşma", ex: ["go over · gözden geçirmek", "take over · devralmak", "get over · atlatmak"] },
  { p: "AWAY", core: "Uzaklaşma, yok olma, kesintisiz sürme", ex: ["give away · ele vermek", "wear away · aşındırmak", "do away with · kaldırmak"] },
  { p: "BACK", core: "Geri dönme, geri çekilme, destek", ex: ["cut back · kısmak", "back up · desteklemek", "date back to · …e dayanmak"] },
  { p: "THROUGH", core: "Baştan sona, bir engeli aşarak", ex: ["go through · yaşamak; incelemek", "fall through · suya düşmek", "pull through · atlatmak"] },
];
[PARTICLES.slice(0, 5), PARTICLES.slice(5)].forEach((group, gi) => {
  add("particles", `
${band("NETFENER", "EDATLARIN MANTIĞI", gi === 0 ? "BÖLÜM 1 · UP · OUT · OFF · DOWN · ON" : "BÖLÜM 2 · IN · OVER · AWAY · BACK · THROUGH")}
<div class="body">
  ${gi === 0 ? `<section class="card"><p class="kicker">NEDEN EDATA BAKMALI?</p><p>Phrasal verb'ün anlamı çoğu zaman fiilden değil edattan gelir. Aynı fiil farklı edatla bambaşka bir iş yapar: <i>put off</i> ertelemek, <i>put out</i> söndürmek, <i>put up with</i> katlanmaktır. Edatın genel yönünü bilmek, hiç görmediğin bir yapının anlamını bağlamdan tahmin etmeni sağlar. Bu bir kural değil, bir pusuladır; istisnaları üniteler içinde ayrıca gösterilir.</p></section>` : ""}
  ${group
    .map((g) => `<section class="particle"><div class="particle-name">${g.p}</div><div><p class="particle-core">${esc(g.core)}</p><p class="particle-ex">${g.ex.map(esc).join("   ·   ")}</p></div></section>`)
    .join("")}
  ${gi === 1 ? `<section class="dark"><div><p class="kicker gold">SINAV İPUCU</p><p>Şıklarda aynı fiille kurulmuş üç phrasal verb görürsen (<i>put off / put out / put up with</i>), fiile değil edata ve boşluktan sonra gelen nesneye bak. Nesnenin türü (bir toplantı mı, bir yangın mı, bir davranış mı) doğru edatı seçtirir.</p></div></section>` : ""}
</div>
${footer(7 + gi)}`);
});

// ---------- units ----------
UNITS.forEach((u, ui) => {
  const no = ui + 1;
  let p = unitStart[ui];
  const chunks: PhrasalVerb[][] = [];
  for (let i = 0; i < u.verbs.length; i += PER_PAGE) chunks.push(u.verbs.slice(i, i + PER_PAGE));

  add("unit", `
${band("NETFENER", `ÜNİTE ${pad(no)}`, `${u.verbs.length} PHRASAL VERB · 7 SAYFA`)}
<div class="body">
  <section class="card">
    <p class="kicker teal">ÜNİTE TEMASI</p>
    <h2 class="unit-title">${esc(u.title)}</h2>
    <p class="unit-q">${esc(u.question)}</p>
    <hr>
    <p>${esc(u.intro)}</p>
  </section>
  <p class="kicker mt">BU ÜNİTEDEKİ YAPILAR</p>
  <div class="vlist">
    ${u.verbs
      .map((v, i) => `<div class="vrow"><span class="vnum">${i + 1}</span><span class="vname">${pvHtml(v.pv)}</span><span class="vtr">${esc(v.tr.split(";")[0])}</span><span class="vsyn">${v.syn === "—" ? "" : `= ${esc(v.syn)}`}</span><span class="vpage">S. ${pad(verbPage.get(v.pv)!.page)}</span></div>`)
      .join("")}
  </div>
  <section class="dark mt">
    <div><p class="kicker gold">EDATIN MANTIĞI</p><p>${esc(u.particleNote)}</p></div>
    <div><p class="kicker gold">ÜNİTE HEDEFİ</p><p>Bu ünitenin sonunda ${u.verbs.length} yapıyı anlamı ve akademik eşiyle tanıyıp sınav cümlesinde doğru yapıyı seçebileceksin.</p><p class="muted-light">Önerilen süre: 60–75 dakika · Tekrar: 1. gün · 3. gün · 7. gün</p></div>
  </section>
</div>
${footer(p)}`);
  p++;

  chunks.forEach((chunk) => {
    add("entries", `
${band("NETFENER", "THE ULTIMATE PHRASAL VERBS GUIDE", `YDS &amp; YÖKDİL · ÜNİTE ${pad(no)} · SAYFA ${pad(p)}`, true).replace("band-title", "band-title band-title-s")}
<div class="body entries">
  ${chunk
    .map(
      (v) => `
  <section class="entry">
    <div class="entry-head">
      <h3>${pvHtml(v.pv)}</h3>
      <span class="badge">${SEP_LABEL[v.sep]}</span>
      ${v.syn === "—" ? "" : `<span class="syn">= ${esc(v.syn)}</span>`}
    </div>
    <p class="entry-tr">${esc(v.tr)}</p>
    <div class="entry-ex"><p class="en">${esc(v.en)}</p><p class="trx">${esc(v.trEx)}</p></div>
  </section>`,
    )
    .join("")}
  <section class="lock">
    <div><p class="kicker gold">LOCK IT IN · SAYFAYI KAPAT, İZİ BUL</p>
    ${chunk.map((v, i) => `<p>${i + 1}. ${esc(v.tr.split(/[;,]/)[0])} → ________ ${v.syn === "—" ? "" : `<span class="muted-light">(= ${esc(v.syn)})</span>`}</p>`).join("")}</div>
    <div class="lock-key"><p class="kicker gold">CEVAP</p>${chunk.map((v, i) => `<p>${i + 1}. ${esc(v.pv.replace(OBJ, ""))}</p>`).join("")}</div>
  </section>
</div>
${footer(p)}`);
    p++;
  });

  // In Action: reading, cloze, synonym match.
  const matchable = u.verbs.filter((v) => v.syn !== "—");
  const matchItems = seeded(matchable, no).slice(0, 6);
  const matchSyns = seeded(matchItems.map((v) => v.syn), no + 7);
  const clozeHtml = esc(u.cloze.text).replace(/\((\d)\)\s*_+/g, "<b>($1) ______</b>");
  add("action", `
${band("NETFENER", `ÜNİTE ${pad(no)} IN ACTION`, "BAĞLAM · CLOZE · EŞ ANLAM")}
<div class="body">
  <section class="card slim"><p class="kicker teal">BU SAYFANIN AMACI</p><p>Yapıların anlamını hatırlamak yetmez. Bu sayfada onları bir paragrafın akışı içinde okuyacak, boşluğun istediği yapıyı şıklara bakmadan bulacak ve akademik eşleriyle eşleştireceksin.</p></section>
  <p class="kicker mt">01 · BAĞLAM İÇİNDE OKU</p>
  <section class="card"><p class="reading">${esc(u.reading)}</p><p class="trail">Paragraf izi: ${esc(u.readingTrail)}</p></section>
  <p class="kicker mt">02 · CLOZE TEST · ŞIKTAN ÖNCE TAHMİN ET</p>
  <div class="cloze">
    <section class="dark-teal"><p>${clozeHtml}</p></section>
    <section class="pool"><p class="kicker gold">YAPI HAVUZU</p>${seeded(u.cloze.pool, no + 3).map((w) => `<p>${esc(w)}</p>`).join("")}<p class="muted">Gerekirse fiilin biçimini cümleye uydur.</p></section>
  </div>
  <p class="kicker mt">03 · EŞ ANLAM EŞLEŞTİR</p>
  <div class="match">
    <div>${matchItems.map((v, i) => `<p><b>${i + 1}.</b> ${esc(v.pv)}</p>`).join("")}</div>
    <div>${matchSyns.map((s, i) => `<p><b>${OPTION[i] ?? String.fromCharCode(65 + i)})</b> ${esc(s)}</p>`).join("")}</div>
  </div>
  <section class="dark mt">
    <div><p class="kicker gold">CEVAP ANAHTARI</p><p>Cloze: ${u.cloze.answers.map((a, i) => `${i + 1} ${esc(a)}`).join(" · ")}</p><p>Eşleştirme: ${matchItems.map((v, i) => `${i + 1}-${String.fromCharCode(65 + matchSyns.indexOf(v.syn))}`).join(" · ")}</p></div>
    <div><p class="kicker gold">KENDİNİ TEŞHİS ET</p><p>Anlamı biliyor ama biçimi kaçırıyorsan → boşluktan önceki yardımcı fiile ve zamana bak.<br>Eşi bulamıyorsan → yapı sayfasındaki <b>=</b> sütununu tekrar et.</p></div>
  </section>
  <p class="final">SON KARAR: FİİLE DEĞİL, EDATIN YÖNÜNE VE NESNEYE BAK.</p>
</div>
${footer(p)}`);
  p++;

  add("exam", `
${band("NETFENER", `ÜNİTE ${pad(no)} · SINAVDA KARAR ANI`, `${u.questions.length} ÖZGÜN SORU · YDS / YÖKDİL TARZI`)}
<div class="body">
  ${u.questions
    .map((raw, qi) => {
      // Options are written answer-first; a fixed shuffle spreads the key over A–E.
      const order = seeded([0, 1, 2, 3, 4], no * 31 + qi * 7 + 5);
      return { ...raw, options: order.map((i) => raw.options[i]) as typeof raw.options, answer: order.indexOf(raw.answer) };
    })
    .map(
      (q, qi) => `
  <section class="q">
    <p class="kicker teal">SORU ${qi + 1}</p>
    <p class="q-stem">${esc(q.stem).replace(/-{3,}/g, "<span class=\"blank\">----</span>")}</p>
    <p class="q-opts">${q.options.map((o, oi) => `<span>${OPTION[oi]}) ${esc(o)}</span>`).join("")}</p>
    <div class="q-why">
      <div class="ans"><p class="kicker gold">CEVAP · ${OPTION[q.answer]}</p><p>${esc(q.why)}</p></div>
      <div class="trap"><p class="kicker red">ÇELDİRİCİ</p><p>${esc(q.trap)}</p></div>
    </div>
  </section>`,
    )
    .join("")}
</div>
${footer(p)}`);
});

// ---------- index ----------
const all = UNITS.flatMap((u) => u.verbs).sort((a, b) => a.pv.localeCompare(b.pv, "en"));
const PER_INDEX_PAGE = 132;
let ip = unitStart[UNITS.length - 1] + 7;
for (let i = 0; i < all.length; i += PER_INDEX_PAGE) {
  const slice = all.slice(i, i + PER_INDEX_PAGE);
  add("index", `
${band("NETFENER", "ALFABETİK DİZİN", `${TOTAL_VERBS} PHRASAL VERB · ÜNİTE / SAYFA`)}
<div class="body index">
  ${slice.map((v) => `<p><span>${esc(v.pv)}</span><b>${pad(verbPage.get(v.pv)!.unit)} / ${pad(verbPage.get(v.pv)!.page)}</b></p>`).join("")}
</div>
${footer(ip)}`);
  ip++;
}

add("back", `
<div class="back">
  ${LIGHTHOUSE(84)}
  <p class="cover-brand light"><span></span>NETFENER<span></span></p>
  <h1 class="back-title">THE ULTIMATE <span class="gold">PHRASAL VERBS</span> GUIDE</h1>
  <p class="back-tag">MEANING · SYNONYM · CONTEXT · EXAM DECISIONS</p>
  <p class="back-text">Phrasal verb'ü ezberlemek yetmez; sınavda onun akademik eşini tanıyıp cümlenin istediği yapıyı seçebilmen gerekir. Bu kitap YDS ve YÖKDİL'de en sık karşına çıkan ${TOTAL_VERBS} phrasal verb'ü ${UNITS.length} tematik ünitede, her biri anlam, eş, örnek cümle ve özgün soruyla öğretir.</p>
  <div class="back-stats"><div><b>${TOTAL_VERBS}</b><span>phrasal verb</span></div><div><b>${UNITS.length}</b><span>tematik ünite</span></div><div><b>${TOTAL_QUESTIONS}</b><span>özgün soru</span></div></div>
  <p class="back-list">Akademik eşler · Ayrılabilirlik işaretleri · Edatların mantığı · Cloze testleri · Eş anlam eşleştirme · Çeldirici analizli sorular · Alfabetik dizin</p>
  <p class="back-site">netfener.com</p>
</div>`);

// ---------- styles ----------
const CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --navy:#14243a; --navy2:#1c3247; --gold:#d9a52b; --teal:#1f8a80; --teal-d:#1d3b45; --cream:#f5f0e6; --ink:#1b2a3a; --muted:#5f6b78; --line:#e3dccd; }
html, body { font-family: "Liberation Sans", Arial, sans-serif; color: var(--ink); font-size: 10.2pt; line-height: 1.45; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; background: var(--cream); page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; }
b { font-weight: 700; }
i { font-style: italic; }
.gold { color: var(--gold); }
.band { background: var(--navy); color: #fff; padding: 8mm 13mm 6mm; display: flex; align-items: center; gap: 5mm; border-bottom: 2.2mm solid var(--gold); }
.band-text { flex: 1; }
.band-eyebrow { color: var(--gold); font-weight: 700; font-size: 9pt; letter-spacing: .04em; }
.band-title { font-size: 19pt; font-weight: 700; line-height: 1.1; margin-top: 1mm; }
.band-title-s { font-size: 15pt; }
.band-right { font-size: 7.2pt; font-weight: 700; letter-spacing: .06em; color: #c9d3de; text-align: right; max-width: 70mm; }
.body { padding: 7mm 13mm 0; }
.pfoot { position: absolute; bottom: 7mm; right: 13mm; font-size: 7pt; font-weight: 700; color: var(--muted); }
.card { background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 5mm 6mm; }
.card.slim { padding: 3.5mm 5mm; }
.card p + p { margin-top: 2mm; }
.kicker { font-size: 7.2pt; font-weight: 700; letter-spacing: .08em; color: var(--gold); text-transform: uppercase; margin-bottom: 1.5mm; }
.kicker.teal { color: var(--teal); }
.kicker.red { color: #b4432f; }
.mt { margin-top: 5mm; }
.mt-s { margin-top: 3mm; }
.muted { color: var(--muted); font-size: 8.5pt; margin-top: 2mm; }
.muted-light { color: #aab6c3; font-size: 8.5pt; }
.dark { background: var(--navy); color: #e8edf2; border-radius: 4mm; padding: 5mm 6mm; display: flex; gap: 6mm; }
.dark > div { flex: 1; }
.dark > div + div { border-left: 1px solid #3a4e63; padding-left: 6mm; }
.dark p + p { margin-top: 1.5mm; }
.badge { display: inline-block; background: var(--teal); color: #fff; font-size: 6.6pt; font-weight: 700; letter-spacing: .06em; border-radius: 3mm; padding: .8mm 3mm; vertical-align: middle; }
.steps4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.step { background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 4mm; }
.step span { display: inline-grid; place-items: center; width: 7mm; height: 7mm; border-radius: 50%; background: var(--navy); color: var(--gold); font-weight: 700; font-size: 9pt; }
.step b { display: block; margin: 2mm 0 1mm; font-size: 9pt; letter-spacing: .04em; }
.step p { font-size: 8.4pt; color: var(--muted); }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.grid2 .card p { font-size: 9pt; }
/* cover */
.cover { height: 100%; background: #efe7d6; padding: 0 12mm; display: flex; flex-direction: column; }
.cover-panel { flex: 1; background: radial-gradient(120% 70% at 50% 65%, #213c5b 0%, var(--navy) 60%); color: #fff; display: flex; flex-direction: column; align-items: center; padding-top: 14mm; position: relative; }
.cover-top { display: flex; flex-direction: column; align-items: center; }
.cover-brand { display: flex; align-items: center; gap: 4mm; letter-spacing: .32em; font-weight: 700; font-size: 11pt; margin-top: 2mm; color: #fff; }
.cover-brand span { display: inline-block; width: 14mm; height: 1px; background: var(--gold); }
.cover-title { font-family: "Liberation Serif", Georgia, serif; text-align: center; margin-top: 12mm; line-height: 1.02; display: flex; flex-direction: column; }
.cover-title span { font-size: 34pt; letter-spacing: .02em; }
.cover-title span.gold { font-size: 46pt; }
.cover-exam { display: flex; align-items: center; gap: 5mm; margin-top: 8mm; font-family: "Liberation Serif", serif; font-size: 20pt; letter-spacing: .12em; }
.cover-exam span { display: inline-block; width: 22mm; height: 1px; background: var(--gold); }
.cover-tag { margin-top: 4mm; font-size: 7.4pt; letter-spacing: .22em; color: #7fd0c6; font-weight: 700; }
.cover-cloud { position: relative; width: 150mm; height: 82mm; margin-top: 10mm; }
.cover-cloud span { position: absolute; font-family: "Liberation Serif", serif; font-size: 15pt; color: #f2e3bb; padding: 1.5mm 4mm; border: 1px solid rgba(217,165,43,.55); border-radius: 6mm; background: rgba(255,255,255,.04); }
.cover-cloud span.b { font-size: 18pt; color: var(--gold); font-weight: 700; }
.cover-count { position: absolute; bottom: 12mm; font-size: 9.5pt; letter-spacing: .08em; color: #d3dbe4; }
.cover-site { display: flex; align-items: center; justify-content: center; gap: 6mm; height: 22mm; color: var(--navy); letter-spacing: .18em; font-size: 10pt; }
.cover-site span { display: inline-block; width: 26mm; height: 1px; background: var(--navy); opacity: .5; }
/* title page */
.titlepage { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20mm; }
.tp-brand { letter-spacing: .3em; font-weight: 700; color: var(--teal); }
.tp-title { font-family: "Liberation Serif", serif; font-size: 34pt; line-height: 1.1; margin-top: 10mm; color: var(--navy); }
.tp-exam { margin-top: 8mm; letter-spacing: .3em; font-weight: 700; }
.tp-tag { margin-top: 3mm; font-size: 8pt; letter-spacing: .2em; color: var(--teal); font-weight: 700; }
.tp-sub { margin-top: 14mm; font-size: 13pt; font-weight: 700; }
.tp-count { margin-top: 3mm; color: var(--muted); }
.tp-site { margin-top: 30mm; letter-spacing: .2em; color: var(--muted); }
/* copyright */
.copyright { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 22mm 28mm; }
.cr-block p { font-size: 9pt; color: #3d4955; margin-top: 3mm; }
.cr-title { font-weight: 700; font-size: 11pt !important; color: var(--ink) !important; margin-top: 5mm !important; }
/* contents */
.toc-row { display: flex; align-items: center; gap: 4mm; background: #fff; border: 1px solid var(--line); border-radius: 3mm; padding: 1.7mm 4mm; margin-bottom: 1.6mm; }
.toc-row b { font-size: 10pt; }
.toc-row p { font-size: 7.4pt; color: var(--teal); letter-spacing: .03em; margin-top: .5mm; }
.toc-row > div { flex: 1; }
.toc-no { width: 19mm; font-size: 7.4pt; font-weight: 700; color: var(--gold); letter-spacing: .05em; }
.toc-page { font-weight: 700; color: var(--navy); }
.toc-front { background: #fbf6ea; }
/* particles */
.particle { display: flex; gap: 5mm; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 4.5mm 5mm; margin-top: 4mm; }
.particle-name { min-width: 30mm; text-align: center; background: var(--navy); color: var(--gold); font-weight: 700; font-size: 15pt; border-radius: 3mm; padding: 4mm 2mm; }
.particle-core { font-weight: 700; font-size: 11pt; }
.particle-ex { color: var(--teal); margin-top: 1.5mm; font-size: 9pt; }
.body .dark { margin-top: 5mm; }
/* unit opener */
.unit-title { font-size: 20pt; margin-top: .5mm; color: var(--navy); }
.page-unit .card { padding: 4mm 6mm; }
.page-unit .card p { font-size: 8.8pt; line-height: 1.38; }
.page-unit .body { padding-top: 6mm; }
.page-unit .dark { padding: 3.5mm 5.5mm; font-size: 8.5pt; line-height: 1.4; }
.page-unit .mt { margin-top: 4mm; }
.unit-q { color: var(--gold); font-weight: 700; margin-top: 1mm; }
.card hr { border: 0; border-top: 1px solid var(--line); margin: 3mm 0; }
.vlist { display: grid; gap: 1.1mm; }
.vrow { display: grid; grid-template-columns: 6mm 47mm 1fr 32mm 12mm; align-items: center; gap: 2mm; background: #fff; border: 1px solid var(--line); border-radius: 2.5mm; padding: .75mm 3mm; font-size: 7.8pt; line-height: 1.22; }
.vnum { display: inline-grid; place-items: center; width: 5.4mm; height: 5.4mm; border-radius: 50%; background: var(--navy); color: #fff; font-size: 6.8pt; font-weight: 700; }
.vname { font-weight: 700; font-size: 8.8pt; }
.vname .obj, h3 .obj { font-weight: 400; color: var(--muted); font-size: .8em; }
.vtr { color: #3d4955; }
.vsyn { color: var(--teal); font-weight: 700; }
.vpage { color: var(--gold); font-weight: 700; font-size: 7pt; text-align: right; }
/* entries */
.entries { display: flex; flex-direction: column; gap: 4.2mm; padding-top: 8mm; }
.entry { background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 4.6mm 5.5mm; }
.entry-head { display: flex; align-items: center; gap: 3mm; flex-wrap: wrap; }
.entry-head h3 { font-size: 16pt; color: var(--navy); letter-spacing: .01em; }
.syn { color: var(--teal); font-weight: 700; font-size: 10.5pt; }
.entry-tr { font-weight: 700; margin-top: 1mm; color: #3d4955; }
.entry-ex { margin-top: 2.6mm; font-size: 10.6pt; border-left: 1.2mm solid var(--gold); background: #faf6ec; padding: 2mm 3.5mm; border-radius: 0 2mm 2mm 0; }
.entry-ex .en { font-style: italic; }
.entry-ex .trx { color: var(--muted); font-size: 9pt; margin-top: .6mm; }
.lock { background: var(--navy); color: #e8edf2; border-radius: 4mm; padding: 4mm 5.5mm; display: flex; gap: 6mm; font-size: 9pt; }
.lock > div:first-child { flex: 1; }
.lock-key { border-left: 1px solid #3a4e63; padding-left: 5mm; width: 46mm; color: var(--gold); font-size: 8.4pt; }
.lock p + p { margin-top: .8mm; }
/* in action */
.reading { font-size: 9.8pt; line-height: 1.5; }
.page-action .card { padding: 4mm 5.5mm; }
.page-action .mt { margin-top: 4mm; }
.page-action .dark { padding: 4mm 5.5mm; font-size: 9pt; }
.page-action .dark-teal { padding: 4mm 5mm; font-size: 9.6pt; line-height: 1.55; }
.trail { margin-top: 3mm; background: #eaf3f1; color: var(--teal); font-size: 8pt; border-radius: 2mm; padding: 2mm 3mm; }
.cloze { display: grid; grid-template-columns: 1fr 44mm; gap: 4mm; }
.dark-teal { background: var(--teal-d); color: #f1f5f6; border-radius: 4mm; padding: 5mm; line-height: 1.6; }
.dark-teal b { color: var(--gold); }
.pool { background: #fdf3dc; border: 1px solid #ecd39b; border-radius: 4mm; padding: 4mm; font-size: 9.4pt; }
.pool p + p { margin-top: 1mm; }
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.match > div { background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 3.5mm 5mm; font-size: 9.2pt; }
.match p + p { margin-top: 1mm; }
.final { margin-top: 4mm; font-weight: 700; color: var(--teal); font-size: 8.6pt; letter-spacing: .04em; }
/* exam */
.q { background: #fff; border: 1px solid var(--line); border-radius: 4mm; padding: 3.6mm 5mm; margin-bottom: 3.2mm; }
.q-stem { font-weight: 700; font-size: 10pt; line-height: 1.45; }
.blank { display: inline-block; min-width: 14mm; border-bottom: 1.2px solid var(--ink); text-align: center; color: transparent; }
.q-opts { display: flex; flex-wrap: wrap; gap: 1mm 6mm; margin-top: 2mm; font-size: 9.2pt; }
.q-why { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 2.5mm; font-size: 8.3pt; }
.q-why > div { border-radius: 3mm; padding: 2.4mm 3.4mm; }
.ans { background: #eaf3f1; }
.trap { background: #fbeae6; }
.q-why .kicker { margin-bottom: .6mm; }
/* index */
.index { column-count: 3; column-gap: 6mm; font-size: 7.9pt; padding-top: 6mm; }
.index p { display: flex; justify-content: space-between; gap: 2mm; border-bottom: 1px dotted #cfc6b3; padding: .55mm 0; break-inside: avoid; }
.index b { color: var(--gold); white-space: nowrap; }
/* back */
.back { height: 100%; background: var(--navy); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 24mm; border-bottom: 3mm solid var(--gold); }
.cover-brand.light { margin-top: 3mm; }
.back-title { font-family: "Liberation Serif", serif; font-size: 22pt; margin-top: 10mm; }
.back-tag { margin-top: 3mm; font-size: 7.4pt; letter-spacing: .22em; color: #7fd0c6; font-weight: 700; }
.back-text { margin-top: 9mm; font-size: 9.4pt; color: #d6dee6; line-height: 1.6; }
.back-stats { display: flex; gap: 5mm; margin-top: 9mm; }
.back-stats div { border: 1px solid #36506b; border-radius: 3mm; padding: 4mm 9mm; }
.back-stats b { display: block; color: var(--gold); font-size: 17pt; }
.back-stats span { font-size: 7.6pt; color: #c9d3de; }
.back-list { margin-top: 8mm; font-size: 8pt; color: #b7c3cf; line-height: 1.6; }
.back-site { position: absolute; bottom: 16mm; letter-spacing: .2em; font-size: 9pt; }
`;

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.map((pg) => `<div class="page page-${pg.kind}">${pg.html}</div>`).join("")}</body></html>`;

const PREVIEW_PAGES = [1, 2, 3, 4, 7, unitStart[0], unitStart[0] + 1, unitStart[0] + 2, unitStart[0] + 5, unitStart[0] + 6];

async function main() {
  const out = (...p: string[]) => path.join(ROOT, ...p);
  await mkdir(out("public/ebooks/previews"), { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.25 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });

  // Nothing may spill off a page: report any overflowing page before writing the book.
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll(".page")].flatMap((el, i) => {
      const box = el.getBoundingClientRect();
      const kids = [...el.querySelectorAll(".body > *, .entries > *, .index > p")];
      const bottom = Math.max(0, ...kids.map((k) => k.getBoundingClientRect().bottom - box.top));
      return bottom > box.height - 34 ? [`${i + 1}: content ends at ${Math.round(bottom)}px of ${Math.round(box.height)}`] : [];
    }),
  );
  if (overflow.length) {
    console.error("Overflowing pages:\n" + overflow.join("\n"));
    if (!process.env.ALLOW_OVERFLOW) process.exit(1);
  }

  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  await writeFile(out("content/ebooks/netfener-phrasal-verbs.pdf"), pdf);

  // Cover and preview images: screenshot single pages at 990×1400.
  const shot = await ctx.newPage();
  await shot.setViewportSize({ width: 794, height: 1123 });
  for (const [i, n] of [[0, 1], ...PREVIEW_PAGES.map((n, k) => [k + 1, n] as const)] as const) {
    await shot.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS} body{margin:0}</style></head><body>${`<div class="page page-${pages[n - 1].kind}">${pages[n - 1].html}</div>`}</body></html>`, { waitUntil: "load" });
    const jpeg = await shot.screenshot({ type: "jpeg", quality: 82, clip: { x: 0, y: 0, width: 794, height: 1123 }, scale: "device" });
    await writeFile(i === 0 ? out("public/ebooks/phrasal-verbs.jpg") : out(`public/ebooks/previews/${SLUG}-${i}.jpg`), jpeg);
  }
  const previewHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${PREVIEW_PAGES.map((n) => `<div class="page page-${pages[n - 1].kind}">${pages[n - 1].html}</div>`).join("")}</body></html>`;
  await page.setContent(previewHtml, { waitUntil: "load" });
  await writeFile(out(`public/ebooks/previews/${SLUG}.pdf`), await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true }));
  await browser.close();
  console.log(`pages ${pages.length} · verbs ${TOTAL_VERBS} · questions ${TOTAL_QUESTIONS}`);
}

void main();
