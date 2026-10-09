import "server-only";
import { db } from "@/server/db";
import { linksSchema } from "@/lib/seo/planning";
import { studioBriefSchema } from "@/lib/seo/studio";
import {
  rankLinkCandidates,
  selectCompetitorTitles,
  selectRelevantQueries,
  type LinkCandidate,
  type Research,
} from "@/lib/seo/autopilot";
import { resolveDestination } from "./destinations";

type KeywordForResearch = { id: string; keyword: string; languageCode: string; exam: { slug: string } | null };

/**
 * Real, currently published pages the article may point to. Ranked by relevance, then every one is re-validated against
 * the live database (a renamed or unpublished page is never offered), so the model can only choose from safe destinations.
 */
export async function loadLinkCandidates(keyword: KeywordForResearch, max = 10): Promise<LinkCandidate[]> {
  const rows = await db.seoContentItem.findMany({
    where: { available: true, publication: { in: ["LIVE", "PUBLISHED"] }, sourceType: { in: ["PRODUCT", "EXAM", "TOPIC", "BLOG", "ROUTE"] } },
    orderBy: { sourceKey: "asc" },
    take: 500,
    select: { id: true, sourceType: true, title: true, url: true, examSlug: true, access: true },
  });
  const ranked = rankLinkCandidates(rows, keyword.keyword, keyword.exam?.slug ?? null, keyword.languageCode, max + 4);
  const valid: LinkCandidate[] = [];
  for (const c of ranked) {
    if (await resolveDestination(c.id)) valid.push(c);
    if (valid.length >= max) break;
  }
  return valid;
}

/** What real people and competitors already do for this keyword. Empty when nothing has been imported or recorded yet. */
export async function loadResearch(keyword: KeywordForResearch): Promise<Research> {
  const snapshot = await db.seoSearchSnapshot.findFirst({ where: { kind: "QUERIES" }, orderBy: { periodEnd: "desc" }, select: { id: true } });
  const [rows, topics, serp] = await Promise.all([
    snapshot
      ? db.seoSearchRow.findMany({ where: { snapshotId: snapshot.id, query: { not: "" } }, orderBy: { impressions: "desc" }, take: 2000, select: { query: true, impressions: true, clicks: true, position: true } })
      : Promise.resolve([]),
    db.seoCompetitorTopic.findMany({ where: { competitor: { active: true } }, select: { title: true }, take: 3000 }).catch(() => [] as { title: string }[]),
    db.seoSerpResult.findMany({ where: { keywordId: keyword.id }, orderBy: { rank: "asc" }, take: 10, select: { rank: true, domain: true, title: true } }),
  ]);
  return {
    queries: selectRelevantQueries(rows, keyword.keyword, keyword.languageCode),
    competitorTitles: selectCompetitorTitles(topics.map((t) => t.title), keyword.keyword, keyword.languageCode),
    serp,
  };
}

/** Resolved at display time, so a page that has since disappeared simply stops being shown. */
export async function getArticleLinks(postId: string) {
  const draft = await db.seoArticleDraft.findUnique({ where: { postId }, select: { approvedLinks: true, brief: true } });
  if (!draft) return { links: [] as { label: string; url: string }[], cta: null as { text: string; title: string; url: string } | null };
  const parsed = linksSchema.safeParse(draft.approvedLinks);
  const links = parsed.success
    ? (await Promise.all(parsed.data.map(async (l) => ({ label: l.label, destination: await resolveDestination(l.itemId) }))))
        .flatMap((l) => (l.destination ? [{ label: l.label, url: l.destination.url }] : []))
    : [];
  const brief = studioBriefSchema.safeParse(draft.brief);
  const target = brief.success && brief.data.ctaItemId ? await resolveDestination(brief.data.ctaItemId) : null;
  return { links, cta: target && brief.success && brief.data.ctaText ? { text: brief.data.ctaText, title: target.title, url: target.url } : null };
}
