// Sanity checks for Kelime Motoru content: counts, set sizes, duplicates, empty fields.
import { A1 } from "../content/vocabulary/a1";
import { A2 } from "../content/vocabulary/a2";
import { B1 } from "../content/vocabulary/b1";
import { B2 } from "../content/vocabulary/b2";
import { C1 } from "../content/vocabulary/c1";
const levels: Record<string, typeof A1> = { A1, A2, B1, B2, C1 };
let problems = 0;
let crossLevel = 0;
const all = new Map<string, string>();
for (const [code, words] of Object.entries(levels)) {
  console.log(`${code}: ${words.length} words, ${Math.ceil(words.length / 20)} sets`);
  const seen = new Map<string, number>();
  words.forEach(([w, pos, tr, en, trEx], i) => {
    const key = `${w.toLowerCase()}|${pos}`;
    if (!w || !pos || !tr || !en || !trEx) { console.log(`  empty field at #${i} ${w}`); problems++; }
    if (seen.has(key)) { console.log(`  duplicate in ${code}: "${w}" (#${seen.get(key)} and #${i}, ${pos})`); problems++; }
    seen.set(key, i);
    const word = w.toLowerCase();
    if (all.has(word) && all.get(word) !== code) { console.log(`  also in ${all.get(word)}: "${w}" (${pos})`); crossLevel++; }
    if (!all.has(word)) all.set(word, code);
  });
}
console.log(`${crossLevel} words repeat an earlier level (allowed only for a new meaning).`);
process.exit(problems ? 1 : 0);
