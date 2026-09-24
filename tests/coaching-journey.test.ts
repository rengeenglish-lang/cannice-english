import assert from "node:assert/strict";
import { after, test } from "node:test";
import { db } from "../server/db";
import { dateToDayKey, dayKey, localDayRange, weekStartOf, addDays } from "../lib/coaching/time";
import { getCoachingProfile, saveOnboarding, updateCoachingSettings, deleteCoachingData } from "../server/services/coaching/profile.service";
import { refreshCoaching } from "../server/services/coaching/coaching.service";
import { applyBusyDay, decideProposal, getWeekTasks, moveTask, pendingProposals, refreshProposals, startTask, todayKeyFor, addCustomTask } from "../server/services/coaching/plan.service";
import { reviewCard, dueVocab } from "../server/services/coaching/vocab.service";
import { retryNotebookQuestion } from "../server/services/coaching/notebook.service";
import { runFollowUps } from "../server/services/coaching/followups.service";
import { ensureReports, buildReport } from "../server/services/coaching/reports.service";
import { saveCheckIn } from "../server/services/coaching/checkin.service";

const stamp = Date.now();
const created: { examTypeId?: string; diagTopicId?: string; userIds: string[]; questionIds: string[] } = { userIds: [], questionIds: [] };

after(async () => {
  await db.user.deleteMany({ where: { id: { in: created.userIds } } });
  await db.diagnosticQuestion.deleteMany({ where: { id: { in: created.questionIds } } });
  if (created.diagTopicId) await db.diagnosticTopic.delete({ where: { id: created.diagTopicId } });
  if (created.examTypeId) await db.examType.delete({ where: { id: created.examTypeId } });
  await db.$disconnect();
});

/** Minimal YDS content: one glossary lesson (vocabulary source) and one practice topic with questions. */
async function seedYds() {
  let examType = await db.examType.findUnique({ where: { slug: "yds" } });
  if (!examType) {
    examType = await db.examType.create({ data: { code: "YDS", slug: "yds", name: "YDS" } });
    created.examTypeId = examType.id;
  }
  const words = ["abandon – terk etmek", "abundant – bol", "accurate – doğru, kesin", "acquire – edinmek", "adequate – yeterli", "adjacent – bitişik"];
  await db.examTopic.create({
    data: {
      examTypeId: examType.id,
      name: `Kelime ${stamp}`,
      slug: `kelime-phrasal-verb`,
      lessons: { create: { title: "Akademik Kelime Sözlüğü", position: 1, contentBody: words.map((w) => `${w}\nÖrnek: Example sentence.`).join("\n\n") } },
    },
  }).catch(async () => undefined);
  let topic = await db.diagnosticTopic.findUnique({ where: { slug: "kelime-bilgisi" } });
  if (!topic) {
    topic = await db.diagnosticTopic.create({ data: { slug: "kelime-bilgisi", name: "Kelime Bilgisi", kind: "TOPIC", examFamilies: ["TRANSLATION_GRAMMAR"], isActive: true } });
    created.diagTopicId = topic.id;
  }
  for (let i = 0; i < 3; i++) {
    const q = await db.diagnosticQuestion.create({
      data: { examFamily: "TRANSLATION_GRAMMAR", examTypeId: examType.id, topicId: topic.id, questionType: "MCQ", prompt: `Q${i} ${stamp}`, options: ["a", "b", "c", "d"], correctAnswer: "1", explanation: "Because b.", isActive: true },
    });
    created.questionIds.push(q.id);
  }
  return { examType, topic };
}

async function newUser(role: "STUDENT" | "TEACHER", tag: string) {
  const u = await db.user.create({ data: { email: `coach-${tag}-${stamp}@test.local`, name: "Koçluk Test", role } });
  created.userIds.push(u.id);
  return { id: u.id, role: u.role as string };
}

const onboarding = { pathway: "YDS", examVersion: "YDS", targetScore: "70", studyDays: [1, 2, 3, 4, 5, 6, 7], dailyMinutes: 60, reminderTime: "19:00", syncGoal: true };

