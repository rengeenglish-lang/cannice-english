/**
 * Builds the two "Özgün YDS Denemeleri" books from content/yds-denemeler:
 *   content/ebooks/netfener-yds-denemeleri-set-{1,2}.pdf          (the books, private)
 *   public/ebooks/covers/yds-denemeleri-set-{1,2}.jpg             (covers)
 *   public/ebooks/previews/yds-denemeleri-set-{1,2}-{1..10}.jpg   (preview pages) and .pdf
 *
 * Each book: cover, how-to + contents, then per test an opener page, two-column question pages
 * and an answer sheet; then answer keys, a score tracking table, explanations and a back cover.
 * Question pages are filled in the browser: blocks go into columns until a column is full.
 *
 *   npx tsx scripts/check-yds-denemeler.mts && npx tsx scripts/build-yds-denemeler.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as mupdf from "mupdf";
import { chromium } from "playwright";
import { LETTERS, ROMAN, SETS, printed, type Printed } from "../content/yds-denemeler/index";
import { SECTIONS, type Deneme } from "../content/yds-denemeler/types";
import { COVER_CSS, backCoverHtml, coverHtml, findCover } from "./ebook-covers/designs";

const ROOT = process.cwd();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** "----" blanks as a printed line. */
const blanks = (s: string) => esc(s).replace(/-{4}/g, '<span class="blank">----</span>');

const LOGO = `<svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true"><g stroke-linejoin="round" stroke-width="2"><polygon points="10,15.6 34,49.4 34,56 10,66" fill="#138a43" stroke="#138a43"/><polygon points="66,4 90,4 90,22 66,32" fill="#42a169" stroke="#42a169"/><polygon points="10,72 34,62 34,96 10,96" fill="#10291c" stroke="#10291c"/><polygon points="66,38 90,28 90,80.4 66,46.6" fill="#10291c" stroke="#10291c" opacity="0.82"/><polygon points="10,10 36,10 90,86 64,86" fill="#10291c" stroke="#10291c"/></g></svg>`;

type Flow = { kind: "flow"; id: string; head: string; blocks: string[] };
type Fixed = { kind: "fixed"; cls: string; html: string; head?: string };
type Part = Flow | Fixed;

const optionsHtml = (p: Printed) =>
  `<ol class="opts">${p.options.map((o, i) => `<li><b>${LETTERS[i]})</b> ${esc(o)}</li>`).join("")}</ol>`;

function questionBlock(p: Printed) {
  if (p.section === "cloze") return `<div class="q q-cloze"><span class="qn">${p.n}.</span>${optionsHtml(p)}</div>`;
  if (p.section === "irrelevant") {
    const text = p.sentences!.map((s, i) => `<b>(${ROMAN[i]})</b> ${esc(s)}`).join(" ");
    return `<div class="q"><span class="qn">${p.n}.</span><p class="stem">${text}</p>${optionsHtml(p)}</div>`;
  }
  if (p.section === "dialogue") {
    const lines = p.stem.split("\n").map((l) => {
      const m = l.match(/^([^:]{1,24}):\s*(.*)$/);
      return m ? `<p><b>${esc(m[1])}:</b> ${blanks(m[2])}</p>` : `<p>${blanks(l)}</p>`;
    });
    return `<div class="q"><span class="qn">${p.n}.</span><div class="stem dialogue">${lines.join("")}</div>${optionsHtml(p)}</div>`;
  }
  const cls = p.section === "enTr" || p.section === "trEn" || p.section === "restatement" ? "stem quote" : "stem";
  return `<div class="q"><span class="qn">${p.n}.</span><p class="${cls}">${blanks(p.stem)}</p>${optionsHtml(p)}</div>`;
}

function sectionHead(key: string) {
  const s = SECTIONS.find((x) => x.key === key)!;
  return `<div class="sec"><p class="sec-t">${esc(s.title)} <span>${s.from}–${s.to}</span></p><p class="sec-i">${esc(s.instruction)}</p></div>`;
}

