/**
 * Builds "Prepositions Master Class" from content/prepositions into
 *   content/ebooks/netfener-prepositions-master-class.pdf        (the book, private)
 *   public/ebooks/covers/prepositions-master-class.jpg           (cover)
 *   public/ebooks/previews/prepositions-master-class-{1..10}.jpg (preview pages) and .pdf
 *
 * Front matter (title, copyright, how-to, contents), five part dividers, 30 units (opener,
 * two-column entry pages, practice + contrasts, exam questions), a 40-question final test,
 * answer keys, an alphabetical index and the back cover. Pages are filled in the browser.
 *
 *   npx tsx scripts/check-prepositions.mts && npx tsx scripts/build-prepositions-book.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as mupdf from "mupdf";
import { chromium } from "playwright";
import { PARTS, UNITS } from "../content/prepositions/index";
import { FINAL_TEST } from "../content/prepositions/final-test";
import type { Question } from "../content/prepositions/types";
import { COVER_CSS, backCoverHtml, coverHtml, findCover } from "./ebook-covers/designs";

const ROOT = process.cwd();
const SLUG = "prepositions-master-class";
const COVER = findCover(SLUG)!;
const LETTERS = ["A", "B", "C", "D", "E"];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const blank = (s: string) => esc(s).replace(/-{4}/g, '<span class="blank">______</span>');
const pad = (n: number) => String(n).padStart(2, "0");
const TOTAL_ENTRIES = UNITS.reduce((n, u) => n + u.entries.length, 0);
const TOTAL_Q = UNITS.reduce((n, u) => n + u.questions.length, 0) + FINAL_TEST.length;

/** Places the correct option (written first) at a fixed position that cycles through A–E. */
let placed = 0;
function place(q: Question) {
  const target = (placed * 3 + 1) % 5;
  placed++;
  const [correct, ...rest] = q.options;
  const options = [...rest];
  options.splice(target, 0, correct);
  return { ...q, options, answer: target };
}

const LOGO = `<svg width="34" height="34" viewBox="0 0 100 100" aria-hidden="true"><g stroke-linejoin="round" stroke-width="2"><polygon points="10,15.6 34,49.4 34,56 10,66" fill="#138a43" stroke="#138a43"/><polygon points="66,4 90,4 90,22 66,32" fill="#42a169" stroke="#42a169"/><polygon points="10,72 34,62 34,96 10,96" fill="#10291c" stroke="#10291c"/><polygon points="66,38 90,28 90,80.4 66,46.6" fill="#10291c" stroke="#10291c" opacity="0.82"/><polygon points="10,10 36,10 90,86 64,86" fill="#10291c" stroke="#10291c"/></g></svg>`;

type Flow = { kind: "flow"; id: string; head: string; cols: 1 | 2; blocks: string[] };
type Fixed = { kind: "fixed"; cls: string; html: string; toc?: string; head?: string };
const parts: (Flow | Fixed)[] = [];
const fixed = (cls: string, html: string, toc?: string, head?: string) => parts.push({ kind: "fixed", cls, html, toc, head });
const flow = (id: string, head: string, cols: 1 | 2, blocks: string[]) => parts.push({ kind: "flow", id, head, cols, blocks });

