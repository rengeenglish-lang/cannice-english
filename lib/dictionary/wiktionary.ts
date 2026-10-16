export type WiktionarySense = {
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
};

export type WiktionaryEntry = {
  partOfSpeech: string;
  pronunciations: string[];
  forms: { word: string; tags: string[] }[];
  senses: WiktionarySense[];
};

export type WiktionaryResult = {
  word: string;
  entries: WiktionaryEntry[];
  sourceUrl: string;
};

const strings = (value: unknown, limit = 12) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, limit)
    : [];

export function parseWiktionaryResult(value: unknown): WiktionaryResult | null {
  if (!value || typeof value !== "object") return null;
  const root = value as Record<string, unknown>;
  if (typeof root.word !== "string" || !Array.isArray(root.entries)) return null;

  const entries = root.entries.flatMap((raw): WiktionaryEntry[] => {
    if (!raw || typeof raw !== "object") return [];
    const entry = raw as Record<string, unknown>;
    if (typeof entry.partOfSpeech !== "string" || !Array.isArray(entry.senses)) return [];
    const senses = entry.senses.flatMap((rawSense): WiktionarySense[] => {
      if (!rawSense || typeof rawSense !== "object") return [];
      const sense = rawSense as Record<string, unknown>;
      if (typeof sense.definition !== "string" || !sense.definition.trim()) return [];
      return [{
        definition: sense.definition.trim(),
        examples: strings(sense.examples, 2),
        synonyms: strings(sense.synonyms, 10),
        antonyms: strings(sense.antonyms, 10),
      }];
    }).slice(0, 12);
    if (!senses.length) return [];

    const pronunciations = Array.isArray(entry.pronunciations)
      ? entry.pronunciations.flatMap((rawPronunciation): string[] => {
          if (!rawPronunciation || typeof rawPronunciation !== "object") return [];
          const pronunciation = rawPronunciation as Record<string, unknown>;
          return pronunciation.type === "ipa" && typeof pronunciation.text === "string" ? [pronunciation.text] : [];
        }).slice(0, 3)
      : [];
    const forms = Array.isArray(entry.forms)
      ? entry.forms.flatMap((rawForm): { word: string; tags: string[] }[] => {
          if (!rawForm || typeof rawForm !== "object") return [];
          const form = rawForm as Record<string, unknown>;
          return typeof form.word === "string" ? [{ word: form.word, tags: strings(form.tags, 4) }] : [];
        }).slice(0, 8)
      : [];

    return [{ partOfSpeech: entry.partOfSpeech, pronunciations, forms, senses }];
  }).slice(0, 8);

  if (!entries.length) return null;
  const source = root.source && typeof root.source === "object" ? root.source as Record<string, unknown> : null;
  return {
    word: root.word,
    entries,
    sourceUrl: source && typeof source.url === "string" ? source.url : `https://en.wiktionary.org/wiki/${encodeURIComponent(root.word)}`,
  };
}
