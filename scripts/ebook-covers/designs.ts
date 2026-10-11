/**
 * Netfener book covers: one series design for every book (deep green, the N logo, a serif title in
 * the book's accent colour, a subject illustration, three fact chips). No lighthouse: the brand
 * mark is the N. Rendered to HTML here; scripts/build-ebook-covers.mts turns it into the cover
 * JPGs and the first/last PDF pages, and the phrasal verbs generator uses it for its own cover.
 */

export type CoverDesign = {
  slug: string;
  /** Title lines: first in white, the rest in the accent colour. */
  title: [string, ...string[]];
  exam: string;
  subtitle: string;
  tagline: string;
  accent: string;
  facts: [string, string, string];
  art: (accent: string) => string;
  /** Back cover blurb; books whose last page is a back cover get a new one. */
  back?: { blurb: string; stats: [string, string][]; list: string };
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The Netfener N for dark backgrounds (public/netfener-logo-white.svg). */
export const logoWhite = (size: number) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><g stroke-linejoin="round" stroke-width="2"><polygon points="10,15.6 34,49.4 34,56 10,66" fill="#34c46e" stroke="#34c46e"/><polygon points="66,4 90,4 90,22 66,32" fill="#67d392" stroke="#67d392"/><polygon points="10,72 34,62 34,96 10,96" fill="#ffffff" stroke="#ffffff"/><polygon points="66,38 90,28 90,80.4 66,46.6" fill="#ffffff" stroke="#ffffff" opacity="0.82"/><polygon points="10,10 36,10 90,86 64,86" fill="#ffffff" stroke="#ffffff"/></g></svg>`;

// ---------- subject illustrations (520 × 380 viewBox) ----------
const W = 520;
const H = 380;
const svg = (body: string) => `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" aria-hidden="true">${body}</svg>`;

/** Sentence x-ray: a sentence split into labelled grammar blocks. */
const sentenceArt = (a: string) =>
  svg(`
  ${[
    ["The results", "ÖZNE", 4, 140],
    ["that were reported", "SIFAT CÜMLECİĞİ", 156, 212],
    ["suggest", "YÜKLEM", 380, 136],
  ]
    .map(([t, l, x, w], i) => `<g transform="translate(${x},70)"><rect width="${w}" height="54" rx="12" fill="${i === 2 ? a : "rgba(255,255,255,.08)"}" stroke="${a}" stroke-width="1.5"/><text x="${Number(w) / 2}" y="34" text-anchor="middle" font-family="Liberation Serif" font-size="20" fill="${i === 2 ? "#0d2418" : "#fff"}">${t}</text><text x="${Number(w) / 2}" y="78" text-anchor="middle" font-family="Liberation Sans" font-weight="700" font-size="11" letter-spacing="2" fill="${a}">${l}</text></g>`)
    .join("")}
  <g transform="translate(60,210)"><rect width="400" height="54" rx="12" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><text x="200" y="34" text-anchor="middle" font-family="Liberation Serif" font-size="20" fill="#fff">a clear link between sleep and memory</text><text x="200" y="78" text-anchor="middle" font-family="Liberation Sans" font-weight="700" font-size="11" letter-spacing="2" fill="rgba(255,255,255,.6)">NESNE</text></g>
  <path d="M74 150 C 74 185, 240 180, 240 212" fill="none" stroke="${a}" stroke-width="2" stroke-dasharray="5 6"/>
  <path d="M448 150 C 448 185, 320 180, 320 212" fill="none" stroke="${a}" stroke-width="2" stroke-dasharray="5 6"/>
  <circle cx="440" cy="332" r="26" fill="none" stroke="${a}" stroke-width="3"/><path d="M459 351 L486 378" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`);

/** Word family network around one root. */
const familyArt = (a: string) => {
  const nodes: [string, number, number, number][] = [
    ["analyse", 260, 180, 30],
    ["analysis", 105, 80, 21],
    ["analytical", 415, 80, 19],
    ["analytically", 412, 285, 16],
    ["analyst", 100, 285, 20],
    ["reanalyse", 260, 330, 15],
  ];
  return svg(`
    ${nodes.slice(1).map(([, x, y]) => `<line x1="260" y1="180" x2="${x}" y2="${y}" stroke="${a}" stroke-opacity=".55" stroke-width="2"/>`).join("")}
    ${[[160, 40], [360, 30], [40, 190], [480, 200], [180, 360], [350, 370]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${a}" opacity=".5"/>`).join("")}
    ${nodes
      .map(([t, x, y, s], i) => `<g><circle cx="${x}" cy="${y}" r="${i ? Math.max(s * 2.3, 44) : s + 30}" fill="${i ? "#17402b" : a}" stroke="${a}" stroke-width="1.5"/><text x="${x}" y="${y + s / 3}" text-anchor="middle" font-family="Liberation Serif" font-weight="${i ? 400 : 700}" font-size="${s}" fill="${i ? "#fff" : "#0d2418"}">${t}</text></g>`)
      .join("")}`);
};

/** A paragraph whose key line is highlighted. */
const paragraphArt = (a: string, highlight: number[]) =>
  svg(
    Array.from({ length: 11 }, (_, i) => {
      const y = 22 + i * 32;
      const widths = [[90, 140, 60, 120], [70, 160, 110], [130, 80, 150], [60, 120, 90, 110], [150, 100, 120], [80, 140, 130], [110, 90, 160], [70, 130, 100, 80], [140, 120, 90], [90, 150, 110], [120, 100]][i];
      let x = 30;
      const hl = highlight.includes(i);
      return (hl ? `<rect x="18" y="${y - 12}" width="484" height="26" rx="13" fill="${a}" opacity=".18"/>` : "") +
        widths.map((w) => { const r = `<rect x="${x}" y="${y - 4}" width="${w}" height="9" rx="4.5" fill="${hl ? a : "rgba(255,255,255,.28)"}"/>`; x += w + 14; return r; }).join("");
    }).join("") + `<circle cx="452" cy="312" r="34" fill="none" stroke="${a}" stroke-width="4"/><path d="M476 336 L506 366" stroke="${a}" stroke-width="8" stroke-linecap="round"/>`,
  );

/** Two texts side by side, with linked evidence. */
const compareArt = (a: string) =>
  svg(`
  ${[20, 280].map((x0, c) => `<rect x="${x0}" y="20" width="220" height="300" rx="16" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.2)"/>
    <text x="${x0 + 20}" y="52" font-family="Liberation Sans" font-weight="700" font-size="13" letter-spacing="3" fill="${a}">METİN ${c ? "B" : "A"}</text>
    ${Array.from({ length: 8 }, (_, i) => { const y = 78 + i * 28; const hl = (c === 0 && i === 2) || (c === 1 && i === 5) || (c === 0 && i === 6); return `<rect x="${x0 + 20}" y="${y}" width="${[170, 150, 180, 140, 175, 160, 150, 120][i]}" height="9" rx="4.5" fill="${hl ? a : "rgba(255,255,255,.28)"}"/>`; }).join("")}`).join("")}
  <path d="M200 140 C 250 140, 260 225, 300 225" fill="none" stroke="${a}" stroke-width="2.5"/>
  <path d="M190 252 C 250 252, 250 225, 300 225" fill="none" stroke="${a}" stroke-width="2.5" stroke-dasharray="6 6"/>
  <circle cx="260" cy="190" r="22" fill="${a}"/><text x="260" y="198" text-anchor="middle" font-family="Liberation Sans" font-weight="700" font-size="22" fill="#0d2418">?</text>
  <text x="260" y="360" text-anchor="middle" font-family="Liberation Sans" font-weight="700" font-size="13" letter-spacing="3" fill="rgba(255,255,255,.65)">KARŞILAŞTIR · VARSAYIM · ARGÜMAN</text>`);

/** Heartbeat line, cells and a medical cross. */
const healthArt = (a: string) =>
  svg(`
  <rect x="10" y="40" width="500" height="200" rx="20" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)"/>
  ${Array.from({ length: 9 }, (_, i) => `<line x1="${10 + i * 62.5}" y1="40" x2="${10 + i * 62.5}" y2="240" stroke="rgba(255,255,255,.07)"/>`).join("")}
  <polyline points="20,150 120,150 150,150 170,95 195,205 220,60 245,185 265,150 340,150 360,128 380,150 500,150" fill="none" stroke="${a}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <g transform="translate(70,300)"><circle r="34" fill="none" stroke="${a}" stroke-width="2.5"/><circle r="12" fill="${a}" opacity=".5"/></g>
  <g transform="translate(170,320)"><circle r="22" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"/><circle r="8" fill="rgba(255,255,255,.35)"/></g>
  <g transform="translate(410,305)"><rect x="-14" y="-44" width="28" height="88" rx="6" fill="${a}"/><rect x="-44" y="-14" width="88" height="28" rx="6" fill="${a}"/></g>
  <text x="290" y="315" text-anchor="middle" font-family="Liberation Serif" font-size="22" fill="#fff">diagnosis</text><text x="290" y="345" text-anchor="middle" font-family="Liberation Serif" font-size="18" fill="rgba(255,255,255,.6)">treatment · prognosis</text>`);

/** Atom, a hexagonal molecule and a flask. */
const scienceArt = (a: string) =>
  svg(`
  <g transform="translate(170,180)">
    ${[0, 60, 120].map((r) => `<ellipse rx="130" ry="46" fill="none" stroke="${a}" stroke-width="2.5" transform="rotate(${r})"/>`).join("")}
    <circle r="22" fill="${a}"/><circle cx="130" cy="0" r="8" fill="#fff"/><circle cx="-65" cy="-112" r="8" fill="#fff"/><circle cx="-65" cy="112" r="8" fill="#fff"/>
  </g>
  <g transform="translate(410,110)" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none">
    <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24"/><polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" stroke="${a}"/>
    <line x1="42" y1="24" x2="80" y2="46"/><circle cx="88" cy="50" r="9" fill="${a}" stroke="none"/>
  </g>
  <g transform="translate(410,250)"><path d="M-22 -40 L-22 0 L-56 70 Q -60 84 -46 84 L46 84 Q 60 84 56 70 L22 0 L22 -40 Z" fill="rgba(255,255,255,.07)" stroke="#fff" stroke-width="3"/><path d="M-40 40 L40 40 L54 70 Q 57 78 48 78 L-48 78 Q -57 78 -54 70 Z" fill="${a}" opacity=".85"/><line x1="-30" y1="-40" x2="30" y2="-40" stroke="#fff" stroke-width="3"/></g>`);

/** People connected in a network, over a small bar chart. */
const socialArt = (a: string) => {
  const people: [number, number][] = [[90, 90], [250, 60], [410, 100], [150, 220], [340, 210], [470, 250], [40, 250]];
  const links = [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [4, 5], [3, 6], [3, 4]];
  return svg(`
    ${links.map(([i, j]) => `<line x1="${people[i][0]}" y1="${people[i][1]}" x2="${people[j][0]}" y2="${people[j][1]}" stroke="${a}" stroke-opacity=".6" stroke-width="2"/>`).join("")}
    ${people.map(([x, y], i) => `<g transform="translate(${x},${y})"><circle r="28" fill="${i === 1 ? a : "rgba(255,255,255,.08)"}" stroke="${a}" stroke-width="2"/><circle cy="-8" r="8" fill="${i === 1 ? "#0d2418" : "#fff"}"/><path d="M-14 19 C -14 5, 14 5, 14 19 Z" fill="${i === 1 ? "#0d2418" : "#fff"}"/></g>`).join("")}
    ${[60, 95, 75, 125, 105, 150].map((h, i) => `<rect x="${130 + i * 46}" y="${370 - h * 0.6}" width="30" height="${h * 0.6}" rx="4" fill="${i === 5 ? a : "rgba(255,255,255,.25)"}"/>`).join("")}`);
};

/** Verb + particle chips joined into phrasal verbs. */
const phrasalArt = (a: string) => {
  const rows: [string, string, number, number][] = [
    ["carry", "out", 40, 40], ["bring", "about", 270, 20], ["rule", "out", 330, 120],
    ["account", "for", 60, 140], ["set", "up", 215, 225], ["put", "off", 30, 270], ["point", "out", 320, 300],
  ];
  return svg(rows
    .map(([v, p, x, y]) => {
      const vw = v.length * 13 + 30;
      const pw = p.length * 13 + 30;
      return `<g transform="translate(${x},${y})"><rect width="${vw}" height="46" rx="23" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/><text x="${vw / 2}" y="30" text-anchor="middle" font-family="Liberation Serif" font-size="21" fill="#fff">${v}</text><text x="${vw + 9}" y="30" text-anchor="middle" font-family="Liberation Sans" font-weight="700" font-size="18" fill="${a}">+</text><rect x="${vw + 18}" width="${pw}" height="46" rx="23" fill="${a}"/><text x="${vw + 18 + pw / 2}" y="30" text-anchor="middle" font-family="Liberation Serif" font-weight="700" font-size="21" fill="#0d2418">${p}</text></g>`;
    })
    .join(""));
};

export const COVERS: CoverDesign[] = [
  { slug: "cumlenin-icini-gor", title: ["CÜMLENİN", "İÇİNİ GÖR"], exam: "YDS & YÖKDİL", subtitle: "YDS ve YÖKDİL Grameri · Örüntü Tanıma ve Sınav Stratejisi", tagline: "SENTENCE X-RAY · PATTERNS · EXAM STRATEGY", accent: "#f2c14e", facts: ["17 modül", "9 adım", "144 sayfa"], art: sentenceArt },
  {
    slug: "kelimenin-izini-sur", title: ["KELİMENİN", "İZİNİ SÜR"], exam: "YDS & YÖKDİL", subtitle: "Cilt 1 · Temel Akademik Kelimeler", tagline: "WORD FAMILIES · CONTEXT · EXAM DECISIONS", accent: "#67d392", facts: ["125 kelime ailesi", "25 ünite", "282 sayfa"], art: familyArt,
    back: { blurb: "Kelimeyi ezberlemek yetmez; sınavda cümlenin istediği biçimi seçebilmen gerekir. Bu kitap YDS ve YÖKDİL'in en sık çıkan 125 akademik kelime ailesini, her biri iki sayfalık bir rota ile öğretir.", stats: [["125", "kelime ailesi"], ["25", "tematik ünite"], ["250", "çalışma sayfası"]], list: "Aile tabloları · Anlam ayrımı · Türkçe tuzakları · Özgün sınav soruları · Cloze testleri · Grammar Lab · Cevap anahtarı ve neden açıklamaları" },
  },
  {
    slug: "phrasal-verbs", title: ["THE ULTIMATE", "PHRASAL VERBS", "GUIDE"], exam: "YDS & YÖKDİL", subtitle: "Sınavda en sık karşılaşılan phrasal verb'ler", tagline: "MEANING · SYNONYM · CONTEXT · EXAM DECISIONS", accent: "#34c46e", facts: ["480 phrasal verb", "30 ünite", "120 özgün soru"], art: phrasalArt,
    back: { blurb: "Phrasal verb'ü ezberlemek yetmez; sınavda onun akademik eşini tanıyıp cümlenin istediği yapıyı seçebilmen gerekir. Bu kitap YDS ve YÖKDİL'de en sık karşına çıkan 480 phrasal verb'ü 30 tematik ünitede, her biri anlam, eş, örnek cümle ve özgün soruyla öğretir.", stats: [["480", "phrasal verb"], ["30", "tematik ünite"], ["120", "özgün soru"]], list: "Akademik eşler · Ayrılabilirlik işaretleri · Edatların mantığı · Cloze testleri · Eş anlam eşleştirme · Çeldirici analizli sorular · Alfabetik dizin" },
  },
  { slug: "paragrafin-isigini-yak", title: ["PARAGRAFIN", "IŞIĞINI YAK"], exam: "YDS & YÖKDİL", subtitle: "Cilt 1 · Akademik Paragraf", tagline: "MAIN IDEA · EVIDENCE · EXAM DECISIONS", accent: "#7fd6c8", facts: ["40 özgün metin", "200 soru", "135 sayfa"], art: (a) => paragraphArt(a, [4]) },
  { slug: "paragrafin-isigini-yak-cilt-2", title: ["PARAGRAFIN", "IŞIĞINI YAK 2"], exam: "YDS & YÖKDİL", subtitle: "Cilt 2 · İleri Paragraf", tagline: "COMPARISON · ASSUMPTION · ARGUMENT", accent: "#a3e4b8", facts: ["40 özgün metin", "200 soru", "135 sayfa"], art: compareArt },
  { slug: "yokdil-saglik", title: ["YÖKDİL", "SAĞLIK BİLİMLERİ"], exam: "YÖKDİL SAĞLIK", subtitle: "Akademik Dil ve Sınav Uygulamaları", tagline: "MEDICAL TEXTS · VOCABULARY · FULL MOCK EXAM", accent: "#ff8f80", facts: ["201 özgün soru", "80 soruluk deneme", "89 sayfa"], art: healthArt },
  { slug: "yokdil-fen", title: ["YÖKDİL", "FEN BİLİMLERİ"], exam: "YÖKDİL FEN", subtitle: "Akademik Dil ve Sınav Uygulamaları", tagline: "SCIENTIFIC TEXTS · VOCABULARY · FULL MOCK EXAM", accent: "#7cc8ff", facts: ["155 özgün soru", "80 soruluk deneme", "100 sayfa"], art: scienceArt },
  { slug: "yokdil-sosyal", title: ["YÖKDİL", "SOSYAL BİLİMLER"], exam: "YÖKDİL SOSYAL", subtitle: "Akademik Dil ve Sınav Uygulamaları", tagline: "SOCIAL TEXTS · VOCABULARY · FULL MOCK EXAM", accent: "#f6b76b", facts: ["139 özgün soru", "80 soruluk deneme", "96 sayfa"], art: socialArt },
];

export const COVER_CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
.nf-cover, .nf-back { width: 210mm; height: 297mm; position: relative; overflow: hidden; color: #fff; font-family: "Liberation Sans", Arial, sans-serif;
  background: radial-gradient(120% 80% at 50% 62%, #174a31 0%, #0f2f1f 45%, #0b2216 100%); }
.nf-cover::before, .nf-back::before { content: ""; position: absolute; inset: 0; opacity: .5;
  background-image: radial-gradient(rgba(255,255,255,.08) 1px, transparent 1.2px); background-size: 7mm 7mm; }
.nf-cover::after, .nf-back::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3.2mm; background: var(--accent); }
.nf-inner { position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 15mm 14mm 13mm; text-align: center; }
.nf-brand { display: flex; flex-direction: column; align-items: center; gap: 3mm; }
.nf-brand p { display: flex; align-items: center; gap: 4mm; font-weight: 700; letter-spacing: .38em; font-size: 10.5pt; }
.nf-brand p span { display: inline-block; width: 13mm; height: 1px; background: var(--accent); }
.nf-exam { margin-top: 9mm; display: inline-block; border: 1px solid var(--accent); color: var(--accent); border-radius: 10mm; padding: 1.8mm 6mm; font-weight: 700; font-size: 10pt; letter-spacing: .24em; }
.nf-title { margin-top: 7mm; font-family: "Liberation Serif", Georgia, serif; font-weight: 700; line-height: .98; display: flex; flex-direction: column; }
.nf-title span { font-size: 46pt; letter-spacing: .01em; }
.nf-title span + span { color: var(--accent); }
.nf-title.long span { font-size: 38pt; }
.nf-title.xlong span { font-size: 31pt; }
.nf-sub { margin-top: 6mm; font-size: 12.5pt; color: rgba(255,255,255,.9); }
.nf-tag { margin-top: 3mm; font-size: 7.6pt; font-weight: 700; letter-spacing: .24em; color: rgba(255,255,255,.55); }
.nf-art { margin-top: 11mm; width: 168mm; height: 124mm; }
.nf-facts { margin-top: auto; display: flex; gap: 3mm; }
.nf-facts span { border: 1px solid rgba(255,255,255,.28); border-radius: 3mm; padding: 2.4mm 4.5mm; font-size: 9.5pt; font-weight: 700; color: #fff; background: rgba(255,255,255,.05); }
.nf-site { margin-top: 6mm; letter-spacing: .26em; font-size: 9pt; color: rgba(255,255,255,.8); }
.nf-back .nf-inner { justify-content: center; }
.nf-back h1 { margin-top: 8mm; font-family: "Liberation Serif", serif; font-size: 23pt; }
.nf-back h1 b { color: var(--accent); }
.nf-back .nf-blurb { margin-top: 9mm; font-size: 10pt; line-height: 1.65; color: rgba(255,255,255,.85); max-width: 150mm; }
.nf-back .nf-stats { display: flex; gap: 5mm; margin-top: 10mm; }
.nf-back .nf-stats div { border: 1px solid rgba(255,255,255,.22); border-radius: 3mm; padding: 4mm 9mm; background: rgba(255,255,255,.04); }
.nf-back .nf-stats b { display: block; color: var(--accent); font-size: 19pt; }
.nf-back .nf-stats span { font-size: 8pt; color: rgba(255,255,255,.75); }
.nf-back .nf-list { margin-top: 9mm; font-size: 8.4pt; line-height: 1.6; color: rgba(255,255,255,.65); max-width: 150mm; }
.nf-back .nf-site { position: absolute; bottom: 14mm; left: 0; right: 0; }
`;

export function coverHtml(d: CoverDesign): string {
  const longest = Math.max(...d.title.map((t) => t.length));
  const size = longest > 13 ? "xlong" : longest > 10 ? "long" : "";
  return `<div class="nf-cover" style="--accent:${d.accent}"><div class="nf-inner">
    <div class="nf-brand">${logoWhite(68)}<p><span></span>NETFENER<span></span></p></div>
    <p class="nf-exam">${esc(d.exam)}</p>
    <h1 class="nf-title ${size}">${d.title.map((t) => `<span>${esc(t)}</span>`).join("")}</h1>
    <p class="nf-sub">${esc(d.subtitle)}</p>
    <p class="nf-tag">${esc(d.tagline)}</p>
    <div class="nf-art">${d.art(d.accent)}</div>
    <div class="nf-facts">${d.facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
    <p class="nf-site">netfener.com</p>
  </div></div>`;
}

export function backCoverHtml(d: CoverDesign): string {
  if (!d.back) throw new Error(`${d.slug} has no back cover`);
  const [first, ...rest] = d.title;
  return `<div class="nf-back" style="--accent:${d.accent}"><div class="nf-inner">
    <div class="nf-brand">${logoWhite(80)}<p><span></span>NETFENER<span></span></p></div>
    <h1>${esc(first)} <b>${rest.map(esc).join(" ")}</b></h1>
    <p class="nf-tag">${esc(d.tagline)}</p>
    <p class="nf-blurb">${esc(d.back.blurb)}</p>
    <div class="nf-stats">${d.back.stats.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join("")}</div>
    <p class="nf-list">${esc(d.back.list)}</p>
    <p class="nf-site">netfener.com</p>
  </div></div>`;
}

export const findCover = (slug: string) => COVERS.find((c) => c.slug === slug);