// ---------- front matter ----------
fixed("cover", coverHtml(COVER));
fixed("plain", `
<div class="titlepage">
  <div class="tp-brand">${LOGO}<span>NETFENER</span></div>
  <h1>PREPOSITIONS<br><span>MASTER CLASS</span></h1>
  <p class="tp-exam">YDS · YÖKDİL · IELTS · TOEFL</p>
  <p class="tp-sub">İngilizcedeki edatların tamamı: yer, zaman, mantık, bağımlı edatlar, sabit öbekler ve sınav tuzakları</p>
  <p class="tp-count">${TOTAL_ENTRIES} kalıp · ${UNITS.length} ünite · ${TOTAL_Q} özgün soru · 300 boşluk doldurma</p>
  <p class="legal">© 2026 Netfener. Tüm hakları saklıdır. Bu yayının hiçbir bölümü yayıncının yazılı izni olmadan çoğaltılamaz, dağıtılamaz veya elektronik ortamda paylaşılamaz.<br><b>Özgünlük beyanı:</b> Bu kitaptaki tüm açıklamalar, örnek cümleler ve sorular Netfener için özgün olarak hazırlanmıştır; ÖSYM sınavlarından ya da başka yayınlardan alıntı içermez. · netfener.com</p>
</div>`);
fixed("plain", `
<div class="prose">
  <p class="kicker">BU KİTAP NASIL ÇALIŞILIR?</p>
  <h2 class="page-h">Küçük kelimeler, büyük puanlar</h2>
  <p class="lead">Edatlar İngilizcenin en kısa kelimeleridir ama sınavda en çok puan kaybettirenlerdendir: Türkçede çoğu bir ekle karşılanır, bu yüzden sezgiyle seçilemez. Bu kitap ${TOTAL_ENTRIES} kalıbı mantıklarıyla birlikte öğretir; ezberlenecek listeler yerine 'neden bu edat?' sorusuna cevap verir.</p>
  <div class="steps">
    <div><b>1</b><p><strong>Mantığı gör.</strong> Her ünite bir soruyla açılır ve edat grubunun ortak mantığını anlatır: nokta-yüzey-hacim, yön, süre, neden, karşıtlık…</p></div>
    <div><b>2</b><p><strong>Kalıbı öğren.</strong> Her kalıp için Türkçe anlam, kullanım notu ve özgün bir örnek cümle ile çevirisi verilir.</p></div>
    <div><b>3</b><p><strong>Ayrımı yakala.</strong> 'İnce ayrımlar' kutusu en çok karıştırılan ikilileri tek cümleyle ayırır: by/until, since/for, beside/besides…</p></div>
    <div><b>4</b><p><strong>Sınavda seç.</strong> 10 boşluk doldurma ve 4 sınav sorusu; her sorunun cevap gerekçesi ve çeldirici analizi.</p></div>
  </div>
  <p class="kicker mt">KİTABIN BEŞ BÖLÜMÜ</p>
  ${PARTS.map((p, i) => `<div class="part-row"><span>${i + 1}</span><div><b>${esc(p.title)}</b><p>${esc(p.subtitle)} · Ünite ${p.from}–${p.to}</p></div></div>`).join("")}
  <div class="tip"><p><b>Önerilen tempo:</b> Günde bir ünite (45–60 dakika). Tekrar: 1. gün · 3. gün · 7. gün. Kitabın sonunda 40 soruluk final testi ve tüm kalıpların alfabetik dizini var.</p></div>
</div>`);
fixed("plain", `
<div class="prose">
  <p class="kicker">İÇİNDEKİLER</p>
  <h2 class="page-h">${UNITS.length} ünite, ${TOTAL_ENTRIES} kalıp</h2>
  <div class="toc">${PARTS.map(
    (p, pi) => `<p class="toc-part">BÖLÜM ${pi + 1} · ${esc(p.title.toLocaleUpperCase("tr"))}</p>${p.units
      .map((u, i) => `<p><span>${pad(p.from + i)} · ${esc(u.title)}</span><i></i><b data-toc="u${p.from + i}"></b></p>`)
      .join("")}`,
  ).join("")}
  <p class="toc-part">SON</p><p><span>Final testi · 40 soru</span><i></i><b data-toc="final"></b></p><p><span>Cevap anahtarları</span><i></i><b data-toc="keys"></b></p><p><span>Alfabetik dizin</span><i></i><b data-toc="index"></b></p></div>
</div>`);

