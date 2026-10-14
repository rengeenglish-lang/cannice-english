import "server-only";
import { DENEME_LOADERS } from "@/content/yds-denemeler/registry";
import { printed } from "@/content/yds-denemeler/paper";
import { SECTIONS, type Deneme } from "@/content/yds-denemeler/types";
import { packBooklet } from "./booklet";
import type { Paper, PaperPassage, PaperQuestion } from "./types";

export type KeyedQuestion = PaperQuestion & { answer: number; why: string };

/** The full test with answers and explanations. Server only: never pass this to a client component. */
export async function loadKeyedDeneme(no: number): Promise<{ deneme: Deneme; questions: KeyedQuestion[]; passages: PaperPassage[] } | null> {
  const load = DENEME_LOADERS[no];
  if (!load) return null;
  const deneme = await load();
  const rows = printed(deneme);

  const passages: PaperPassage[] = [];
  const passageIndex = new Map<string, number>();
  for (const r of rows) {
    if (r.passage === undefined || (r.section !== "cloze" && r.section !== "reading")) continue;
    const key = `${r.section}-${r.passage}`;
    const existing = passageIndex.get(key);
    if (existing !== undefined) {
      passages[existing].to = r.n;
      continue;
    }
    const text =
      r.section === "cloze"
        ? deneme.cloze[r.passage].text.replace(/\{(\d)\}/g, (_, k) => `(${r.n + Number(k) - 1}) ----`)
        : deneme.reading[r.passage].text;
    passageIndex.set(key, passages.length);
    passages.push({ kind: r.section, text, from: r.n, to: r.n });
  }

  const questions: KeyedQuestion[] = rows.map((r) => ({
    n: r.n,
    section: r.section,
    stem: r.stem,
    options: r.options,
    passage: r.passage === undefined ? undefined : passageIndex.get(`${r.section}-${r.passage}`),
    sentences: r.sentences,
    answer: r.answer,
    why: r.why,
  }));
  return { deneme, questions, passages };
}

/** The answer-free paper sent to the browser for a sitting. */
export async function loadPaper(no: number): Promise<Paper | null> {
  const keyed = await loadKeyedDeneme(no);
  if (!keyed) return null;
  const questions: PaperQuestion[] = keyed.questions.map((q) => {
    const item: PaperQuestion = { n: q.n, section: q.section, stem: q.stem, options: q.options };
    if (q.passage !== undefined) item.passage = q.passage;
    if (q.sentences) item.sentences = q.sentences;
    return item;
  });
  return {
    no,
    questions,
    passages: keyed.passages,
    sections: SECTIONS.map((s) => ({ key: s.key, from: s.from, to: s.to, title: s.title, instruction: s.instruction })),
    pages: packBooklet(questions, keyed.passages),
  };
}
