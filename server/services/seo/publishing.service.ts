import "server-only";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { resolveDestination } from "./destinations";
import { resolveApprovedLinks } from "./planning.service";
import { readSeoSettings } from "./settings.service";
import {
  StudioError,
  editorialHash,
  postContent,
  VOID_APPROVAL,
} from "./studio.service";
import { recordSeoVersion } from "./versions";
import { studioBriefSchema, draftContentSchema } from "@/lib/seo/studio";
import {
  MAX_SCHEDULED,
  istanbulWindow,
  publishGate,
  scheduleInputSchema,
  scheduleWindowError,
} from "@/lib/seo/publishing";

const idSchema = z.string().min(1).max(100);
const identity = z.object({ id: idSchema, revision: z.number().int().min(0) });
type Draft = NonNullable<Awaited<ReturnType<typeof load>>>;

function load(tx: TransactionClient, id: string) {
  return tx.seoArticleDraft.findUnique({ where: { id }, include: { post: true } });
}

/** Evaluates the publishing gate against current database state. */
async function evaluate(tx: TransactionClient, item: Draft, assumeApproved = false, assumeReviewed = false) {
  const brief = studioBriefSchema.parse(item.brief);
  const post = postContent(item.post);
  const links = await resolveApprovedLinks(item.approvedLinks, tx);
  const hash = editorialHash(post, { brief, links: item.approvedLinks });
  const [other, claimed, settings] = await Promise.all([
    tx.blogPost.findFirst({ where: { slug: post.slug, id: { not: item.postId } }, select: { id: true } }),
    tx.seoSlugRedirect.findUnique({ where: { fromSlug: post.slug } }),
    readSeoSettings(tx),
  ]);
  const gate = publishGate({
    post,
    brief,
    minimumQualityScore: settings.settings.minimumQualityScore,
    reviewedCurrent: assumeReviewed || item.reviewedHash === hash,
    approvedCurrent: assumeApproved || item.approvedHash === hash,
    slugTaken: Boolean(other) || Boolean(claimed && claimed.postId !== item.postId),
    linksValid: !links.some((l) => !l.destination),
    ctaValid: !brief.ctaItemId || Boolean(await resolveDestination(brief.ctaItemId, tx)),
  });
  return { gate, post, hash, settings: settings.settings };
}

function requireDraftState(item: Draft | null, revision: number): Draft {
  if (!item || item.revision !== revision)
    throw new StudioError("Taslak başka bir sekmede değişti. Sayfayı yenileyin.");
  if (item.post.status !== "DRAFT")
    throw new StudioError("Bu yazı zaten yayında.");
  return item;
}

export async function getPublishingState(actorId: string, rawId: unknown) {
  await requireSeoAdmin(actorId);
  const id = idSchema.parse(rawId);
  const item = await load(db, id);
  if (!item) return null;
  const [{ gate }, versions] = await Promise.all([
    evaluate(db, item),
    db.seoArticleVersion.findMany({
      where: { draftId: id },
      orderBy: { version: "desc" },
      take: 50,
      select: { id: true, version: true, reason: true, score: true, createdAt: true, actorId: true },
    }),
  ]);
  const actors = await db.user.findMany({
    where: { id: { in: versions.map((v) => v.actorId).filter((v): v is string => Boolean(v)) } },
    select: { id: true, name: true },
  });
  const names = new Map(actors.map((a) => [a.id, a.name]));
  return {
    gate,
    approvedAt: item.approvedAt?.toISOString() ?? null,
    publishedAt: item.post.publishedAt?.toISOString() ?? null,
    versions: versions.map((v) => ({
      id: v.id,
      version: v.version,
      reason: v.reason,
      score: v.score,
      createdAt: v.createdAt.toISOString(),
      editor: v.actorId ? names.get(v.actorId) ?? "Silinmiş kullanıcı" : "Sistem",
    })),
  };
}

