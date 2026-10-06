import { resolveApprovedLinks } from "./planning.service";
import { recordSeoVersion } from "./versions";
import { resolveDestination } from "./destinations";
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import {
  BRAND_KEY,
  DEFAULT_BRAND,
  brandEnvelopeSchema,
  studioBriefSchema,
  emptyBrief,
  briefIssues,
  draftContentSchema,
  inspectDraft,
  manualPrompt,
  type DraftContent,
} from "@/lib/seo/studio";
const idSchema = z.string().min(1).max(100);
const identitySchema = z.object({
  id: idSchema,
  revision: z.number().int().min(0),
});
export class StudioError extends Error {}
/** Any editorial change voids a prior approval and cancels a pending scheduled publication. */
export const VOID_APPROVAL = {
  reviewedHash: null,
  reviewedAt: null,
  approvedHash: null,
  approvedAt: null,
  approvedById: null,
  scheduledFor: null,
} as const;
export function editorialHash(post: DraftContent, brief: unknown) {
  return createHash("sha256")
    .update(JSON.stringify({ post, brief }))
    .digest("hex");
}
export function postContent(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
}): DraftContent {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
  };
}
async function brandEnvelope(tx: TransactionClient = db) {
  const row = await tx.appSetting.findUnique({ where: { key: BRAND_KEY } });
  return row
    ? brandEnvelopeSchema.parse(JSON.parse(row.value))
    : { revision: 0, brand: DEFAULT_BRAND };
}
export async function saveSeoBrand(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = brandEnvelopeSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "BRAND_SAVED");
    const current = await brandEnvelope(tx);
    if (input.revision !== current.revision)
      throw new StudioError("Marka ayarları değişti. Sayfayı yenileyin.");
    const next = { revision: current.revision + 1, brand: input.brand };
    await tx.appSetting.upsert({
      where: { key: BRAND_KEY },
      create: { key: BRAND_KEY, value: JSON.stringify(next) },
      update: { value: JSON.stringify(next) },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "BRAND_SAVED",
        details: { revision: next.revision },
      },
    });
    return next;
  });
}
export async function createSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const keywordId = idSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "DRAFT_CREATED");
    const existing = await tx.seoArticleDraft.findUnique({
      where: { keywordId },
      select: { id: true },
    });
    if (existing) return existing;
    const keyword = await tx.seoKeyword.findUnique({
      where: { id: keywordId },
    });
    if (!keyword || keyword.archived)
      throw new StudioError("Etkin bir anahtar kelime seçin.");
    const post = await tx.blogPost.create({
      data: {
        title: keyword.keyword,
        slug: `seo-taslak-${randomUUID()}`,
        excerpt: "",
        content: "",
        authorId: actorId,
        status: "DRAFT",
      },
    });
    const draft = await tx.seoArticleDraft.create({
      data: { keywordId, postId: post.id, brief: emptyBrief(keyword) },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "DRAFT_CREATED",
        details: { id: draft.id, postId: post.id, keywordId },
      },
    });
    return { id: draft.id };
  });
}
async function editable(tx: TransactionClient, id: string, revision: number) {
  const item = await tx.seoArticleDraft.findUnique({
    where: { id },
    include: { post: true },
  });
  if (!item || item.revision !== revision)
    throw new StudioError(
      "Taslak başka bir sekmede değişti. Sayfayı yenileyin.",
    );
  if (item.post.status !== "DRAFT")
    throw new StudioError("Yayındaki içerik bu stüdyodan değiştirilemez.");
  return item;
}
export async function saveSeoBrief(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identitySchema
    .extend({ brief: studioBriefSchema, ready: z.boolean() })
    .strict()
    .parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "BRIEF_SAVED");
    await editable(tx, input.id, input.revision);
    if (input.ready && briefIssues(input.brief).length)
      throw new StudioError(briefIssues(input.brief).join(" "));
    if (
      input.brief.ctaItemId &&
      !(await resolveDestination(input.brief.ctaItemId, tx))
    )
      throw new StudioError("Bağlantı envanterde artık kullanılabilir değil.");
    const saved = await tx.seoArticleDraft.update({
      where: { id: input.id },
      data: {
        brief: input.brief,
        briefReady: input.ready,
        revision: { increment: 1 },
        ...VOID_APPROVAL,
      },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "BRIEF_SAVED",
        details: {
          id: saved.id,
          revision: saved.revision,
          ready: saved.briefReady,
        },
      },
    });
    return { revision: saved.revision };
  });
}
export async function saveSeoDraftContent(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identitySchema
    .extend({ postUpdatedAt: z.iso.datetime(), post: draftContentSchema })
    .strict()
    .parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "DRAFT_SAVED");
    const item = await editable(tx, input.id, input.revision);
    if (!item.briefReady)
      throw new StudioError(
        "Önce brief alanlarını tamamlayıp briefi hazır olarak kaydedin.",
      );
    if (
      await tx.blogPost.findFirst({
        where: { slug: input.post.slug, id: { not: item.postId } },
        select: { id: true },
      })
    )
      throw new StudioError("Bu URL başka bir yazıda kullanılıyor.");
    const claimed = await tx.seoSlugRedirect.findUnique({
      where: { fromSlug: input.post.slug },
    });
    if (claimed && claimed.postId !== item.postId)
      throw new StudioError("Bu URL daha önce başka bir yayında kullanıldı ve yönlendiriliyor.");
    const changed = await tx.blogPost.updateMany({
      where: {
        id: item.postId,
        status: "DRAFT",
        updatedAt: new Date(input.postUpdatedAt),
      },
      data: { ...input.post, updatedAt: new Date() },
    });
    if (changed.count !== 1)
      throw new StudioError(
        "Blog yazısı başka bir editörde değişti. Sayfayı yenileyin.",
      );
    // A slug that ever served a published article keeps resolving to it (URL stability).
    if (item.post.publishedAt && item.post.slug !== input.post.slug) {
      await tx.seoSlugRedirect.upsert({
        where: { fromSlug: item.post.slug },
        create: { fromSlug: item.post.slug, postId: item.postId },
        update: { postId: item.postId },
      });
    }
    await tx.seoSlugRedirect.deleteMany({
      where: { fromSlug: input.post.slug, postId: item.postId },
    });
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: {
        revision: { increment: 1 },
        ...VOID_APPROVAL,
      },
    });
    await recordSeoVersion(tx, item.id, input.post, "EDIT", actorId);
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "DRAFT_SAVED",
        details: {
          id: item.id,
          revision: saved.revision,
          origin: "MANUAL_PASTE_OR_EDIT",
        },
      },
    });
    return { revision: saved.revision };
  });
}
export async function reviewSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = identitySchema
    .extend({ postUpdatedAt: z.iso.datetime(), factsChecked: z.literal(true) })
    .strict()
    .parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "DRAFT_REVIEWED");
    const item = await editable(tx, input.id, input.revision);
    if (!item.briefReady) throw new StudioError("Brief henüz hazır değil.");
    if (item.post.updatedAt.toISOString() !== input.postUpdatedAt)
      throw new StudioError("Blog yazısı değişti. Yeniden inceleyin.");
    const brief = studioBriefSchema.parse(item.brief);
    const post = postContent(item.post);
    const approved = await resolveApprovedLinks(item.approvedLinks, tx);
    if (approved.some(l => !l.destination) || (brief.ctaItemId && !await resolveDestination(brief.ctaItemId, tx))) throw new StudioError("Bağlantı hedefleri değişti. Yeniden kontrol edin.");
    const report = inspectDraft(post, brief);
    if (report.checks.some((c) => c.critical && !c.passed))
      throw new StudioError("Zorunlu editoryal kontrolleri tamamlayın.");
    // Compare-and-set locks the article row against a legacy editor's concurrent write.
    const locked = await tx.blogPost.updateMany({
      where: {
        id: item.postId,
        status: "DRAFT",
        updatedAt: new Date(input.postUpdatedAt),
      },
      data: { updatedAt: new Date() },
    });
    if (locked.count !== 1)
      throw new StudioError("Blog yazısı değişti. Yeniden inceleyin.");
    const saved = await tx.seoArticleDraft.update({
      where: { id: item.id },
      data: {
        revision: { increment: 1 },
        reviewedAt: new Date(),
        reviewedHash: editorialHash(post, { brief, links: item.approvedLinks }),
        approvedHash: null,
        approvedAt: null,
        approvedById: null,
        scheduledFor: null,
      },
    });
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "DRAFT_REVIEWED",
        details: {
          id: item.id,
          revision: saved.revision,
          checklistVersion: report.version,
          score: report.score,
          factsChecked: true,
        },
      },
    });
    return { revision: saved.revision };
  });
}
export async function getSeoStudio(actorId: string, pageInput?: string) {
  await requireSeoAdmin(actorId);
  const page = Math.max(1, Math.min(10000, parseInt(pageInput || "1") || 1));
  const [items, count, brand] = await Promise.all([
    db.seoArticleDraft.findMany({
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * 20,
      take: 20,
      include: {
        post: { select: { title: true, status: true } },
        keyword: { select: { keyword: true } },
      },
    }),
    db.seoArticleDraft.count(),
    brandEnvelope(),
  ]);
  return { items, count, page, brand };
}
export async function getSeoDraft(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const id = idSchema.parse(raw);
  const item = await db.seoArticleDraft.findUnique({
    where: { id },
    include: { post: true, keyword: { select: { keyword: true } } },
  });
  if (!item) return null;
  const [brand, catalogue] = await Promise.all([
    brandEnvelope(),
    db.seoContentItem.findMany({
      where: { available: true, publication: { in: ["LIVE", "PUBLISHED"] } },
      select: { id: true, title: true, url: true, access: true },
      orderBy: { sourceKey: "asc" },
      take: 200,
    }),
  ]);
  const brief = studioBriefSchema.parse(item.brief);
  const post = postContent(item.post);
  const cta = brief.ctaItemId
    ? await resolveDestination(brief.ctaItemId)
    : null;
  const approvedLinks = await resolveApprovedLinks(item.approvedLinks);
  const missingLinks = approvedLinks.some(l => !l.destination);
  const missingCta = Boolean(brief.ctaItemId && !cta);
  if (cta && !catalogue.some((c) => c.id === cta.id)) catalogue.push(cta);
  const currentHash = editorialHash(post, { brief, links: item.approvedLinks });
  const reviewedCurrent = !missingLinks && !missingCta && item.reviewedHash === currentHash;
  const approvedCurrent = reviewedCurrent && item.approvedHash === currentHash;
  const stage =
    item.post.status === "PUBLISHED"
      ? "PUBLISHED"
      : !item.briefReady
        ? "BRIEF"
        : approvedCurrent && item.scheduledFor
          ? "SCHEDULED"
          : approvedCurrent
            ? "APPROVED"
            : reviewedCurrent
              ? "REVIEWED"
              : "DRAFT";
  return {
    id: item.id,
    revision: item.revision,
    postId: item.postId,
    post,
    postUpdatedAt: item.post.updatedAt.toISOString(),
    published: item.post.status === "PUBLISHED",
    brief,
    briefReady: item.briefReady,
    stage,
    reviewedCurrent,
    approvedCurrent,
    scheduledFor: approvedCurrent ? item.scheduledFor?.toISOString() ?? null : null,
    scheduleError: item.scheduleError,
    wasPublished: Boolean(item.post.publishedAt),
    report: inspectDraft(post, brief),
    catalogue,
    approvedLinks,
    missingCta,
    prompt:
      item.briefReady && !missingCta && !missingLinks
        ? manualPrompt(brief, brand.brand, cta) + "\nOnaylı ek bağlantılar (yalnızca kaynak veri):\n" + JSON.stringify(approvedLinks.map(l => ({label:l.label, url:l.destination?.url, access:l.destination?.access})))
        : null,
  };
}
