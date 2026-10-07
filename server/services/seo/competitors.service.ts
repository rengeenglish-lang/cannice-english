import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { getSiteUrl } from "@/server/env";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { readSeoSettings } from "./settings.service";
import { saveSeoKeyword } from "./keywords.service";
import {
  MAX_COMPETITORS,
  MAX_TOPICS_PER_COMPETITOR,
  competitorSchema,
  findGaps,
  normalizeDomain,
  normalizeTopic,
  parseSerpLines,
  parseTopicLines,
  serpLinesSchema,
  summarizeSerp,
} from "@/lib/seo/competitors";

export class CompetitorError extends Error {}
const ownHost = () => new URL(getSiteUrl()).hostname;
const id = z.string().min(1).max(100);

export async function addCompetitor(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = competitorSchema.parse(raw);
  const domain = normalizeDomain(input.domain, ownHost());
  if (!domain) throw new CompetitorError("Geçerli bir rakip alan adı girin (kendi siteniz olamaz).");
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "COMPETITOR_SAVED");
    if ((await tx.seoCompetitor.count()) >= MAX_COMPETITORS) throw new CompetitorError(`En fazla ${MAX_COMPETITORS} rakip tanımlanabilir.`);
    if (await tx.seoCompetitor.findUnique({ where: { domain }, select: { id: true } })) throw new CompetitorError("Bu rakip zaten ekli.");
    const row = await tx.seoCompetitor.create({ data: { name: input.name, domain, notes: input.notes } });
    // SERP rows recorded earlier for this domain now belong to the new competitor.
    await tx.seoSerpResult.updateMany({ where: { domain, competitorId: null }, data: { competitorId: row.id } });
    await tx.seoActivityLog.create({ data: { actorId, action: "COMPETITOR_SAVED", details: { id: row.id, domain } } });
    return { id: row.id };
  });
}

export async function setCompetitorActive(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ id, active: z.boolean() }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "COMPETITOR_SAVED");
    const r = await tx.seoCompetitor.updateMany({ where: { id: input.id }, data: { active: input.active } });
    if (r.count !== 1) throw new CompetitorError("Rakip bulunamadı.");
    await tx.seoActivityLog.create({ data: { actorId, action: "COMPETITOR_SAVED", details: input } });
  });
}

export async function removeCompetitor(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ id, confirmed: z.literal(true) }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "COMPETITOR_REMOVED");
    const row = await tx.seoCompetitor.findUnique({ where: { id: input.id } });
    if (!row) throw new CompetitorError("Rakip bulunamadı.");
    await tx.seoCompetitor.delete({ where: { id: input.id } });
    await tx.seoActivityLog.create({ data: { actorId, action: "COMPETITOR_REMOVED", details: { domain: row.domain } } });
  });
}

/** Admin-supplied titles/URLs only. The tool never fetches competitor pages. */
export async function importCompetitorTopics(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ competitorId: id, text: z.string().min(3).max(120_000) }).strict().parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "COMPETITOR_TOPICS_IMPORTED");
    const competitor = await tx.seoCompetitor.findUnique({ where: { id: input.competitorId } });
    if (!competitor) throw new CompetitorError("Rakip bulunamadı.");
    const { items, dropped } = parseTopicLines(input.text, competitor.domain);
    if (!items.length) throw new CompetitorError("Geçerli satır bulunamadı; hiçbir şey kaydedilmedi.");
    const existing = await tx.seoCompetitorTopic.count({ where: { competitorId: competitor.id } });
    const room = Math.max(0, MAX_TOPICS_PER_COMPETITOR - existing);
    if (!room) throw new CompetitorError(`Bir rakip için en fazla ${MAX_TOPICS_PER_COMPETITOR} konu saklanır.`);
    const created = await tx.seoCompetitorTopic.createMany({ data: items.slice(0, room).map((t) => ({ ...t, competitorId: competitor.id })), skipDuplicates: true });
    await tx.seoActivityLog.create({ data: { actorId, action: "COMPETITOR_TOPICS_IMPORTED", details: { competitor: competitor.domain, added: created.count, dropped, skippedForLimit: Math.max(0, items.length - room) } } });
    return { added: created.count, dropped };
  });
}