// ---------- parts and units ----------
const indexItems: { prep: string; unit: number; id: string }[] = [];
const practiceKeys: string[] = [];
const examKeys: string[] = [];
PARTS.forEach((p, pi) => {
  fixed("divider", `
<div class="dv"><p class="dv-k">BÖLÜM ${pi + 1}</p><h1>${esc(p.title)}</h1><p class="dv-s">${esc(p.subtitle)}</p>
<ol>${p.units.map((u, i) => `<li><span>${pad(p.from + i)}</span>${esc(u.title)}</li>`).join("")}</ol></div>`);
  p.units.forEach((u, i) => {
    const no = p.from + i;
    fixed("plain", `
<div class="opener">
  <p class="kicker">ÜNİTE ${pad(no)} · BÖLÜM ${pi + 1}</p>
  <h2>${esc(u.title)}</h2>
  <p class="op-q">${esc(u.question)}</p>
  <p class="lead">${esc(u.intro)}</p>
  <p class="kicker mt">BU ÜNİTEDEKİ ${u.entries.length} KALIP</p>
  <div class="chips">${u.entries.map((e) => `<span>${esc(e[0])}</span>`).join("")}</div>
  <div class="contrasts"><p class="kicker light">İNCE AYRIMLAR</p>${u.contrasts.map(([a, b]) => `<p><b>${esc(a)}</b> ${esc(b)}</p>`).join("")}</div>
</div>`, `u${no}`);
    flow(`e${no}`, `ÜNİTE ${pad(no)} · ${u.title}`, 2, u.entries.map((e, k) => {
      const id = `x${no}-${k}`;
      indexItems.push({ prep: e[0], unit: no, id });
      return `<div class="entry" data-id="${id}"><p class="en-h">${esc(e[0])}</p><p class="en-tr">${esc(e[1])}</p><p class="en-note">${esc(e[2])}</p><p class="en-ex">${esc(e[3])}</p><p class="en-trx">${esc(e[4])}</p></div>`;
    }));
    const qs = u.questions.map(place);
    practiceKeys.push(`<p><b>Ünite ${pad(no)}:</b> ${u.practice.map(([, a], k) => `${k + 1}. ${esc(a)}`).join(" · ")}</p>`);
    examKeys.push(`<p><b>Ünite ${pad(no)}:</b> ${qs.map((q, k) => `${k + 1}-${LETTERS[q.answer]}`).join("  ")}</p>`);
    flow(`p${no}`, `ÜNİTE ${pad(no)} · PRATİK VE SINAV`, 1, [
      `<div class="sec-h">BOŞLUK DOLDURMA · 10 CÜMLE</div>`,
      `<ol class="practice">${u.practice.map(([s]) => `<li>${blank(s)}</li>`).join("")}</ol>`,
      `<div class="sec-h">SINAVDA KARAR ANI · ${qs.length} ÖZGÜN SORU</div>`,
      ...qs.map((q, k) => `
<div class="q"><p class="q-stem"><b>${k + 1}.</b> ${blank(q.stem)}</p><p class="q-opts">${q.options.map((o, oi) => `<span><b>${LETTERS[oi]})</b> ${esc(o)}</span>`).join("")}</p>
<div class="q-why"><div class="ans"><p class="kicker">CEVAP · ${LETTERS[q.answer]}</p><p>${esc(q.why)}</p></div><div class="trap"><p class="kicker red">ÇELDİRİCİ</p><p>${esc(q.trap)}</p></div></div></div>`),
      `<div class="keybox"><b>Boşluk doldurma cevapları:</b> ${u.practice.map(([, a], k) => `${k + 1}. ${esc(a)}`).join(" · ")}</div>`,
    ]);
  });
});

// ---------- final test, keys, index ----------
const finalQs = FINAL_TEST.map(place);
flow("final", "FİNAL TESTİ · 40 SORU", 2, [
  `<div class="sec-h">FİNAL TESTİ · 40 SORU · ÖNERİLEN SÜRE 40 DAKİKA</div>`,
  ...finalQs.map((q, k) => `<div class="fq"><p><b>${k + 1}.</b> ${blank(q.stem)}</p><p class="fq-opts">${q.options.map((o, oi) => `<span><b>${LETTERS[oi]})</b> ${esc(o)}</span>`).join("")}</p></div>`),
]);
flow("keys", "CEVAP ANAHTARLARI", 1, [
  `<div class="sec-h">FİNAL TESTİ</div>`,
  `<div class="fkey">${finalQs.map((q, k) => `<span><i>${k + 1}</i>${LETTERS[q.answer]}</span>`).join("")}</div>`,
  ...finalQs.map((q, k) => `<div class="fsol"><b>${k + 1} · ${LETTERS[q.answer]}</b> ${esc(q.why)} <span>${esc(q.trap)}</span></div>`),
  `<div class="sec-h">ÜNİTE SINAV SORULARI</div>`,
  `<div class="keys">${examKeys.join("")}</div>`,
]);
const sorted = [...indexItems].sort((a, b) => a.prep.localeCompare(b.prep, "en", { sensitivity: "base" }));
flow("index", "ALFABETİK DİZİN", 2, [
  `<div class="sec-h">ALFABETİK DİZİN · KALIP · ÜNİTE / SAYFA</div>`,
  ...sorted.map((x) => `<p class="ix"><span>${esc(x.prep)}</span><b>${pad(x.unit)} / <em data-page-of="${x.id}"></em></b></p>`),
]);
fixed("cover", backCoverHtml(COVER));

