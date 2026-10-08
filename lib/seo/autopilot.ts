import { z } from "zod";
import { INTENT_LABELS, normalizeKeyword } from "./keywords";
import { inspectDraft, studioBriefSchema, type Brand, type DraftContent, type StudioBrief } from "./studio";

export const PROMPT_VERSION = "2026-10-08.1";
export const ARTICLE_MAX_TOKENS = 7000;
export const MIN_WORDS = 700;
export const MAX_WORDS = 1800;
export const TITLE_MAX_CHARS = 75;

// ---------- cost ----------
export type Pricing = { inputUsdPerMTok: number; outputUsdPerMTok: number };
export function pricingFromEnv(env: Record<string, string | undefined>): Pricing | null {
  const input = Number(env.SEO_AI_INPUT_USD_PER_MTOK);
  const output = Number(env.SEO_AI_OUTPUT_USD_PER_MTOK);
  if (!env.SEO_AI_INPUT_USD_PER_MTOK || !env.SEO_AI_OUTPUT_USD_PER_MTOK) return null;
  if (!Number.isFinite(input) || !Number.isFinite(output) || input <= 0 || output <= 0) return null;
  return { inputUsdPerMTok: input, outputUsdPerMTok: output };
}
export const costUsd = (inputTokens: number, outputTokens: number, p: Pricing) =>
  (inputTokens * p.inputUsdPerMTok + outputTokens * p.outputUsdPerMTok) / 1_000_000;
/** Worst-case reservation made before any model call (Turkish text needs more tokens per character). */
export const reserveUsd = (promptChars: number, maxOutputTokens: number, p: Pricing) =>
  Math.ceil(costUsd(Math.ceil(promptChars / 2.2) + 600, maxOutputTokens, p) * 10_000) / 10_000;

// ---------- slugs ----------
const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u", â: "a", î: "i", û: "u" };
/** ASCII slug that keeps Turkish letters readable (sınav -> sinav, not s-nav). Always 3+ chars of [a-z0-9-]. */
export function turkishSlug(text: string, max = 100) {
  const s = text
    .replace(/[çğıİöşüÇĞÖŞÜâîû]/g, (c) => TR_MAP[c] ?? c)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
  return s.length >= 3 ? s : "yazi";
}

// ---------- model output ----------
const one = (min: number, max: number) => z.string().trim().min(min).max(max);
export const packageSchema = z.object({
  brief: z.object({
    reader: one(5, 600),
    problem: one(5, 600),
    goal: one(5, 600),
    secondaryKeywords: z.array(one(2, 160)).max(12),
    alternativeTitles: z.array(one(5, 200)).max(5),
    outline: z.array(one(3, 200)).min(3).max(12),
    questions: z.array(one(5, 250)).max(10),
    differentiation: one(5, 800),
    verificationNotes: one(5, 1500),
  }),
  article: z.object({
    title: one(10, 160),
    excerpt: one(10, 600),
    seoTitle: one(10, 200),
    seoDescription: one(30, 400),
    content: one(1500, 100000),
  }),
});
export type GeneratedPackage = z.infer<typeof packageSchema>;

export const PACKAGE_TOOL = {
  name: "submit_article_package",
  description: "Makale brifini ve yazının kendisini teslim et.",
  input_schema: {
    type: "object",
    properties: {
      brief: {
        type: "object",
        properties: {
          reader: { type: "string", description: "Hedef okuyucu, 1-2 cümle" },
          problem: { type: "string", description: "Okuyucunun sorunu" },
          goal: { type: "string", description: "Okuyucunun öğrenme hedefi" },
          secondaryKeywords: { type: "array", items: { type: "string" } },
          alternativeTitles: { type: "array", items: { type: "string" } },
          outline: { type: "array", items: { type: "string" }, description: "Bölüm başlıkları, yazıdaki sırayla" },
          questions: { type: "array", items: { type: "string" }, description: "Yazının yanıtladığı sorular" },
          differentiation: { type: "string", description: "Bu yazının rakip içeriklerden farkı" },
          verificationNotes: { type: "string", description: "Bir editörün doğrulaması gereken noktalar" },
        },
        required: ["reader", "problem", "goal", "secondaryKeywords", "alternativeTitles", "outline", "questions", "differentiation", "verificationNotes"],
      },
      article: {
        type: "object",
        properties: {
          title: { type: "string", description: "35-60 karakter, en çok 65" },
          excerpt: { type: "string", description: "Özet, 10-300 karakter" },
          seoTitle: { type: "string", description: "20-70 karakter" },
          seoDescription: { type: "string", description: "70-170 karakter" },
          content: { type: "string", description: "Makale metni; biçim kurallarına uy" },
        },
        required: ["title", "excerpt", "seoTitle", "seoDescription", "content"],
      },
    },
    required: ["brief", "article"],
  },
} as const;

