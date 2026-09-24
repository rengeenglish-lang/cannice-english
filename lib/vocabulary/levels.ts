/**
 * Kelime Motoru levels. Word counts grow by 200 per level from A2 up (A1 is the 800-word
 * starter core). Words are served in sets of SET_SIZE, in the order they appear in the content
 * file — files are written in themed groups so each set hangs together.
 */
export const SET_SIZE = 20;

export const LEXICON_LEVELS = [
  { code: "A1", name: "Başlangıç", target: 800, blurb: "Günlük hayatın en temel kelimeleri." },
  { code: "A2", name: "Temel", target: 1000, blurb: "Kendini basitçe ifade etmeye yetecek kelimeler." },
  { code: "B1", name: "Orta", target: 1200, blurb: "İş, okul ve seyahatte rahat iletişim." },
  { code: "B2", name: "Orta üstü", target: 1400, blurb: "Akademik ve profesyonel metinler için." },
  { code: "C1", name: "İleri", target: 1600, blurb: "YDS, YÖKDİL, IELTS ve TOEFL'da fark yaratan kelimeler." },
] as const;

export type LexiconLevelCode = (typeof LEXICON_LEVELS)[number]["code"];

export function levelInfo(code: string) {
  return LEXICON_LEVELS.find((l) => l.code === code.toUpperCase()) ?? null;
}

export const POS_LABELS: Record<string, string> = {
  n: "isim",
  v: "fiil",
  adj: "sıfat",
  adv: "zarf",
  prep: "edat",
  pron: "zamir",
  conj: "bağlaç",
  det: "belirleyici",
  num: "sayı",
  int: "ünlem",
  phr: "kalıp",
  pv: "phrasal verb",
  modal: "yardımcı fiil",
};