function testBlocks(d: Deneme) {
  const qs = printed(d);
  const out: string[] = [];
  let section = "";
  let passage = -1;
  for (const p of qs) {
    if (p.section !== section) {
      // Keep the section header with its first question so a header never ends a column.
      section = p.section;
      passage = -1;
      out.push(sectionHead(section));
    }
    if (p.section === "cloze" && p.passage !== passage) {
      passage = p.passage!;
      const first = qs.find((x) => x.section === "cloze" && x.passage === passage)!.n;
      const text = esc(d.cloze[passage].text).replace(/\{(\d)\}/g, (_, k) => `<span class="gap">(${first + Number(k) - 1}) ----</span>`);
      out.push(`<div class="passage"><p>${text}</p></div>`);
    }
    if (p.section === "reading" && p.passage !== passage) {
      passage = p.passage!;
      const first = qs.find((x) => x.section === "reading" && x.passage === passage)!.n;
      out.push(`<div class="passage"><p class="p-note">${first} – ${first + 3}. soruları aşağıdaki parçaya göre cevaplayınız.</p><p>${esc(d.reading[passage].text)}</p></div>`);
    }
    out.push(questionBlock(p));
  }
  out.push(`<div class="end">TEST BİTTİ.<br>CEVAPLARINIZI KONTROL EDİNİZ.</div>`);
  return out;
}

function solutionBlocks(d: Deneme) {
  return [
    `<div class="sol-head">DENEME ${d.no} · ÇÖZÜMLER</div>`,
    ...printed(d).map((p) => {
      const right = p.section === "irrelevant" ? `(${ROMAN[p.answer]}) ${p.sentences![p.answer]}` : p.options[p.answer];
      return `<div class="sol"><span class="sol-n">${p.n}</span><span class="sol-a">${LETTERS[p.answer]}</span><p><b>${esc(right.length > 90 ? right.slice(0, 88) + "…" : right)}</b> ${esc(p.why)}</p></div>`;
    }),
  ];
}

const opener = (d: Deneme, set: number) => `
<div class="op">
  <p class="op-k">ÖZGÜN YDS DENEMELERİ · SET ${set}</p>
  <h1>DENEME <span>${d.no}</span></h1>
  <p class="op-s">80 soru · 180 dakika · Her doğru 1,25 puan</p>
  <table class="op-t"><thead><tr><th>Bölüm</th><th>Sorular</th><th>Soru</th><th>Önerilen süre</th></tr></thead><tbody>
  ${SECTIONS.map((s) => `<tr><td>${esc(s.title)}</td><td>${s.from}–${s.to}</td><td>${s.to - s.from + 1}</td><td>${{ vocab: 6, grammar: 10, cloze: 14, completion: 15, enTr: 8, trEn: 8, reading: 60, dialogue: 10, restatement: 10, paragraph: 12, irrelevant: 10 }[s.key]} dk</td></tr>`).join("")}
  </tbody></table>
  <div class="op-box">
    <p><b>Başlamadan önce</b></p>
    <p>Saatini 180 dakikaya kur ve testi tek oturumda, ara vermeden çöz. Cevaplarını test sonundaki cevap kâğıdına işaretle. Bilmediğin soruyu boş bırakabilirsin; YDS'de yanlışlar doğruları götürmez, bu yüzden süre bitmeden her soruya bir cevap vermeye çalış.</p>
    <div class="op-times"><span>Başlama: ______</span><span>Bitiş: ______</span><span>Tarih: ____________</span></div>
  </div>
</div>`;

function answerSheet(d: Deneme) {
  const col = (from: number) =>
    `<div class="as-col">${Array.from({ length: 20 }, (_, i) => `<p><b>${from + i}</b>${LETTERS.map((l) => `<span>${l}</span>`).join("")}</p>`).join("")}</div>`;
  return `
<div class="as">
  <div class="as-top"><div><p class="op-k">CEVAP KÂĞIDI</p><h2>DENEME ${d.no}</h2></div><div class="as-name">Ad Soyad: ______________________</div></div>
  <div class="as-grid">${[1, 21, 41, 61].map(col).join("")}</div>
  <div class="as-score"><span>Doğru: ______</span><span>Yanlış: ______</span><span>Boş: ______</span><span>Puan = Doğru × 1,25 = ______</span></div>
</div>`;
}

