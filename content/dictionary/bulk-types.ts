import type { DomainCode } from "./domains";

/** [category, term, part of speech, Turkish meaning, English example, Turkish translation] */
export type BulkEntry = [field: DomainCode | "GENERAL", en: string, pos: string, tr: string, exampleEn: string, exampleTr: string];