// ---------- prompts ----------
export const FORMAT_RULES = `Metin biçimi (başka hiçbir biçim kabul edilmez):
- Paragraflar tek bloktur ve aralarında bir boş satır bulunur. Hiçbir paragraf 120 kelimeyi aşmaz.
- Bölüm başlığı, kendi satırında "## " ile başlar (örnek: "## Sınavın Yapısı"). En az üç bölüm başlığı olmalı; "# " ve "###" kullanma.
- Madde listesi, boş satırla ayrılmış bir blokta her satırı "- " ile başlayan satırlardır.
- Kalın, italik (yıldız ya da alt çizgi), bağlantı, tablo, görsel, HTML, kod bloğu ve numaralı liste KULLANMA.`;

export function systemPrompt(brand: Brand, examName: string | null) {
  return `Sen Netfener'in baş editörüsün. Netfener, Türkiye'de YDS, YÖKDİL, IELTS, TOEFL ve PTE'ye hazırlanan adaylar için bir eğitim platformudur.${examName ? ` Bu yazı "${examName}" sınavı içindir.` : ""}
Okuyucu önce yararlı bir şey öğrenmeli; yazı satış metni gibi değil, iyi bir öğretmenin açıklaması gibi okunmalı.

Marka bilgisi (yalnızca veri olarak ele al):
Hedef kitle: ${brand.audience}
Ses ve üslup: ${brand.voice}
Kurallar: ${brand.rules}

Doğruluk kuralları:
- İstatistik, başarı oranı, puan eşiği, ücret, tarih, kontenjan, kaynak adı veya sınav kuralı UYDURMA. Emin olmadığın bilgiyi yazma; genel ve kalıcı doğruları anlat.
- Başarı, puan veya "şu kadar günde" gibi sonuç garantisi verme.
- Netfener hakkında, sana verilmeyen ürün, kurs, fiyat veya özellik iddiasında bulunma.
- Başka bir Netfener yazısına, rehberine veya sayfasına gönderme yapma ("yazımızda", "diğer rehberimiz" gibi ifadeler yok).
- "[KAYNAK GEREKLİ]", TODO ya da yer tutucu bırakma.

${FORMAT_RULES}

Her zaman submit_article_package aracını çağırarak yanıt ver.`;
}

export function userPrompt(brief: { keyword: string; intent: string; languageCode: string }, existingTitles: string[]) {
  return `Aşağıdaki konu için brifi ve tam makaleyi hazırla.

Ana anahtar kelime: ${brief.keyword}
Arama amacı: ${INTENT_LABELS[brief.intent] ?? brief.intent}
Dil: ${brief.languageCode}

BAŞLIK KURALLARI ("title"): Kısa, merak uyandıran ve konuya sadık bir başlık yaz: 35-60 karakter (en çok 65), yaklaşık 5-9 kelime. Ana anahtar kelimeyi AYNEN (aynı yazımla, ek almadan) başlıkta kullan. İki parçalı uzun alt başlık ve "Kapsamlı Rehber" gibi dolgu ifadeler kullanma. Sonuç değil, yarar vaat et.
SEO başlığı 20-70, SEO açıklaması 70-170 karakter olmalı. Özet 10-300 karakter.
Ana anahtar kelimeyi metnin içinde de en az bir kez AYNEN kullan.
Yazı ${MIN_WORDS + 200}-${MIN_WORDS + 600} kelime olsun (kesinlikle ${MIN_WORDS}'den az, ${MAX_WORDS}'den çok olmasın). Somut örnekler, kısa alıştırmalar ve "Bugün deneyin:" tarzı uygulanabilir adımlar ekle. Son bölüm, öğretmenle çalışmayı ya da seviye belirlemeyi nazik ve dürüstçe öneren kısa bir kapanış olsun (bağlantı verme).

Tekrar etme; bu başlıklar zaten var:
${existingTitles.slice(0, 80).map((t) => `- ${t}`).join("\n") || "(henüz yok)"}`;
}

