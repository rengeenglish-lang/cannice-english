import { A1 } from "@/content/vocabulary/a1";
import { A2 } from "@/content/vocabulary/a2";
import { B1 } from "@/content/vocabulary/b1";
import { B2 } from "@/content/vocabulary/b2";
import { C1 } from "@/content/vocabulary/c1";
import type { LexiconEntry } from "@/content/vocabulary/types";
import { UNITS } from "@/content/phrasal-verbs";
import { DOMAIN_GLOSSARY, type DomainCode } from "@/content/dictionary/domains";
import { CORE_WORDS } from "@/content/dictionary/core";
import { editDistance, fold, headwordKey, lemmaCandidates, normalise, turkishTerms } from "@/lib/dictionary/text";

/**
 * Netfener Sözlük — an English ⇄ Turkish dictionary built only from Netfener's own content:
 * the Kelime Motoru lexicon (A1–C1), The Ultimate Phrasal Verbs Guide, and the core supplement
 * and YÖKDİL field glossaries in content/dictionary. Nothing is taken from other dictionaries.
 */

export type DictCategory = "GENERAL" | "PHRASE" | "PHRASAL" | DomainCode;

export const CATEGORY_LABELS: Record<DictCategory, string> = {
  GENERAL: "Genel",
  PHRASE: "Kalıp",
  PHRASAL: "Phrasal Verb",
  HEALTH: "Sağlık",
  SCIENCE: "Fen",
  SOCIAL: "Sosyal Bilimler",
  ACADEMIC: "Akademik",
};

const CATEGORY_ORDER: DictCategory[] = ["GENERAL", "PHRASE", "PHRASAL", "ACADEMIC", "SOCIAL", "HEALTH", "SCIENCE"];

export const POS_TR: Record<string, string> = {
  n: "isim", v: "fiil", adj: "sıfat", adv: "zarf", prep: "edat", pron: "zamir", conj: "bağlaç", det: "belirleyici",
  num: "sayı", int: "ünlem", phr: "kalıp", pv: "phrasal verb", modal: "yardımcı fiil",
};

export type DictEntry = {
  id: string;
  en: string;
  pos: string;
  tr: string;
  category: DictCategory;
  level: string | null;
  exampleEn: string | null;
  exampleTr: string | null;
  tip: string | null;
  /** Academic one-word equivalent (phrasal verbs). */
  syn: string | null;
  /** Kelime Motoru word id, so signed-in learners can add it to their list. */
  lexiconId: string | null;
  /** Normalised headword ("carry out sth" → "carry out", hyphens as spaces). */
  key: string;
  trTerms: string[];
};

type Index = {
  entries: DictEntry[];
  byKey: Map<string, DictEntry[]>;
  byTr: Map<string, DictEntry[]>;
  byWord: Map<string, DictEntry[]>;
  enKeys: string[];
  trKeys: string[];
};

const key = (s: string) => headwordKey(s).replace(/-/g, " ").replace(/\s+/g, " ").trim();
const slugPart = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let cached: Index | null = null;

function build(): Index {
  const entries: DictEntry[] = [];
  const levels: [string, LexiconEntry[]][] = [["A1", A1], ["A2", A2], ["B1", B1], ["B2", B2], ["C1", C1]];
  for (const [level, words] of levels) {
    // Same id scheme as lib/vocabulary/content.ts so "Listeme ekle" points at the right card.
    const seen = new Map<string, number>();
    for (const [word, pos, tr, exampleEn, exampleTr, tip] of words) {
      let id = `${level.toLowerCase()}-${slugPart(word)}`;
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n > 0) id = `${id}-${slugPart(pos)}${n > 1 ? n : ""}`;
      entries.push({
        id: `lex:${id}`, en: word, pos, tr, level,
        category: pos === "pv" ? "PHRASAL" : pos === "phr" ? "PHRASE" : "GENERAL",
        exampleEn: exampleEn || null, exampleTr: exampleTr || null, tip: tip ?? null, syn: null, lexiconId: id,
        key: key(word), trTerms: turkishTerms(tr),
      });
    }
  }
  CORE_WORDS.forEach(([word, pos, tr, exampleEn, exampleTr], i) =>
    entries.push({
      id: `core:${i}`, en: word, pos, tr, level: null, category: "GENERAL",
      exampleEn: exampleEn || null, exampleTr: exampleTr || null, tip: null, syn: null, lexiconId: null,
      key: key(word), trTerms: turkishTerms(tr),
    }),
  );
  UNITS.forEach((unit, u) =>
    unit.verbs.forEach((v, i) =>
      entries.push({
        id: `pv:${u + 1}-${i + 1}`, en: v.pv, pos: "pv", tr: v.tr, level: null, category: "PHRASAL",
        exampleEn: v.en, exampleTr: v.trEx, tip: null, syn: v.syn && v.syn !== "—" ? v.syn : null, lexiconId: null,
        key: key(v.pv), trTerms: turkishTerms(v.tr),
      }),
    ),
  );
  DOMAIN_GLOSSARY.forEach(([domain, en, pos, tr, exampleEn, exampleTr], i) =>
    entries.push({
      id: `dom:${domain.toLowerCase()}-${i}`, en, pos, tr, level: null, category: domain,
      exampleEn: exampleEn ?? null, exampleTr: exampleTr ?? null, tip: null, syn: null, lexiconId: null,
      key: key(en), trTerms: turkishTerms(tr),
    }),
  );

  const byKey = new Map<string, DictEntry[]>();
  const byTr = new Map<string, DictEntry[]>();
  const byWord = new Map<string, DictEntry[]>();
  const push = (m: Map<string, DictEntry[]>, k: string, e: DictEntry) => {
    const list = m.get(k);
    if (!list) m.set(k, [e]);
    else if (!list.includes(e)) list.push(e);
  };
  for (const e of entries) {
    push(byKey, e.key, e);
    for (const t of e.trTerms) push(byTr, fold(t), e);
    if (e.key.includes(" ")) for (const w of e.key.split(" ")) if (w.length > 1) push(byWord, w, e);
  }
  return {
    entries,
    byKey,
    byTr,
    byWord,
    enKeys: [...byKey.keys()].sort(),
    trKeys: [...new Set(entries.flatMap((e) => e.trTerms))].sort((a, b) => a.localeCompare(b, "tr")),
  };
}

