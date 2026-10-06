import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { requireSeoAdmin } from "./access";
import { parseSource, seoValueScore, WINDOWS, classifyReferrer, referrerHost } from "@/lib/seo/attribution";

const PRACTICE_EVENTS = ["practice_started", "mock_exam_started", "diagnostic_started"];
const MAX_ATTRIBUTED = 5000;
const dayStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Counts one aggregate page view. No identifier, cookie or IP is stored. */
export async function recordArticleView(slug: string, referrer: unknown, now = new Date()) {
  const post = await db.blogPost.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return false;
  const organic = classifyReferrer(referrerHost(referrer)) === "ORGANIC";
  const day = dayStart(now);
  await db.seoArticleDay.upsert({
    where: { postId_day: { postId: post.id, day } },
    create: { postId: post.id, day, organicViews: organic ? 1 : 0, otherViews: organic ? 0 : 1 },
    update: organic ? { organicViews: { increment: 1 } } : { otherViews: { increment: 1 } },
  });
  return true;
}

/** Links a brand-new account to the article whose register link it used. First touch only. */
export async function recordRegistrationAttribution(userId: string, source: unknown) {
  const slug = parseSource(source);
  if (!slug) return false;
  const post = await db.blogPost.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return false;
  await db.seoAttribution.upsert({
    where: { userId },
    create: { userId, postId: post.id, slug },
    update: {},
  });
  return true;
}

export async function getConversionReport(actorId: string, rawDays: unknown) {
  await requireSeoAdmin(actorId);
  const days = z.coerce.number().pipe(z.union(WINDOWS.map((w) => z.literal(w)) as [z.ZodLiteral<7>, z.ZodLiteral<30>, z.ZodLiteral<90>])).catch(30).parse(rawDays);
  const now = new Date();
  const since = new Date(dayStart(now).getTime() - (days - 1) * 86_400_000);
  const [dayRows, attributions, firstDay, snapshot] = await Promise.all([
    db.seoArticleDay.groupBy({ by: ["postId"], where: { day: { gte: since } }, _sum: { organicViews: true, otherViews: true } }),
    db.seoAttribution.findMany({ where: { postId: { not: null } }, select: { userId: true, postId: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: MAX_ATTRIBUTED }),
    db.seoArticleDay.findFirst({ orderBy: { day: "asc" }, select: { day: true } }),
    db.seoSearchSnapshot.findFirst({ where: { kind: "PAGES" }, orderBy: { periodEnd: "desc" }, select: { id: true } }),
  ]);
  const userIds = attributions.map((a) => a.userId);
  const [events, orders] = await Promise.all([
    userIds.length
      ? db.analyticsEvent.findMany({ where: { userId: { in: userIds }, event: { in: PRACTICE_EVENTS }, createdAt: { gte: since } }, select: { userId: true, createdAt: true }, take: 50000 })
      : [],
    userIds.length
      ? db.order.findMany({ where: { userId: { in: userIds }, status: "PAID", createdAt: { gte: since } }, select: { userId: true, total: true, currency: true, createdAt: true }, take: 20000 })
      : [],
  ]);
  type Row = { postId: string; organic: number; other: number; registrations: number; practice: number; purchasers: Set<string>; revenue: Map<string, number> };
  const rows = new Map<string, Row>();
  const row = (postId: string): Row => {
    let r = rows.get(postId);
    if (!r) rows.set(postId, (r = { postId, organic: 0, other: 0, registrations: 0, practice: 0, purchasers: new Set(), revenue: new Map() }));
    return r;
  };
  for (const d of dayRows) {
    const r = row(d.postId);
    r.organic = d._sum.organicViews ?? 0;
    r.other = d._sum.otherViews ?? 0;
  }
  const byUser = new Map(attributions.map((a) => [a.userId, a]));
  for (const a of attributions) if (a.createdAt >= since && a.postId) row(a.postId).registrations++;
  for (const e of events) {
    const a = e.userId ? byUser.get(e.userId) : undefined;
    if (a?.postId && e.createdAt >= a.createdAt) row(a.postId).practice++;
  }
  for (const o of orders) {
    const a = o.userId ? byUser.get(o.userId) : undefined;
    if (!a?.postId || o.createdAt < a.createdAt) continue;
    const r = row(a.postId);
    r.purchasers.add(o.userId!);
    r.revenue.set(o.currency, (r.revenue.get(o.currency) ?? 0) + Number(o.total));
  }
  const ids = [...rows.keys()];
  const posts = ids.length
    ? await db.blogPost.findMany({ where: { id: { in: ids } }, select: { id: true, title: true, slug: true, seoDraft: { select: { id: true } } } })
    : [];
  const meta = new Map(posts.map((p) => [p.id, p]));
  const positions = new Map<string, number>();
  if (snapshot && posts.length) {
    const pr = await db.seoSearchRow.findMany({ where: { snapshotId: snapshot.id, page: { in: posts.map((p) => `/blog/${p.slug}`) }, impressions: { gte: 100 } }, select: { page: true, position: true } });
    for (const p of pr) positions.set(p.page, p.position);
  }
  const items = [...rows.values()]
    .filter((r) => meta.has(r.postId))
    .map((r) => {
      const p = meta.get(r.postId)!;
      const views = r.organic + r.other;
      const revenueTry = r.revenue.get("TRY") ?? 0;
      return {
        postId: r.postId,
        title: p.title,
        slug: p.slug,
        draftId: p.seoDraft?.id ?? null,
        organicViews: r.organic,
        otherViews: r.other,
        views,
        registrations: r.registrations,
        registrationRate: views ? r.registrations / views : null,
        practiceStarts: r.practice,
        purchasers: r.purchasers.size,
        revenue: Object.fromEntries(r.revenue),
        score: seoValueScore({ views, registrations: r.registrations, practiceStarts: r.practice, purchases: r.purchasers.size, revenueTry, position: positions.get(`/blog/${p.slug}`) ?? null }),
        position: positions.get(`/blog/${p.slug}`) ?? null,
      };
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || b.registrations - a.registrations || b.views - a.views);
  const sum = (f: (i: (typeof items)[number]) => number) => items.reduce((s, i) => s + f(i), 0);
  return {
    days,
    trackingSince: firstDay?.day ?? null,
    attributionCapReached: attributions.length >= MAX_ATTRIBUTED,
    totals: {
      views: sum((i) => i.views),
      organicViews: sum((i) => i.organicViews),
      registrations: sum((i) => i.registrations),
      practiceStarts: sum((i) => i.practiceStarts),
      purchasers: sum((i) => i.purchasers),
    },
    items,
  };
}
