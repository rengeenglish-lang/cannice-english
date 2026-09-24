import { test } from "node:test";
import assert from "node:assert/strict";
import { PATHWAYS, parseScore, type SkillKey } from "../lib/coaching/exams";
import { generateWeekPlan, type CatalogActivity, type PlannerInput } from "../lib/coaching/planner";
import { reviewVocab, retryMistake } from "../lib/coaching/srs";
import { decideFollowUps, type DeliveryPrefs, type FollowUpCandidate } from "../lib/coaching/followups";
import { suggestAdjustment } from "../lib/coaching/adapt";
import { addDays, dayKey, inQuietHours, isoWeekday, localTime, weekStartOf } from "../lib/coaching/time";

const copy = { vocabTitle: "Kelime", vocabDetail: "", mistakeTitle: "Hata", mistakeDetail: "" };

function activitiesFor(code: keyof typeof PATHWAYS): CatalogActivity[] {
  return PATHWAYS[code].taskTypes.flatMap((t) => [
    { taskTypeKey: t.key, skill: t.skill, kind: "LESSON" as const, mode: "learn" as const, title: `L ${t.name}`, minutes: t.minutes, isGap: false, refType: "EXAM_TOPIC", refId: `l-${t.key}` },
    { taskTypeKey: t.key, skill: t.skill, kind: "PRACTICE" as const, mode: "practice" as const, title: `P ${t.name}`, minutes: t.minutes, isGap: !t.practiceSlugs, refId: `p-${t.key}` },
  ]);
}

function input(code: keyof typeof PATHWAYS, over: Partial<PlannerInput> = {}): PlannerInput {
  return {
    weekStart: "2026-09-21",
    fromDay: "2026-09-21",
    studyDays: [1, 2, 3, 4, 6],
    dailyMinutes: 60,
    pathway: PATHWAYS[code],
    focusSkills: ["writing" as SkillKey],
    activities: activitiesFor(code),
    vocab: { available: true, href: "/v" },
    mistakes: { available: true, href: "/m" },
    mock: { taskTypeKey: "mock", skill: "reading", kind: "MOCK", mode: "practice", title: "Deneme 1", minutes: 60, isGap: false },
    timedPractice: null,
    daysUntilExam: 30,
    weekIndex: 0,
    copy,
    ...over,
  };
}

test("time helpers work in Europe/Istanbul", () => {
  const d = new Date("2026-09-23T22:30:00Z"); // 01:30 on the 24th in Istanbul (UTC+3)
  assert.equal(dayKey(d, "Europe/Istanbul"), "2026-09-24");
  assert.equal(localTime(d, "Europe/Istanbul"), "01:30");
  assert.equal(weekStartOf("2026-09-24"), "2026-09-21");
  assert.equal(isoWeekday("2026-09-27"), 7);
  assert.equal(addDays("2026-09-30", 1), "2026-10-01");
  assert.equal(inQuietHours("23:10", "22:00", "08:00"), true);
  assert.equal(inQuietHours("07:59", "22:00", "08:00"), true);
  assert.equal(inQuietHours("12:00", "22:00", "08:00"), false);
});

test("scores snap to each exam's own scale", () => {
  assert.equal(parseScore("6,5", PATHWAYS.IELTS.overall), 6.5);
  assert.equal(parseScore("9.5", PATHWAYS.IELTS.overall), null);
  assert.equal(parseScore("4.5", PATHWAYS.TOEFL.overall), 4.5);
  assert.equal(parseScore("100", PATHWAYS.TOEFL.overall), null, "old 0–120 scale values are rejected for the 1–6 scale");
  assert.equal(parseScore("79", PATHWAYS.PTE.overall), 79);
  assert.equal(parseScore("5", PATHWAYS.PTE.overall), null);
  assert.equal(parseScore("72.5", PATHWAYS.YDS.overall), 72.5);
});

