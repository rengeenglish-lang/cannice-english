import "server-only";
import { db } from "@/server/db";
import { levelWords, setCount, setWords, type LexiconWord } from "@/lib/vocabulary/content";
import { LEXICON_LEVELS, type LexiconLevelCode } from "@/lib/vocabulary/levels";
import { PASS_RATIO } from "@/lib/vocabulary/quiz";

export type WordState = { status: "KNOWN" | "LEARNING" | null; note: string | null };

/** Overview for the levels page: words known, sets passed, next set to study. */
export async function levelsOverview(userId: string) {
  const [states, tests] = await Promise.all([
    db.lexiconWordState.groupBy({ by: ["level", "status"], where: { userId }, _count: true }),
    db.lexiconSetTest.findMany({ where: { userId }, select: { level: true, setNumber: true, score: true, total: true } }),
  ]);
  return LEXICON_LEVELS.map((l) => {
    const words = levelWords(l.code).length;
    const known = states.find((s) => s.level === l.code && s.status === "KNOWN")?._count ?? 0;
    const passed = new Set(tests.filter((t) => t.level === l.code && t.score / t.total >= PASS_RATIO).map((t) => t.setNumber));
    const sets = setCount(l.code);
    const next = Array.from({ length: sets }, (_, i) => i + 1).find((n) => !passed.has(n)) ?? (sets || null);
    return { ...l, words, sets, known, passed: passed.size, next };
  });
}

/** Per-set status for a level page. */
export async function setsOverview(userId: string, level: LexiconLevelCode) {
  const [states, tests] = await Promise.all([
    db.lexiconWordState.findMany({ where: { userId, level }, select: { wordId: true, status: true } }),
    db.lexiconSetTest.findMany({ where: { userId, level }, orderBy: { createdAt: "desc" }, select: { setNumber: true, score: true, total: true, createdAt: true } }),
  ]);
  const status = new Map(states.map((s) => [s.wordId, s.status]));
  return Array.from({ length: setCount(level) }, (_, i) => {
    const n = i + 1;
    const words = setWords(level, n);
    const setTests = tests.filter((t) => t.setNumber === n);
    const best = setTests.reduce<{ score: number; total: number } | null>((b, t) => (!b || t.score / t.total > b.score / b.total ? t : b), null);
    return {
      n,
      preview: words.slice(0, 4).map((w) => w.word),
      size: words.length,
      known: words.filter((w) => status.get(w.id) === "KNOWN").length,
      learning: words.filter((w) => status.get(w.id) === "LEARNING").length,
      best,
      passed: Boolean(best && best.score / best.total >= PASS_RATIO),
      attempts: setTests.length,
    };
  });
}

export async function wordStates(userId: string, words: LexiconWord[]) {
  const rows = await db.lexiconWordState.findMany({ where: { userId, wordId: { in: words.map((w) => w.id) } } });
  return Object.fromEntries(rows.map((r) => [r.wordId, { status: (r.status as WordState["status"]) ?? null, note: r.note }])) as Record<string, WordState>;
}

export function setWordStatus(userId: string, word: LexiconWord, status: "KNOWN" | "LEARNING" | null) {
  return db.lexiconWordState.upsert({
    where: { userId_wordId: { userId, wordId: word.id } },
    update: { status, seenAt: new Date() },
    create: { userId, wordId: word.id, level: word.level, status, seenAt: new Date() },
  });
}

export function saveWordNote(userId: string, word: LexiconWord, note: string) {
  const value = note.trim().slice(0, 2000) || null;
  return db.lexiconWordState.upsert({
    where: { userId_wordId: { userId, wordId: word.id } },
    update: { note: value },
    create: { userId, wordId: word.id, level: word.level, note: value },
  });
}

export function recordSetTest(userId: string, level: LexiconLevelCode, setNumber: number, score: number, total: number, wrongWordIds: string[]) {
  return db.lexiconSetTest.create({ data: { userId, level, setNumber, score, total, wrongWordIds } });
}

/** All of a student's notes, newest first — for "Notlarım". */
export async function myNotes(userId: string) {
  const rows = await db.lexiconWordState.findMany({ where: { userId, note: { not: null } }, orderBy: { updatedAt: "desc" }, take: 300 });
  return rows;
}
