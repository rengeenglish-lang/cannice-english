import { z } from "zod";

export const SNAPSHOT_KINDS = ["PAGES", "QUERIES", "PAGE_QUERIES"] as const;
export type SnapshotKind = (typeof SNAPSHOT_KINDS)[number];
export const KIND_LABELS: Record<SnapshotKind, string> = {
  PAGES: "Sayfalar",
  QUERIES: "Sorgular",
  PAGE_QUERIES: "Sayfa + sorgu",
};
export const MAX_IMPORT_ROWS = 20000;
export const MAX_CSV_BYTES = 2_000_000;
/** Minimum evidence before any recommendation or decay alert is shown. */
export const MIN_IMPRESSIONS = 100;
export const DECAY_MIN_PRIOR_CLICKS = 30;
export const DECAY_MIN_PRIOR_IMPRESSIONS = 500;

export type PerfRow = {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export const periodSchema = z
  .object({ start: z.iso.date(), end: z.iso.date() })
  .refine((p) => p.end >= p.start, "Bitiş tarihi başlangıçtan önce olamaz.")
  .refine(
    (p) => (Date.parse(p.end) - Date.parse(p.start)) / 86_400_000 <= 92,
    "Dönem en fazla 93 gün olabilir.",
  )
  .refine((p) => Date.parse(p.end) <= Date.now(), "Gelecekteki bir dönem içe aktarılamaz.");
export function periodDays(start: string | Date, end: string | Date) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
}

