import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { requireSeoAdmin } from "./access";
import { readSeoSettings } from "./settings.service";
import { readGscConfig } from "@/lib/seo/gsc";

export async function getSeoOverview(actorId: string) {
  await requireSeoAdmin(actorId);
  const [
    settings,
    exams,
    inventoryCount,
    publishedPosts,
    draftPosts,
    lastRefresh,
    missingBlogMetadata,
    unavailable,
  ] = await Promise.all([
    readSeoSettings(),
    db.examType.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.seoContentItem.count({ where: { available: true } }),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
    db.seoActivityLog.findFirst({
      where: { action: "INVENTORY_REFRESHED" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.blogPost.count({
      where: {
        status: "PUBLISHED",
        OR: [
          { seoDescription: null },
          { seoDescription: "" },
          { seoTitle: null },
          { seoTitle: "" },
        ],
      },
    }),
    db.seoContentItem.count({ where: { available: false } }),
  ]);
  return {
    settings,
    exams,
    inventoryCount,
    publishedPosts,
    draftPosts,
    lastRefresh,
    missingBlogMetadata,
    unavailable,
  };
}
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).catch(1),
  q: z.string().trim().max(100).catch(""),
});
export async function listSeoInventory(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const query = querySchema.parse(raw);
  const where = {
    available: true,
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" as const } },
            { url: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const count = await db.seoContentItem.count({ where });
  const page = Math.min(query.page, Math.max(1, Math.ceil(count / 30)));
  const items = await db.seoContentItem.findMany({
    where,
    orderBy: [{ sourceType: "asc" }, { title: "asc" }, { id: "asc" }],
    skip: (page - 1) * 30,
    take: 30,
  });
  return { items, count, page, q: query.q };
}
export async function listSeoActivity(actorId: string, requestedPage: unknown) {
  await requireSeoAdmin(actorId);
  const { page: requested } = querySchema.parse({ page: requestedPage });
  const count = await db.seoActivityLog.count();
  const page = Math.min(requested, Math.max(1, Math.ceil(count / 30)));
  const items = await db.seoActivityLog.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * 30,
    take: 30,
    select: {
      id: true,
      action: true,
      createdAt: true,
      details: true,
      actor: { select: { name: true } },
    },
  });
  return { items, count, page };
}

/** Live counts for "what needs attention". Counts only; no content is loaded. */
export async function getSeoAttention(actorId: string) {
  await requireSeoAdmin(actorId);
  const draft = { post: { status: "DRAFT" as const } };
  const [needsBrief, writing, reviewed, approved, scheduled, parked, published, keywords, snapshot] = await Promise.all([
    db.seoArticleDraft.count({ where: { ...draft, briefReady: false } }),
    db.seoArticleDraft.count({ where: { ...draft, briefReady: true, reviewedHash: null } }),
    db.seoArticleDraft.count({ where: { ...draft, reviewedHash: { not: null }, approvedHash: null } }),
    db.seoArticleDraft.count({ where: { ...draft, approvedHash: { not: null }, scheduledFor: null } }),
    db.seoArticleDraft.count({ where: { ...draft, scheduledFor: { not: null } } }),
    db.seoArticleDraft.count({ where: { ...draft, scheduleError: { not: null } } }),
    db.seoArticleDraft.count({ where: { post: { status: "PUBLISHED" } } }),
    db.seoKeyword.count({ where: { archived: false } }),
    db.seoSearchSnapshot.findFirst({ where: { kind: "PAGES" }, orderBy: { periodEnd: "desc" } }),
  ]);
  const totals = snapshot
    ? await db.seoSearchRow.aggregate({ where: { snapshotId: snapshot.id }, _sum: { clicks: true, impressions: true }, _count: true })
    : null;
  return {
    studio: { needsBrief, writing, reviewed, approved, scheduled, parked, published },
    keywords,
    search: {
      connected: readGscConfig() !== null,
      period: snapshot ? { start: snapshot.periodStart, end: snapshot.periodEnd } : null,
      clicks: totals?._sum.clicks ?? 0,
      impressions: totals?._sum.impressions ?? 0,
      pages: totals?._count ?? 0,
    },
  };
}