function answerKeys(list: readonly Deneme[]) {
  return `<div class="keys"><h2 class="page-h">Cevap Anahtarları</h2>${list
    .map((d) => {
      const qs = printed(d);
      return `<div class="key"><p class="key-t">DENEME ${d.no}</p><div class="key-g">${qs.map((p) => `<span><i>${p.n}</i>${LETTERS[p.answer]}</span>`).join("")}</div></div>`;
    })
    .join("")}</div>`;
}

function tracker(list: readonly Deneme[]) {
  return `<div class="track"><h2 class="page-h">Net ve Puan Takibi</h2>
  <p class="lead">Her denemeden sonra bölüm bölüm doğru sayını yaz. Hangi bölümde puan kaybettiğini görmek, bir sonraki denemeye nasıl çalışacağını belirler.</p>
  <table><thead><tr><th>Bölüm</th>${list.map((d) => `<th>D${d.no}</th>`).join("")}</tr></thead><tbody>
  ${SECTIONS.map((s) => `<tr><td>${esc(s.title)} <small>(${s.to - s.from + 1})</small></td>${list.map(() => "<td></td>").join("")}</tr>`).join("")}
  <tr class="sum"><td>Toplam doğru (80)</td>${list.map(() => "<td></td>").join("")}</tr>
  <tr class="sum"><td>Puan (doğru × 1,25)</td>${list.map(() => "<td></td>").join("")}</tr>
  </tbody></table>
  <div class="tips"><p><b>Puan hesaplama:</b> YDS'de 80 sorunun her biri 1,25 puandır ve yanlışlar doğruları götürmez. 60 doğru = 75 puan; 64 doğru = 80 puan; 70 doğru = 87,5 puan.</p>
  <p><b>Deneme sonrası:</b> Yanlış ve boş bıraktığın her soru için çözümü oku, sonra soruyu çözümlere bakmadan yeniden çöz. Aynı türde iki kez yanlış yaptığın soruları Netfener'de konu konu çalış.</p></div></div>`;
}

function intro(set: number, list: readonly Deneme[]) {
  return `<div class="intro">
  <div class="intro-brand">${LOGO}<span>NETFENER</span></div>
  <h2 class="page-h">Bu kitap nasıl kullanılır?</h2>
  <p class="lead">Özgün YDS Denemeleri Set ${set}, YDS'nin soru türlerini, sırasını ve süresini birebir izleyen beş tam deneme içerir. Kitaptaki tüm cümleler, parçalar ve sorular Netfener için yazılmıştır; ÖSYM sınavlarından ya da başka yayınlardan alınmış soru yoktur.</p>
  <div class="steps">
    <div><b>1</b><p><strong>Gerçek koşullar.</strong> Her denemeyi 180 dakikada, tek oturumda ve telefonsuz çöz. Deneme açılış sayfasındaki önerilen süreler, zamanını bölümlere göre planlamana yardım eder.</p></div>
    <div><b>2</b><p><strong>Cevap kâğıdı.</strong> Cevaplarını her denemenin sonundaki cevap kâğıdına işaretle; sınavdaki gibi kitapçık üzerinde değil, ayrı kâğıtta çalışma alışkanlığı kazan.</p></div>
    <div><b>3</b><p><strong>Kontrol ve takip.</strong> Cevap anahtarıyla kontrol et, doğru sayını ve puanını takip tablosuna yaz. Bölüm bazında ilerlemen hangi konuya yoğunlaşman gerektiğini gösterir.</p></div>
    <div><b>4</b><p><strong>Çözümler.</strong> Her sorunun neden doğru olduğu ve çeldiricilerin neden yanlış olduğu Türkçe açıklanır. Yanlışlarını okuyup soruyu yeniden çözmeden bir sonraki denemeye geçme.</p></div>
  </div>
  <h3 class="mini-h">İçindekiler</h3>
  <div class="toc">${list.map((d) => `<p><span>Deneme ${d.no}</span><i></i><b data-toc="t${d.no}"></b></p>`).join("")}
  <p><span>Cevap anahtarları</span><i></i><b data-toc="keys"></b></p><p><span>Net ve puan takibi</span><i></i><b data-toc="track"></b></p>${list
    .map((d) => `<p><span>Çözümler · Deneme ${d.no}</span><i></i><b data-toc="s${d.no}"></b></p>`)
    .join("")}</div>
  <p class="legal">© ${new Date().getFullYear()} Netfener. Bu kitabın tamamı Netfener'e aittir; izinsiz çoğaltılamaz ve paylaşılamaz. netfener.com</p>
</div>`;
}

