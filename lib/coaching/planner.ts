import type { PathwayConfig, SkillKey } from "@/lib/coaching/exams";
import { addDays, isoWeekday } from "@/lib/coaching/time";
import { examPhase, mocksThisWeek, NORMS, questionsFor } from "@/lib/coaching/workload";

/** What a task's volume target counts. */
export type TaskUnit = "WORDS" | "QUESTIONS" | "MOCK" | "TEXT";

export type TaskKindCode =
  | "LESSON"
  | "PRACTICE"
  | "TIMED_PRACTICE"
  | "MOCK"
  | "LEVEL_TEST"
  | "VOCAB_REVIEW"
  | "MISTAKE_REVIEW"
  | "SPEAKING"
  | "WRITING"
  | "LISTENING"
  | "READING"
  | "CUSTOM";

/** One thing the student could do — built by the catalog service from real site content (or a gap). */
export type CatalogActivity = {
  taskTypeKey: string;
  skill: SkillKey;
  kind: TaskKindCode;
  /** "learn" = new material (lesson), "practice" = questions / simulator / self-practice. */
  mode: "learn" | "practice";
  title: string;
  detail?: string;
  href?: string;
  refType?: string;
  refId?: string;
  minutes: number;
  isGap: boolean;
  /** Student already finished this lesson — used only if nothing fresh is left. */
  done?: boolean;
};

export type PlannedTask = {
  date: string;
  position: number;
  kind: TaskKindCode;
  skill: SkillKey | null;
  title: string;
  detail?: string;
  href?: string;
  refType?: string;
  refId?: string;
  isGap: boolean;
  minutes: number;
  busyMinutes: number | null;
  /** Volume target, e.g. 25 words or 40 questions (null = time-only task such as a lesson). */
  targetCount?: number | null;
  unit?: TaskUnit | null;
};

export type PlannerInput = {
  weekStart: string;
  /** Never plan days before this (e.g. onboarding on a Thursday). */
  fromDay: string;
  studyDays: number[];
  dailyMinutes: number;
  pathway: PathwayConfig;
  /** Skills to prioritise, weakest first (declared difficulties + measured weak spots). */
  focusSkills: SkillKey[];
  activities: CatalogActivity[];
  vocab: { available: boolean; href: string };
  mistakes: { available: boolean; href: string };
  mock: CatalogActivity | null;
  timedPractice: CatalogActivity | null;
  daysUntilExam: number | null;
  /** Week number since coaching started — mocks alternate weeks when the exam is far away. */
  weekIndex: number;
  /** New words this week (see lib/coaching/workload.ts). */
  newWordsPerWeek: number;
  copy: { vocabTitle: string; vocabDetail: string; mistakeTitle: string; mistakeDetail: string; mockReviewTitle: string; mockReviewDetail: string };
};

const MIN_BLOCK = 10;

/**
 * Builds one week of daily tasks with coach-style volumes. Each study day opens with the day's
 * share of new words plus due reviews and, alternately, the mistake notebook, then fills the rest of
 * the student's daily time with exam skills — weak skills get twice the turns — alternating new
 * learning and question practice, each practice block carrying a question count at exam pace. Full
 * mocks follow the phase cadence (every other week far from the exam, weekly from 8 weeks out,
 * twice a week in the last 3 weeks), each followed by an hour of mock analysis. Days that aren't
 * study days stay empty as rest days, and a student studying all seven days gets a light
 * revision-only day. Every task carries a shorter "busy day" duration or none.
 */
