/**
 * Pratik Bankası groups every diagnostic topic under one of five skill sections. Topics carry no
 * section column, so it is derived from the slug: explicit YDS/YÖKDİL question-type mappings
 * first, then the skill word in the slug (ielts-reading-…, …-listening-…), then the grammar
 * parent ("dil-bilgisi") that owns the tense/passive/conditional sub-topics.
 */
export const PRACTICE_SECTIONS = [
  { key: "grammar", label: "Grammar", description: "Tüm dil bilgisi konuları: zamanlar, edilgen yapı, bağlaçlar ve daha fazlası." },
  { key: "reading", label: "Reading", description: "Okuma, paragraf ve çeviri soru tipleri." },
  { key: "listening", label: "Listening", description: "Dinleme soru tipleri." },
  { key: "speaking", label: "Speaking", description: "Konuşma görevleri." },
  { key: "writing", label: "Writing", description: "Yazma görevleri." },
] as const;

export type PracticeSectionKey = (typeof PRACTICE_SECTIONS)[number]["key"];

const EXPLICIT: Record<string, PracticeSectionKey> = {
  "dil-bilgisi": "grammar",
  "kelime-bilgisi": "grammar",
  "cloze-test": "grammar",
  "cumle-tamamlama": "grammar",
  okuma: "reading",
  "paragraf-tamamlama": "reading",
  "anlamda-en-yakin-cumle": "reading",
  "ceviri-en-tr": "reading",
  "ceviri-tr-en": "reading",
};

export function practiceSectionForTopic(topic: { slug: string; parentSlug?: string | null }): PracticeSectionKey {
  const explicit = EXPLICIT[topic.slug];
  if (explicit) return explicit;
  for (const key of ["reading", "listening", "speaking", "writing"] as const) {
    if (topic.slug.includes(key)) return key;
  }
  if (topic.parentSlug) return practiceSectionForTopic({ slug: topic.parentSlug });
  return "grammar";
}

export function isPracticeSection(value: string | undefined): value is PracticeSectionKey {
  return PRACTICE_SECTIONS.some((section) => section.key === value);
}
