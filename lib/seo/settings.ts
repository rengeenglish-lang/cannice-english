import { z } from "zod";

export const SEO_SETTINGS_KEY = "seo_autopilot_v1";
export const seoSettingsSchema = z
  .object({
    mode: z.enum(["MANUAL", "ASSISTED"]).default("ASSISTED"),
    paused: z.literal(true).default(true), // No automation engine is enabled in Phase 1.
    languageCode: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .refine((value) => {
        try {
          return Intl.getCanonicalLocales(value).length === 1;
        } catch {
          return false;
        }
      }, "Geçerli bir dil kodu kullanın (tr-TR, en-GB)."),
    targetMarkets: z
      .array(
        z
          .string()
          .trim()
          .regex(/^[A-Z]{2}$/),
      )
      .min(1)
      .max(20),
    enabledExamIds: z.array(z.string().min(1).max(100)).max(30),
    provider: z.enum(["NONE", "OPENAI", "ANTHROPIC", "GOOGLE"]),
    model: z
      .string()
      .trim()
      .max(100)
      .regex(/^[a-zA-Z0-9._:/-]*$/),
    monthlyBudgetUsd: z.number().finite().min(0).max(10000),
    dailyArticleLimit: z.number().int().min(0).max(20),
    weeklyArticleLimit: z.number().int().min(0).max(100),
    minimumQualityScore: z.number().int().min(0).max(100),
    minimumRelevanceScore: z.number().int().min(0).max(100),
    excludedKeywords: z.array(z.string().trim().min(1).max(120)).max(100),
    excludedTopics: z.array(z.string().trim().min(1).max(120)).max(100),
  })
  .strict()
  .refine(
    (s) => s.dailyArticleLimit <= s.weeklyArticleLimit,
    "Günlük sınır haftalık sınırı aşamaz.",
  )
  .refine(
    (s) => s.provider === "NONE" || s.model.length > 0,
    "Sağlayıcı seçildiğinde model adını girin.",
  );
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  mode: "ASSISTED",
  paused: true,
  languageCode: "tr-TR",
  targetMarkets: ["TR"],
  enabledExamIds: [],
  provider: "NONE",
  model: "",
  monthlyBudgetUsd: 0,
  dailyArticleLimit: 1,
  weeklyArticleLimit: 3,
  minimumQualityScore: 85,
  minimumRelevanceScore: 80,
  excludedKeywords: [],
  excludedTopics: [],
};
export const seoSettingsEnvelopeSchema = z
  .object({ revision: z.number().int().min(0), settings: seoSettingsSchema })
  .strict();
export type SeoSettingsEnvelope = z.infer<typeof seoSettingsEnvelopeSchema>;
export const SEO_SECTIONS = [
  ["overview", "Genel bakış", 1],
  ["opportunities", "Fırsatlar", 2],
  ["keywords", "Anahtar kelimeler", 2],
  ["clusters", "Konu kümeleri", 3],
  ["calendar", "İçerik takvimi", 4],
  ["studio", "Makale stüdyosu", 2],
  ["inventory", "Mevcut içerik", 1],
  ["links", "İç bağlantılar", 3],
  ["refresh", "İçerik yenileme", 5],
  ["performance", "Performans", 5],
  ["conversions", "Dönüşümler", 6],
  ["competitors", "Rakipler", 8],
  ["settings", "Ayarlar", 1],
  ["activity", "İşlem geçmişi", 1],
] as const;