/** Normalizes a Search Console page value to a site-relative path; null if it is not on this site. */
export function normalizePage(value: string, siteHost: string) {
  const v = value.trim();
  if (!v) return null;
  let path = v;
  if (/^https?:\/\//i.test(v)) {
    let u: URL;
    try {
      u = new URL(v);
    } catch {
      return null;
    }
    const strip = (h: string) => h.replace(/^www\./, "");
    if (strip(u.hostname) !== strip(siteHost)) return null;
    path = u.pathname;
  } else if (!v.startsWith("/")) return null;
  path = path.split(/[?#]/)[0];
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path.length <= 300 ? path : null;
}

function splitCsvLine(line: string, delimiter: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}
const integer = (v: string) => {
  const digits = v.replace(/[.,\s ]/g, "");
  return /^\d+$/.test(digits) ? parseInt(digits, 10) : null;
};
const decimal = (v: string) => {
  const n = Number(v.replace("%", "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/**
 * Parses a Search Console performance export: first column is the page or query, then clicks,
 * impressions, CTR and position. Header names differ by interface language, so columns are
 * positional. Rows that cannot be validated are counted, never guessed.
 */
export function parsePerformanceCsv(text: string, kind: "PAGES" | "QUERIES", siteHost: string) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  const delimiter = (lines[0]?.match(/;/g)?.length ?? 0) > (lines[0]?.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: PerfRow[] = [];
  let dropped = 0;
  const seen = new Set<string>();
  for (const line of lines) {
    const cells = splitCsvLine(line, delimiter);
    if (cells.length < 5) {
      dropped++;
      continue;
    }
    const clicks = integer(cells[1]);
    const impressions = integer(cells[2]);
    const ctrRaw = decimal(cells[3]);
    const position = decimal(cells[4]);
    if (clicks === null || impressions === null || ctrRaw === null || position === null) {
      dropped++; // header row or malformed values
      continue;
    }
    const ctr = cells[3].includes("%") ? ctrRaw / 100 : ctrRaw;
    const label = cells[0];
    const page = kind === "PAGES" ? normalizePage(label, siteHost) : "";
    const query = kind === "QUERIES" ? label.slice(0, 300) : "";
    const key = page + "\u0000" + query;
    if (
      (kind === "PAGES" ? page === null : !query) ||
      clicks > impressions ||
      ctr < 0 ||
      ctr > 1 ||
      position < 0 ||
      seen.has(key)
    ) {
      dropped++;
      continue;
    }
    seen.add(key);
    rows.push({ page: page ?? "", query, clicks, impressions, ctr, position });
  }
  return { rows, dropped };
}

/** Editorial heuristic of organic CTR by average position. Not Google data. */
export function expectedCtr(position: number) {
  const table = [0.28, 0.15, 0.11, 0.08, 0.07, 0.05, 0.04, 0.035, 0.03, 0.025];
  if (position < 1) return table[0];
  if (position <= 10) return table[Math.round(position) - 1];
  return position <= 15 ? 0.015 : position <= 20 ? 0.008 : 0.004;
}

export type Action =
  | "UPDATE"
  | "EXPAND"
  | "RE_TITLE"
  | "ADD_INTERNAL_LINKS"
  | "NO_ACTION";
export const ACTION_LABELS: Record<Action, string> = {
  UPDATE: "Güncelle",
  EXPAND: "Genişlet",
  RE_TITLE: "Başlık/açıklamayı iyileştir",
  ADD_INTERNAL_LINKS: "İç bağlantı ekle",
  NO_ACTION: "İşlem gerekmiyor",
};

export type QuickWin = PerfRow & { action: Action; reason: string; expectedCtr: number };

/** Position 5–20 with enough impressions: weak CTR → retitle; page two → expand + link. */
export function findQuickWins(rows: PerfRow[]): QuickWin[] {
  const wins: QuickWin[] = [];
  for (const r of rows) {
    if (r.impressions < MIN_IMPRESSIONS || r.position < 5 || r.position > 20) continue;
    const exp = expectedCtr(r.position);
    if (r.position <= 10 && r.ctr < exp * 0.5)
      wins.push({
        ...r,
        expectedCtr: exp,
        action: "RE_TITLE",
        reason: `Ortalama konum ${r.position.toFixed(1)} için TO %${(r.ctr * 100).toFixed(1)}; yaklaşık beklenti %${(exp * 100).toFixed(1)}. Başlık ve meta açıklamayı iyileştirin.`,
      });
    else if (r.position > 10)
      wins.push({
        ...r,
        expectedCtr: exp,
        action: "EXPAND",
        reason: `Ortalama konum ${r.position.toFixed(1)} (ikinci sayfa). İçeriği genişletin ve iç bağlantıları güçlendirin.`,
      });
  }
  // Opportunity: how many clicks the gap to the expected CTR is worth.
  const gap = (w: QuickWin) => Math.max(0, w.expectedCtr - w.ctr) * w.impressions;
  return wins.sort((a, b) => gap(b) - gap(a) || b.impressions - a.impressions);
}

export type Decay = {
  page: string;
  signals: string[];
  severity: "HIGH" | "MEDIUM";
  current: PerfRow;
  previous: PerfRow;
};
const drop = (cur: number, prev: number) => (prev > 0 ? (prev - cur) / prev : 0);

/** Compares equal consecutive periods; tiny datasets never alert. */
export function findDecay(current: PerfRow[], previous: PerfRow[]): Decay[] {
  const prev = new Map(previous.map((r) => [r.page, r]));
  const out: Decay[] = [];
  for (const cur of current) {
    const p = prev.get(cur.page);
    if (!p) continue;
    if (p.clicks < DECAY_MIN_PRIOR_CLICKS && p.impressions < DECAY_MIN_PRIOR_IMPRESSIONS) continue;
    const signals: string[] = [];
    const clickDrop = drop(cur.clicks, p.clicks);
    if (p.clicks >= DECAY_MIN_PRIOR_CLICKS && clickDrop >= 0.3)
      signals.push(`Tıklama %${Math.round(clickDrop * 100)} düştü (${p.clicks} → ${cur.clicks})`);
    const impDrop = drop(cur.impressions, p.impressions);
    if (p.impressions >= DECAY_MIN_PRIOR_IMPRESSIONS && impDrop >= 0.3)
      signals.push(`Gösterim %${Math.round(impDrop * 100)} düştü (${p.impressions} → ${cur.impressions})`);
    if (p.impressions >= DECAY_MIN_PRIOR_IMPRESSIONS && cur.impressions >= MIN_IMPRESSIONS && drop(cur.ctr, p.ctr) >= 0.3)
      signals.push(`TO %${(p.ctr * 100).toFixed(1)} → %${(cur.ctr * 100).toFixed(1)}`);
    if (cur.impressions >= MIN_IMPRESSIONS && p.impressions >= MIN_IMPRESSIONS && cur.position - p.position >= 3)
      signals.push(`Ortalama konum ${p.position.toFixed(1)} → ${cur.position.toFixed(1)}`);
    if (!signals.length) continue;
    out.push({
      page: cur.page,
      signals,
      severity: clickDrop >= 0.5 && signals.length >= 2 ? "HIGH" : "MEDIUM",
      current: cur,
      previous: p,
    });
  }
  return out.sort((a, b) => (a.severity === b.severity ? b.previous.clicks - a.previous.clicks : a.severity === "HIGH" ? -1 : 1));
}

export type PageFacts = { wordCount: number | null; internalLinkCount: number | null };
export type Recommendation = { page: string; actions: Action[]; reasons: string[] };

/** Combines decay, quick-win and on-page facts. Pages with nothing actionable are omitted. */
export function recommendRefresh(
  pages: PerfRow[],
  decay: Decay[],
  facts: Map<string, PageFacts>,
): Recommendation[] {
  const decayed = new Map(decay.map((d) => [d.page, d]));
  const out: Recommendation[] = [];
  for (const row of pages) {
    const actions = new Set<Action>();
    const reasons: string[] = [];
    const d = decayed.get(row.page);
    if (d) {
      actions.add("UPDATE");
      reasons.push(...d.signals);
    }
    for (const w of findQuickWins([row])) {
      actions.add(w.action);
      reasons.push(w.reason);
      if (w.action === "EXPAND") actions.add("ADD_INTERNAL_LINKS");
    }
    const f = facts.get(row.page);
    if (row.impressions >= MIN_IMPRESSIONS && f) {
      if (f.wordCount !== null && f.wordCount < 300) {
        actions.add("EXPAND");
        reasons.push(`Metin kısa (${f.wordCount} kelime).`);
      }
      if (f.internalLinkCount === 0) {
        actions.add("ADD_INTERNAL_LINKS");
        reasons.push("Envanterde bu sayfadan çıkan iç bağlantı bulunamadı.");
      }
    }
    if (actions.size) out.push({ page: row.page, actions: [...actions], reasons });
  }
  return out;
}

/** Page-level coverage of a window: used to pick comparable snapshots. */
export function comparablePrevious(
  current: { periodStart: Date; periodEnd: Date },
  candidate: { periodStart: Date; periodEnd: Date },
) {
  const len = periodDays(current.periodStart, current.periodEnd);
  return (
    periodDays(candidate.periodStart, candidate.periodEnd) === len &&
    candidate.periodEnd.getTime() + 86_400_000 === current.periodStart.getTime()
  );
}

/** Merges rows that normalize to the same page+query (e.g. URLs differing only by query string). */
export function mergeRows(rows: PerfRow[]): PerfRow[] {
  const map = new Map<string, PerfRow>();
  for (const r of rows) {
    const key = r.page + "\u0000" + r.query;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, { ...r });
      continue;
    }
    const impressions = cur.impressions + r.impressions;
    const clicks = cur.clicks + r.clicks;
    map.set(key, {
      page: r.page,
      query: r.query,
      clicks,
      impressions,
      ctr: impressions ? clicks / impressions : 0,
      position: impressions ? (cur.position * cur.impressions + r.position * r.impressions) / impressions : cur.position,
    });
  }
  return [...map.values()];
}
