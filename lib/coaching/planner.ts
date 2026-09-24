import type { PathwayConfig, SkillKey } from "@/lib/coaching/exams";
import { addDays, isoWeekday } from "@/lib/coaching/time";

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
  copy: { vocabTitle: string; vocabDetail: string; mistakeTitle: string; mistakeDetail: string };
};

const MIN_BLOCK = 10;

/**
 * Builds one week of daily tasks. Each study day opens with spaced revision (vocabulary and,
 * alternately, the mistake notebook), then fills the rest of the student's realistic daily time
 * with exam skills — weak skills get twice the turns — alternating new learning and practice. One
 * day a week (or every other week when the exam is far off) carries a mock or timed practice.
 * Days that aren't study days stay empty as rest days, and a student studying all seven days gets
 * a light revision-only day. Every task carries a shorter "busy day" duration or none.
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
  const longDay = [...days].filter((d) => d !== lightDay).sort((a, b) => isoWeekday(b) - isoWeekday(a))[0];
  const mockWeek = input.daysUntilExam !== null && input.daysUntilExam <= 42 ? true : input.weekIndex % 2 === 0;

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
      const minutes = Math.min(15, Math.max(MIN_BLOCK, Math.round(input.dailyMinutes * 0.2)));
      push({ kind: "VOCAB_REVIEW", skill: "vocabulary", title: input.copy.vocabTitle, detail: input.copy.vocabDetail, href: input.vocab.href, isGap: false, minutes, busyMinutes: MIN_BLOCK });
    }
    if (input.mistakes.available && (dayIndex % 2 === 1 || !input.vocab.available) && budget >= MIN_BLOCK * 2) {
      push({ kind: "MISTAKE_REVIEW", skill: null, title: input.copy.mistakeTitle, detail: input.copy.mistakeDetail, href: input.mistakes.href, isGap: false, minutes: MIN_BLOCK, busyMinutes: input.vocab.available ? null : MIN_BLOCK });
    }
    if (date === lightDay) return;

    if (date === longDay && mockWeek) {
      const mock = input.mock && input.mock.minutes <= input.dailyMinutes * 2.5 ? input.mock : null;
      const exam = mock ?? input.timedPractice;
      if (exam) {
        push({ kind: exam.kind, skill: exam.skill, title: exam.title, detail: exam.detail, href: exam.href, refType: exam.refType, refId: exam.refId, isGap: exam.isGap, minutes: exam.minutes, busyMinutes: null });
        return;
      }
    }

    let guard = 0;
    while (order.length > 0 && budget >= MIN_BLOCK && guard++ < 12) {
      const skill = order[cursor++ % order.length];
      const turn = skillTurns.get(skill) ?? 0;
      skillTurns.set(skill, turn + 1);
      const wantPractice = nearExam || turn % 2 === 1;
      const activity = pick(input.activities, skill, wantPractice, used);
      if (!activity) continue;
      used.add(activityKey(activity));
      const minutes = Math.min(activity.minutes, budget);
      if (minutes < MIN_BLOCK) break;
      push({ kind: activity.kind, skill: activity.skill, title: activity.title, detail: activity.detail, href: activity.href, refType: activity.refType, refId: activity.refId, isGap: activity.isGap, minutes, busyMinutes: null });
    }
  });

  return tasks;
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