// ---------- styles ----------
const CSS = `
${COVER_CSS}
:root { --accent: ${COVER.accent}; --ink: #14241b; --muted: #5d6b63; --line: #d9e1dc; --soft: #f3f6f4; --green: #0f2f1f; --pink: #c2185b; }
body { margin: 0; background: #888; font-family: "Liberation Sans", Arial, sans-serif; color: var(--ink); }
.page { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden; page-break-after: always; }
.page.cover { background: none; }
.ph { position: absolute; top: 0; left: 0; right: 0; height: 13mm; background: var(--green); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 13mm; font-size: 7.4pt; font-weight: 700; letter-spacing: .14em; border-bottom: 1.2mm solid var(--accent); }
.ph b { color: var(--accent); max-width: 120mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pf { position: absolute; bottom: 7mm; left: 13mm; right: 13mm; display: flex; justify-content: space-between; font-size: 7.4pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 1.6mm; }
.cols { position: absolute; top: 20mm; bottom: 15mm; left: 13mm; right: 13mm; display: grid; column-gap: 7mm; }
.cols.c2 { grid-template-columns: 1fr 1fr; }
.cols.c1 { grid-template-columns: 1fr; }
.col { overflow: hidden; height: 100%; }
.kicker { font-size: 7.6pt; font-weight: 700; letter-spacing: .2em; color: var(--pink); }
.kicker.red { color: #b3261e; } .kicker.light { color: var(--accent); }
.mt { margin-top: 6mm; }
.page-h { font-family: "Liberation Serif", serif; font-size: 24pt; color: var(--green); margin-top: 2mm; }
.lead { margin-top: 4mm; font-size: 10pt; line-height: 1.6; color: #2c3a32; }
/* entries */
.entry { border: 1px solid var(--line); border-left: 1.4mm solid var(--accent); border-radius: 0 2mm 2mm 0; padding: 2.4mm 3.2mm; margin-bottom: 3mm; break-inside: avoid; }
.en-h { font-weight: 700; font-size: 10.4pt; color: var(--green); }
.en-tr { font-size: 8.6pt; font-weight: 700; color: var(--pink); margin-top: .4mm; }
.en-note { font-size: 8pt; color: var(--muted); margin-top: .8mm; line-height: 1.4; }
.en-ex { font-family: "Liberation Serif", serif; font-style: italic; font-size: 9.2pt; margin-top: 1.4mm; line-height: 1.35; }
.en-trx { font-size: 8pt; color: var(--muted); margin-top: .4mm; line-height: 1.35; }
/* practice + questions */
.sec-h { background: var(--green); color: #fff; font-weight: 700; font-size: 8.2pt; letter-spacing: .14em; padding: 2mm 3mm; border-radius: 1.6mm; margin: 0 0 3mm; }
.sec-h::before { content: ""; display: inline-block; width: 2mm; height: 2mm; border-radius: 50%; background: var(--accent); margin-right: 2mm; vertical-align: .2mm; }
.practice { padding-left: 7mm; font-family: "Liberation Serif", serif; font-size: 10pt; line-height: 1.5; margin-bottom: 4mm; }
.practice li { margin-bottom: 1.2mm; }
.blank { display: inline-block; border-bottom: 1px solid var(--ink); min-width: 16mm; color: transparent; line-height: 1; }
.q { border: 1px solid var(--line); border-radius: 2.4mm; padding: 3mm 4mm; margin-bottom: 3mm; }
.q-stem { font-family: "Liberation Serif", serif; font-size: 10pt; line-height: 1.45; }
.q-opts { display: flex; flex-wrap: wrap; gap: 1mm 6mm; margin-top: 1.6mm; font-size: 9pt; }
.q-why { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 2.4mm; font-size: 8pt; line-height: 1.45; }
.q-why > div { border-radius: 2mm; padding: 2.2mm 3mm; }
.ans { background: #eaf3ee; } .trap { background: #fbeaea; }
.keybox { margin-top: 2mm; font-size: 8pt; color: var(--muted); border-top: 1px dashed var(--line); padding-top: 2mm; }
/* final test */
.fq { font-family: "Liberation Serif", serif; font-size: 9.4pt; line-height: 1.38; margin-bottom: 3mm; }
.fq-opts { display: grid; grid-template-columns: 1fr 1fr; gap: .4mm 3mm; margin-top: 1mm; font-size: 8.8pt; }
.fkey { display: grid; grid-template-columns: repeat(10, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); margin-bottom: 4mm; }
.fkey span { border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); text-align: center; padding: 1mm 0; font-weight: 700; font-size: 9pt; }
.fkey i { display: block; font-style: normal; font-weight: 400; font-size: 6.4pt; color: var(--muted); }
.fsol { font-size: 8.2pt; line-height: 1.45; margin-bottom: 1.6mm; }
.fsol span { color: var(--muted); }
.keys p { font-size: 8.4pt; line-height: 1.7; }
/* index */
.ix { display: flex; justify-content: space-between; gap: 2mm; border-bottom: 1px dotted #cfd8d2; padding: .5mm 0; font-size: 8pt; }
.ix b { white-space: nowrap; color: var(--pink); } .ix em { font-style: normal; }
/* title, prose, toc, divider, opener */
.titlepage { position: absolute; inset: 30mm 22mm; display: flex; flex-direction: column; align-items: center; text-align: center; }
.tp-brand, .intro-brand { display: flex; align-items: center; gap: 2.4mm; font-weight: 700; letter-spacing: .3em; font-size: 9pt; }
.titlepage h1 { margin-top: 24mm; font-family: "Liberation Serif", serif; font-size: 40pt; line-height: 1.05; color: var(--green); }
.titlepage h1 span { color: var(--pink); }
.tp-exam { margin-top: 8mm; letter-spacing: .3em; font-weight: 700; font-size: 10pt; }
.tp-sub { margin-top: 6mm; font-size: 11pt; color: var(--muted); max-width: 140mm; line-height: 1.5; }
.tp-count { margin-top: 10mm; font-weight: 700; font-size: 10pt; }
.legal { position: absolute; bottom: 0; left: 0; right: 0; font-size: 7.6pt; color: var(--muted); line-height: 1.55; }
.prose { position: absolute; inset: 18mm 18mm 16mm; }
.steps { margin-top: 6mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.steps div { display: flex; gap: 3mm; background: var(--soft); border-radius: 2.4mm; padding: 3.6mm 4mm; font-size: 8.8pt; line-height: 1.5; }
.steps b { display: grid; place-items: center; flex: 0 0 7mm; height: 7mm; border-radius: 50%; background: var(--green); color: #fff; font-size: 9pt; box-shadow: 0 0 0 1mm var(--accent); }
.part-row { display: flex; gap: 4mm; align-items: center; border-bottom: 1px solid var(--line); padding: 2.6mm 0; font-size: 9.4pt; }
.part-row span { display: grid; place-items: center; width: 9mm; height: 9mm; border-radius: 2mm; background: var(--green); color: var(--accent); font-weight: 700; }
.part-row p { color: var(--muted); font-size: 8.4pt; margin-top: .4mm; }
.tip { margin-top: 6mm; background: var(--soft); border-radius: 2.4mm; padding: 4mm 5mm; font-size: 9pt; line-height: 1.55; }
.toc { margin-top: 4mm; font-size: 8.8pt; }
.toc p { display: flex; align-items: baseline; gap: 2mm; padding: .8mm 0; }
.toc i { flex: 1; border-bottom: 1px dotted #a9b5ae; }
.toc b { min-width: 7mm; text-align: right; }
.toc .toc-part { display: block; margin-top: 3mm; font-size: 7.4pt; font-weight: 700; letter-spacing: .2em; color: var(--pink); }
.page.divider { background: var(--green); color: #fff; }
.dv { position: absolute; inset: 40mm 24mm; }
.dv-k { letter-spacing: .3em; font-weight: 700; color: var(--accent); font-size: 10pt; }
.dv h1 { margin-top: 6mm; font-family: "Liberation Serif", serif; font-size: 44pt; }
.dv-s { margin-top: 4mm; font-size: 11pt; color: rgba(255,255,255,.8); }
.dv ol { list-style: none; margin-top: 18mm; }
.dv li { display: flex; gap: 5mm; padding: 3mm 0; border-bottom: 1px solid rgba(255,255,255,.18); font-size: 11pt; }
.dv li span { color: var(--accent); font-weight: 700; }
.opener { position: absolute; inset: 20mm 17mm 16mm; }
.opener h2 { margin-top: 2mm; font-family: "Liberation Serif", serif; font-size: 24pt; color: var(--green); line-height: 1.15; }
.op-q { margin-top: 3mm; font-size: 11pt; font-style: italic; color: var(--pink); }
.chips { display: flex; flex-wrap: wrap; gap: 1.6mm; margin-top: 3mm; }
.chips span { border: 1px solid var(--line); background: var(--soft); border-radius: 10mm; padding: 1mm 3mm; font-size: 8.2pt; font-weight: 700; }
.contrasts { margin-top: 6mm; background: var(--green); color: #eef4f0; border-radius: 3mm; padding: 4.5mm 5.5mm; font-size: 8.8pt; line-height: 1.55; }
.contrasts p + p { margin-top: 2mm; }
.contrasts b { color: var(--accent); }
`;