export async function approveSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity
    .extend({ postUpdatedAt: z.iso.datetime(), confirmed: z.literal(true) })
    .strict()
    .parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "DRAFT_APPROVED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    if (item.post.updatedAt.toISOString() !== input.postUpdatedAt)
      throw new StudioError("Blog yazısı değişti. Yeniden inceleyin.");
    const { gate, hash } = await evaluate(tx, item, true);
    const failed = gate.checks.filter((c) => !c.passed).map((c) => c.label);
    if (failed.length)
      throw new StudioError("Yayın kapısı geçilemedi: " + failed.join("; "));
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: {
        revision: { increment: 1 },
        approvedHash: hash,
        approvedAt: new Date(),
        approvedById: actorId,
        scheduledFor: null,
        scheduleError: null,
      },
    });
    await tx.seoActivityLog.create({
      data: { actorId, action: "DRAFT_APPROVED", details: { id: item.id, revision: saved.revision, score: gate.score } },
    });
    return { revision: saved.revision };
  });
}

export async function revokeSeoApproval(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity.strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "APPROVAL_REVOKED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: { revision: { increment: 1 }, approvedHash: null, approvedAt: null, approvedById: null, scheduledFor: null },
    });
    await tx.seoActivityLog.create({
      data: { actorId, action: "APPROVAL_REVOKED", details: { id: item.id, revision: saved.revision } },
    });
    return { revision: saved.revision };
  });
}

export async function scheduleSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = scheduleInputSchema.strict().parse(raw);
  const when = new Date(input.scheduledFor);
  const windowError = scheduleWindowError(when);
  if (windowError) throw new StudioError(windowError);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "DRAFT_SCHEDULED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    const { gate, settings } = await evaluate(tx, item);
    const failed = gate.checks.filter((c) => !c.passed).map((c) => c.label);
    if (failed.length)
      throw new StudioError("Yayın kapısı geçilemedi: " + failed.join("; "));
    const pending = await tx.seoArticleDraft.count({
      where: { scheduledFor: { not: null }, id: { not: item.id } },
    });
    if (pending >= MAX_SCHEDULED)
      throw new StudioError(`En fazla ${MAX_SCHEDULED} yazı planlanabilir.`);
    for (const [unit, limit, label] of [
      ["day", settings.dailyArticleLimit, "günlük"],
      ["week", settings.weeklyArticleLimit, "haftalık"],
    ] as const) {
      const { start, end } = istanbulWindow(when, unit);
      const [scheduled, published] = await Promise.all([
        tx.seoArticleDraft.count({
          where: { id: { not: item.id }, scheduledFor: { gte: start, lt: end } },
        }),
        tx.seoArticleDraft.count({
          where: { id: { not: item.id }, post: { status: "PUBLISHED", publishedAt: { gte: start, lt: end } } },
        }),
      ]);
      if (scheduled + published >= limit)
        throw new StudioError(`${label[0].toUpperCase()}${label.slice(1)} yayın sınırı (${limit}) doluyor. Ayarlar’dan sınırı artırın veya başka bir zaman seçin.`);
    }
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: { revision: { increment: 1 }, scheduledFor: when, scheduleError: null },
    });
    await tx.seoActivityLog.create({
      data: { actorId, action: "DRAFT_SCHEDULED", details: { id: item.id, revision: saved.revision, scheduledFor: when.toISOString() } },
    });
    return { revision: saved.revision };
  });
}

export async function cancelSeoSchedule(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity.strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "SCHEDULE_CANCELLED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: { revision: { increment: 1 }, scheduledFor: null },
    });
    await tx.seoActivityLog.create({
      data: { actorId, action: "SCHEDULE_CANCELLED", details: { id: item.id, revision: saved.revision } },
    });
    return { revision: saved.revision };
  });
}

/**
 * Publishes inside the caller's transaction after re-running every gate check against current
 * data. A failed gate never publishes; the caller decides how to report it.
 */
