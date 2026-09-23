/**
 * Fallback link from a seviye-tespit/pratik topic to the matching Konu Anlatımı topic, used by
 * Hatalarım when no TopicLesson has been explicitly tagged with the diagnostic topic in the admin
 * panel (TopicLesson.diagnosticTopicIds). Candidates are tried in order against the exam's own
 * Konu Anlatımı slugs, since YDS and the three YÖKDİL branches name the same grammar topic
 * differently (e.g. "tense-sorulari" vs "tense-system").
 */
export const KONU_SLUG_CANDIDATES: Record<string, string[]> = {
  zamanlar: ["tense-system", "tense-sorulari"],
  "edilgen-cati": ["passive-voice-causatives"],
  "sifat-cumlecikleri": ["adjective-clauses"],
  "kosul-cumleleri": ["conditionals"],
  "modal-fiiller": ["modality"],
  "ulac-mastar": ["gerunds-infinitives"],
  baglaclar: ["conjunctions-adverbial-clauses"],
  "kelime-bilgisi": ["kelime-bilgisi", "kelime-phrasal-verb"],
  "cloze-test": ["cloze-test"],
  "cumle-tamamlama": ["cumle-tamamlama"],
  "ceviri-en-tr": ["ceviri"],
  "ceviri-tr-en": ["ceviri"],
  "paragraf-tamamlama": ["paragraf-tamamlama"],
  okuma: ["paragraf-okuma-anlama", "paragraf"],
  "anlamda-en-yakin-cumle": ["yakin-anlamli-cumle"],
  "ielts-reading-tfng": ["ielts-reading-true-false-not-given"],
  "ielts-reading-matching-headings": ["ielts-reading-matching-headings"],
  "ielts-reading-mcq": ["ielts-reading-multiple-choice"],
  "ielts-reading-completion": ["ielts-reading-sentence-summary-table-completion"],
  "toefl-reading-vocabulary": ["toefl-vocabulary"],
  "toefl-reading-reference": ["toefl-reference"],
  "toefl-reading-inference": ["toefl-inference"],
  "toefl-reading-simplification": ["toefl-sentence-simplification"],
  "pte-reading-mcq-single": ["reading-mcq-single"],
  "pte-reading-mcq-multi": ["reading-mcq-multiple"],
  "pte-reading-reorder": ["reading-reorder-paragraphs"],
  "pte-reading-fill-blanks": ["reading-fill-in-blanks"],
};

export function konuAnlatimHref(examSlug: string, topicSlug: string) {
  return `/konu-anlatim?exam=${encodeURIComponent(examSlug)}&topic=${encodeURIComponent(topicSlug)}`;
}