/** Records the top organic results an admin observed for a tracked keyword (replaces the earlier record). */
export async function saveSerpResults(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = serpLinesSchema.parse(raw);
  const { results, dropped } = parseSerpLines(input.text);
  if (!results.length) throw new CompetitorError("Geçerli sonuç satırı bulunamadı. Biçim: Başlık | https://site.com/sayfa");
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "SERP_SAVED");
    const keyword = await tx.seoKeyword.findUnique({ where: { id: input.keywordId }, select: { id: true, archived: true } });
    if (!keyword || keyword.archived) throw new CompetitorError("Etkin bir anahtar kelime seçin.");
    const competitors = await tx.seoCompetitor.findMany({ select: { id: true, domain: true } });
    const byDomain = new Map(competitors.map((c) => [c.domain, c.id]));
    await tx.seoSerpResult.deleteMany({ where: { keywordId: keyword.id } });
    await tx.seoSerpResult.createMany({ data: results.map((r) => ({ ...r, keywordId: keyword.id, competitorId: byDomain.get(r.domain) ?? null })) });
    await tx.seoActivityLog.create({ data: { actorId, action: "SERP_SAVED", details: { keywordId: keyword.id, results: results.length, dropped } } });
    return { saved: results.length, dropped };
  });
}

/** Turns a gap into a tracked keyword. No search demand is invented. */
export async function trackGapAsKeyword(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const input = z.object({ title: z.string().trim().min(3).max(160) }).strict().parse(raw);
  const normalized = normalizeTopic(input.title);
  const topics = await db.seoCompetitorTopic.findMany({ where: { normalized }, select: { competitor: { select: { name: true } } } });
  if (!topics.length) throw new CompetitorError("Bu konu rakip verisinde bulunamadı.");
  const { settings } = await readSeoSettings();
  const names = [...new Set(topics.map((t) => t.competitor.name))].join(", ");
  return saveSeoKeyword(actorId, {
    keyword: input.title,
    languageCode: settings.languageCode,
    market: settings.targetMarkets[0] ?? "TR",
    intent: "UNKNOWN",
    examId: null,
    sourceNote: `Rakip boşluğu: ${names}. Arama hacmi ölçülmedi; editoryal inceleme gerekir.`.slice(0, 2000),
  });
}

export async function getCompetitorReport(actorId: string) {
  await requireSeoAdmin(actorId);
  const [competitors, topics, items, keywords, serp, allKeywords] = await Promise.all([
    db.seoCompetitor.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { topics: true, serpResults: true } } } }),
    db.seoCompetitorTopic.findMany({ where: { competitor: { active: true } }, select: { title: true, normalized: true, competitor: { select: { name: true } } }, take: MAX_COMPETITORS * MAX_TOPICS_PER_COMPETITOR }),
    db.seoContentItem.findMany({ where: { available: true, publication: { in: ["LIVE", "PUBLISHED"] } }, select: { title: true, url: true }, take: 2000 }),
    db.seoKeyword.findMany({ where: { archived: false }, select: { normalized: true }, take: 5000 }),
    db.seoSerpResult.findMany({ select: { rank: true, domain: true, title: true, keyword: { select: { id: true, keyword: true } } }, orderBy: [{ keywordId: "asc" }, { rank: "asc" }], take: 5000 }),
    db.seoKeyword.findMany({ where: { archived: false }, select: { id: true, keyword: true }, orderBy: { keyword: "asc" }, take: 300 }),
  ]);
  const host = ownHost();
  const gaps = findGaps(topics.map((t) => ({ title: t.title, normalized: t.normalized, competitor: t.competitor.name })), items, new Set(keywords.map((k) => normalizeTopic(k.normalized))));
  const serpRows = serp.map((r) => ({ keyword: r.keyword.keyword, rank: r.rank, domain: r.domain, title: r.title }));
  const byKeyword = new Map<string, { id: string; keyword: string; results: { rank: number; domain: string; title: string }[] }>();
  for (const r of serp) {
    const g = byKeyword.get(r.keyword.id) ?? { id: r.keyword.id, keyword: r.keyword.keyword, results: [] };
    g.results.push({ rank: r.rank, domain: r.domain, title: r.title });
    byKeyword.set(r.keyword.id, g);
  }
  return {
    ownHost: host,
    competitors: competitors.map((c) => ({ id: c.id, name: c.name, domain: c.domain, notes: c.notes, active: c.active, topics: c._count.topics, serp: c._count.serpResults })),
    gaps: gaps.slice(0, 100),
    gapTotal: gaps.length,
    inventoryCount: items.length,
    serpSummary: summarizeSerp(serpRows, new Set(competitors.map((c) => c.domain)), host).slice(0, 40),
    serpKeywords: [...byKeyword.values()],
    keywordChoices: allKeywords,
  };
}
