import "server-only";
import { db } from "@/server/db";
import { requireSeoAdmin } from "./access";
import { analyzeDestinations } from "@/lib/seo/intelligence";
import { studioBriefSchema } from "@/lib/seo/studio";

export async function getDraftIntelligence(actorId: string, id: string) {
  await requireSeoAdmin(actorId);
  const draft = await db.seoArticleDraft.findUnique({ where: { id }, include: {
    keyword: { include: { exam: true } },
  } });
  if (!draft) return null;
  const brief = studioBriefSchema.parse(draft.brief);
  const items = await db.seoContentItem.findMany({
    where: { available: true, publication: { in: ["LIVE", "PUBLISHED"] } },
    orderBy: { sourceKey: "asc" }, take: 2001,
    select: { id: true, title: true, url: true, sourceType: true, sourceId: true, examSlug: true, languageCode: true, excerpt: true, access: true, publication: true, available: true, scannedAt: true },
  });
  if (items.length > 2000) return { limited: true, scannedAt: null, links: [], products: [], overlaps: [] };
  const candidates = analyzeDestinations({ keyword: brief.primaryKeyword,
    language: brief.languageCode, examSlug: draft.keyword.exam?.slug ?? null,
    postId: draft.postId }, items);
  return {
    limited: false,
    scannedAt: items.length ? new Date(Math.min(...items.map(i => i.scannedAt.getTime()))) : null,
    links: candidates.filter(i => i.sourceType !== "PRODUCT").slice(0, 8),
    products: candidates.filter(i => i.sourceType === "PRODUCT").slice(0, 4),
    overlaps: candidates.filter(i => i.possibleOverlap).slice(0, 8),
  };
}

/** Read-only editorial map; never creates fabricated topics or search demand. */
export async function getTopicMap(actorId: string) {
  await requireSeoAdmin(actorId);
  const keywords = await db.seoKeyword.findMany({
    where: { archived: false }, orderBy: [{ examId: "asc" }, { keyword: "asc" }], take: 2001,
    include: { exam: { select: { name: true } }, articleDraft: { select: { id: true, post: { select: { status: true } } } } },
  });
  if (keywords.length > 2000) return { limited: true, groups: [] };
  const groups = new Map<string, { key: string; name: string; items: typeof keywords }>();
  for (const keyword of keywords) {
    const key = JSON.stringify([keyword.examId, keyword.languageCode, keyword.market, keyword.intent]);
    const group = groups.get(key) ?? { key, name: `${keyword.exam?.name ?? "Sınav atanmamış"} · ${keyword.languageCode} · ${keyword.market} · ${keyword.intent}`, items: [] };
    group.items.push(keyword);
    groups.set(key, group);
  }
  return { limited: false, groups: [...groups.values()] };
}
