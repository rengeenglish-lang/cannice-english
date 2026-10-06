import { normalizeKeyword } from "./keywords";
import { internalUrl } from "./inventory";

export type IntelligenceItem = {
  id: string; title: string; url: string; sourceType: string; sourceId: string;
  examSlug: string | null; languageCode: string | null; excerpt: string | null;
  access: string; publication: string; available: boolean;
};
const stop = new Set(["ve", "ile", "bir", "için", "the", "and", "for", "konu", "anlatımı"]);
export function topicTokens(text: string, language: string) {
  return [...new Set(normalizeKeyword(text, language).match(/[\p{L}\p{N}]+/gu) || [])]
    .filter(t => t.length > 1 && !stop.has(t));
}
/** Lexical evidence only: neither semantic similarity nor measured search cannibalization. */
export function analyzeDestinations(input: {
  keyword: string; language: string; examSlug: string | null; postId: string;
}, items: IntelligenceItem[]) {
  const tokens = topicTokens(input.keyword, input.language);
  return items.filter(item => item.available && ["LIVE", "PUBLISHED"].includes(item.publication)
    && !(item.sourceType === "BLOG" && item.sourceId === input.postId)
    && (!item.languageCode || item.languageCode.split("-")[0] === input.language.split("-")[0])
    && (!input.examSlug || !item.examSlug || item.examSlug === input.examSlug)
    && item.url.startsWith("/") && !item.url.startsWith("//")
    && internalUrl(item.url, "https://netfener.com") !== null)
    .map(item => {
      const titleWords = new Set(topicTokens(item.title, input.language));
      const matched = tokens.filter(t => titleWords.has(t));
      const overlap = tokens.length ? matched.length / tokens.length : 0;
      const sameExam = Boolean(input.examSlug && item.examSlug === input.examSlug);
      const exact = normalizeKeyword(item.title, input.language) === normalizeKeyword(input.keyword, input.language);
      return { ...item, matched, overlap, sameExam,
        score: Math.round(overlap * 80 + (sameExam ? 20 : 0)),
        possibleOverlap: item.sourceType !== "PRODUCT" && (exact || (matched.length >= 2 && overlap >= 0.75)),
      };
    }).filter(item => item.overlap > 0 || item.sameExam)
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
}
