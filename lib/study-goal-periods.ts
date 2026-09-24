// Turkey has had no DST since 2016 - Europe/Istanbul is a fixed UTC+3 offset year-round, so a
// literal "+03:00" suffix is accurate (and much simpler than timezone-aware date math) here.
const ISTANBUL_OFFSET = "+03:00";

function istanbulDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(date);
}

/** Monday of the Istanbul week containing `date`, as a "YYYY-MM-DD" key. */
function istanbulMondayKey(date: Date) {
  const key = istanbulDayKey(date);
  const local = new Date(`${key}T00:00:00${ISTANBUL_OFFSET}`);
  const isoWeekday = local.getUTCDay() === 0 ? 7 : local.getUTCDay(); // Mon=1..Sun=7
  local.setUTCDate(local.getUTCDate() - (isoWeekday - 1));
  return istanbulDayKey(local);
}

export type StudyGoalPeriodKind = "DAY" | "WEEK" | "MONTH";

/** The current Istanbul-local day/week/month boundaries for a new goal of this period. */
export function currentPeriodBounds(period: StudyGoalPeriodKind, now: Date = new Date()): { start: Date; end: Date } {
  if (period === "DAY") {
    const start = new Date(`${istanbulDayKey(now)}T00:00:00${ISTANBUL_OFFSET}`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }
  if (period === "WEEK") {
    const start = new Date(`${istanbulMondayKey(now)}T00:00:00${ISTANBUL_OFFSET}`);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }
  const [year, month] = istanbulDayKey(now).split("-").map(Number);
  const start = new Date(`${istanbulDayKey(now).slice(0, 7)}-01T00:00:00${ISTANBUL_OFFSET}`);
  const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  const end = new Date(`${nextMonth}-01T00:00:00${ISTANBUL_OFFSET}`);
  return { start, end };
}

export const PERIOD_LABEL: Record<StudyGoalPeriodKind, string> = { DAY: "Günlük", WEEK: "Haftalık", MONTH: "Aylık" };