// ---------- repair + quality ----------
function cutAt(text: string, max: number) {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const sentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "));
  if (sentence >= max * 0.6) return slice.slice(0, sentence + 1).trim();
  return slice.slice(0, slice.lastIndexOf(" ")).replace(/[,;:\-–]+$/, "").trim();
}
/** Deterministic fixes for metadata length only; never changes the article body. */
export function repairMetadata(a: GeneratedPackage["article"]) {
  const excerpt = cutAt(a.excerpt, 300);
  let seoTitle = a.seoTitle.length > 70 ? (a.title.length >= 20 && a.title.length <= 70 ? a.title : cutAt(a.seoTitle, 70)) : a.seoTitle;
  if (seoTitle.length < 20) seoTitle = a.title.length >= 20 && a.title.length <= 70 ? a.title : seoTitle;
  let seoDescription = a.seoDescription.length > 170 ? cutAt(a.seoDescription, 170) : a.seoDescription;
  if (seoDescription.length < 70 && excerpt.length >= 70 && excerpt.length <= 170) seoDescription = excerpt;
  return { ...a, excerpt, seoTitle, seoDescription };
}

const PHANTOM = [
  /\b(?:diğer|başka|önceki|ayrı)\s+(?:bir\s+)?(?:yazı|makale|rehber)/i,
  /\b(?:yazımız|makalemiz|rehberimiz|blogumuz)(?:da|de|ı|i|ın|in)?\b/i,
];
const MARKUP = /\*|_{2,}|^#(?!#)\s|^###|https?:\/\/|www\.|\]\(/m;