async function publishInTx(tx: TransactionClient, item: Draft, actorId: string, origin: "MANUAL" | "SCHEDULED" | "AUTOPILOT") {
  const { gate, post } = await evaluate(tx, item);
  const failed = gate.checks.filter((c) => !c.passed).map((c) => c.label);
  if (failed.length) return { published: false as const, failed };
  const now = new Date();
  const changed = await tx.blogPost.updateMany({
    where: { id: item.postId, status: "DRAFT", updatedAt: item.post.updatedAt },
    data: { status: "PUBLISHED", publishedAt: item.post.publishedAt ?? now, updatedAt: now },
  });
  if (changed.count !== 1)
    return { published: false as const, failed: ["Blog yazısı başka bir editörde değişti."] };
  const saved = await tx.seoArticleDraft.update({
    where: { id: item.id },
    data: { revision: { increment: 1 }, scheduledFor: null, scheduleError: null },
  });
  await recordSeoVersion(tx, item.id, post, "PUBLISHED", actorId);
  await tx.seoActivityLog.create({
    data: { actorId, action: "ARTICLE_PUBLISHED", details: { id: item.id, postId: item.postId, slug: post.slug, origin, score: gate.score } },
  });
  return { published: true as const, revision: saved.revision, slug: post.slug };
}

export async function publishSeoDraftNow(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity.extend({ confirmed: z.literal(true) }).strict().parse(raw);
  const result = await db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "ARTICLE_PUBLISHED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    return publishInTx(tx, item, actorId, "MANUAL");
  });
  if (!result.published)
    throw new StudioError("Yayın kapısı geçilemedi: " + result.failed.join("; "));
  return result;
}

/**
 * Unattended publication for the autopilot. It applies exactly the same gate as a human publication (every check,
 * no override, including the minimum checklist score) and only then records an AUTOMATED review and approval so the
 * normal state machine and audit trail stay consistent. A failed gate publishes nothing and returns the reasons.
 * The audit entries say AUTO, never claiming a person checked the facts.
 */
export async function autoPublishSeoDraft(draftId: string, actorId: string) {
  await requireSeoAdmin(actorId);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    const item = await load(tx, draftId);
    if (!item || item.post.status !== "DRAFT")
      return { published: false as const, failed: ["Taslak bulunamadı ya da zaten yayında."] };
    const { gate, hash } = await evaluate(tx, item, true, true);
    const failed = gate.checks.filter((c) => !c.passed).map((c) => c.label);
    if (failed.length) return { published: false as const, failed };
    const now = new Date();
    await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: {
        revision: { increment: 1 },
        reviewedAt: now,
        reviewedHash: hash,
        approvedAt: now,
        approvedHash: hash,
        approvedById: actorId,
        scheduledFor: null,
        scheduleError: null,
      },
    });
    await tx.seoActivityLog.create({
      data: { actorId, action: "DRAFT_AUTO_APPROVED", details: { id: item.id, score: gate.score, automated: true } },
    });
    const fresh = await load(tx, draftId);
    return publishInTx(tx, fresh!, actorId, "AUTOPILOT");
  });
}

export async function unpublishSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity.extend({ confirmed: z.literal(true) }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "ARTICLE_UNPUBLISHED");
    const item = await load(tx, input.id);
    if (!item || item.revision !== input.revision)
      throw new StudioError("Taslak başka bir sekmede değişti. Sayfayı yenileyin.");
    if (item.post.status !== "PUBLISHED") throw new StudioError("Yazı yayında değil.");
    const changed = await tx.blogPost.updateMany({
      where: { id: item.postId, status: "PUBLISHED" },
      data: { status: "DRAFT", updatedAt: new Date() },
    });
    if (changed.count !== 1) throw new StudioError("Yazı değişti. Sayfayı yenileyin.");
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: { revision: { increment: 1 }, ...VOID_APPROVAL },
    });
    await recordSeoVersion(tx, item.id, postContent(item.post), "UNPUBLISHED", actorId);
    await tx.seoActivityLog.create({
      data: { actorId, action: "ARTICLE_UNPUBLISHED", details: { id: item.id, postId: item.postId, slug: item.post.slug } },
    });
    return { revision: saved.revision, slug: item.post.slug };
  });
}

