import type { CoachingPathwayCode, PathwayConfig, SkillKey } from "@/lib/coaching/exams";

/**
 * How much work a serious exam candidate needs — the volumes coaches set, not just minutes.
 *
 * Every number here comes from a published benchmark (see NORM_SOURCES) and is used as a planning
 * guide, never as a promise of a score:
 * - ~200 guided learning hours to move up one CEFR level (Cambridge English).
 * - ~80 focused hours per half IELTS band, i.e. ~160 per band (IELTS prep guides; ielts.org notes
 *   that on average students take three months to improve by up to half a band).
 * - YDS coaching programmes: 120–150 new words a week from a core list, revised on days 1, 2, 4, 7
 *   and 14; at least 5 study days of 60–90 minutes for a sustainable plan.
 * - Full mocks every two weeks early on, weekly from 6–8 weeks out, twice a week in the last three
 *   weeks, and at least 60 minutes of analysis after each one.
 * - Question pace from the official timing: ÖSYM 80 questions in 180 minutes; IELTS Reading 40
 *   questions in 60 minutes; IELTS Listening 40 questions in ~30 minutes.
 */
export const NORMS = {
  hoursPerCefrStep: 200,
  hoursPerIeltsBand: 160,
  newWordsPerWeek: 140,
  minNewWordsPerWeek: 50,
  seriousDays: 5,
  seriousDailyMinutes: 60,
  idealDailyMinutes: 90,
  mockAnalysisMinutes: 60,
  /**
   * Practice minutes per question including checking answers: ÖSYM exam pace is 180 / 80 = 2.25;
   * grammar and vocabulary items go faster, reading and translation slower.
   */
  minutesPerQuestion: { osymQuick: 1.5, osymLong: 3, osymTimed: 2.25, reading: 2, listening: 1 },
  /** Practice sets coaches give on a full study day: 20+ questions, i.e. 30-minute blocks. */
  fullDayPracticeBlock: 30,
} as const;

export const NORM_SOURCES = [
  { label: "Cambridge English — Guided learning hours", url: "https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours" },
  { label: "IELTS — How long will it take to get the band score I need?", url: "https://ielts.org/news-and-insights/how-long-will-it-take-to-get-the-ielts-band-score-i-need" },
  { label: "ÖSYM — YDS / YÖKDİL (80 soru, 180 dakika)", url: "https://www.osym.gov.tr" },
];

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Cefr = (typeof CEFR)[number];
const cefrIndex = (c: string | null | undefined) => (c ? CEFR.indexOf(c.toUpperCase() as Cefr) : -1);

const OSYM: CoachingPathwayCode[] = ["YDS", "YOKDIL", "YDT"];
export const isOsym = (code: CoachingPathwayCode) => OSYM.includes(code);

/**
 * CEFR a target score needs. International exams publish their own alignment; ÖSYM publishes none,
 * so YDS / YÖKDİL use the commonly quoted approximation (≈70 ↔ IELTS 6, ≈80 ↔ IELTS 7) and say so.
 */
export function targetCefr(pathway: PathwayConfig, target: number | null): { cefr: Cefr; approximate: boolean } | null {
  if (target === null) return null;
  if (pathway.cefrForScore) {
    const c = pathway.cefrForScore(target);
    return c ? { cefr: c as Cefr, approximate: false } : null;
  }
  if (pathway.code === "YDS" || pathway.code === "YOKDIL") {
    return { cefr: target >= 80 ? "C1" : target >= 55 ? "B2" : target >= 35 ? "B1" : "A2", approximate: true };
  }
  return null;
}

export type Phase = "FOUNDATION" | "BUILD" | "FINAL";

/** Far from the exam: build the base; 6–8 weeks out: weekly mocks; last 3 weeks: exam rehearsal. */
export function examPhase(daysUntilExam: number | null): Phase {
  if (daysUntilExam === null || daysUntilExam > 56) return "FOUNDATION";
  if (daysUntilExam > 21) return "BUILD";
  return "FINAL";
}

/** Full mocks to plan this week (foundation weeks alternate one / none). */
export function mocksThisWeek(phase: Phase, weekIndex: number) {
  if (phase === "FINAL") return 2;
  if (phase === "BUILD") return 1;
  return weekIndex % 2 === 0 ? 1 : 0;
}

export function weeklyNewWords(weeklyMinutes: number) {
  const scaled = Math.round((NORMS.newWordsPerWeek * Math.min(1, weeklyMinutes / (NORMS.seriousDays * NORMS.seriousDailyMinutes))) / 5) * 5;
  return Math.max(NORMS.minNewWordsPerWeek, scaled);
}