test("IELTS plan covers all four skills, fits the daily time, rests on non-study days", () => {
  const tasks = generateWeekPlan(input("IELTS"));
  const skills = new Set(tasks.map((t) => t.skill));
  for (const s of ["reading", "listening", "writing", "speaking"]) assert.ok(skills.has(s as SkillKey), `missing ${s}`);
  const byDay = Map.groupBy(tasks, (t) => t.date);
  assert.ok(!byDay.has("2026-09-25"), "Friday is not a study day");
  assert.ok(!byDay.has("2026-09-27"), "Sunday is not a study day");
  for (const [date, list] of byDay) {
    const total = list.reduce((n, t) => n + t.minutes, 0);
    const hasMock = list.some((t) => t.kind === "MOCK");
    assert.ok(hasMock || total <= 60, `${date} exceeds budget: ${total}`);
    assert.equal(list[0].kind, "VOCAB_REVIEW", "each day starts with spaced revision");
  }
  assert.equal(tasks.filter((t) => t.kind === "MOCK").length, 1, "one mock a week");
  assert.ok(tasks.some((t) => t.kind === "MISTAKE_REVIEW"));
  assert.ok(tasks.every((t) => t.busyMinutes === null || t.kind === "VOCAB_REVIEW" || t.kind === "MISTAKE_REVIEW"), "busy day keeps only revision");
});

test("weak skills get more turns", () => {
  const tasks = generateWeekPlan(input("IELTS", { focusSkills: ["writing"], mock: null }));
  const count = (s: string) => tasks.filter((t) => t.skill === s).length;
  assert.ok(count("writing") >= count("speaking"), `writing ${count("writing")} vs speaking ${count("speaking")}`);
});

test("YDS/YÖKDİL/YDT plans use only their assessed skills", () => {
  for (const code of ["YDS", "YOKDIL", "YDT"] as const) {
    const tasks = generateWeekPlan(input(code, { focusSkills: ["grammar"] }));
    for (const t of tasks) assert.ok(t.skill === null || PATHWAYS[code].skills.includes(t.skill), `${code}: unexpected ${t.skill}`);
    assert.ok(!tasks.some((t) => t.skill === "speaking" || t.skill === "listening"));
  }
});

test("TOEFL and PTE plans follow their current task types", () => {
  assert.ok(PATHWAYS.TOEFL.taskTypes.some((t) => t.name === "Build a Sentence"));
  assert.ok(PATHWAYS.TOEFL.taskTypes.some((t) => t.name === "Take an Interview"));
  assert.ok(PATHWAYS.PTE.taskTypes.some((t) => t.name === "Respond to a Situation"));
  const tasks = generateWeekPlan(input("PTE"));
  assert.ok(new Set(tasks.map((t) => t.skill)).has("speaking"));
});

test("mid-week onboarding plans only from today; 7-day students get a light Sunday", () => {
  const tasks = generateWeekPlan(input("YDS", { fromDay: "2026-09-24", studyDays: [1, 2, 3, 4, 5, 6, 7] }));
  assert.ok(tasks.every((t) => t.date >= "2026-09-24"));
  const sunday = tasks.filter((t) => t.date === "2026-09-27");
  assert.ok(sunday.length > 0 && sunday.every((t) => t.kind === "VOCAB_REVIEW" || t.kind === "MISTAKE_REVIEW"));
});

test("vocabulary is never mastered on a single correct answer", () => {
  const now = new Date("2026-09-24T10:00:00Z");
  let s = { box: 1, reviews: 0, lapses: 0 };
  const first = reviewVocab(s, true, now);
  assert.equal(first.mastered, false);
  for (let i = 0; i < 3; i++) s = reviewVocab(s, true, now);
  const r = reviewVocab(s, true, now);
  assert.equal(r.box, 5);
  assert.equal(r.mastered, true);
  const miss = reviewVocab({ box: 4, reviews: 5, lapses: 0 }, false, now);
  assert.equal(miss.box, 1);
  assert.equal(miss.lapses, 1);
});

