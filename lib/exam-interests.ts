/**
 * Learners pick at most two exams they are preparing for ("ilgi alanları"). The choice drives the
 * countdown bar shown across the site and limits exam-specific study material to those exams.
 * Pure (no DB) so the rules are unit-tested; data lives in server/services/exam-interests.service.ts.
 */
import { EXAM_CALENDAR, type CalendarExam } from "@/content/exam-calendar";

export const MAX_EXAM_INTERESTS = 2;

export type InterestCode = "YDS" | "YOKDIL_SOSYAL" | "YOKDIL_SAGLIK" | "YOKDIL_FEN" | "IELTS" | "TOEFL" | "PTE";

export const INTEREST_EXAMS: { code: InterestCode; slug: string; label: string; osym: boolean }[] = [
  { code: "YDS", slug: "yds", label: "YDS / e-YDS", osym: true },
  { code: "YOKDIL_SOSYAL", slug: "yokdil-sosyal-bilimler", label: "YÖKDİL Sosyal Bilimler", osym: true },
  { code: "YOKDIL_SAGLIK", slug: "yokdil-saglik-bilimleri", label: "YÖKDİL Sağlık Bilimleri", osym: true },
  { code: "YOKDIL_FEN", slug: "yokdil-fen-bilimleri", label: "YÖKDİL Fen Bilimleri", osym: true },
  { code: "IELTS", slug: "ielts", label: "IELTS", osym: false },
  { code: "TOEFL", slug: "toefl", label: "TOEFL", osym: false },
  { code: "PTE", slug: "pte", label: "PTE", osym: false },
];

export const isInterestCode = (v: string): v is InterestCode => INTEREST_EXAMS.some((e) => e.code === v);
export const interestExam = (code: InterestCode) => INTEREST_EXAMS.find((e) => e.code === code)!;
export const slugForCode = (code: InterestCode) => interestExam(code).slug;

/** ÖSYM sessions that count for this interest: YDS learners can sit paper YDS or English e-YDS. */
function matchesInterest(code: InterestCode, e: CalendarExam) {
  if (code === "YDS") return e.kind === "YDS" || (e.kind === "E_YDS" && Boolean(e.note?.includes("İngilizce")));
  if (code.startsWith("YOKDIL_")) return e.kind === "YOKDIL";
  return false;
}

export function nextOfficialExam(code: InterestCode, todayKey: string, exams = EXAM_CALENDAR) {
  return [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate)).find((e) => matchesInterest(code, e) && e.examDate >= todayKey);
}

export type Countdown =
  | { code: InterestCode; label: string; state: "DATE"; examName: string; dateKey: string; target: string; source: "OSYM" | "PERSONAL" }
  /** ÖSYM exam with nothing left on the published calendar. */
  | { code: InterestCode; label: string; state: "AWAITING_CALENDAR" }
  /** IELTS/TOEFL/PTE have no fixed national date: the learner adds the one they booked. */
  | { code: InterestCode; label: string; state: "NEEDS_DATE" };

/** ÖSYM language exams start at 10:15 Istanbul time; a learner's own date counts from 09:00. */
const instant = (dateKey: string, time: string) => `${dateKey}T${time}:00+03:00`;

export function countdownFor(interest: { code: InterestCode; examDate: string | null }, todayKey: string, exams = EXAM_CALENDAR): Countdown {
  const meta = interestExam(interest.code);
  const label = meta.label.replace(" / e-YDS", "");
  if (interest.examDate && interest.examDate >= todayKey) {
    return { code: interest.code, label, state: "DATE", examName: `${label} (kendi sınav tarihin)`, dateKey: interest.examDate, target: instant(interest.examDate, "09:00"), source: "PERSONAL" };
  }
  if (!meta.osym) return { code: interest.code, label, state: "NEEDS_DATE" };
  const next = nextOfficialExam(interest.code, todayKey, exams);
  if (!next) return { code: interest.code, label, state: "AWAITING_CALENDAR" };
  return { code: interest.code, label, state: "DATE", examName: next.name, dateKey: next.examDate, target: instant(next.examDate, "10:15"), source: "OSYM" };
}

/**
 * Exam slugs a viewer may open study material for. `null` = no restriction: signed-out visitors,
 * staff, and learners who haven't picked their exams yet.
 */
export function allowedExamSlugs(codes: InterestCode[] | null) {
  return codes && codes.length ? new Set(codes.map(slugForCode)) : null;
}

export const canOpenExam = (allowed: Set<string> | null, slug: string) => !allowed || allowed.has(slug);

/** Validates a form submission: known codes, no repeats, at most two, dates as YYYY-MM-DD. */
export function parseInterests(raw: { code: string; examDate?: string | null }[]) {
  const seen = new Set<string>();
  const out: { code: InterestCode; examDate: string | null }[] = [];
  for (const r of raw) {
    if (!isInterestCode(r.code) || seen.has(r.code)) continue;
    seen.add(r.code);
    const date = r.examDate && /^\d{4}-\d{2}-\d{2}$/.test(r.examDate) ? r.examDate : null;
    out.push({ code: r.code, examDate: date });
  }
  if (out.length > MAX_EXAM_INTERESTS) throw new Error(`En fazla ${MAX_EXAM_INTERESTS} sınav seçebilirsin.`);
  return out;
}
