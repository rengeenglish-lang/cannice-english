import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { callClaudeTool, claudeConfig, ClaudeApiError } from "@/server/seo/claude";
import { NonRetryableError } from "@/lib/seo/automation";
import {
  ARTICLE_MAX_TOKENS,
  PACKAGE_TOOL,
  PROMPT_VERSION,
  assess,
  buildStudioBrief,
  costUsd,
  normalizePackageInput,
  packageSchema,
  repairMetadata,
  reserveUsd,
  systemPrompt,
  turkishSlug,
  userPrompt,
} from "@/lib/seo/autopilot";
import { BRAND_KEY, DEFAULT_BRAND, brandEnvelopeSchema, briefIssues, draftContentSchema } from "@/lib/seo/studio";
import { istanbulWindow } from "@/lib/seo/publishing";
import { BudgetError, releaseAiUsage, reserveAiBudget, settleAiUsage } from "./budget.service";
import { readAutomation } from "./automation.service";
import { readSeoSettings } from "./settings.service";
import { autoPublishSeoDraft } from "./publishing.service";
import { createSeoDraft, saveSeoBrief, saveSeoDraftContent } from "./studio.service";

/** The audit/authorship identity for unattended work: the oldest active administrator. */
export async function systemActorId() {
  const admin = await db.user.findFirst({ where: { role: "ADMIN", isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!admin) throw new NonRetryableError("Etkin bir yönetici hesabı bulunamadı.");
  return admin.id;
}

async function readBrand() {
  const row = await db.appSetting.findUnique({ where: { key: BRAND_KEY } });
  return row ? brandEnvelopeSchema.parse(JSON.parse(row.value)).brand : DEFAULT_BRAND;
}

/** SEO writes share one advisory lock; wait briefly instead of failing (and re-paying) when another write is in flight. */
async function withLock<T>(fn: () => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= 5 || !(error instanceof Error) || !error.message.startsWith("Başka bir SEO işlemi sürüyor")) throw error;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function uniqueSlug(title: string) {
  const base = turkishSlug(title, 90);
  for (let n = 1; n < 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const [post, redirect] = await Promise.all([
      db.blogPost.findUnique({ where: { slug }, select: { id: true } }),
      db.seoSlugRedirect.findUnique({ where: { fromSlug: slug }, select: { postId: true } }),
    ]);
    if (!post && !redirect) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type GenerateResult = {
  keywordId: string;
  status: "PUBLISHED" | "NEEDS_REVIEW" | "SKIPPED";
  draftId?: string;
  slug?: string;
  score?: number;
  reasons: string[];
  costUsd?: number;
};

/** Articles published (any route) inside the Istanbul day / week containing `now`. */
async function publishedIn(now: Date, unit: "day" | "week") {
  const { start, end } = istanbulWindow(now, unit);
  return db.seoArticleDraft.count({ where: { post: { status: "PUBLISHED", publishedAt: { gte: start, lt: end } } } });
}

/**
 * Brief + article for one keyword, then (only if enabled and every gate passes) publication. The paid model call
 * happens once: after it, failures are non-retryable so a retry never pays twice. A draft that does not pass is saved
 * for a human and parked with the reasons.
 */
export async function generateArticleForKeyword(
  keywordId: string,
  options: { ignoreLimits?: boolean; actorId?: string; call?: typeof callClaudeTool } = {},
): Promise<GenerateResult> {
  const { settings } = await readSeoSettings();
  if (settings.provider !== "ANTHROPIC" || !settings.model)
    throw new NonRetryableError("Ayarlar’da sağlayıcı olarak ANTHROPIC seçin ve bir model adı girin.");
  const config = claudeConfig();
  if (!config) throw new NonRetryableError("Claude yapılandırılmadı (ANTHROPIC_API_KEY ve SEO_AI_*_USD_PER_MTOK gerekli).");

  const keyword = await db.seoKeyword.findUnique({
    where: { id: keywordId },
    include: { exam: { select: { name: true } }, articleDraft: { include: { post: { select: { status: true, content: true } } } } },
  });
  if (!keyword || keyword.archived) throw new NonRetryableError("Anahtar kelime bulunamadı ya da arşivde.");
  const existing = keyword.articleDraft;
  if (existing && (existing.post.status === "PUBLISHED" || existing.post.content.trim().length > 0))
    return { keywordId, status: "SKIPPED", draftId: existing.id, reasons: ["Bu anahtar kelimenin zaten bir taslağı var; üzerine yazılmaz."] };

  const now = new Date();
  if (!options.ignoreLimits) {
    const [today, week] = await Promise.all([
      db.seoActivityLog.count({ where: { action: "AUTOPILOT_GENERATED", createdAt: { gte: istanbulWindow(now, "day").start } } }),
      db.seoActivityLog.count({ where: { action: "AUTOPILOT_GENERATED", createdAt: { gte: istanbulWindow(now, "week").start } } }),
    ]);
    if (today >= settings.dailyArticleLimit) throw new NonRetryableError(`Günlük üretim sınırı (${settings.dailyArticleLimit}) doldu.`);
    if (week >= settings.weeklyArticleLimit) throw new NonRetryableError(`Haftalık üretim sınırı (${settings.weeklyArticleLimit}) doldu.`);
  }

  // ---- one paid call, guarded by the budget ledger ----
  const [brand, titles] = await Promise.all([
    readBrand(),
    db.blogPost.findMany({ select: { title: true }, orderBy: { createdAt: "desc" }, take: 150 }),
  ]);
  const system = systemPrompt(brand, keyword.exam?.name ?? null);
  const user = userPrompt({ keyword: keyword.keyword, intent: keyword.intent, languageCode: keyword.languageCode }, titles.map((t) => t.title));
  const estimate = reserveUsd(system.length + user.length, ARTICLE_MAX_TOKENS, config.pricing);
  let reservation;
  try {
    reservation = await reserveAiBudget({ provider: "ANTHROPIC", model: settings.model, operation: "GENERATE_ARTICLE", estimatedUsd: estimate });
  } catch (error) {
    if (error instanceof BudgetError) throw new NonRetryableError(error.message);
    throw error;
  }
  let result;
  try {
    result = await (options.call ?? callClaudeTool)(config, { tool: PACKAGE_TOOL, system, user, model: settings.model, maxTokens: ARTICLE_MAX_TOKENS });
  } catch (error) {
    // A cut-off response was generated (and billed); anything else did not reach a usable answer.
    if (error instanceof Error && error.message.includes("yarıda kesildi")) await settleAiUsage(reservation.id, { usd: estimate });
    else await releaseAiUsage(reservation.id);
    if (error instanceof ClaudeApiError && !error.retryable) throw new NonRetryableError(error.message);
    throw error;
  }
  const spent = costUsd(result.inputTokens, result.outputTokens, config.pricing);
  await settleAiUsage(reservation.id, { usd: spent, inputTokens: result.inputTokens, outputTokens: result.outputTokens });

  // ---- from here on every failure is final (the money is spent) ----
  const parsed = packageSchema.safeParse(normalizePackageInput(result.input));
  if (!parsed.success) {
    const issue = `${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`;
    // The call was paid for: keep what the model returned so the cause can be diagnosed.
    await db.seoActivityLog.create({ data: { actorId: null, action: "AUTOPILOT_OUTPUT_REJECTED", details: { keywordId, issue, raw: JSON.stringify(result.input).slice(0, 12000) } } });
    throw new NonRetryableError(`Model çıktısı doğrulanamadı: ${issue}`);
  }
  const article = repairMetadata(parsed.data.article);
  const slug = await uniqueSlug(article.title);
  const post = draftContentSchema.safeParse({ title: article.title, slug, excerpt: article.excerpt, content: article.content, seoTitle: article.seoTitle, seoDescription: article.seoDescription });
  if (!post.success) throw new NonRetryableError(`Yazı alanları geçersiz: ${post.error.issues[0]?.path.join(".")} ${post.error.issues[0]?.message}`);
  const brief = buildStudioBrief(parsed.data, keyword, article.title);
  const problems = briefIssues(brief);
  if (problems.length) throw new NonRetryableError(`Brief eksik: ${problems.join(" ")}`);

  const actor = options.actorId ?? (await systemActorId());
  const { id: draftId } = await withLock(() => createSeoDraft(actor, keyword.id));
  let draft = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: draftId }, include: { post: { select: { updatedAt: true } } } });
  const briefSaved = await withLock(() => saveSeoBrief(actor, { id: draftId, revision: draft.revision, brief, ready: true }));
  draft = await db.seoArticleDraft.findUniqueOrThrow({ where: { id: draftId }, include: { post: { select: { updatedAt: true } } } });
  await withLock(() => saveSeoDraftContent(actor, { id: draftId, revision: briefSaved.revision, postUpdatedAt: draft.post.updatedAt.toISOString(), post: post.data }));

  const assessment = assess(post.data, brief, settings.minimumQualityScore);
  await db.seoActivityLog.create({
    data: {
      actorId: actor,
      action: "AUTOPILOT_GENERATED",
      details: { draftId, keywordId, score: assessment.score, words: assessment.wordCount, costUsd: Number(spent.toFixed(4)), model: settings.model, promptVersion: PROMPT_VERSION, reasons: assessment.reasons },
    },
  });

  // ---- optional unattended publication: same gate, plus the daily/weekly caps ----
  let reasons = assessment.reasons;
  const automation = (await readAutomation()).state;
  if (automation.autoPublish && !automation.emergencyStop && assessment.ok) {
    const [day, week] = await Promise.all([publishedIn(now, "day"), publishedIn(now, "week")]);
    if (!options.ignoreLimits && (day >= settings.dailyArticleLimit || week >= settings.weeklyArticleLimit)) {
      reasons = ["Günlük ya da haftalık yayın sınırı dolu; yazı incelemeye bırakıldı."];
    } else {
      const published = await withLock(() => autoPublishSeoDraft(draftId, actor));
      if (published.published) {
        try {
          revalidatePath("/blog");
          revalidatePath("/sitemap.xml");
          revalidatePath(`/blog/${published.slug}`);
        } catch {
          /* outside a request (tests, scripts): pages refresh on their own schedule */
        }
        return { keywordId, status: "PUBLISHED", draftId, slug: published.slug, score: assessment.score, reasons: [], costUsd: spent };
      }
      reasons = published.failed;
    }
  } else if (!automation.autoPublish) {
    reasons = ["Otomatik yayın kapalı; yazı incelemeye hazır.", ...assessment.reasons];
  }
  await db.seoArticleDraft.update({
    where: { id: draftId },
    data: { scheduleError: `Otomatik yayın yapılmadı: ${reasons.join("; ")}`.slice(0, 500), revision: { increment: 1 } },
  });
  await db.seoActivityLog.create({ data: { actorId: actor, action: "AUTOPILOT_NEEDS_REVIEW", details: { draftId, keywordId, reasons } } });
  return { keywordId, status: "NEEDS_REVIEW", draftId, slug: post.data.slug, score: assessment.score, reasons, costUsd: spent };
}
