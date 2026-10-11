/** Sanity checks for the phrasal verbs book content. npx tsx scripts/check-phrasal-verbs.mts */
import { UNITS } from "../content/phrasal-verbs/index";

const base = (pv: string) => pv.toLowerCase().replace(/\((.*?)\)/g, "$1").replace(/\b(sth|sb|sb\/sth|oneself|doing sth)\b/g, "").replace(/\s+/g, " ").trim();
const errors: string[] = [];
const seen = new Map<string, string>();
UNITS.forEach((u, i) => {
  const at = `Ünite ${i + 1}`;
  if (u.verbs.length !== 16) errors.push(`${at}: ${u.verbs.length} verbs`);
  for (const v of u.verbs) {
    const key = base(v.pv);
    if (seen.has(key)) errors.push(`${at}: "${v.pv}" repeats ${seen.get(key)}`);
    seen.set(key, at);
    for (const f of ["tr", "syn", "en", "trEx"] as const) if (!v[f]?.trim()) errors.push(`${at}: ${v.pv} missing ${f}`);
  }
  if (u.cloze.answers.length !== 5 || (u.cloze.text.match(/\(\d\)/g) ?? []).length !== 5) errors.push(`${at}: cloze must have 5 blanks/answers`);
  for (const a of u.cloze.answers) if (!u.cloze.pool.includes(a)) errors.push(`${at}: cloze answer "${a}" not in pool`);
  if (u.questions.length !== 4) errors.push(`${at}: ${u.questions.length} questions`);
  u.questions.forEach((q, qi) => {
    if (!q.stem.includes("----")) errors.push(`${at} Q${qi + 1}: no blank`);
    if (new Set(q.options).size !== 5) errors.push(`${at} Q${qi + 1}: duplicate options`);
    if (q.answer < 0 || q.answer > 4) errors.push(`${at} Q${qi + 1}: bad answer index`);
  });
});
console.log(`${UNITS.length} units · ${seen.size} distinct phrasal verbs`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
