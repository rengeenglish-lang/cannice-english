import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { fetchGscRows, readGscConfig, GscError } from "@/lib/seo/gsc";
import {
  MAX_CSV_BYTES,
  MAX_IMPORT_ROWS,
  SNAPSHOT_KINDS,
  comparablePrevious,
  findDecay,
  findQuickWins,
  mergeRows,
  parsePerformanceCsv,
  periodDays,
  periodSchema,
  recommendRefresh,
  type PageFacts,
  type PerfRow,
  type SnapshotKind,
} from "@/lib/seo/performance";

export class PerformanceError extends Error {}
const siteHost = () => new URL(getSiteUrl()).hostname;
const day = (s: string) => new Date(`${s}T00:00:00.000Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

async function storeSnapshot(
  actorId: string | null,
  kind: SnapshotKind,
  period: { start: string; end: string },
  source: "CSV" | "GSC_API",
  rows: PerfRow[],
  dropped: number,
) {
  if (!rows.length) throw new PerformanceError("Geçerli satır bulunamadı; hiçbir şey kaydedilmedi.");
  if (rows.length > MAX_IMPORT_ROWS) throw new PerformanceError(`En fazla ${MAX_IMPORT_ROWS} satır içe aktarılabilir.`);
  return db.$transaction(
    async (tx) => {
      if (actorId) await requireSeoAdmin(actorId, tx);
      await lockSeoWrites(tx);
      if (actorId) await checkSeoRateLimit(tx, actorId, "SEARCH_SNAPSHOT_SAVED");
      const where = { kind_periodStart_periodEnd: { kind, periodStart: day(period.start), periodEnd: day(period.end) } };
      const replaced = await tx.seoSearchSnapshot.findUnique({ where, select: { id: true } });
      if (replaced) await tx.seoSearchSnapshot.delete({ where });
      const snapshot = await tx.seoSearchSnapshot.create({
        data: { kind, source, periodStart: day(period.start), periodEnd: day(period.end), rowCount: rows.length, droppedRows: dropped, importedById: actorId },
      });
      await tx.seoSearchRow.createMany({ data: rows.map((r) => ({ ...r, snapshotId: snapshot.id })) });
      await tx.seoActivityLog.create({
        data: { actorId, action: "SEARCH_SNAPSHOT_SAVED", details: { id: snapshot.id, kind, source, period, rows: rows.length, dropped, replaced: Boolean(replaced) } },
      });
      return { id: snapshot.id, rows: rows.length, dropped, replaced: Boolean(replaced) };
    },
    { timeout: 30000 },
  );
}

export async function importSearchCsv(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z
    .object({ kind: z.enum(["PAGES", "QUERIES"]), period: periodSchema, csv: z.string().min(10).max(MAX_CSV_BYTES) })
    .strict()
    .parse(raw);
  const { rows, dropped } = parsePerformanceCsv(input.csv, input.kind, siteHost());
  return storeSnapshot(actorId, input.kind, input.period, "CSV", rows, dropped);
}

export function gscStatus() {
  return { configured: readGscConfig() !== null };
}

/** Pulls one period from the Search Console API. Manual trigger only; unavailable without credentials. */
export async function syncSearchConsole(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ kind: z.enum(SNAPSHOT_KINDS), period: periodSchema }).strict().parse(raw);
  const config = readGscConfig();
  if (!config) throw new PerformanceError("Search Console bağlı değil: sunucuda GSC_SERVICE_ACCOUNT_JSON ve GSC_SITE_URL tanımlı olmalı.");
  try {
    const { rows, dropped } = await fetchGscRows(config, input.kind, input.period, siteHost());
    return storeSnapshot(actorId, input.kind, input.period, "GSC_API", mergeRows(rows), dropped);
  } catch (e) {
    if (e instanceof GscError) throw new PerformanceError(e.message);
    throw e;
  }
}

/** Scheduled-job entry point: same fetch and validation as the admin button, attributed to the system. */
export async function syncSearchConsoleSystem(raw: unknown) {
  const input = z.object({ kind: z.enum(SNAPSHOT_KINDS), period: periodSchema }).strict().parse(raw);
  const config = readGscConfig();
  if (!config) throw new PerformanceError("Search Console bağlı değil.");
  try {
    const { rows, dropped } = await fetchGscRows(config, input.kind, input.period, siteHost());
    return await storeSnapshot(null, input.kind, input.period, "GSC_API", mergeRows(rows), dropped);
  } catch (e) {
    if (e instanceof GscError) throw new PerformanceError(e.message);
    throw e;
  }
}

export async function listSnapshots(actorId: string) {
  await requireSeoAdmin(actorId);
  return db.seoSearchSnapshot.findMany({
    orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: { id: true, kind: true, source: true, periodStart: true, periodEnd: true, rowCount: true, droppedRows: true, createdAt: true },
  });
}

async function rowsOf(snapshotId: string): Promise<PerfRow[]> {
  return db.seoSearchRow.findMany({
    where: { snapshotId },
    select: { page: true, query: true, clicks: true, impressions: true, ctr: true, position: true },
    take: MAX_IMPORT_ROWS,
  });
}

/** Latest snapshot of a kind plus the equal-length period immediately before it, if one exists. */
async function latestPair(kind: SnapshotKind) {
  const current = await db.seoSearchSnapshot.findFirst({ where: { kind }, orderBy: { periodEnd: "desc" } });
  if (!current) return null;
  const earlier = await db.seoSearchSnapshot.findMany({
    where: { kind, periodEnd: { lt: current.periodStart } },
    orderBy: { periodEnd: "desc" },
    take: 5,
  });
  const previous = earlier.find((c) => comparablePrevious(current, c)) ?? null;
  return { current, previous };
}

async function pageFacts(pages: string[]) {
  const facts = new Map<string, PageFacts>();
  const slugs = pages.filter((p) => p.startsWith("/blog/")).map((p) => decodeURIComponent(p.slice(6)));
  const [posts, items] = await Promise.all([
    db.blogPost.findMany({ where: { slug: { in: slugs }, status: "PUBLISHED" }, select: { slug: true, content: true, seoDraft: { select: { id: true } } } }),
    db.seoContentItem.findMany({ where: { url: { in: pages }, available: true }, select: { url: true, internalLinks: true } }),
  ]);
  const links = new Map(items.map((i) => [i.url, Array.isArray(i.internalLinks) ? i.internalLinks.length : null]));
  const drafts = new Map<string, string>();
  for (const p of posts) {
    const path = `/blog/${p.slug}`;
    facts.set(path, { wordCount: (p.content.match(/[\p{L}\p{N}]+/gu) || []).length, internalLinkCount: links.get(path) ?? null });
    if (p.seoDraft) drafts.set(path, p.seoDraft.id);
  }
  for (const [url, n] of links) if (!facts.has(url)) facts.set(url, { wordCount: null, internalLinkCount: n });
  return { facts, drafts };
}

export async function getPerformanceReport(actorId: string) {
  await requireSeoAdmin(actorId);
  const [pages, queries, pageQueries] = await Promise.all([latestPair("PAGES"), latestPair("QUERIES"), latestPair("PAGE_QUERIES")]);
  const pageRows = pages ? await rowsOf(pages.current.id) : [];
  const prevRows = pages?.previous ? await rowsOf(pages.previous.id) : null;
  const decay = prevRows ? findDecay(pageRows, prevRows) : [];
  const { facts, drafts } = await pageFacts(pageRows.map((r) => r.page));
  const winsSource = pageQueries ? await rowsOf(pageQueries.current.id) : queries ? await rowsOf(queries.current.id) : [];
  const tracked = new Set((await db.seoKeyword.findMany({ where: { archived: false }, select: { normalized: true }, take: 5000 })).map((k) => k.normalized));
  const totals = pageRows.reduce((t, r) => ({ clicks: t.clicks + r.clicks, impressions: t.impressions + r.impressions }), { clicks: 0, impressions: 0 });
  return {
    snapshot: pages?.current ?? null,
    previousSnapshot: pages?.previous ?? null,
    decayAvailable: Boolean(prevRows),
    totals,
    pageCount: pageRows.length,
    decay: decay.slice(0, 50),
    pageQuickWins: findQuickWins(pageRows).slice(0, 50),
    queryQuickWins: findQuickWins(winsSource).slice(0, 50),
    queryQuickWinsSource: pageQueries ? ("PAGE_QUERIES" as const) : queries ? ("QUERIES" as const) : null,
    untracked: winsSource
      .filter((r) => r.query && r.impressions >= 100 && !tracked.has(r.query.toLowerCase().trim()))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 30),
    recommendations: recommendRefresh(pageRows, decay, facts).slice(0, 100).map((r) => ({ ...r, draftId: drafts.get(r.page) ?? null })),
    snapshotDays: pages ? periodDays(pages.current.periodStart, pages.current.periodEnd) : null,
    period: pages ? { start: iso(pages.current.periodStart), end: iso(pages.current.periodEnd) } : null,
  };
}
