/**
 * Suggested plan changes. Nothing here changes a plan by itself — each suggestion becomes a
 * PlanProposal the student accepts or declines, as the coaching brief requires for substantial
 * changes.
 */

export type AdaptationInput = {
  plannedCount: number;
  doneCount: number;
  dailyMinutes: number;
  studyDays: number[];
  checkIn?: { manageable: string; workloadChange: string; blockers: string[] } | null;
  /** Coaching reminders sent recently that the student never opened. */
  ignoredReminders: number;
  /** Student said the workload isn't realistic in the last report survey. */
  unrealisticWorkload?: boolean;
};

export type Adjustment = {
  reason: "LOW_COMPLETION" | "CHECKIN_LESS" | "CHECKIN_MORE" | "IGNORED_REMINDERS" | "SURVEY_WORKLOAD";
  dailyMinutes: number;
  studyDays: number[];
};

const round5 = (n: number) => Math.max(15, Math.round(n / 5) * 5);

export function suggestAdjustment(input: AdaptationInput): Adjustment | null {
  const rate = input.plannedCount ? input.doneCount / input.plannedCount : null;
  const lighter = (reason: Adjustment["reason"]): Adjustment => {
    const minutes = round5(input.dailyMinutes * 0.75);
    // Already at the floor → drop a study day instead (keep at least two).
    const days = minutes === input.dailyMinutes && input.studyDays.length > 2 ? input.studyDays.slice(0, -1) : input.studyDays;
    return { reason, dailyMinutes: minutes, studyDays: days };
  };

  if (input.checkIn?.workloadChange === "LESS" || input.checkIn?.manageable === "HARD") return lighter("CHECKIN_LESS");
  if (input.unrealisticWorkload) return lighter("SURVEY_WORKLOAD");
  if (rate !== null && input.plannedCount >= 3 && rate < 0.5) return lighter("LOW_COMPLETION");
  if (input.ignoredReminders >= 3) return lighter("IGNORED_REMINDERS");
  if (input.checkIn?.workloadChange === "MORE" && (rate === null || rate >= 0.8)) {
    return { reason: "CHECKIN_MORE", dailyMinutes: Math.min(240, round5(input.dailyMinutes * 1.2)), studyDays: input.studyDays };
  }
  return null;
}