function bookParts(set: number, list: readonly Deneme[]): Part[] {
  const cover = findCover(`yds-denemeleri-set-${set}`)!;
  const parts: Part[] = [
    { kind: "fixed", cls: "cover", html: coverHtml(cover) },
    { kind: "fixed", cls: "plain", html: intro(set, list) },
  ];
  for (const d of list) {
    parts.push({ kind: "fixed", cls: "plain", html: opener(d, set), head: `t${d.no}` });
    parts.push({ kind: "flow", id: `q${d.no}`, head: `DENEME ${d.no}`, blocks: testBlocks(d) });
    parts.push({ kind: "fixed", cls: "plain", html: answerSheet(d) });
  }
  parts.push({ kind: "fixed", cls: "plain", html: answerKeys(list), head: "keys" });
  parts.push({ kind: "fixed", cls: "plain", html: tracker(list), head: "track" });
  for (const d of list) parts.push({ kind: "flow", id: `s${d.no}`, head: `ÇÖZÜMLER · DENEME ${d.no}`, blocks: solutionBlocks(d) });
  parts.push({ kind: "fixed", cls: "cover", html: backCoverHtml(cover) });
  return parts;
}

const CSS = (accent: string) => `
${COVER_CSS}
:root { --accent: ${accent}; --ink: #14241b; --muted: #5d6b63; --line: #d9e1dc; --soft: #f3f6f4; --green: #0f2f1f; }
body { margin: 0; background: #888; font-family: "Liberation Sans", Arial, sans-serif; color: var(--ink); }
.page { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden; page-break-after: always; }
.page.cover { background: none; }
.ph { position: absolute; top: 9mm; left: 13mm; right: 13mm; display: flex; align-items: center; justify-content: space-between; border-bottom: 1.4px solid var(--ink); padding-bottom: 2mm; font-size: 7.6pt; font-weight: 700; letter-spacing: .14em; }
.ph b { background: var(--green); color: #fff; padding: 1.2mm 3.4mm; border-radius: 1.5mm; letter-spacing: .1em; }
.ph b::before { content: ""; display: inline-block; width: 2mm; height: 2mm; border-radius: 50%; background: var(--accent); margin-right: 1.6mm; vertical-align: .2mm; }
.pf { position: absolute; bottom: 7mm; left: 13mm; right: 13mm; display: flex; justify-content: space-between; font-size: 7.4pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 1.6mm; }
.cols { position: absolute; top: 19mm; bottom: 15mm; left: 13mm; right: 13mm; display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; }
.cols::after { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; border-left: 1px solid var(--line); }
.col { overflow: hidden; height: 100%; }
.body { position: absolute; inset: 15mm 15mm 15mm; }
/* questions */
.sec { background: var(--soft); border-left: 1.2mm solid var(--accent); border-radius: 0 1.6mm 1.6mm 0; padding: 2mm 3mm; margin: 0 0 3mm; }
.sec-t { font-weight: 700; font-size: 8.8pt; letter-spacing: .04em; }
.sec-t span { color: var(--muted); font-weight: 400; margin-left: 1mm; }
.sec-i { margin-top: .8mm; font-size: 7.8pt; font-weight: 700; line-height: 1.35; }
.q { position: relative; padding-left: 6.5mm; margin-bottom: 3.6mm; font-family: "Liberation Serif", Georgia, serif; font-size: 9.6pt; line-height: 1.36; }
.qn { position: absolute; left: 0; top: 0; font-family: "Liberation Sans", Arial, sans-serif; font-weight: 700; font-size: 8.8pt; }
.stem { margin-bottom: 1.2mm; text-align: justify; hyphens: auto; }
.stem.quote { font-style: italic; }
.dialogue p { margin-bottom: .5mm; }
.blank { letter-spacing: .05em; white-space: nowrap; }
.opts { list-style: none; }
.opts li { padding-left: 4.6mm; text-indent: -4.6mm; margin-bottom: .35mm; }
.opts b { font-family: "Liberation Sans", Arial, sans-serif; font-size: 8.4pt; }
.q-cloze { margin-bottom: 2.6mm; }
.passage { font-family: "Liberation Serif", Georgia, serif; font-size: 9.6pt; line-height: 1.38; text-align: justify; hyphens: auto; margin-bottom: 3.4mm; border: 1px solid var(--line); border-radius: 1.6mm; padding: 2.6mm 3mm; }
.p-note { font-family: "Liberation Sans", Arial, sans-serif; font-size: 7.8pt; font-weight: 700; margin-bottom: 1.2mm; text-align: left; }
.gap { font-weight: 700; white-space: nowrap; }
.end { margin-top: 4mm; border: 1.4px solid var(--ink); border-radius: 1.6mm; padding: 3mm; text-align: center; font-weight: 700; font-size: 8.6pt; letter-spacing: .08em; }
/* solutions */
.sol-head { font-weight: 700; letter-spacing: .12em; font-size: 9pt; margin-bottom: 3mm; color: var(--green); }
.sol { display: grid; grid-template-columns: 6.5mm 5.4mm 1fr; gap: 1.6mm; align-items: start; font-size: 7.9pt; line-height: 1.38; margin-bottom: 2.2mm; }
.sol-n { font-weight: 700; text-align: right; padding-top: .3mm; }
.sol-a { display: grid; place-items: center; width: 5mm; height: 5mm; border-radius: 50%; background: var(--green); color: #fff; font-weight: 700; font-size: 7.4pt; }
.sol p { color: #2c3a32; }
.sol p b { color: var(--ink); }
/* opener */
.op { position: absolute; inset: 22mm 20mm 18mm; }
.op-k { font-size: 8pt; font-weight: 700; letter-spacing: .26em; color: var(--muted); }
.op h1 { margin-top: 4mm; font-family: "Liberation Serif", serif; font-size: 50pt; line-height: 1; color: var(--green); }
.op h1 span { color: #fff; background: var(--green); padding: 0 5mm; border-radius: 3mm; box-shadow: inset 0 -2.4mm 0 var(--accent); }
.op-s { margin-top: 5mm; font-size: 11pt; color: var(--muted); }
.op-t { margin-top: 9mm; width: 100%; border-collapse: collapse; font-size: 9.2pt; }
.op-t th { text-align: left; font-size: 7.6pt; letter-spacing: .12em; color: var(--muted); border-bottom: 1.4px solid var(--ink); padding: 2mm 1.5mm; }
.op-t td { border-bottom: 1px solid var(--line); padding: 2.1mm 1.5mm; }
.op-t td:nth-child(n+2) { white-space: nowrap; }
.op-box { margin-top: 9mm; background: var(--soft); border-radius: 3mm; padding: 5mm 6mm; font-size: 9.2pt; line-height: 1.55; }
.op-box p + p { margin-top: 1.4mm; }
.op-times { display: flex; gap: 8mm; margin-top: 4mm; font-weight: 700; font-size: 9pt; }
/* answer sheet */
.as { position: absolute; inset: 18mm 16mm 16mm; }
.as-top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.4px solid var(--ink); padding-bottom: 3mm; }
.as-top h2 { font-family: "Liberation Serif", serif; font-size: 24pt; color: var(--green); margin-top: 1mm; }
.as-name { font-size: 9pt; font-weight: 700; }
.as-grid { margin-top: 6mm; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.as-col p { display: flex; align-items: center; gap: 1.2mm; height: 9.9mm; border-bottom: 1px dashed var(--line); }
.as-col b { width: 6mm; text-align: right; font-size: 8.6pt; margin-right: .8mm; }
.as-col span { display: grid; place-items: center; width: 5.4mm; height: 5.4mm; border: 1.1px solid #6b7a71; border-radius: 50%; font-size: 6.6pt; color: #6b7a71; }
.as-score { margin-top: 6mm; display: flex; justify-content: space-between; border: 1.4px solid var(--ink); border-radius: 2mm; padding: 4mm 5mm; font-weight: 700; font-size: 9pt; }
/* keys, tracker, intro */
.keys, .track, .intro { position: absolute; inset: 18mm 17mm 16mm; }
.page-h { font-family: "Liberation Serif", serif; font-size: 22pt; color: var(--green); }
.key { margin-top: 4.4mm; }
.key-t { font-weight: 700; font-size: 8.4pt; letter-spacing: .16em; margin-bottom: 1.6mm; }
.key-g { display: grid; grid-template-columns: repeat(16, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.key-g span { border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); text-align: center; padding: .9mm 0; font-weight: 700; font-size: 8.6pt; }
.key-g i { display: block; font-style: normal; font-weight: 400; font-size: 6.4pt; color: var(--muted); }
.lead { margin-top: 4mm; font-size: 10pt; line-height: 1.6; color: #2c3a32; }
.track table { margin-top: 7mm; width: 100%; border-collapse: collapse; font-size: 9pt; }
.track th { background: var(--green); color: #fff; padding: 2.4mm; font-size: 8pt; letter-spacing: .1em; }
.track td { border: 1px solid var(--line); padding: 2.6mm 2.4mm; height: 9mm; }
.track td:first-child { width: 72mm; font-weight: 700; }
.track small { color: var(--muted); font-weight: 400; }
.track tr.sum td { background: var(--soft); }
.tips { margin-top: 8mm; font-size: 9pt; line-height: 1.6; }
.tips p + p { margin-top: 2.4mm; }
.intro-brand { display: flex; align-items: center; gap: 2.4mm; font-weight: 700; letter-spacing: .3em; font-size: 9pt; margin-bottom: 7mm; }
.steps { margin-top: 6mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.steps div { display: flex; gap: 3mm; background: var(--soft); border-radius: 2.4mm; padding: 3.6mm 4mm; font-size: 8.8pt; line-height: 1.5; }
.steps b { display: grid; place-items: center; flex: 0 0 7mm; height: 7mm; border-radius: 50%; background: var(--green); color: #fff; font-size: 9pt; box-shadow: 0 0 0 1mm var(--accent); }
.mini-h { margin-top: 8mm; font-size: 9pt; letter-spacing: .2em; color: var(--muted); }
.toc { margin-top: 3mm; font-size: 9.6pt; }
.toc p { display: flex; align-items: baseline; gap: 2mm; padding: 1.3mm 0; }
.toc i { flex: 1; border-bottom: 1px dotted #a9b5ae; }
.toc b { min-width: 8mm; text-align: right; }
.legal { position: absolute; bottom: 0; left: 0; right: 0; font-size: 7.6pt; color: var(--muted); }
`;

