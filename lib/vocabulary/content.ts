import "server-only";
import { A1 } from "@/content/vocabulary/a1";
import { A2 } from "@/content/vocabulary/a2";
import { B1 } from "@/content/vocabulary/b1";
import { B2 } from "@/content/vocabulary/b2";
import { C1 } from "@/content/vocabulary/c1";
import type { LexiconEntry } from "@/content/vocabulary/types";
import { LEXICON_LEVELS, SET_SIZE, type LexiconLevelCode } from "@/lib/vocabulary/levels";

export type LexiconWord = {
  id: string;
  level: LexiconLevelCode;
  word: string;
  pos: string;
  tr: string;
  exampleEn: string;
  exampleTr: string;
  tip: string | null;
};

const SOURCES: Partial<Record<LexiconLevelCode, LexiconEntry[]>> = { A1, A2, B1, B2, C1 };

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const cache = new Map<string, LexiconWord[]>();

/** All words of a level with stable ids ("a1-apple", "a1-light-adj" for a repeated spelling). */
export function levelWords(level: LexiconLevelCode): LexiconWord[] {
  const hit = cache.get(level);
  if (hit) return hit;
  const seen = new Map<string, number>();
  const words = (SOURCES[level] ?? []).map(([word, pos, tr, exampleEn, exampleTr, tip]) => {
    let id = `${level.toLowerCase()}-${slug(word)}`;
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${slug(pos)}${n > 1 ? n : ""}`;
    return { id, level, word, pos, tr, exampleEn, exampleTr, tip: tip ?? null };
  });
  cache.set(level, words);
  return words;
}

export function setCount(level: LexiconLevelCode) {
  return Math.ceil(levelWords(level).length / SET_SIZE);
}

/** Words of set `n` (1-based). */
export function setWords(level: LexiconLevelCode, n: number) {
  return levelWords(level).slice((n - 1) * SET_SIZE, n * SET_SIZE);
}

export function availableLevels() {
  return LEXICON_LEVELS.map((l) => ({ ...l, count: levelWords(l.code).length }));
}

export function wordById(id: string) {
  const level = id.split("-")[0]?.toUpperCase() as LexiconLevelCode;
  return levelWords(level).find((w) => w.id === id) ?? null;
}