/** How many questions fit in a practice block of this skill (null = not counted in questions). */
export function questionsFor(code: CoachingPathwayCode, skill: SkillKey | null, minutes: number): number | null {
  if (!skill || skill === "writing" || skill === "speaking") return null;
  // ÖSYM time-management practice is a timed question set; elsewhere "time" is a strategy drill.
  if (isOsym(code)) {
    const pace = skill === "time" ? NORMS.minutesPerQuestion.osymTimed : skill === "grammar" || skill === "vocabulary" ? NORMS.minutesPerQuestion.osymQuick : NORMS.minutesPerQuestion.osymLong;
    return Math.max(5, Math.floor(minutes / pace));
  }
  if (skill === "time") return null;
  if (skill === "reading") return Math.max(5, Math.floor(minutes / NORMS.minutesPerQuestion.reading));
  if (skill === "listening") return Math.max(5, Math.floor(minutes / NORMS.minutesPerQuestion.listening));
  return null;
}

export type Feasibility = "OK" | "TIGHT" | "UNREALISTIC" | "UNKNOWN";

export type WorkloadAssessment = {
  plannedWeeklyMinutes: number;
  /** Below 5 days × 60 minutes — the floor coaches set for a score-raising plan. */
  belowSeriousMinimum: boolean;
  currentCefr: Cefr | null;
  target: { cefr: Cefr; approximate: boolean } | null;
  /** Estimated study hours still needed (null when the gap can't be measured). */
  hoursNeeded: number | null;
  /** What the hours were measured from: an IELTS band gap or a CEFR level gap. */
  hoursBasis: "BAND" | "CEFR" | null;
  weeksLeft: number | null;
  /** Weekly minutes needed to close the gap by the exam date. */
  neededWeeklyMinutes: number | null;
  /** Recommended daily minutes on the student's study days (rounded up to 15). */
  recommendedDailyMinutes: number | null;
  feasibility: Feasibility;
  /** ÖSYM: extra correct answers needed (1.25 points each) from the last reported score. */
  netGap: number | null;
  phase: Phase;
  newWordsPerWeek: number;
};

export function assessWorkload(input: {
  pathway: PathwayConfig;
  studyDays: number;
  dailyMinutes: number;
  currentLevel: string | null;
  measuredCefr?: string | null;
  targetScore: number | null;
  recentScore: number | null;
  daysUntilExam: number | null;
}): WorkloadAssessment {
  const plannedWeeklyMinutes = input.studyDays * input.dailyMinutes;
  const belowSeriousMinimum = input.studyDays < NORMS.seriousDays || input.dailyMinutes < NORMS.seriousDailyMinutes;
  const currentCefr = (cefrIndex(input.measuredCefr) >= 0 ? input.measuredCefr!.toUpperCase() : cefrIndex(input.currentLevel) >= 0 ? input.currentLevel!.toUpperCase() : null) as Cefr | null;
  const target = targetCefr(input.pathway, input.targetScore);

  let hoursNeeded: number | null = null;
  let hoursBasis: WorkloadAssessment["hoursBasis"] = null;
  if (input.pathway.code === "IELTS" && input.targetScore !== null && input.recentScore !== null) {
    hoursNeeded = Math.max(0, input.targetScore - input.recentScore) * NORMS.hoursPerIeltsBand;
    hoursBasis = "BAND";
  } else if (currentCefr && target) {
    hoursNeeded = Math.max(0, cefrIndex(target.cefr) - cefrIndex(currentCefr)) * NORMS.hoursPerCefrStep;
    hoursBasis = "CEFR";
  }

  const weeksLeft = input.daysUntilExam !== null && input.daysUntilExam > 0 ? input.daysUntilExam / 7 : null;
  const neededWeeklyMinutes = hoursNeeded !== null && weeksLeft !== null ? Math.ceil((hoursNeeded * 60) / weeksLeft) : null;
  const recommendedDailyMinutes =
    neededWeeklyMinutes !== null && input.studyDays > 0
      ? Math.max(NORMS.seriousDailyMinutes, Math.ceil(neededWeeklyMinutes / input.studyDays / 15) * 15)
      : belowSeriousMinimum
        ? NORMS.seriousDailyMinutes
        : null;

  let feasibility: Feasibility = "UNKNOWN";
  if (neededWeeklyMinutes !== null) {
    const ratio = neededWeeklyMinutes === 0 ? Infinity : plannedWeeklyMinutes / neededWeeklyMinutes;
    feasibility = ratio >= 1 ? "OK" : ratio >= 0.6 ? "TIGHT" : "UNREALISTIC";
  }

  const netGap =
    isOsym(input.pathway.code) && input.pathway.code !== "YDT" && input.targetScore !== null && input.recentScore !== null
      ? Math.max(0, Math.ceil((input.targetScore - input.recentScore) / 1.25))
      : input.pathway.code === "YDT" && input.targetScore !== null && input.recentScore !== null
        ? Math.max(0, Math.ceil(input.targetScore - input.recentScore))
        : null;

  return {
    plannedWeeklyMinutes,
    belowSeriousMinimum,
    currentCefr,
    target,
    hoursNeeded,
    hoursBasis,
    weeksLeft: weeksLeft === null ? null : Math.round(weeksLeft * 10) / 10,
    neededWeeklyMinutes,
    recommendedDailyMinutes,
    feasibility,
    netGap,
    phase: examPhase(input.daysUntilExam),
    newWordsPerWeek: weeklyNewWords(plannedWeeklyMinutes),
  };
}