/** Turns the parts into pages in the browser and fills the contents page numbers. */
function paginate() {
  const book = document.getElementById("book")!;
  const parts = JSON.parse(document.getElementById("parts")!.textContent!) as (
    | { kind: "flow"; id: string; head: string; blocks: string[] }
    | { kind: "fixed"; cls: string; html: string; head?: string }
  )[];
  const title = book.dataset.title!;
  const toc: Record<string, number> = {};
  let n = 0;
  const newPage = (cls: string) => {
    const page = document.createElement("div");
    page.className = `page ${cls}`;
    book.appendChild(page);
    n++;
    return page;
  };
  const chrome = (page: HTMLElement, head: string) => {
    page.insertAdjacentHTML("beforeend", `<div class="ph"><span>${title}</span><b>${head}</b></div><div class="pf"><span>netfener.com</span><span>${n}</span></div>`);
  };
  const overflowing: string[] = [];
  for (const part of parts) {
    if (part.kind === "fixed") {
      const page = newPage(part.cls);
      page.innerHTML = part.html;
      if (part.head) toc[part.head] = n;
      if (part.cls !== "cover") page.insertAdjacentHTML("beforeend", `<div class="pf"><span>netfener.com</span><span>${n}</span></div>`);
      continue;
    }
    toc[part.id] = n + 1;
    let cols: HTMLElement[] = [];
    let c = 2;
    const nextCol = () => {
      c++;
      if (c > 1) {
        const page = newPage("flow");
        chrome(page, part.head);
        page.insertAdjacentHTML("beforeend", `<div class="cols"><div class="col"></div><div class="col"></div></div>`);
        cols = [...page.querySelectorAll<HTMLElement>(".col")];
        c = 0;
      }
      return cols[c];
    };
    let col = nextCol();
    for (let i = 0; i < part.blocks.length; i++) {
      const isHeader = /class="(sec|sol-head)"/.test(part.blocks[i]);
      // A section header travels with the block after it.
      const html = isHeader && i + 1 < part.blocks.length ? part.blocks[i] + part.blocks[++i] : part.blocks[i];
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      col.appendChild(wrap);
      if (col.scrollHeight > col.clientHeight + 1) {
        col.removeChild(wrap);
        if (!col.children.length) overflowing.push(`${part.id}: block too tall for an empty column`);
        col = nextCol();
        col.appendChild(wrap);
        if (col.scrollHeight > col.clientHeight + 1) overflowing.push(`${part.id}: block ${i} too tall`);
      }
    }
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-toc]")) el.textContent = String(toc[el.dataset.toc!] ?? "");
  // Fixed pages must not spill either.
  for (const [i, page] of [...document.querySelectorAll<HTMLElement>(".page.plain")].entries()) {
    const box = page.getBoundingClientRect();
    const bottom = Math.max(0, ...[...page.querySelectorAll("*")].filter((e) => !e.closest(".pf") && !e.classList.contains("legal")).map((e) => e.getBoundingClientRect().bottom - box.top));
    if (bottom > box.height - 40) overflowing.push(`plain page ${i}: content ends at ${Math.round(bottom)}px`);
  }
  return { pages: n, overflowing };
}