export async function restoreSeoVersion(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identity
    .extend({ versionId: idSchema, postUpdatedAt: z.iso.datetime() })
    .strict()
    .parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "VERSION_RESTORED");
    const item = requireDraftState(await load(tx, input.id), input.revision);
    const version = await tx.seoArticleVersion.findFirst({
      where: { id: input.versionId, draftId: item.id },
    });
    if (!version) throw new StudioError("Sürüm bulunamadı.");
    const content = draftContentSchema.parse(version.snapshot);
    if (
      await tx.blogPost.findFirst({ where: { slug: content.slug, id: { not: item.postId } }, select: { id: true } })
    )
      throw new StudioError("Bu sürümün URL kısa adı artık başka bir yazıda kullanılıyor.");
    const claimed = await tx.seoSlugRedirect.findUnique({ where: { fromSlug: content.slug } });
    if (claimed && claimed.postId !== item.postId)
      throw new StudioError("Bu sürümün URL kısa adı başka bir yayına yönlendiriyor.");
    const changed = await tx.blogPost.updateMany({
      where: { id: item.postId, status: "DRAFT", updatedAt: new Date(input.postUpdatedAt) },
      data: { ...content, updatedAt: new Date() },
    });
    if (changed.count !== 1)
      throw new StudioError("Blog yazısı başka bir editörde değişti. Sayfayı yenileyin.");
    if (item.post.publishedAt && item.post.slug !== content.slug)
      await tx.seoSlugRedirect.upsert({
        where: { fromSlug: item.post.slug },
        create: { fromSlug: item.post.slug, postId: item.postId },
        update: { postId: item.postId },
      });
    await tx.seoSlugRedirect.deleteMany({ where: { fromSlug: content.slug, postId: item.postId } });
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: { revision: { increment: 1 }, ...VOID_APPROVAL },
    });
    await recordSeoVersion(tx, item.id, content, "RESTORED", actorId);
    await tx.seoActivityLog.create({
      data: { actorId, action: "VERSION_RESTORED", details: { id: item.id, restoredVersion: version.version, revision: saved.revision } },
    });
    return { revision: saved.revision };
  });
}

/** Content calendar rows: every approved, scheduled or published SEO article. */
export async function getSeoCalendar(actorId: string) {
  await requireSeoAdmin(actorId);
  const rows = await db.seoArticleDraft.findMany({
    where: { OR: [{ scheduledFor: { not: null } }, { approvedAt: { not: null } }, { post: { status: "PUBLISHED" } }] },
    orderBy: [{ updatedAt: "desc" }],
    take: 200,
    include: { post: { select: { title: true, slug: true, status: true, publishedAt: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.post.title,
    slug: r.post.slug,
    status: r.post.status,
    publishedAt: r.post.publishedAt,
    scheduledFor: r.scheduledFor,
    approvedAt: r.approvedAt,
    scheduleError: r.scheduleError,
  }));
}

/**
 * Publishes human-scheduled articles that are due. Only drafts an administrator approved and
 * scheduled are considered, and each is re-validated; failures are parked with a visible reason.
 * Returns the slugs to revalidate.
 */
export async function runDueSeoPublications(now = new Date(), cap = 5) {
  const due = await db.seoArticleDraft.findMany({
    where: { scheduledFor: { lte: now }, post: { status: "DRAFT" } },
    orderBy: { scheduledFor: "asc" },
    take: cap,
    select: { id: true },
  });
  const slugs: string[] = [];
  const failures: { id: string; reasons: string[] }[] = [];
  for (const { id } of due) {
    try {
      await db.$transaction(async (tx) => {
        await lockSeoWrites(tx);
        const item = await load(tx, id);
        if (!item || !item.scheduledFor || item.scheduledFor > now || item.post.status !== "DRAFT") return;
        const approver = item.approvedById
          ? await requireSeoAdmin(item.approvedById, tx).catch(() => null)
          : null;
        // A deactivated or demoted approver invalidates the approval.
        const result = approver
          ? await publishInTx(tx, item, approver.id, "SCHEDULED")
          : { published: false as const, failed: ["Onaylayan yönetici artık etkin değil."] };
        if (result.published) slugs.push(result.slug);
        else {
          await tx.seoArticleDraft.update({
            where: { id },
            data: { scheduledFor: null, scheduleError: result.failed.join("; ").slice(0, 500), revision: { increment: 1 } },
          });
          await tx.seoActivityLog.create({
            data: { actorId: item.approvedById, action: "SCHEDULE_FAILED", details: { id, reasons: result.failed } },
          });
          failures.push({ id, reasons: result.failed });
        }
      });
    } catch (error) {
      failures.push({ id, reasons: [error instanceof Error ? error.message : "Bilinmeyen hata"] });
    }
  }
  return { due: due.length, published: slugs, failures };
}
