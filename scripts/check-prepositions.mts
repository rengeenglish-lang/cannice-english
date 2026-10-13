/**
 * Checks content/prepositions: 30 units, complete entries, gap-fill items with one blank,
 * five distinct options per question, explanations present and no repeated question stems.
 *
 *   npx tsx scripts/check-prepositions.mts
 */
import { UNITS } from "../content/prepositions/index";

const problems: string[] = [];
const stems = new Map<string, string>();
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/g, " ").trim();
if (UNITS.length !== 30) problems.push(`${UNITS.length} units`);
UNITS.forEach((u, i) => {
  const tag = `Ünite ${i + 1}`;
  if (u.intro.length < 150) problems.push(`${tag}: intro too short`);
  if (u.entries.length < 14) problems.push(`${tag}: only ${u.entries.length} entries`);
  const heads = new Set<string>();
  for (const e of u.entries) {
    if (e.length !== 5 || e.some((f) => !f.trim())) problems.push(`${tag}: incomplete entry ${e[0]}`);
    if (heads.has(e[0])) problems.push(`${tag}: repeats ${e[0]}`);
    heads.add(e[0]);
  }
  if (u.contrasts.length < 3) problems.push(`${tag}: fewer than 3 contrasts`);
  if (u.practice.length !== 10) problems.push(`${tag}: ${u.practice.length} practice items`);
  for (const [s, a] of u.practice) {
    if ((s.match(/-{4}/g) ?? []).length !== 1) problems.push(`${tag}: practice needs exactly one blank: ${s}`);
    if (!a.trim()) problems.push(`${tag}: practice answer missing: ${s}`);
  }
  if (u.questions.length !== 4) problems.push(`${tag}: ${u.questions.length} questions`);
  for (const q of u.questions) {
    if (!q.stem.includes("----")) problems.push(`${tag}: question without blank`);
    if (new Set(q.options.map(norm)).size !== 5) problems.push(`${tag}: duplicate options in "${q.stem.slice(0, 40)}"`);
    if (q.why.length < 30 || q.trap.length < 30) problems.push(`${tag}: thin explanation in "${q.stem.slice(0, 40)}"`);
    if (/\b(seçenek|şık)\s*[A-E]\b/.test(q.why + q.trap)) problems.push(`${tag}: explanation names a letter`);
    const k = norm(q.stem).slice(0, 100);
    if (stems.has(k)) problems.push(`${tag}: stem repeats ${stems.get(k)}`);
    stems.set(k, tag);
  }
});
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
const n = (f: (u: (typeof UNITS)[number]) => number) => UNITS.reduce((s, u) => s + f(u), 0);
console.log(`ok · ${UNITS.length} units · ${n((u) => u.entries.length)} entries · ${n((u) => u.practice.length)} practice · ${n((u) => u.questions.length)} questions`);