async function buildSet(browser: import("playwright").Browser, set: (typeof SETS)[number]) {
  const cover = findCover(set.slug)!;
  const parts = bookParts(set.set, set.denemeler);
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>${CSS(cover.accent)}</style></head><body><div id="book" data-title="ÖZGÜN YDS DENEMELERİ · SET ${set.set}"></div><script type="application/json" id="parts">${JSON.stringify(parts).replace(/</g, "\\u003c")}</script></body></html>`;
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.25 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  // tsx keeps function names with a __name() helper that does not exist in the page.
  await page.evaluate("globalThis.__name = (f) => f");
  const { pages, overflowing } = await page.evaluate(paginate);
  if (overflowing.length) {
    console.error(`Set ${set.set} overflow:\n${overflowing.join("\n")}`);
    if (!process.env.ALLOW_OVERFLOW) process.exit(1);
  }
  await page.evaluate(() => { document.body.style.background = "#fff"; });
  const out = (...p: string[]) => path.join(ROOT, ...p);
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
  await writeFile(out(`content/ebooks/netfener-${set.slug}.pdf`), pdf);

  // Preview: cover, contents, the first test's opener and question pages, its answer sheet,
  // the answer keys and a solutions page.
  const all = page.locator(".page");
  const kinds = await all.evaluateAll((els) => els.map((e) => e.className));
  const firstFlow = kinds.findIndex((k) => k.includes("flow"));
  const keysAt = await all.evaluateAll((els) => els.findIndex((e) => e.querySelector(".keys")));
  const solAt = await all.evaluateAll((els) => els.findIndex((e) => e.querySelector(".sol")));
  const sheetAt = await all.evaluateAll((els) => els.findIndex((e) => e.querySelector(".as")));
  const preview = [0, 1, firstFlow - 1, firstFlow, firstFlow + 1, firstFlow + 2, firstFlow + 3, sheetAt, keysAt, solAt];
  await mkdir(out("public/ebooks/previews"), { recursive: true });
  await mkdir(out("public/ebooks/covers"), { recursive: true });
  for (const [i, at] of preview.entries()) {
    const jpeg = await all.nth(at).screenshot({ type: "jpeg", quality: 84, scale: "device" });
    if (i === 0) await writeFile(out(`public/ebooks/covers/${set.slug}.jpg`), jpeg);
    await writeFile(out(`public/ebooks/previews/${set.slug}-${i + 1}.jpg`), jpeg);
  }
  const full = mupdf.Document.openDocument(pdf, "application/pdf") as mupdf.PDFDocument;
  const sample = new mupdf.PDFDocument();
  for (const at of preview) sample.graftPage(-1, full, at);
  await writeFile(out(`public/ebooks/previews/${set.slug}.pdf`), sample.saveToBuffer("garbage=compact,compress").asUint8Array());
  await ctx.close();
  console.log(`${set.slug}: ${pages} pages · ${set.denemeler.length * 80} questions`);
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  for (const set of SETS) await buildSet(browser, set);
  await browser.close();
}

void main();
