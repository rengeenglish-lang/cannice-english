/**
 * Beceri Analizi table rules. Pure, so they're unit-tested; the I/O is in
 * server/services/skill-analysis.service.ts.
 */
import type { DiagnosticSeverity } from "@/lib/generated/prisma/enums";

/** Share of a topic's full study estimate still recommended at each result level. */
export const SEVERITY_STUDY_SHARE: Record<DiagnosticSeverity, number> = {
  CRITICAL: 1,
  NEEDS_IMPROVEMENT: 0.75,
  DEVELOPING: 0.5,
  STRONG: 0.25,
};

/** "Önerilen çalışma süresi": the topic's estimate scaled by how weak the result was, in 15-minute steps. */
export function recommendedMinutes(estimatedMinutes: number | null, severity: DiagnosticSeverity) {
  if (!estimatedMinutes || estimatedMinutes <= 0) return null;
  return Math.max(15, Math.round((estimatedMinutes * SEVERITY_STUDY_SHARE[severity]) / 15) * 15);
}

/** The most a single report from the reading timer may add. The client reports every 30 s. */
export const MAX_REPORT_SECONDS = 60;

/**
 * Seconds to credit for one timer report: never more than was reported, never more than the
 * maximum, and never more than the time since the previous report (plus a little slack for
 * network delay), so parallel tabs or a replayed request can't add more than real time.
 */
export function creditSeconds(reported: number, lastPingAt: Date | null, now: Date) {
  if (!Number.isFinite(reported) || reported <= 0) return 0;
  const cap = Math.min(Math.floor(reported), MAX_REPORT_SECONDS);
  if (!lastPingAt) return cap;
  const sinceLast = Math.floor((now.getTime() - lastPingAt.getTime()) / 1000) + 5;
  return Math.max(0, Math.min(cap, sinceLast));
}

/** "1 sa 15 dk", "45 dk", "0 dk". */
export function formatStudyMinutes(minutes: number) {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (!h) return `${rest} dk`;
  return rest ? `${h} sa ${rest} dk` : `${h} sa`;
}
