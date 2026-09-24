/**
 * One word, written compactly: [word, part of speech, Turkish meaning, English example,
 * Turkish translation of the example, optional usage tip in Turkish].
 * Part-of-speech codes are listed in lib/vocabulary/levels.ts (POS_LABELS).
 */
export type LexiconEntry = [word: string, pos: string, tr: string, exampleEn: string, exampleTr: string, tip?: string];