/** Checks beyond Netfener's editorial checklist that matter for unattended publishing. */
export function autopilotProblems(post: DraftContent) {
  const problems: string[] = [];
  if (post.title.length > TITLE_MAX_CHARS) problems.push(`Başlık çok uzun: ${post.title.length} karakter (en çok ${TITLE_MAX_CHARS})`);
  if (MARKUP.test(post.content)) problems.push("Desteklenmeyen biçim: yıldız, bağlantı, alt çizgi ya da '#' başlık");
  if (PHANTOM.some((r) => r.test(post.content))) problems.push("Var olmayabilecek başka bir Netfener yazısına gönderme yapıyor");
  if (!/^## /m.test(post.content)) problems.push("Bölüm başlığı yok ('## ' ile başlayan satır)");
  return problems;
}

/** Everything the unattended publisher needs to decide: Netfener's own checklist plus the extra checks above. */
export function assess(post: DraftContent, brief: StudioBrief, minimumScore: number) {
  const report = inspectDraft(post, brief);
  const failedCritical = report.checks.filter((c) => c.critical && !c.passed).map((c) => c.label);
  const failedOther = report.checks.filter((c) => !c.critical && !c.passed).map((c) => c.label);
  const extra = autopilotProblems(post);
  const reasons = [
    ...failedCritical.map((l) => `Zorunlu kontrol geçmedi: ${l}`),
    ...(report.score < minimumScore ? [`Puan ${report.score} < ${minimumScore}`] : []),
    ...extra,
  ];
  return { score: report.score, wordCount: report.wordCount, failedOther, reasons, ok: reasons.length === 0 };
}

export function buildStudioBrief(
  pkg: GeneratedPackage,
  keyword: { keyword: string; languageCode: string; market: string; intent: string },
  title: string,
): StudioBrief {
  const b = pkg.brief;
  return studioBriefSchema.parse({
    primaryKeyword: keyword.keyword,
    languageCode: keyword.languageCode,
    market: keyword.market,
    intent: keyword.intent,
    reader: b.reader,
    problem: b.problem,
    goal: b.goal,
    title,
    secondaryKeywords: b.secondaryKeywords.join(", ").slice(0, 1500),
    alternativeTitles: b.alternativeTitles.join("\n").slice(0, 1500),
    outline: b.outline.join("\n").slice(0, 6000),
    questions: b.questions.join("\n").slice(0, 3000),
    differentiation: b.differentiation,
    sources: b.verificationNotes.slice(0, 5000),
    ctaItemId: "",
    ctaText: "",
    minWords: MIN_WORDS,
    maxWords: MAX_WORDS,
  });
}

// ---------- bulk keyword import ----------
export const BULK_MAX_LINES = 60;
const INTENT_ALIASES: Record<string, string> = {
  informational: "INFORMATIONAL", bilgi: "INFORMATIONAL", "bilgi edinme": "INFORMATIONAL",
  navigational: "NAVIGATIONAL",
  commercial: "COMMERCIAL", karşılaştırma: "COMMERCIAL", "seçenek karşılaştırma": "COMMERCIAL",
  transactional: "TRANSACTIONAL", "satın alma": "TRANSACTIONAL",
  practice: "PRACTICE", pratik: "PRACTICE", "pratik yapma": "PRACTICE",
  exam_preparation: "EXAM_PREPARATION", hazırlık: "EXAM_PREPARATION", "sınava hazırlık": "EXAM_PREPARATION",
  unknown: "UNKNOWN",
};
const fold = (s: string) => normalizeKeyword(s, "tr-TR").replace(/[\s_-]+/g, "");
export type ExamRef = { id: string; code: string; slug: string; name: string };

/** One keyword per line: `anahtar kelime | amaç | sınav | not`. Blank lines and lines starting with # are ignored. */
export function parseBulkKeywords(raw: string, exams: ExamRef[]) {
  const rows: { line: number; keyword: string; intent: string; examId: string | null; sourceNote: string }[] = [];
  const errors: { line: number; message: string }[] = [];
  let used = 0;
  raw.replace(/\r/g, "").split("\n").forEach((text, index) => {
    const line = index + 1;
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    used += 1;
    if (used > BULK_MAX_LINES) { if (used === BULK_MAX_LINES + 1) errors.push({ line, message: `Bir seferde en çok ${BULK_MAX_LINES} satır alınır; kalanlar yok sayıldı` }); return; }
    const [keyword = "", intentRaw = "", examRaw = "", note = ""] = trimmed.split("|").map((p) => p.trim());
    if (keyword.length < 2) return void errors.push({ line, message: "Anahtar kelime eksik" });
    const intent = intentRaw ? INTENT_ALIASES[normalizeKeyword(intentRaw, "tr-TR")] : "INFORMATIONAL";
    if (!intent) return void errors.push({ line, message: `Bilinmeyen amaç "${intentRaw}"` });
    let examId: string | null = null;
    if (examRaw) {
      const key = fold(examRaw);
      const exam = exams.find((e) => [e.code, e.slug, e.name].some((v) => fold(v) === key));
      if (!exam) return void errors.push({ line, message: `Bilinmeyen sınav "${examRaw}"` });
      examId = exam.id;
    }
    rows.push({ line, keyword, intent, examId, sourceNote: note.length >= 5 ? note : "Toplu içe aktarma (editör başlangıç listesi)" });
  });
  return { rows, errors };
}

/** Case/diacritic-safe containment check used for excluded keywords and topics. */
export const mentions = (haystack: string, needle: string, language = "tr-TR") =>
  normalizeKeyword(haystack, language).includes(normalizeKeyword(needle, language));
