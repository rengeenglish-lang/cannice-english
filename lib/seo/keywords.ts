import { z } from "zod";
import { intentSchema } from "./providers";
export const INTENT_LABELS: Record<string, string> = {
  UNKNOWN: "Henüz değerlendirilmedi",
  INFORMATIONAL: "Bilgi edinme",
  NAVIGATIONAL: "Belirli sayfayı bulma",
  COMMERCIAL: "Seçenek karşılaştırma",
  TRANSACTIONAL: "Satın alma",
  PRACTICE: "Pratik yapma",
  EXAM_PREPARATION: "Sınava hazırlık",
};
export function normalizeKeyword(value: string, language = "tr-TR") {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase(language)
    .replace(/\s+/g, " ");
}
export const keywordSchema = z
  .object({
    keyword: z.string().trim().min(2).max(160),
    languageCode: z
      .string()
      .trim()
      .max(20)
      .transform((v, ctx) => {
        try {
          return (
            Intl.getCanonicalLocales(v)[0] ||
            ctx.addIssue({ code: "custom", message: "Dil gerekli" })
          );
        } catch {
          ctx.addIssue({ code: "custom", message: "Geçersiz dil" });
          return z.NEVER;
        }
      })
      .pipe(z.string().min(2)),
    market: z.string().regex(/^[A-Z]{2}$/),
    intent: z.union([intentSchema, z.literal("UNKNOWN")]),
    examId: z.string().max(100).nullable(),
    sourceNote: z.string().trim().min(5).max(2000),
  })
  .strict();
export const updateKeywordSchema = keywordSchema.extend({
  id: z.string().min(1).max(100),
  revision: z.number().int().min(0),
  archived: z.boolean(),
});
export type KeywordInput = z.infer<typeof keywordSchema>;
/** Editorial signals only. This is not a ranking forecast or measured search demand. */
export function assessOpportunity(
  input: {
    keyword: string;
    languageCode: string;
    intent: string;
    examId: string | null;
  },
  inventory: {
    id: string;
    title: string;
    url: string;
    examSlug: string | null;
  }[],
  examSlug: string | null,
) {
  const normalized = normalizeKeyword(input.keyword, input.languageCode);
  const tokens = normalized
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2);
  const related = inventory
    .map((item) => {
      const title = normalizeKeyword(item.title, input.languageCode);
      const words = new Set(title.split(/[^\p{L}\p{N}]+/u));
      const overlap = tokens.length
        ? tokens.filter((t) => words.has(t)).length / tokens.length
        : 0;
      return { ...item, overlap, exact: title === normalized };
    })
    .filter((i) => i.overlap >= 0.5 || (examSlug && i.examSlug === examSlug))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);
  const duplicate = related.some((i) => i.exact || i.overlap >= 0.85);
  const signals = [
    { label: "Etkin sınavla ilişki", points: examSlug ? 40 : 0 },
    { label: "Mevcut içerikle destek", points: related.length ? 30 : 0 },
    {
      label: "Öğrenme/pratik amacı",
      points: ["INFORMATIONAL", "PRACTICE", "EXAM_PREPARATION"].includes(
        input.intent,
      )
        ? 30
        : 0,
    },
  ];
  return {
    relevance: signals.reduce((n, s) => n + s.points, 0),
    signals,
    related,
    duplicate,
    searchDemand: null,
    rankingFeasibility: null,
  };
}
