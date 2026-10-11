/**
 * ÖSYM language exam dates shown on /tools/exam-calendar. Dates are Istanbul calendar days
 * ("2026-11-22"). Update this file when ÖSYM publishes a new calendar (the 2027 one usually comes
 * out in November) — always check against osym.gov.tr before adding a row.
 */

export type ExamKind = "YDS" | "YOKDIL" | "E_YDS";

export type CalendarExam = {
  kind: ExamKind;
  name: string;
  /** Extra detail, e.g. which languages an e-YDS session covers. */
  note?: string;
  applicationStart?: string;
  applicationEnd?: string;
  lateApplication?: string;
  examDate: string;
  resultDate?: string;
};

export const EXAM_KIND_LABEL: Record<ExamKind, string> = {
  YDS: "YDS",
  YOKDIL: "YÖKDİL",
  E_YDS: "e-YDS",
};

export const EXAM_CALENDAR: CalendarExam[] = [
  { kind: "E_YDS", name: "e-YDS 2026/1", note: "İngilizce", examDate: "2026-01-24" },
  { kind: "E_YDS", name: "e-YDS 2026/2", note: "İngilizce", examDate: "2026-02-14" },
  { kind: "YOKDIL", name: "2026-YÖKDİL/1", examDate: "2026-03-08", resultDate: "2026-03-18" },
  { kind: "YDS", name: "2026-YDS/1", applicationStart: "2026-02-18", applicationEnd: "2026-02-26", lateApplication: "2026-03-04", examDate: "2026-04-05", resultDate: "2026-04-28" },
  { kind: "E_YDS", name: "e-YDS 2026/3", examDate: "2026-04-18" },
  { kind: "E_YDS", name: "e-YDS 2026/4", note: "İngilizce", examDate: "2026-05-02" },
  { kind: "E_YDS", name: "e-YDS 2026/5", examDate: "2026-05-03" },
  { kind: "E_YDS", name: "e-YDS 2026/6", note: "İngilizce", examDate: "2026-06-27" },
  { kind: "E_YDS", name: "e-YDS 2026/7", examDate: "2026-06-28" },
  { kind: "E_YDS", name: "e-YDS 2026/8", examDate: "2026-07-04" },
  { kind: "YOKDIL", name: "2026-YÖKDİL/2", examDate: "2026-08-09", resultDate: "2026-08-20" },
  { kind: "E_YDS", name: "e-YDS 2026/9", note: "İngilizce", examDate: "2026-08-22" },
  { kind: "E_YDS", name: "e-YDS 2026/10", note: "İngilizce", examDate: "2026-09-26" },
  { kind: "E_YDS", name: "e-YDS 2026/11", note: "Farsça / İngilizce", applicationStart: "2026-09-30", applicationEnd: "2026-10-08", examDate: "2026-10-17" },
  { kind: "YDS", name: "2026-YDS/2", applicationStart: "2026-09-30", applicationEnd: "2026-10-08", lateApplication: "2026-10-14", examDate: "2026-11-22", resultDate: "2026-12-10" },
  { kind: "E_YDS", name: "e-YDS 2026/12", note: "İngilizce", applicationStart: "2026-12-02", applicationEnd: "2026-12-10", examDate: "2026-12-19", resultDate: "2026-12-19" },
];

/** The year whose ÖSYM calendar is not out yet, shown as "coming soon". */
export const NEXT_CALENDAR_YEAR = 2027;

/** Splits the calendar around `todayKey`: an exam stays "upcoming" until its result is out. */
export function splitCalendar(todayKey: string, exams = EXAM_CALENDAR) {
  const sorted = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));
  const upcoming = sorted.filter((e) => (e.resultDate ?? e.examDate) >= todayKey);
  const past = sorted.filter((e) => (e.resultDate ?? e.examDate) < todayKey).reverse();
  return { upcoming, past };
}

/** What a student can still do today: apply, apply late, wait for the exam, or wait for results. */
export function examStatus(e: CalendarExam, todayKey: string) {
  if (e.applicationStart && todayKey < e.applicationStart) return "Başvurular yakında";
  if (e.applicationEnd && todayKey <= e.applicationEnd) return "Başvurular açık";
  if (e.lateApplication && todayKey <= e.lateApplication) return "Geç başvuru";
  if (todayKey < e.examDate) return "Sınav yaklaşıyor";
  if (todayKey === e.examDate) return "Bugün";
  if (e.resultDate && todayKey < e.resultDate) return "Sonuç bekleniyor";
  return "Tamamlandı";
}
