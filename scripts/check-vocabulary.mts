// Sanity checks for Kelime Motoru content: counts, set sizes, duplicates, empty fields.
import { A1 } from "../content/vocabulary/a1";
const levels: Record<string, typeof A1> = { A1 };
let problems = 0;
const all = new Map<string, string>();
for (const [code, words] of Object.entries(levels)) {
  console.log(`${code}: ${words.length} words, ${Math.ceil(words.length / 20)} sets`);
  const seen = new Map<string, number>();
  words.forEach(([w, pos, tr, en, trEx], i) => {
    const key = `${w.toLowerCase()}|${pos}`;
    if (!w || !pos || !tr || !en || !trEx) { console.log(`  empty field at #${i} ${w}`); problems++; }
    if (seen.has(key)) { console.log(`  duplicate in ${code}: "${w}" (#${seen.get(key)} and #${i}, ${pos})`); problems++; }
    seen.set(key, i);
    if (all.has(key) && all.get(key) !== code) { console.log(`  also in ${all.get(key)}: "${w}"`); }
    all.set(key, code);
  });
}
process.exit(problems ? 1 : 0);