test("mistakes need correct retries on three different days", () => {
  const now = new Date("2026-09-24T10:00:00Z");
  let st = { correctStreak: 0, timesWrong: 1, lastRetryDay: null as string | null };
  const a = retryMistake(st, true, now, "2026-09-24");
  const sameDay = retryMistake({ ...st, correctStreak: a.correctStreak, lastRetryDay: a.lastRetryDay }, true, now, "2026-09-24");
  assert.equal(sameDay.correctStreak, 1, "same-day repeats don't count twice");
  st = { correctStreak: a.correctStreak, timesWrong: 1, lastRetryDay: "2026-09-24" };
  const b = retryMistake(st, true, now, "2026-09-25");
  const c = retryMistake({ correctStreak: b.correctStreak, timesWrong: 1, lastRetryDay: "2026-09-25" }, true, now, "2026-09-28");
  assert.equal(b.mastered, false);
  assert.equal(c.mastered, true);
  const wrong = retryMistake({ correctStreak: 2, timesWrong: 1, lastRetryDay: "2026-09-25" }, false, now, "2026-09-26");
  assert.equal(wrong.correctStreak, 0);
  assert.equal(wrong.timesWrong, 2);
});

test("follow-ups respect preferences, quiet hours, pause and throttling", () => {
  const base: DeliveryPrefs = { enabled: true, notifyInApp: true, frequency: "NORMAL", pausedUntil: null, quietStart: "22:00", quietEnd: "08:00", timezone: "Europe/Istanbul" };
  const c = (kind: FollowUpCandidate["kind"]): FollowUpCandidate => ({ kind, dedupeKey: kind, title: kind, href: "/" });
  const noon = new Date("2026-09-24T09:00:00Z"); // 12:00 Istanbul
  const night = new Date("2026-09-24T20:30:00Z"); // 23:30 Istanbul
  assert.equal(decideFollowUps([c("VOCAB_DUE")], base, noon, 0)[0].action, "SEND");
  assert.equal(decideFollowUps([c("VOCAB_DUE")], base, night, 0)[0].action, "DEFER");
  assert.equal(decideFollowUps([c("VOCAB_DUE")], { ...base, enabled: false }, noon, 0)[0].action, "SKIP");
  assert.equal(decideFollowUps([c("VOCAB_DUE")], { ...base, notifyInApp: false }, noon, 0)[0].action, "SKIP");
  assert.equal(decideFollowUps([c("VOCAB_DUE")], { ...base, pausedUntil: new Date("2026-09-30T00:00:00Z") }, noon, 0)[0].action, "SKIP");
  assert.equal(decideFollowUps([c("VOCAB_DUE")], { ...base, frequency: "LOW" }, noon, 0)[0].action, "SKIP");
  assert.equal(decideFollowUps([c("WEEKLY_REPORT")], { ...base, frequency: "LOW" }, noon, 0)[0].action, "SEND");
  const throttled = decideFollowUps([c("MISSED"), c("PLAN_CHECK")], base, noon, 3);
  assert.equal(throttled[0].action, "SKIP");
  assert.equal(throttled[1].action, "SEND");
});

test("plan adjustments are suggested, sized sensibly", () => {
  assert.equal(suggestAdjustment({ plannedCount: 10, doneCount: 8, dailyMinutes: 60, studyDays: [1, 2, 3], ignoredReminders: 0 }), null);
  const low = suggestAdjustment({ plannedCount: 10, doneCount: 3, dailyMinutes: 60, studyDays: [1, 2, 3], ignoredReminders: 0 });
  assert.equal(low?.reason, "LOW_COMPLETION");
  assert.equal(low?.dailyMinutes, 45);
  const floor = suggestAdjustment({ plannedCount: 10, doneCount: 1, dailyMinutes: 15, studyDays: [1, 2, 3, 4], ignoredReminders: 0 });
  assert.deepEqual(floor?.studyDays, [1, 2, 3]);
  const more = suggestAdjustment({ plannedCount: 10, doneCount: 10, dailyMinutes: 30, studyDays: [1], ignoredReminders: 0, checkIn: { manageable: "EASY", workloadChange: "MORE", blockers: [] } });
  assert.equal(more?.dailyMinutes, 35);
});

test("local day ranges follow the student's time zone", async () => {
  const { localDayRange } = await import("../lib/coaching/time");
  const r = localDayRange("2026-09-24", "Europe/Istanbul");
  assert.equal(r.start.toISOString(), "2026-09-23T21:00:00.000Z");
  assert.equal(r.end.toISOString(), "2026-09-24T21:00:00.000Z");
  const ny = localDayRange("2026-09-24", "America/New_York");
  assert.equal(ny.start.toISOString(), "2026-09-24T04:00:00.000Z");
});