export function generateWeekPlan(input: PlannerInput): PlannedTask[] {
  const days = Array.from({ length: 7 }, (_, i) => addDays(input.weekStart, i)).filter(
    (d) => d >= input.fromDay && input.studyDays.includes(isoWeekday(d)),
  );
  if (days.length === 0) return [];

  const skills = input.pathway.skills.filter((s) => input.activities.some((a) => a.skill === s));
  const focus = input.focusSkills.filter((s) => skills.includes(s)).slice(0, 2);
  const rotation: SkillKey[] = [];
  for (const s of skills) {
    rotation.push(s);
    if (focus.includes(s)) rotation.push(s);
  }
  // Interleave so a weak skill's two turns aren't back to back.
  const order = interleave(rotation);

  const nearExam = input.daysUntilExam !== null && input.daysUntilExam <= 14;
  const lightDay = input.studyDays.length >= 7 ? days.find((d) => isoWeekday(d) === 7) : undefined;
  const workDays = days.filter((d) => d !== lightDay);
  const phase = examPhase(input.daysUntilExam);
  const mockDays = pickMockDays(workDays, mocksThisWeek(phase, input.weekIndex));
  const analysisDays = new Set(mockDays.map((d) => workDays[workDays.indexOf(d) + 1]).filter(Boolean));
  const wordsPerDay = Math.ceil(input.newWordsPerWeek / days.length);

  const used = new Set<string>();
  const skillTurns = new Map<SkillKey, number>();
  let cursor = 0;
  const tasks: PlannedTask[] = [];

  days.forEach((date, dayIndex) => {
    let position = 0;
    let budget = input.dailyMinutes;
    const push = (t: Omit<PlannedTask, "date" | "position">) => {
      tasks.push({ ...t, date, position: position++ });
      budget -= t.minutes;
    };

    if (input.vocab.available) {
      // ~0.6 min per new word plus a few minutes of due reviews, within a quarter-to-a-third of the day.
      const minutes = Math.min(Math.max(MIN_BLOCK, Math.round(input.dailyMinutes * 0.33)), Math.max(MIN_BLOCK, Math.round(wordsPerDay * 0.6) + 5));
      push({ kind: "VOCAB_REVIEW", skill: "vocabulary", title: input.copy.vocabTitle, detail: input.copy.vocabDetail, href: input.vocab.href, isGap: false, minutes, busyMinutes: MIN_BLOCK, targetCount: wordsPerDay, unit: "WORDS" });
    }
    if (analysisDays.has(date)) {
      push({ kind: "MISTAKE_REVIEW", skill: "time", title: input.copy.mockReviewTitle, detail: input.copy.mockReviewDetail, href: input.mistakes.href, isGap: false, minutes: Math.max(MIN_BLOCK, Math.min(NORMS.mockAnalysisMinutes, budget)), busyMinutes: null });
    } else if (input.mistakes.available && (dayIndex % 2 === 1 || !input.vocab.available) && budget >= MIN_BLOCK * 2) {
      push({ kind: "MISTAKE_REVIEW", skill: null, title: input.copy.mistakeTitle, detail: input.copy.mistakeDetail, href: input.mistakes.href, isGap: false, minutes: MIN_BLOCK, busyMinutes: input.vocab.available ? null : MIN_BLOCK });
    }
    if (date === lightDay) return;

    if (mockDays.includes(date)) {
      const mock = input.mock && input.mock.minutes <= input.dailyMinutes * 2.5 ? input.mock : null;
      const exam = mock ?? input.timedPractice;
      if (exam) {
        const questions = exam === mock ? null : questionsFor(input.pathway.code, exam.skill, exam.minutes);
        push({ kind: exam.kind, skill: exam.skill, title: exam.title, detail: exam.detail, href: exam.href, refType: exam.refType, refId: exam.refId, isGap: exam.isGap, minutes: exam.minutes, busyMinutes: null, targetCount: questions ?? 1, unit: questions ? "QUESTIONS" : "MOCK" });
        return;
      }
    }

    let guard = 0;
    while (order.length > 0 && budget >= MIN_BLOCK && guard++ < 12) {
      const skill = order[cursor++ % order.length];
      const turn = skillTurns.get(skill) ?? 0;
      skillTurns.set(skill, turn + 1);
      // Far from the exam learning and practice alternate; from 8 weeks out two of every three
      // blocks are question practice; in the final weeks it is all practice.
      const wantPractice = nearExam || phase === "FINAL" || (phase === "BUILD" ? turn % 3 !== 0 : turn % 2 === 1);
      const activity = pick(input.activities, skill, wantPractice, used);
      if (!activity) continue;
      used.add(activityKey(activity));
      // On a full study day practice comes in exam-sized sets (30 minutes), not 15-minute tasters.
      const wanted = activity.mode === "practice" && input.dailyMinutes >= 90 ? Math.max(activity.minutes, NORMS.fullDayPracticeBlock) : activity.minutes;
      const minutes = Math.min(wanted, budget);
      if (minutes < MIN_BLOCK) break;
      push({ kind: activity.kind, skill: activity.skill, title: activity.title, detail: activity.detail, href: activity.href, refType: activity.refType, refId: activity.refId, isGap: activity.isGap, minutes, busyMinutes: null, ...volumeOf(input.pathway, activity, minutes) });
    }
  });

  return tasks;
}

/**
 * Mock days, each followed by a work day for the analysis (mock on the weekend's first day, analysis
 * on the next is the usual rhythm); with two mocks the first sits about half a week earlier.
 */
function pickMockDays(workDays: string[], count: number) {
  if (!count || !workDays.length) return [];
  if (workDays.length === 1) return [workDays[0]];
  const late = workDays.length - 2;
  if (count === 1 || workDays.length < 4) return [workDays[late]];
  return [workDays[Math.max(0, late - Math.ceil(workDays.length / 2))], workDays[late]];
}

/** Question count for practice at exam pace; one text for writing practice; nothing for lessons. */
function volumeOf(pathway: PathwayConfig, a: CatalogActivity, minutes: number): Pick<PlannedTask, "targetCount" | "unit"> {
  if (a.mode !== "practice") return {};
  if (a.skill === "writing") return { targetCount: 1, unit: "TEXT" };
  const questions = questionsFor(pathway.code, a.skill, minutes);
  return questions ? { targetCount: questions, unit: "QUESTIONS" } : {};
}

function activityKey(a: CatalogActivity) {
  return `${a.kind}:${a.refId ?? a.taskTypeKey}`;
}

function pick(all: CatalogActivity[], skill: SkillKey, wantPractice: boolean, used: Set<string>) {
  const forSkill = all.filter((a) => a.skill === skill);
  const fresh = forSkill.filter((a) => !used.has(activityKey(a)));
  const pool = fresh.length ? fresh : forSkill;
  const rank = (a: CatalogActivity) => {
    let r = 0;
    if ((a.mode === "practice") !== wantPractice) r += 4;
    if (a.isGap) r += 2; // real site content first, self-study only where nothing exists
    if (a.done) r += 3;
    return r;
  };
  return [...pool].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

/** Spread repeated entries apart: [a, a, b, c, d, d] → [a, b, d, c, a, d]. */
function interleave(list: SkillKey[]): SkillKey[] {
  const unique = [...new Set(list)];
  const counts = new Map(unique.map((s) => [s, list.filter((x) => x === s).length]));
  const out: SkillKey[] = [];
  while (out.length < list.length) {
    for (const s of unique) {
      const left = counts.get(s)!;
      if (left > 0) {
        out.push(s);
        counts.set(s, left - 1);
      }
    }
  }
  return out.length ? out : list;
}
