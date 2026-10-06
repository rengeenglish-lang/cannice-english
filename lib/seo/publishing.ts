import { z } from "zod";
import { inspectDraft, type DraftContent, type StudioBrief } from "./studio";

export const SCHEDULE_MIN_MINUTES = 5;
export const SCHEDULE_MAX_DAYS = 90;
export const MAX_SCHEDULED = 30;
export const TEMP_SLUG_PREFIX = "seo-taslak-";

export const VERSION_REASONS: Record<string, string> = {
  EDIT: "Düzenleme",
  PUBLISHED: "Yayınlandı",
  UNPUBLISHED: "Yayından kaldırıldı",
  RESTORED: "Sürüm geri yüklendi",
};

export const scheduleInputSchema = z.object({
  id: z.string().min(1).max(100),
  revision: z.number().int().min(0),
  scheduledFor: z.iso.datetime(),
});

/** Validates a requested publication time against the allowed window. Returns an error message or null. */
export function scheduleWindowError(when: Date, now = new Date()) {
  if (Number.isNaN(when.getTime())) return "Geçerli bir tarih seçin.";
  if (when.getTime() < now.getTime() + SCHEDULE_MIN_MINUTES * 60_000)
    return `Yayın zamanı en az ${SCHEDULE_MIN_MINUTES} dakika sonrası olmalı.`;
  if (when.getTime() > now.getTime() + SCHEDULE_MAX_DAYS * 86_400_000)
    return `Yayın en fazla ${SCHEDULE_MAX_DAYS} gün sonrasına planlanabilir.`;
  return null;
}

export type GateInput = {
  post: DraftContent;
  brief: StudioBrief;
  minimumQualityScore: number;
  reviewedCurrent: boolean;
  approvedCurrent: boolean;
  slugTaken: boolean;
  linksValid: boolean;
  ctaValid: boolean;
};
export type GateCheck = { id: string; label: string; passed: boolean };

/**
 * Deterministic publishing gate. Every check must pass; there is no override. A failure sends the
 * article back to review rather than publishing it. The score is the manual editorial checklist,
 * not a measure of accuracy, originality or ranking potential.
 */
export function publishGate(input: GateInput) {
  const report = inspectDraft(input.post, input.brief);
  const criticalOk = report.checks.every((c) => !c.critical || c.passed);
  const checks: GateCheck[] = [
    { id: "reviewed", label: "Editör incelemesi güncel (inceleme sonrası değişiklik yok)", passed: input.reviewedCurrent },
    { id: "approved", label: "Yayın onayı güncel", passed: input.approvedCurrent },
    { id: "critical", label: "Zorunlu editoryal kontroller tamam", passed: criticalOk },
    {
      id: "score",
      label: `Kontrol listesi puanı ≥ ${input.minimumQualityScore}`,
      passed: report.score >= input.minimumQualityScore,
    },
    { id: "slug", label: "URL kısa adı benzersiz ve geçici değil", passed: !input.slugTaken && !input.post.slug.startsWith(TEMP_SLUG_PREFIX) },
    { id: "metadata", label: "SEO başlığı ve açıklaması geçerli", passed: report.checks.filter((c) => c.id === "title" || c.id === "description").every((c) => c.passed) },
    { id: "links", label: "Onaylı iç bağlantılar ve CTA hedefleri yayında", passed: input.linksValid && input.ctaValid },
    { id: "sections", label: "Boş bölüm veya yer tutucu yok", passed: report.checks.filter((c) => c.id === "placeholders" || c.id === "paragraphs").every((c) => c.passed) },
  ];
  return { ok: checks.every((c) => c.passed), checks, score: report.score };
}

export function articlePath(slug: string) {
  return `/blog/${slug}`;
}

/** Escapes a JSON-LD payload so article text can never close the script element. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}

export type ArticleSchemaInput = {
  siteUrl: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  authorName: string;
  publishedAt: Date | null;
  modifiedAt: Date;
  languageCode: string;
};

/**
 * BlogPosting + BreadcrumbList describing exactly what the page shows. No FAQ, rating, review or
 * product markup is emitted because the page does not contain those elements.
 */
export function buildArticleJsonLd(a: ArticleSchemaInput) {
  const base = a.siteUrl.replace(/\/$/, "");
  const url = `${base}${articlePath(a.slug)}`;
  const posting: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: a.title.slice(0, 110),
    description: a.description,
    inLanguage: a.languageCode,
    author: { "@type": "Person", name: a.authorName },
    publisher: { "@type": "Organization", name: "Netfener", url: base },
    dateModified: a.modifiedAt.toISOString(),
  };
  if (a.publishedAt) posting.datePublished = a.publishedAt.toISOString();
  if (a.imageUrl) posting.image = a.imageUrl.startsWith("http") ? a.imageUrl : `${base}${a.imageUrl}`;
  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: a.title, item: url },
    ],
  };
  return { "@context": "https://schema.org", "@graph": [posting, breadcrumbs] };
}

export const PUBLISH_STAGE_LABELS: Record<string, string> = {
  APPROVED: "Yayın için onaylandı · yayınlanmadı",
  SCHEDULED: "Zamanlandı · henüz yayınlanmadı",
};

const ISTANBUL_OFFSET_MS = 3 * 3_600_000; // Turkey has used a fixed UTC+3 since 2016.
/** Start (inclusive) and end (exclusive) of the Istanbul calendar day or Monday-based week containing `date`. */
export function istanbulWindow(date: Date, unit: "day" | "week") {
  const local = date.getTime() + ISTANBUL_OFFSET_MS;
  const day = Math.floor(local / 86_400_000);
  const startDay = unit === "day" ? day : day - ((day + 3) % 7); // 1970-01-01 was a Thursday.
  const days = unit === "day" ? 1 : 7;
  return {
    start: new Date(startDay * 86_400_000 - ISTANBUL_OFFSET_MS),
    end: new Date((startDay + days) * 86_400_000 - ISTANBUL_OFFSET_MS),
  };
}