test("coaching journey: onboarding → plan → activity → progress → follow-up → report → delete", async () => {
  const { examType } = await seedYds();
  const user = await newUser("TEACHER", "journey"); // staff role = all plan content unlocked

  // Onboarding validates on the exam's own scale and requires guardian consent for minors.
  assert.deepEqual(await saveOnboarding(user.id, { ...onboarding, targetScore: "120" }), { ok: false, error: "score" });
  assert.deepEqual(await saveOnboarding(user.id, { ...onboarding, isMinor: true }), { ok: false, error: "guardian" });
  assert.deepEqual(await saveOnboarding(user.id, onboarding), { ok: true });
  const goal = await db.examGoal.findFirst({ where: { userId: user.id, isActive: true } });
  assert.equal(goal?.examTypeId, examType.id, "site exam goal follows the coaching exam");

  // First refresh builds this week's plan and pulls site vocabulary into the deck.
  let profile = (await refreshCoaching(user))!;
  const todayKey = todayKeyFor(profile);
  const week = weekStartOf(todayKey);
  let tasks = await getWeekTasks(user.id, week);
  assert.ok(tasks.length > 0, "a plan was generated");
  assert.ok(tasks.every((x) => dateToDayKey(x.date) >= todayKey), "no tasks before onboarding day");
  assert.ok(tasks.some((x) => x.kind === "LEVEL_TEST"), "level test offered to a student without one");
  assert.equal(await db.vocabCard.count({ where: { userId: user.id, source: "SITE" } }), 6);
  const practice = tasks.find((x) => (x.kind === "PRACTICE" || x.kind === "TIMED_PRACTICE") && x.refType === "DIAGNOSTIC_TOPIC");
  assert.ok(practice, "plan links the real Pratik Bankası topic");
  assert.ok(tasks.every((x) => !x.href || x.href.startsWith("/")), "only internal links");

  // Rescheduling: move the practice task to today, start it (creates the real attempt).
  await moveTask(user.id, practice!.id, todayKey);
  const href = await startTask(user.id, practice!.id);
  assert.match(href ?? "", /^\/dashboard\/sinav\//);
  const linked = await db.studyTask.findUnique({ where: { id: practice!.id } });
  assert.ok(linked?.attemptId);

  // Learning activity: finish the attempt with one wrong answer.
  const [q0, q1, q2] = created.questionIds;
  await db.diagnosticResponse.createMany({ data: [{ attemptId: linked!.attemptId!, questionId: q0, answerRaw: "0", isCorrect: false }, { attemptId: linked!.attemptId!, questionId: q1, answerRaw: "1", isCorrect: true }, { attemptId: linked!.attemptId!, questionId: q2, answerRaw: "1", isCorrect: true }] });
  await db.diagnosticAttempt.update({ where: { id: linked!.attemptId! }, data: { status: "COMPLETED", completedAt: new Date(), questionOrder: [q0, q1, q2] } });

  // Vocabulary review of five cards.
  for (const card of (await dueVocab(user.id)).slice(0, 5)) await reviewCard(user.id, card.id, true);

  // Progress update: the next refresh ticks tasks from real activity and fills the notebook.
  await db.coachingProfile.update({ where: { userId: user.id }, data: { lastSyncedAt: new Date(Date.now() - 60_000) } });
  profile = (await refreshCoaching(user))!;
  tasks = await getWeekTasks(user.id, week);
  const practiceAfter = tasks.find((x) => x.id === practice!.id)!;
  assert.equal(practiceAfter.status, "DONE");
  assert.equal(practiceAfter.completion, "AUTO");
  const todayVocab = tasks.find((x) => x.kind === "VOCAB_REVIEW" && dateToDayKey(x.date) === todayKey);
  if (todayVocab) assert.equal(todayVocab.status, "DONE", "vocab review task auto-completes after reviews");
  const mistake = await db.mistakeEntry.findFirst({ where: { userId: user.id, questionId: q0 } });
  assert.ok(mistake, "wrong answer collected into the notebook");
  // A single correct retry doesn't master it.
  const retry = await retryNotebookQuestion(user.id, mistake!.id, "1", todayKey);
  assert.equal(retry?.correct, true);
  assert.equal(retry?.mastered, false);

  // Follow-ups at midday Istanbul time: sent once, never duplicated.
  const noon = new Date(localDayRange(todayKey, profile.timezone).start.getTime() + 12 * 3_600_000);
  const first = await runFollowUps(user.id, todayKey, noon);
  assert.ok(first.sent >= 1, "at least one follow-up delivered");
  const second = await runFollowUps(user.id, todayKey, noon);
  assert.equal(second.sent, 0, "duplicate prevention");
  const notes = await db.notification.findMany({ where: { userId: user.id } });
  assert.equal(notes.length, first.sent);
  // Quiet hours defer instead of sending.
  const night = new Date(localDayRange(todayKey, profile.timezone).start.getTime() + 23 * 3_600_000);
  await db.coachingNotificationLog.deleteMany({ where: { userId: user.id } });
  assert.equal((await runFollowUps(user.id, todayKey, night)).sent, 0);
  assert.equal(await db.coachingNotificationLog.count({ where: { userId: user.id } }), 0, "deferred, not logged");

  // Opt-out: with in-app reminders off nothing is sent, and it's recorded as skipped.
  await updateCoachingSettings(user.id, { notifyInApp: false, frequency: "NORMAL", quietStart: "22:00", quietEnd: "08:00", reminderTime: "19:00", pauseDays: -1, timezone: "Europe/Istanbul", locale: "tr" });
  const before = await db.notification.count({ where: { userId: user.id } });
  assert.equal((await runFollowUps(user.id, todayKey, noon)).sent, 0);
  assert.equal(await db.notification.count({ where: { userId: user.id } }), before);
  assert.ok((await db.coachingNotificationLog.findMany({ where: { userId: user.id } })).every((l) => l.status === "SKIPPED_PREFS"));

  // Weekly check-in → a lighter-plan proposal that only applies once accepted.
  profile = (await getCoachingProfile(user.id))!;
  await saveCheckIn(profile, week, { manageable: "HARD", workloadChange: "LESS", blockers: ["TIME"], hardestSkills: ["reading"] });
  await refreshProposals(profile, todayKey);
  const proposals = await pendingProposals(user.id);
  const settings = proposals.find((p) => p.reason === "CHECKIN_LESS");
  assert.ok(settings, "check-in produced a proposal");
  assert.equal((await getCoachingProfile(user.id))!.dailyMinutes, 60, "nothing changes before confirmation");
  await decideProposal(profile, user, settings!.id, true, todayKey);
  assert.equal((await getCoachingProfile(user.id))!.dailyMinutes, 45);
  await refreshProposals((await getCoachingProfile(user.id))!, todayKey);
  assert.ok(!(await pendingProposals(user.id)).some((p) => p.reason === "CHECKIN_LESS"), "the same check-in isn't proposed twice");
  assert.equal((await db.studyTask.findUnique({ where: { id: practice!.id } }))?.status, "DONE", "completed work survives re-planning");

  // Busy day keeps only short revision.
  await applyBusyDay(user.id, todayKey);
  const busy = (await getWeekTasks(user.id, week)).filter((x) => dateToDayKey(x.date) === todayKey && x.status === "PLANNED");
  assert.ok(busy.every((x) => x.kind === "VOCAB_REVIEW" || x.kind === "MISTAKE_REVIEW"));

  // Report from real data, including an honest note on what's missing.
  const report = await buildReport((await getCoachingProfile(user.id))!, week, todayKey);
  assert.ok(report.tasks.done >= 1);
  assert.ok(report.vocab.reviewed >= 5);
  assert.ok(report.insufficient.some((x) => x.tr.includes("deneme")), "no mocks → says so");
  assert.ok(report.recommendation.tr.length > 10);

  // Weekly report is filed once last week is over, and announced as an essential follow-up.
  const lastWeekDay = addDays(week, -3);
  await addCustomTask(user.id, { title: "Geçen haftanın görevi", minutes: 20, date: lastWeekDay });
  await db.coachingProfile.update({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 20 * 86_400_000), notifyInApp: true } });
  const filed = await ensureReports((await getCoachingProfile(user.id))!, todayKey);
  assert.ok(filed.some((r) => r.kind === "WEEKLY"));
  assert.equal((await ensureReports((await getCoachingProfile(user.id))!, todayKey)).length, 0, "report filed once");
  await db.coachingNotificationLog.deleteMany({ where: { userId: user.id } });
  await runFollowUps(user.id, todayKey, noon);
  assert.ok(await db.coachingNotificationLog.findFirst({ where: { userId: user.id, kind: "WEEKLY_REPORT", status: "SENT" } }));

  // Privacy: deleting coaching data removes every coaching record and its notifications only.
  const attempts = await db.diagnosticAttempt.count({ where: { userId: user.id } });
  await deleteCoachingData(user.id);
  for (const count of await Promise.all([
    db.coachingProfile.count({ where: { userId: user.id } }),
    db.studyTask.count({ where: { userId: user.id } }),
    db.vocabCard.count({ where: { userId: user.id } }),
    db.mistakeEntry.count({ where: { userId: user.id } }),
    db.coachingReport.count({ where: { userId: user.id } }),
    db.coachingNotificationLog.count({ where: { userId: user.id } }),
    db.notification.count({ where: { userId: user.id } }),
  ])) assert.equal(count, 0);
  assert.equal(await db.diagnosticAttempt.count({ where: { userId: user.id } }), attempts, "exam history untouched");
});

test("a student without a plan still gets a full free plan, never locked links", async () => {
  await seedYds();
  const user = await newUser("STUDENT", "free");
  assert.deepEqual(await saveOnboarding(user.id, { ...onboarding, studyDays: [2, 4], dailyMinutes: 30 }), { ok: true });
  const profile = (await refreshCoaching(user))!;
  const tasks = await getWeekTasks(user.id, weekStartOf(todayKeyFor(profile)));
  assert.ok(!tasks.some((x) => x.kind === "PRACTICE" || x.kind === "MOCK"), "no paid practice/mocks linked");
  assert.ok(tasks.every((x) => [2, 4].includes(new Date(x.date).getUTCDay())), "only on chosen study days");
  // Disabling stops everything; a disabled profile isn't refreshed or reminded.
  await db.coachingProfile.update({ where: { userId: user.id }, data: { enabled: false } });
  assert.equal((await runFollowUps(user.id, dayKey(new Date()))).sent, 0);
});
