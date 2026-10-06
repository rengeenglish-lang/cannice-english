/** Cookie-free attribution helpers. Nothing here identifies a visitor. */
export const SOURCE_PARAM = "src";
const SOURCE_RE = /^blog\.[a-z0-9-]{3,160}$/;
export const WINDOWS = [7, 30, 90] as const;

export const sourceFor = (slug: string) => `blog.${slug}`;
/** Returns the article slug from a `src` value, or null for anything else. */
export function parseSource(value: unknown): string | null {
  return typeof value === "string" && SOURCE_RE.test(value) ? value.slice(5) : null;
}

const SEARCH_HOSTS = [
  /(^|\.)google\.[a-z.]+$/,
  /(^|\.)bing\.com$/,
  /(^|\.)yandex\.[a-z.]+$/,
  /(^|\.)duckduckgo\.com$/,
  /(^|\.)yahoo\.com$/,
  /(^|\.)ecosia\.org$/,
  /(^|\.)baidu\.com$/,
  /(^|\.)search\.brave\.com$/,
  /(^|\.)startpage\.com$/,
];
/** Organic only when the referrer host is a web search engine; everything else is "other". */
export function classifyReferrer(host: string | null | undefined): "ORGANIC" | "OTHER" {
  const h = (host ?? "").toLowerCase().replace(/\.$/, "");
  return h && SEARCH_HOSTS.some((re) => re.test(h)) ? "ORGANIC" : "OTHER";
}
export function referrerHost(value: unknown): string | null {
  if (typeof value !== "string" || !value || value.length > 2000) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python-requests|facebookexternalhit|embedly|whatsapp|telegram/i;
export const looksLikeBot = (ua: string | null) => !ua || BOT_RE.test(ua);

export type ValueInput = {
  views: number;
  registrations: number;
  practiceStarts: number;
  purchases: number;
  revenueTry: number;
  position: number | null; // Search Console average position, null when unavailable
};
/** Documented reference targets; a component at its target scores full marks. */
export const VALUE_WEIGHTS = {
  traffic: { weight: 10, label: "Trafik (görüntüleme)", target: "2.000 görüntüleme (logaritmik)" },
  ranking: { weight: 10, label: "Arama sırası", target: "konum 1 = tam, 20 = sıfır (Search Console verisi varsa)" },
  rate: { weight: 15, label: "Kayıt oranı", target: "%5" },
  registrations: { weight: 25, label: "Kayıtlar", target: "20 kayıt" },
  practice: { weight: 10, label: "Çalışma başlangıçları", target: "20" },
  purchases: { weight: 15, label: "Ödeme yapan müşteri", target: "3" },
  revenue: { weight: 15, label: "Gelir (TRY)", target: "5.000 TRY" },
} as const;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const MIN_VIEWS_FOR_SCORE = 20;

/**
 * Business value 0–100, not traffic rank. Ranking is dropped from the weighting (and the rest
 * rescaled) when no Search Console data exists. Returns null below the minimum evidence.
 */
export function seoValueScore(v: ValueInput): number | null {
  if (v.views < MIN_VIEWS_FOR_SCORE && v.registrations === 0 && v.purchases === 0) return null;
  const parts: [number, number][] = [
    [VALUE_WEIGHTS.traffic.weight, clamp(Math.log10(1 + v.views) / Math.log10(2001))],
    [VALUE_WEIGHTS.rate.weight, clamp((v.views ? v.registrations / v.views : 0) / 0.05)],
    [VALUE_WEIGHTS.registrations.weight, clamp(v.registrations / 20)],
    [VALUE_WEIGHTS.practice.weight, clamp(v.practiceStarts / 20)],
    [VALUE_WEIGHTS.purchases.weight, clamp(v.purchases / 3)],
    [VALUE_WEIGHTS.revenue.weight, clamp(v.revenueTry / 5000)],
  ];
  if (v.position !== null) parts.push([VALUE_WEIGHTS.ranking.weight, clamp((20 - v.position) / 19)]);
  const total = parts.reduce((s, [w]) => s + w, 0);
  return Math.round((parts.reduce((s, [w, x]) => s + w * x, 0) / total) * 100);
}