/** Turns the parts into pages in the browser; fills contents and index page numbers. */
function paginate() {
  const book = document.getElementById("book")!;
  const list = JSON.parse(document.getElementById("parts")!.textContent!) as (
    | { kind: "flow"; id: string; head: string; cols: 1 | 2; blocks: string[] }
    | { kind: "fixed"; cls: string; html: string; toc?: string; head?: string }
  )[];
  const toc: Record<string, number> = {};
  let n = 0;
  const overflowing: string[] = [];
  const foot = (page: HTMLElement) => page.insertAdjacentHTML("beforeend", `<div class="pf"><span>netfener.com · Prepositions Master Class</span><span>${n}</span></div>`);
  const newPage = (cls: string) => {
    const page = document.createElement("div");
    page.className = `page ${cls}`;
    book.appendChild(page);
    n++;
    return page;
  };
  for (const part of list) {
    if (part.kind === "fixed") {
      const page = newPage(part.cls);
      page.innerHTML = part.html;
      if (part.toc) toc[part.toc] = n;
      if (part.cls === "plain") foot(page);
      continue;
    }
    toc[part.id] = n + 1;
    let cols: HTMLElement[] = [];
    let c = 99;
    const nextCol = () => {
      c++;
      if (c >= cols.length) {
        const page = newPage("flow");
        page.insertAdjacentHTML("beforeend", `<div class="ph"><span>NETFENER · PREPOSITIONS MASTER CLASS</span><b>${part.head}</b></div>`);
        foot(page);
        page.insertAdjacentHTML("beforeend", `<div class="cols c${part.cols}">${'<div class="col"></div>'.repeat(part.cols)}</div>`);
        cols = [...page.querySelectorAll<HTMLElement>(".col")];
        c = 0;
      }
      return cols[c];
    };
    let col = nextCol();
    for (let i = 0; i < part.blocks.length; i++) {
      // A section header travels with the block after it.
      const header = part.blocks[i].includes('class="sec-h"');
      const html = header && i + 1 < part.blocks.length ? part.blocks[i] + part.blocks[++i] : part.blocks[i];
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      col.appendChild(wrap);
      if (col.scrollHeight > col.clientHeight + 1) {
        col.removeChild(wrap);
        col = nextCol();
        col.appendChild(wrap);
        if (col.scrollHeight > col.clientHeight + 1) overflowing.push(`${part.id}: block ${i} taller than a column`);
      }
    }
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-toc]")) el.textContent = String(toc[el.dataset.toc!] ?? "");
  const pages = [...document.querySelectorAll<HTMLElement>(".page")];
  for (const el of document.querySelectorAll<HTMLElement>("[data-page-of]")) {
    const target = document.querySelector(`[data-id="${el.dataset.pageOf}"]`);
    el.textContent = target ? String(pages.indexOf(target.closest(".page") as HTMLElement) + 1).padStart(2, "0") : "";
  }
  for (const [i, page] of pages.entries()) {
    if (!page.classList.contains("plain")) continue;
    const box = page.getBoundingClientRect();
    const bottom = Math.max(0, ...[...page.querySelectorAll("*")].filter((e) => !e.closest(".pf") && !e.classList.contains("legal") && !e.closest(".legal")).map((e) => e.getBoundingClientRect().bottom - box.top));
    if (bottom > box.height - 40) overflowing.push(`page ${i + 1}: content ends at ${Math.round(bottom)}px`);
  }
  return { pages: n, overflowing };
}

