import "server-only";
import { z } from "zod";
import { db, type TransactionClient } from "@/server/db";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { resolveDestination } from "./destinations";
import { CLUSTERS_KEY, clustersSchema, linksSchema } from "@/lib/seo/planning";
export async function resolveApprovedLinks(raw: unknown, tx: TransactionClient = db) {
  const links = linksSchema.parse(raw);
  return Promise.all(links.map(async link => ({ ...link, destination: await resolveDestination(link.itemId, tx) })));
}
export async function saveApprovedLinks(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ id: z.string().min(1).max(100), revision: z.number().int().min(0), links: linksSchema }).strict().parse(raw);
  return db.$transaction(async tx => {
    await requireSeoAdmin(actorId, tx); await lockSeoWrites(tx); await checkSeoRateLimit(tx, actorId, "LINKS_APPROVED");
    const draft = await tx.seoArticleDraft.findUnique({ where: { id: input.id }, include: { post: true } });
    if (!draft || draft.post.status !== "DRAFT" || draft.revision !== input.revision) throw new Error("Taslak değişti veya salt okunur. Sayfayı yenileyin.");
    const resolved = await resolveApprovedLinks(input.links, tx);
    if (resolved.some(l => !l.destination || (l.destination.sourceType === "BLOG" && l.destination.sourceId === draft.postId))) throw new Error("Bağlantı artık kullanılamıyor veya yazının kendisine gidiyor. Envanteri yenileyin.");
    await tx.seoArticleDraft.update({ where: { id: input.id }, data: { approvedLinks: input.links, revision: { increment: 1 }, reviewedAt: null, reviewedHash: null } });
    await tx.seoActivityLog.create({ data: { actorId, action: "LINKS_APPROVED", details: { draftId: input.id, links: input.links } } });
  });
}
export async function getClusters(actorId: string) {
  await requireSeoAdmin(actorId);
  const row = await db.appSetting.findUnique({ where: { key: CLUSTERS_KEY } });
  const value = row ? clustersSchema.parse(JSON.parse(row.value)) : { revision: 0, clusters: [] };
  const ids = [...new Set(value.clusters.flatMap(c => [c.pillarId, ...c.supportingIds]))];
  const resolved = new Map(await Promise.all(ids.map(async id => [id, await resolveDestination(id)] as const)));
  return { ...value, status: value.clusters.map(c => ({ id: c.id, invalidIds: [c.pillarId, ...c.supportingIds].filter(id => !resolved.get(id)) })) };
}
export async function saveClusters(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = clustersSchema.parse(raw);
  if (new Set(input.clusters.map(c => c.id)).size !== input.clusters.length) throw new Error("Küme kimlikleri tekrarlanamaz.");
  return db.$transaction(async tx => {
    await requireSeoAdmin(actorId, tx); await lockSeoWrites(tx); await checkSeoRateLimit(tx, actorId, "CLUSTERS_SAVED");
    const row = await tx.appSetting.findUnique({ where: { key: CLUSTERS_KEY } });
    const current = row ? clustersSchema.parse(JSON.parse(row.value)) : { revision: 0, clusters: [] };
    if (current.revision !== input.revision) throw new Error("Konu kümeleri değişti. Sayfayı yenileyin.");
    const ids = [...new Set(input.clusters.flatMap(c => [c.pillarId, ...c.supportingIds]))];
    if (ids.length > 200) throw new Error("En fazla 200 farklı sayfa seçilebilir.");
    for (const id of ids) if (!await resolveDestination(id, tx)) throw new Error("Seçilen sayfa artık yayında değil. Envanteri yenileyin.");
    const value = JSON.stringify({ ...input, revision: current.revision + 1 });
    await tx.appSetting.upsert({ where: { key: CLUSTERS_KEY }, create: { key: CLUSTERS_KEY, value }, update: { value } });
    await tx.seoActivityLog.create({ data: { actorId, action: "CLUSTERS_SAVED", details: { revision: current.revision + 1, clusters: input.clusters } } });
  }, { timeout: 15000 });
}
export async function getPlanningChoices(actorId: string, selected: string[] = []) {
  await requireSeoAdmin(actorId);
  const rows = await db.seoContentItem.findMany({ where: { available: true, publication: { in: ["LIVE", "PUBLISHED"] } }, orderBy: { sourceKey: "asc" }, take: 200, select: { id: true, title: true, url: true } });
  const missing = selected.filter(id => !rows.some(r => r.id === id));
  if (missing.length) rows.push(...await db.seoContentItem.findMany({where:{id:{in:missing}},select:{id:true,title:true,url:true}}));
  return rows;
}
