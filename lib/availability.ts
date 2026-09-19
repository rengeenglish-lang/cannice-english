export const DEFAULT_CAPACITY = 10;
export const LESSON_TIMEZONE = "Europe/Istanbul";
export const GROUP_EXAM_FILTERS = ["yds", "yokdil", "toefl", "ielts"] as const;
export type GroupExamFilter = (typeof GROUP_EXAM_FILTERS)[number];
export type AvailabilityStatus =
  "AVAILABLE" | "ALMOST_FULL" | "FULL" | "CLOSED" | "CANCELLED";
export const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: "Yer var",
  ALMOST_FULL: "Dolmak üzere",
  FULL: "Dolu",
  CLOSED: "Kayıt kapalı",
  CANCELLED: "İptal edildi",
};
export function occupancyStatus(
  count: number,
  capacity: number,
): AvailabilityStatus {
  return count >= capacity
    ? "FULL"
    : count >= Math.ceil(capacity * 0.7)
      ? "ALMOST_FULL"
      : "AVAILABLE";
}
export function availability(
  slot: {
    capacity: number | null;
    enrollmentOpen: boolean;
    cancelled: boolean;
    startsAt: Date;
    displayedOccupancy: number | null;
    useDisplayedOccupancy: boolean;
  },
  actual: number,
  now = new Date(),
) {
  const capacity = slot.capacity ?? DEFAULT_CAPACITY;
  const simulated = false;
  const displayed = actual;
  const override = slot.cancelled
    ? "CANCELLED"
    : !slot.enrollmentOpen || slot.startsAt <= now
      ? "CLOSED"
      : null;
  return {
    capacity,
    actual,
    displayed,
    simulated,
    remaining: Math.max(0, capacity - actual),
    displayRemaining: Math.max(0, capacity - displayed),
    status: override ?? occupancyStatus(displayed, capacity),
    actualStatus: override ?? occupancyStatus(actual, capacity),
    canEnroll: !override && actual < capacity,
  };
}
export function localDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LESSON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function dateAt(date: string, time = "00:00") {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    throw new Error("Geçerli tarih ve saat girin.");
  const result = new Date(`${date}T${time}:00+03:00`);
  if (!Number.isFinite(result.getTime()) || localDate(result) !== date)
    throw new Error("Geçersiz tarih.");
  return result;
}
export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}
export function weekRange(input?: string) {
  let day: Date;
  try {
    day = dateAt(input || localDate(new Date()));
  } catch {
    day = dateAt(localDate(new Date()));
  }
  const weekday = new Date(`${localDate(day)}T12:00:00Z`).getUTCDay();
  const start = addDays(day, -((weekday + 6) % 7));
  return {
    start,
    end: addDays(start, 7),
    previous: localDate(addDays(start, -7)),
    next: localDate(addDays(start, 7)),
  };
}
export function lessonTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: LESSON_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
export function lessonDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: LESSON_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
export function lessonWeekday(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: LESSON_TIMEZONE,
    weekday: "long",
  }).format(date);
}
export function groupExamFilter(value: unknown): GroupExamFilter {
  return GROUP_EXAM_FILTERS.includes(value as GroupExamFilter)
    ? (value as GroupExamFilter)
    : "yds";
}
type GroupExamProduct = {
  title: string;
  examType: { code: string; name: string } | null;
};
function isMixedYdsYokdil(product: GroupExamProduct) {
  const title = product.title.toLocaleUpperCase("tr-TR");
  return title.includes("YDS") && title.includes("YÖKDİL");
}
export function matchesGroupExam(
  product: GroupExamProduct,
  filter: GroupExamFilter,
) {
  const code = product.examType?.code;
  if (filter === "yokdil")
    return Boolean(code?.startsWith("YOKDIL_") || isMixedYdsYokdil(product));
  if (filter === "yds") return code === "YDS" || isMixedYdsYokdil(product);
  return code?.toLowerCase() === filter;
}
export function groupExamLabel(product: GroupExamProduct) {
  if (isMixedYdsYokdil(product)) return "YDS · YÖKDİL";
  if (product.examType?.code.startsWith("YOKDIL_")) return "YÖKDİL";
  return product.examType?.name ?? "Genel İngilizce";
}
export function slotReturnPath(value: unknown) {
  return typeof value === "string" &&
    /^\/group-lessons\/[a-zA-Z0-9_-]+$/.test(value)
    ? value
    : undefined;
}
