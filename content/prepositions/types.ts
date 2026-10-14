/**
 * Prepositions Master Class (YDS · YÖKDİL · IELTS · TOEFL): book content. Every sentence and
 * question here was written for Netfener; nothing is quoted from ÖSYM papers or other publishers.
 * scripts/build-prepositions-book.mts renders it; scripts/check-prepositions.mts validates it.
 */

/**
 * [preposition or pattern, Turkish meaning, Turkish usage note, English example, Turkish translation]
 * The pattern is written as it is learnt: "depend on sth", "in spite of", "at risk (of sth)".
 */
export type Entry = [prep: string, tr: string, note: string, en: string, trEx: string];

/** A gap-fill sentence with "----" and the answer that goes there. */
export type Practice = [sentence: string, answer: string];

/**
 * An exam-style question. The CORRECT option is written first; the builder places it with a
 * fixed balanced permutation, so `why`/`trap` never mention option letters.
 */
export type Question = { stem: string; options: [string, string, string, string, string]; why: string; trap: string };

export type Unit = {
  title: string;
  /** The question the unit answers, as a hook on its opening page. */
  question: string;
  /** Turkish: what the unit covers and the big idea behind it. */
  intro: string;
  entries: Entry[];
  /** Turkish contrast notes: [the pair or group, how to tell them apart]. */
  contrasts: [string, string][];
  practice: Practice[];
  questions: Question[];
};

export type Part = { title: string; subtitle: string; units: Unit[] };
