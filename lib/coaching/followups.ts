import { inQuietHours, localTime } from "@/lib/coaching/time";

export type FollowUpKind =
  | "SESSION_TODAY"
  | "SESSION_SOON"
  | "MISSED"
  | "INACTIVE"
  | "VOCAB_DUE"
  | "MISTAKE_DUE"
  | "MOCK_SCHEDULED"
  | "MILESTONE"
  | "WEEKLY_REPORT"
  | "PLAN_CHECK";

/** Essential follow-ups still go out on "LOW" frequency and when earlier reminders were ignored. */
export const ESSENTIAL: ReadonlySet<FollowUpKind> = new Set(["MOCK_SCHEDULED", "MILESTONE", "WEEKLY_REPORT", "PLAN_CHECK"]);

export type FollowUpCandidate = {
  kind: FollowUpKind;
  /** Unique per user — the delivery log's unique index makes each key send at most once. */
  dedupeKey: string;
  title: string;
  body?: string;
  href: string;
};

export type DeliveryPrefs = {
  enabled: boolean;
  notifyInApp: boolean;
  frequency: string;
  pausedUntil: Date | null;
  quietStart: string;
  quietEnd: string;
  timezone: string;
};

export type Decision =
  | { action: "SEND"; candidate: FollowUpCandidate }
  /** Logged as skipped (never retried) — the student opted out of this. */
  | { action: "SKIP"; candidate: FollowUpCandidate; status: "SKIPPED_PREFS" | "SKIPPED_THROTTLE" }
  /** Not logged — try again on the next run (e.g. after quiet hours end). */
  | { action: "DEFER"; candidate: FollowUpCandidate };

/** Consecutive unopened reminders after which only essential follow-ups are sent. */
export const IGNORE_THRESHOLD = 3;

/**
 * Re-checks the student's preferences right before sending. Quiet hours defer (the reminder can
 * still go out later); pausing, turning coaching off, choosing "LOW" frequency, or repeatedly not
 * engaging turn non-essential reminders into logged skips so they are never sent late in a burst.
 */
export function decideFollowUps(candidates: FollowUpCandidate[], prefs: DeliveryPrefs, now: Date, ignoredInARow: number): Decision[] {
  return candidates.map((candidate) => {
    const essential = ESSENTIAL.has(candidate.kind);
    if (!prefs.enabled || !prefs.notifyInApp) return { action: "SKIP", candidate, status: "SKIPPED_PREFS" };
    if (prefs.pausedUntil && prefs.pausedUntil > now) return { action: "SKIP", candidate, status: "SKIPPED_PREFS" };
    if (inQuietHours(localTime(now, prefs.timezone), prefs.quietStart, prefs.quietEnd)) return { action: "DEFER", candidate };
    if (!essential && prefs.frequency === "LOW") return { action: "SKIP", candidate, status: "SKIPPED_PREFS" };
    if (!essential && ignoredInARow >= IGNORE_THRESHOLD) return { action: "SKIP", candidate, status: "SKIPPED_THROTTLE" };
    return { action: "SEND", candidate };
  });
}
