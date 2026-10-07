import { z } from "zod";

export const MAX_COMPETITORS = 20;
export const MAX_TOPICS_PER_COMPETITOR = 500;
export const MAX_SERP_RESULTS = 20;
/** Share of a competitor topic's words that one Netfener page must contain to count as covered. */
export const COVERED_AT = 0.6;

const HOST_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
/** Accepts "example.com", "https://www.example.com/path"; returns a bare lowercase host or null. Rejects IPs, localhost and the own site. */
export function normalizeDomain(input: string, ownHost?: string) {
  let v = input.trim().toLowerCase();
  if (!v || v.length > 300) return null;
  if (!/^https?:\/\//.test(v)) v = `https://${v}`;
  let host: string;
  try {
    host = new URL(v).hostname.replace(/^www\./, "").replace(/\.$/, "");
  } catch {
    return null;
  }
  if (!HOST_RE.test(host) || /^\d+(\.\d+){3}$/.test(host)) return null;
  if (ownHost && host === ownHost.replace(/^www\./, "")) return null;
  return host;
}
export const competitorSchema = z
  .object({ name: z.string().trim().min(2).max(80), domain: z.string().trim().min(3).max(300), notes: z.string().trim().max(1000).default("") })
  .strict();

const STOP = new Set("ve ile için icin bir bu şu da de mi mı mu mü en çok cok nasıl nasil nedir neden ne the and for with how what to of in on a an is are your you".split(" "));
export function topicTokens(text: string) {
  return new Set(
    text
      .normalize("NFKC")
      .toLocaleLowerCase("tr-TR")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}
export const normalizeTopic = (title: string) => [...topicTokens(title)].sort().join(" ");

/** One topic per line: `Title` or `Title | https://competitor.com/page`. Counts what it cannot use; never guesses. */
export function parseTopicLines(text: string, competitorDomain: string) {
  const items: { title: string; normalized: string; url: string | null }[] = [];
  let dropped = 0;
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    if (items.length >= MAX_TOPICS_PER_COMPETITOR) {
      dropped++;
      continue;
    }
    const [rawTitle, rawUrl] = line.split("|").map((p) => p.trim());
    const title = rawTitle?.slice(0, 200) ?? "";
    let url: string | null = null;
    if (rawUrl) {
      try {
        const u = new URL(rawUrl);
        if (u.protocol !== "https:" || u.hostname.replace(/^www\./, "") !== competitorDomain) throw new Error();
        url = u.origin + u.pathname.slice(0, 300);
      } catch {
        dropped++;
        continue;
      }
    }
    const normalized = normalizeTopic(title);
    if (title.length < 3 || !normalized || seen.has(normalized)) {
      dropped++;
      continue;
    }
    seen.add(normalized);
    items.push({ title, normalized, url });
  }
  return { items, dropped };
}

export type OwnItem = { title: string; url: string };
export type Gap = { title: string; normalized: string; competitors: string[]; nearest: { title: string; url: string; coverage: number } | null; tracked: boolean };

/**
 * Lexical, explainable gap detection: a competitor topic is a gap when no Netfener page contains at
 * least COVERED_AT of its meaningful words. It is not semantic matching and says nothing about
 * search demand or whether Netfener *should* cover the topic.
 */
export function findGaps(
  topics: { title: string; normalized: string; competitor: string }[],
  own: OwnItem[],
  trackedKeywords: Set<string>,
): Gap[] {
  const ownTokens = own.map((o) => ({ ...o, tokens: topicTokens(o.title) }));
  const groups = new Map<string, { title: string; competitors: Set<string> }>();
  for (const t of topics) {
    const g = groups.get(t.normalized) ?? { title: t.title, competitors: new Set<string>() };
    g.competitors.add(t.competitor);
    groups.set(t.normalized, g);
  }
  const gaps: Gap[] = [];
  for (const [normalized, g] of groups) {
    const words = new Set(normalized.split(" "));
    let nearest: Gap["nearest"] = null;
    for (const o of ownTokens) {
      const hit = [...words].filter((w) => o.tokens.has(w)).length / words.size;
      if (!nearest || hit > nearest.coverage) nearest = { title: o.title, url: o.url, coverage: hit };
    }
    if (nearest && nearest.coverage >= COVERED_AT) continue;
    gaps.push({ title: g.title, normalized, competitors: [...g.competitors].sort(), nearest, tracked: trackedKeywords.has(normalized) });
  }
  return gaps.sort((a, b) => b.competitors.length - a.competitors.length || Number(a.tracked) - Number(b.tracked) || a.title.localeCompare(b.title, "tr"));
}

const GENERIC = new Set(["wikipedia.org", "youtube.com", "facebook.com", "instagram.com", "twitter.com", "x.com", "reddit.com", "quora.com", "pinterest.com", "linkedin.com", "tiktok.com", "google.com", "amazon.com"]);
export type SerpRow = { keyword: string; rank: number; domain: string; title: string };
/** Domains by how many tracked keywords they appear for; flags the own site, configured competitors and generic platforms. */
export function summarizeSerp(rows: SerpRow[], competitorDomains: Set<string>, ownHost: string) {
  const own = ownHost.replace(/^www\./, "");
  const byDomain = new Map<string, { keywords: Set<string>; best: number; ranks: number[] }>();
  for (const r of rows) {
    const d = byDomain.get(r.domain) ?? { keywords: new Set<string>(), best: 99, ranks: [] };
    d.keywords.add(r.keyword);
    d.best = Math.min(d.best, r.rank);
    d.ranks.push(r.rank);
    byDomain.set(r.domain, d);
  }
  return [...byDomain.entries()]
    .map(([domain, d]) => ({
      domain,
      keywords: d.keywords.size,
      bestRank: d.best,
      averageRank: d.ranks.reduce((a, b) => a + b, 0) / d.ranks.length,
      kind: domain === own ? ("OWN" as const) : competitorDomains.has(domain) ? ("COMPETITOR" as const) : GENERIC.has(domain) ? ("GENERIC" as const) : ("CANDIDATE" as const),
    }))
    .sort((a, b) => b.keywords - a.keywords || a.bestRank - b.bestRank);
}

export const serpLinesSchema = z.object({ keywordId: z.string().min(1).max(100), text: z.string().min(5).max(6000) }).strict();
/** One result per line, in rank order: `Title | https://site.com/page`. */
export function parseSerpLines(text: string) {
  const out: { rank: number; title: string; url: string; domain: string }[] = [];
  let dropped = 0;
  for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const [title, rawUrl] = line.split("|").map((p) => p.trim());
    try {
      const u = new URL(rawUrl ?? "");
      const domain = normalizeDomain(u.hostname);
      if (u.protocol !== "https:" || !domain || !title || title.length < 3 || out.length >= MAX_SERP_RESULTS) throw new Error();
      out.push({ rank: out.length + 1, title: title.slice(0, 200), url: u.origin + u.pathname.slice(0, 300), domain });
    } catch {
      dropped++;
    }
  }
  return { results: out, dropped };
}