async function main() {
  const out = (...p: string[]) => path.join(ROOT, ...p);
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${CSS}</style></head><body><div id="book"></div><script type="application/json" id="parts">${JSON.stringify(parts).replace(/</g, "\\u003c")}</script></body></html>`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.25 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  // tsx keeps function names with a __name() helper that does not exist in the page.
  await page.evaluate("globalThis.__name = (f) => f");
  const { pages, overflowing } = await page.evaluate(paginate);
  if (overflowing.length) {
    console.error("Overflow:\n" + overflowing.join("\n"));
    if (!process.env.ALLOW_OVERFLOW) process.exit(1);
  }
  await page.evaluate(() => { document.body.style.background = "#fff"; });
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  await writeFile(out(`content/ebooks/netfener-${SLUG}.pdf`), pdf);

  // Preview: cover, how-to, contents, first part divider, unit 1 opener + entries + practice,
  // a later unit's entries, the final test and the index.
  const all = page.locator(".page");
  const find = (sel: string) => all.evaluateAll((els, s) => els.findIndex((e) => e.querySelector(s)), sel);
  const firstDivider = await all.evaluateAll((els) => els.findIndex((e) => e.classList.contains("divider")));
  const firstEntry = await find(".entry");
  const firstPractice = await find(".practice");
  const laterEntry = await find('[data-id="x24-0"]');
  const finalAt = await find(".fq");
  const indexAt = await find(".ix");
  const preview = [0, 2, 3, firstDivider, firstDivider + 1, firstEntry, firstPractice, laterEntry, finalAt, indexAt];
  await mkdir(out("public/ebooks/previews"), { recursive: true });
  await mkdir(out("public/ebooks/covers"), { recursive: true });
  for (const [i, at] of preview.entries()) {
    const jpeg = await all.nth(at).screenshot({ type: "jpeg", quality: 84, scale: "device" });
    if (i === 0) await writeFile(out(`public/ebooks/covers/${SLUG}.jpg`), jpeg);
    await writeFile(out(`public/ebooks/previews/${SLUG}-${i + 1}.jpg`), jpeg);
  }
  const full = mupdf.Document.openDocument(pdf, "application/pdf") as mupdf.PDFDocument;
  const sample = new mupdf.PDFDocument();
  for (const at of preview) sample.graftPage(-1, full, at);
  await writeFile(out(`public/ebooks/previews/${SLUG}.pdf`), sample.saveToBuffer("garbage=compact,compress").asUint8Array());
  await browser.close();
  console.log(`${SLUG}: ${pages} pages · ${TOTAL_ENTRIES} entries · ${TOTAL_Q} questions`);
}

void main();
