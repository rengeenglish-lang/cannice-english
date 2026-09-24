/**
 * Calendar helpers for coaching. A "day key" is the student's local calendar date as YYYY-MM-DD
 * in their chosen timezone (Europe/Istanbul by default); plan days, reminders and quiet hours all
 * work in those local terms. Pure functions — usable on server and client.
 */

export const DEFAULT_TIMEZONE = "Europe/Istanbul";

export const TIMEZONE_OPTIONS = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Toronto",
  "Asia/Dubai",
  "Australia/Sydney",
] as const;

export function isValidTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function parts(date: Date, tz: string) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

export function dayKey(date: Date, tz: string = DEFAULT_TIMEZONE) {
  const p = parts(date, tz);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Local "HH:MM" for a moment. */
export function localTime(date: Date, tz: string = DEFAULT_TIMEZONE) {
  const p = parts(date, tz);
  return `${p.hour}:${p.minute}`;
}

/** Day key → the Date stored in @db.Date columns (UTC midnight of that calendar date). */
export function dayKeyToDate(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

export function dateToDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number) {
  const d = dayKeyToDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToDayKey(d);
}

/** ISO weekday of a day key: 1 = Monday … 7 = Sunday. */
export function isoWeekday(key: string) {
  const d = dayKeyToDate(key).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Monday of the week containing `key`. */
export function weekStartOf(key: string) {
  return addDays(key, 1 - isoWeekday(key));
}

export function daysBetween(fromKey: string, toKey: string) {
  return Math.round((dayKeyToDate(toKey).getTime() - dayKeyToDate(fromKey).getTime()) / 86_400_000);
}

export function minutesOfDay(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Whether a local HH:MM falls inside quiet hours (which may wrap past midnight, e.g. 22:00–08:00). */
export function inQuietHours(hhmm: string, quietStart: string, quietEnd: string) {
  const t = minutesOfDay(hhmm);
  const s = minutesOfDay(quietStart);
  const e = minutesOfDay(quietEnd);
  if (s === e) return false;
  return s < e ? t >= s && t < e : t >= s || t < e;
}

export function isValidHHMM(v: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
}

/** Offset of `tz` from UTC at a given moment, in minutes (Istanbul = +180). */
export function tzOffsetMinutes(at: Date, tz: string) {
  const p = parts(at, tz);
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
  return Math.round((asUtc - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

/** UTC instants bounding a local calendar day in `tz`: [start, end). */
export function localDayRange(key: string, tz: string = DEFAULT_TIMEZONE) {
  const guess = dayKeyToDate(key);
  const start = new Date(guess.getTime() - tzOffsetMinutes(guess, tz) * 60000);
  const nextGuess = dayKeyToDate(addDays(key, 1));
  const end = new Date(nextGuess.getTime() - tzOffsetMinutes(nextGuess, tz) * 60000);
  return { start, end };
}

/** Whole years since a birth date (used only to decide whether guardian consent is needed). */
export function ageFrom(birthDate: Date | null | undefined, now = new Date()) {
  if (!birthDate) return null;
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  if (now.getUTCMonth() < birthDate.getUTCMonth() || (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}
