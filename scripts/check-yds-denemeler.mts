/**
 * Checks content/yds-denemeler: 80 questions per test in YDS order, five distinct options,
 * blanks where the type needs one, balanced answer letters, no repeated stems or passages.
 *
 *   npx tsx scripts/check-yds-denemeler.mts [deneme numbers…]
 */
import type { Deneme, Q } from "../content/yds-denemeler/types";

const only = process.argv.slice(2).map(Number);
const mods = await Promise.all(
  Array.from({ length: 10 }, (_, i) => i + 1)
    .filter((n) => !only.length || only.includes(n))
    .map(async (n) => {
      const id = String(n).padStart(2, "0");
      const m = await import(`../content/yds-denemeler/deneme-${id}`);
      return m[`DENEME_${id}`] as Deneme;
    }),
);
const { printed } = await import("../content/yds-denemeler/index").catch(() => ({ printed: null }));

const problems: string[] = [];
const seen = new Map<string, string>();
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/g, " ").trim();
const once = (text: string, where: string) => {
  const k = norm(text).slice(0, 120);
  if (k.length < 20) return;
  const prev = seen.get(k);
  if (prev) problems.push(`${where}: repeats ${prev}`);
  else seen.set(k, where);
};

for (const d of mods) {
  const tag = `Deneme ${d.no}`;
  const check = (q: Q, where: string, opts: { blank?: boolean; stem?: boolean; generic?: boolean } = {}) => {
    const [stem, options, why] = q;
    if (options.length !== 5) problems.push(`${where}: ${options.length} options`);
    if (new Set(options.map(norm)).size !== 5) problems.push(`${where}: duplicate options`);
    if (options.some((o) => !o.trim())) problems.push(`${where}: empty option`);
    if (opts.stem !== false && !stem.trim()) problems.push(`${where}: empty stem`);
    if (opts.blank && !stem.includes("----")) problems.push(`${where}: no ---- blank`);
    if (!why || why.length < 30) problems.push(`${where}: explanation too short`);
    if (/\b(seçenek|şık)\s*[A-E]\b|\b[A-E]\s*(seçeneği|şıkkı)/.test(why)) problems.push(`${where}: explanation names a letter`);
    // Reading stems ("The main idea of the passage is that ----.") are generic and may repeat.
    if (stem.trim() && !opts.generic) once(stem, where);
  };
  let n = 0;
  let longest = 0;
  const next = () => ++n;
  const all: Q[] = [...d.vocab, ...d.grammar, ...d.cloze.flatMap((c) => c.blanks), ...d.completion, ...d.enTr, ...d.trEn, ...d.reading.flatMap((r) => r.questions), ...d.dialogue, ...d.restatement, ...d.paragraph];
  for (const [, o] of all) if (o[0].length > Math.max(...o.slice(1).map((x) => x.length)) + 8) longest++;
  // The correct option must not give itself away by being the longest one far too often.
  if (longest > 20) problems.push(`${tag}: correct option clearly longest in ${longest}/75`);
  d.vocab.forEach((q) => check(q, `${tag} #${next()}`, { blank: true }));
  d.grammar.forEach((q) => check(q, `${tag} #${next()}`, { blank: true }));
  d.cloze.forEach((c) => {
    once(c.text, `${tag} cloze`);
    for (let b = 1; b <= 5; b++) if (!c.text.includes(`{${b}}`)) problems.push(`${tag} cloze: missing {${b}}`);
    c.blanks.forEach((q) => check(q, `${tag} #${next()}`, { stem: false }));
  });
  d.completion.forEach((q) => check(q, `${tag} #${next()}`, { blank: true }));
  d.enTr.forEach((q) => check(q, `${tag} #${next()}`));
  d.trEn.forEach((q) => check(q, `${tag} #${next()}`));
  d.reading.forEach((r, i) => {
    once(r.text, `${tag} reading ${i + 1}`);
    const words = r.text.split(/\s+/).length;
    if (words < 130 || words > 260) problems.push(`${tag} reading ${i + 1}: ${words} words`);
    r.questions.forEach((q) => check(q, `${tag} #${next()}`, { generic: true }));
  });
  d.dialogue.forEach((q) => check(q, `${tag} #${next()}`, { blank: true }));
  d.restatement.forEach((q) => check(q, `${tag} #${next()}`));
  d.paragraph.forEach((q) => check(q, `${tag} #${next()}`, { blank: true }));
  d.irrelevant.forEach((x) => {
    const where = `${tag} #${next()}`;
    once(x.sentences.join(" "), where);
    if (x.why.length < 30) problems.push(`${where}: explanation too short`);
  });
  if (n !== 80) problems.push(`${tag}: ${n} questions`);
  const odd = d.irrelevant.map((x) => x.odd);
  if (new Set(odd).size < 3) problems.push(`${tag}: anlam bütünlüğü answers too uniform (${odd.join(",")})`);
  if (printed && !only.length) {
    const counts = [0, 0, 0, 0, 0];
    for (const p of printed(d)) counts[p.answer]++;
    if (counts.some((c) => c !== 16)) problems.push(`${tag}: answer letters ${counts.join("/")}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`ok · ${mods.length} deneme · ${mods.length * 80} questions`);
