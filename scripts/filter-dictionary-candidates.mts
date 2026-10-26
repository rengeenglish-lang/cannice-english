/**
 * Prints the words from a candidate list (one headword per line, or space/comma separated) that are not
 * yet in the dictionary. Usage: npx tsx scripts/filter-dictionary-candidates.mts list.txt
 */
import fs from "node:fs";
import { A1 } from "../content/vocabulary/a1";
import { A2 } from "../content/vocabulary/a2";
import { B1 } from "../content/vocabulary/b1";
import { B2 } from "../content/vocabulary/b2";
import { C1 } from "../content/vocabulary/c1";
import { CORE_WORDS } from "../content/dictionary/core";
import { EXTENDED_WORDS } from "../content/dictionary/extended";
import { ACADEMIC_WORDS } from "../content/dictionary/academic";
import { BULK_WORDS } from "../content/dictionary/bulk";
import { DOMAIN_GLOSSARY } from "../content/dictionary/domains";
import { UNITS } from "../content/phrasal-verbs";
import { headwordKey } from "../lib/dictionary/text";

const norm = (w: string) => headwordKey(w).replace(/-/g, " ").replace(/\s+/g, " ").trim();
const seen = new Set<string>([
  ...[...A1, ...A2, ...B1, ...B2, ...C1, ...CORE_WORDS, ...EXTENDED_WORDS, ...ACADEMIC_WORDS].map(([w]) => norm(w)),
  ...BULK_WORDS.map(([, w]) => norm(w)),
  ...DOMAIN_GLOSSARY.map(([, w]) => norm(w)),
  ...UNITS.flatMap((u) => u.verbs.map((v) => norm(v.pv))),
]);
const words = [...new Set(fs.readFileSync(process.argv[2], "utf8").split(/[\n,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
const missing = words.filter((w) => !seen.has(norm(w)));
console.log(missing.join("\n"));
console.error(`${words.length} candidates, ${missing.length} missing`);
