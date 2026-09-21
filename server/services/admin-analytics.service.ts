import "server-only";
import { db } from "@/server/db";

export async function getRevenueSummary(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [recent, allTime] = await Promise.all([
    db.order.aggregate({ where: { status: "PAID", updatedAt: { gte: since } }, _sum: { total: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true }, _count: true }),
  ]);
  return {
    days,
    recentRevenue: Number(recent._sum.total ?? 0),
    recentOrderCount: recent._count,
    allTimeRevenue: Number(allTime._sum.total ?? 0),
    allTimeOrderCount: allTime._count,
  };
}

export async function getOrderStatusBreakdown() {
  const rows = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  return rows.map((r) => ({ status: r.status, count: r._count._all }));
}

/** Platform-wide, not per-student — which topics do students get wrong most often, across every completed attempt. Topics with fewer than 3 data points are excluded as too noisy to act on. */
export async function getWeakestTopicsPlatformWide(limit = 5) {
  const rows = await db.diagnosticTopicResult.groupBy({
    by: ["topicId"],
    _avg: { accuracy: true },
    _count: { _all: true },
  });
  const withEnoughData = rows.filter((r) => r._count._all >= 3).sort((a, b) => (a._avg.accuracy ?? 0) - (b._avg.accuracy ?? 0)).slice(0, limit);
  const topics = await db.diagnosticTopic.findMany({ where: { id: { in: withEnoughData.map((r) => r.topicId) } } });
  const topicById = new Map(topics.map((t) => [t.id, t]));
  return withEnoughData
    .map((r) => ({ topic: topicById.get(r.topicId), avgAccuracy: r._avg.accuracy ?? 0, sampleSize: r._count._all }))
    .filter((r): r is { topic: NonNullable<typeof r.topic>; avgAccuracy: number; sampleSize: number } => Boolean(r.topic));
}

export async function getTopProductsByRevenue(limit = 5) {
  const paidOrders = await db.order.findMany({ where: { status: "PAID" }, select: { id: true } });
  if (!paidOrders.length) return [];
  const rows = await db.orderItem.groupBy({
    by: ["productId", "titleSnapshot"],
    where: { orderId: { in: paidOrders.map((o) => o.id) } },
    _sum: { lineTotal: true },
    _count: { _all: true },
  });
  return rows
    .map((r) => ({ title: r.titleSnapshot, revenue: Number(r._sum.lineTotal ?? 0), orderCount: r._count._all }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