export function dictionary() {
  cached ??= build();
  return cached;
}

const rank = (e: DictEntry) => CATEGORY_ORDER.indexOf(e.category) * 10 + (e.level ? "ABC".indexOf(e.level[0]) : 5);
const sortRows = (rows: DictEntry[]) => [...rows].sort((a, b) => rank(a) - rank(b));

/** Same meaning written twice (lexicon + book): keep the richer row. */
function dedupe(rows: DictEntry[]) {
  const seen = new Map<string, DictEntry>();
  for (const r of rows) {
    const k = `${r.key}|${r.pos}|${fold(r.tr)}`;
    if (!seen.has(k)) seen.set(k, r);
  }
  return [...seen.values()];
}

export type SearchResult = {
  query: string;
  /** English → Turkish rows for the headword. */
  en: DictEntry[];
  /** When the query was an inflected form: the dictionary form that was looked up. */
  lemma: string | null;
  /** Turkish → English rows. */
  tr: DictEntry[];
  /** Phrasal verbs and phrases containing the word ("take" → take off, take over …). */
  phrases: DictEntry[];
  /** Turkish meanings containing the word ("almak" → işe almak …). */
  trPhrases: DictEntry[];
  /** "Bunu mu demek istediniz?" — only when nothing matched. */
  suggestions: string[];
};

export function search(raw: string): SearchResult {
  const idx = dictionary();
  const query = normalise(raw).slice(0, 80);
  const k = key(query);
  const empty: SearchResult = { query, en: [], lemma: null, tr: [], phrases: [], trPhrases: [], suggestions: [] };
  if (!k) return empty;

  let en = idx.byKey.get(k) ?? [];
  let lemma: string | null = null;
  if (!en.length) {
    for (const c of lemmaCandidates(k)) {
      const hit = idx.byKey.get(c);
      if (hit?.length) {
        en = hit;
        lemma = c;
        break;
      }
    }
  }
  const tr = idx.byTr.get(fold(query)) ?? [];
  const head = lemma ?? k;
  const phrases = head.includes(" ") ? [] : (idx.byWord.get(head) ?? []).filter((e) => !en.includes(e));
  const fq = fold(query);
  const trPhrases =
    fq.length >= 3 && !fq.includes(" ")
      ? idx.entries.filter((e) => !tr.includes(e) && e.trTerms.some((t) => t !== fq && fold(t).split(" ").includes(fq))).slice(0, 40)
      : [];

  const result: SearchResult = {
    query,
    en: sortRows(dedupe(en)),
    lemma,
    tr: sortRows(dedupe(tr)),
    phrases: sortRows(dedupe(phrases)).slice(0, 60),
    trPhrases: sortRows(dedupe(trPhrases)),
    suggestions: [],
  };
  if (!result.en.length && !result.tr.length && !result.phrases.length && !result.trPhrases.length) result.suggestions = suggest(query);
  return result;
}

/** Closest headwords and Turkish terms by edit distance (typo tolerance). */
export function suggest(query: string, limit = 8) {
  const idx = dictionary();
  const q = fold(query);
  if (q.length < 3) return [];
  const max = q.length <= 5 ? 1 : 2;
  const scored: { term: string; d: number }[] = [];
  for (const term of [...idx.enKeys, ...idx.trKeys]) {
    const d = editDistance(q, fold(term), max);
    if (d <= max) scored.push({ term, d });
  }
  return [...new Map(scored.sort((a, b) => a.d - b.d || a.term.length - b.term.length).map((s) => [s.term, s])).keys()].slice(0, limit);
}

/** Autocomplete: headwords and Turkish terms starting with what's typed (accent-insensitive). */
export function complete(prefix: string, limit = 8) {
  const idx = dictionary();
  const p = fold(prefix);
  if (!p) return [];
  const out: { term: string; lang: "en" | "tr" }[] = [];
  for (const term of idx.enKeys) {
    if (fold(term).startsWith(p)) out.push({ term, lang: "en" });
    if (out.length >= limit) return out;
  }
  for (const term of idx.trKeys) {
    if (fold(term).startsWith(p) && !out.some((o) => o.term === term)) out.push({ term, lang: "tr" });
    if (out.length >= limit) break;
  }
  return out;
}

/** Deterministic "Günün kelimesi" from the B2–C1 lexicon. */
export function wordOfTheDay(dayKey: string) {
  const pool = dictionary().entries.filter((e) => (e.level === "B2" || e.level === "C1") && e.category === "GENERAL" && e.exampleEn);
  let h = 0;
  for (const ch of dayKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}

export function dictionaryStats() {
  const idx = dictionary();
  return { entries: idx.entries.length, headwords: idx.byKey.size, turkishTerms: idx.trKeys.length };
}

/** Headwords for the sitemap and static links. */
export function allHeadwords() {
  return dictionary().enKeys;
}
