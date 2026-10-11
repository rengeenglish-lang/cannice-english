/**
 * The Ultimate Phrasal Verbs Guide (YDS & YÖKDİL): book content. Every sentence, paragraph and
 * question here was written for Netfener; nothing is quoted from ÖSYM papers or other publishers.
 * scripts/build-phrasal-verbs-book.mts renders it to content/ebooks/netfener-phrasal-verbs.pdf.
 */

/** A: ayrılabilir (separable) · Ç: ayrılmaz (inseparable) · N: nesne almaz (intransitive). */
export type Separability = "A" | "Ç" | "N";

export type PhrasalVerb = {
  /** As it is learnt, with "sth/sb" where an object goes: "carry out sth". */
  pv: string;
  /** Turkish meaning(s). */
  tr: string;
  /** The one-word (mostly academic) equivalent YDS/YÖKDİL options use; "—" when there is none. */
  syn: string;
  sep: Separability;
  en: string;
  trEx: string;
};

export type ExamQuestion = {
  /** The stem with "----" for the blank, as in YDS/YÖKDİL. */
  stem: string;
  options: [string, string, string, string, string];
  /** 0–4 */
  answer: number;
  /** Turkish: why the answer fits. */
  why: string;
  /** Turkish: the most tempting wrong option and why it fails. */
  trap: string;
};

export type Unit = {
  title: string;
  question: string;
  intro: string;
  /** Turkish: what the particle(s) in this unit usually add to the verb. */
  particleNote: string;
  verbs: PhrasalVerb[];
  /** An academic paragraph using several of the unit's verbs. */
  reading: string;
  /** The idea path of the paragraph, in Turkish (→ separated). */
  readingTrail: string;
  /** Cloze with (1)…(5) blanks, a word pool, and the answers in blank order. */
  cloze: { text: string; pool: string[]; answers: string[] };
  questions: ExamQuestion[];
};
