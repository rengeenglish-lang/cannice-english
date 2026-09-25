/**
 * Builds a filming-ready demo student ("Elif Yılmaz", YDS, target 75) by driving the real
 * services — level test, practice, mock exams, coaching plan, vocabulary — so every screen
 * recorded for the ad shows genuine, internally consistent data.
 *
 * Local databases only. Re-running deletes and recreates the demo student.
 *
 *   DATABASE_URL=postgresql://…localhost…/db npx tsx --conditions=react-server scripts/film-demo.mts
 *
 * Log in afterwards as film@netfener.demo / NetfenerFilm2026!
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { db } from "../server/db";
import { startLevelTestAttempt, retakeLevelTestAttempt, findOrCreateMasteryCheckAttempt, findOrCreatePracticeAttempt, findOrCreateMockExamAttempt, submitAnswer, finishAttempt } from "../server/services/diagnostic-attempts.service";
import { saveOnboarding, getCoachingProfile } from "../server/services/coaching/profile.service";
import { refreshCoaching } from "../server/services/coaching/coaching.service";
import { getWeekTasks, completeTask, todayKeyFor } from "../server/services/coaching/plan.service";
import { reviewCard, dueVocab } from "../server/services/coaching/vocab.service";
import { setWordStatus, recordSetTest } from "../server/services/lexicon.service";
import { setWords } from "../lib/vocabulary/content";
import { weekStartOf, dateToDayKey } from "../lib/coaching/time";

const EMAIL = "film@netfener.demo";
const PASSWORD = "NetfenerFilm2026!";
const DAY = 86_400_000;

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url) && process.env.FILM_DEMO_ALLOW_REMOTE !== "1") {
  throw new Error("film-demo only runs against a local database (set FILM_DEMO_ALLOW_REMOTE=1 to override).");
}

const scrypt = promisify(scryptCb) as (p: string, s: Buffer, n: number) => Promise<Buffer>;
async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${(await scrypt(password, salt, 64)).toString("hex")}`;
}

/** Deterministic pseudo-random so every run produces the same story. */
let seed = 20260925;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

/** Per-topic skill profile: strong vocabulary, shaky reading & paragraph questions. */
function accuracyFor(slug: string, lift: number) {
  const base: Record<string, number> = {
    "kelime-bilgisi": 0.72, "dil-bilgisi": 0.6, zamanlar: 0.64, "modal-fiiller": 0.55, baglaclar: 0.5,
    "edilgen-cati": 0.58, "kosul-cumleleri": 0.5, "sifat-cumlecikleri": 0.52, "ulac-mastar": 0.56,
    "cloze-test": 0.5, "cumle-tamamlama": 0.48, "ceviri-en-tr": 0.55, "ceviri-tr-en": 0.5,
    okuma: 0.36, "paragraf-tamamlama": 0.3, "anlamda-en-yakin-cumle": 0.4,
  };
  return Math.min(0.95, (base[slug] ?? 0.5) + lift);
}

async function answerAll(attemptId: string, userId: string, lift: number) {
  const attempt = await db.diagnosticAttempt.findUniqueOrThrow({ where: { id: attemptId } });
  const questions = await db.diagnosticQuestion.findMany({ where: { id: { in: attempt.questionOrder } }, include: { topic: { select: { slug: true } } } });
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const id of attempt.questionOrder) {
    const q = byId.get(id)!;
    const options = Array.isArray(q.options) ? q.options : [];
    const correct = rand() < accuracyFor(q.topic.slug, lift);
    let answer = q.correctAnswer ?? "0";
    if (!correct && options.length > 1) {
      const wrong = [...options.keys()].map(String).filter((k) => k !== q.correctAnswer);
      answer = wrong[Math.floor(rand() * wrong.length)] ?? answer;
    }
    await submitAnswer(attemptId, userId, id, answer);
  }
  await finishAttempt(attemptId, userId);
}

/** Moves an attempt (and its results) into the past so the progress timeline has history. */
async function backdate(attemptId: string, daysAgo: number, minutes = 40) {
  const done = new Date(Date.now() - daysAgo * DAY);
  done.setHours(20, 30, 0, 0);
  const started = new Date(done.getTime() - minutes * 60_000);
  await db.diagnosticAttempt.update({ where: { id: attemptId }, data: { startedAt: started, completedAt: done } });
  await db.$executeRaw`UPDATE diagnostic_responses SET "createdAt" = ${done} WHERE "attemptId" = ${attemptId}`.catch(() => undefined);
  await db.$executeRaw`UPDATE diagnostic_topic_results SET "createdAt" = ${done} WHERE "attemptId" = ${attemptId}`.catch(() => undefined);
}

async function main() {
  await db.user.deleteMany({ where: { email: EMAIL } });
  const user = await db.user.create({ data: { email: EMAIL, name: "Elif Yılmaz", role: "STUDENT", password: await hashPassword(PASSWORD) } });
  await db.planSubscription.create({ data: { userId: user.id, tier: "UZMAN", expiresAt: new Date(Date.now() + 120 * DAY) } });

  // 1. Coaching onboarding: YDS, target 75, six study days, 60 minutes a day.
  const onboarded = await saveOnboarding(user.id, { pathway: "YDS", examVersion: "YDS", targetScore: "75", studyDays: [1, 2, 3, 4, 5, 6], dailyMinutes: 60, reminderTime: "20:00", syncGoal: true });
  if (!onboarded.ok) throw new Error(`onboarding failed: ${JSON.stringify(onboarded)}`);
  const goal = await db.examGoal.findFirstOrThrow({ where: { userId: user.id, isActive: true } });
  const examType = await db.examType.findUniqueOrThrow({ where: { id: goal.examTypeId } });
  const family = "TRANSLATION_GRAMMAR" as const;

  // 2. Level test three weeks ago — the "lost" starting point.
  const level = (await startLevelTestAttempt(user.id, { id: examType.id, code: examType.code }, family, goal.id)).attempt!;
  await answerAll(level.id, user.id, 0);
  await backdate(level.id, 21, 55);

  // 3. Targeted practice on the weak areas, getting steadily better.
  const topics = await db.diagnosticTopic.findMany({ where: { slug: { in: ["okuma", "paragraf-tamamlama", "anlamda-en-yakin-cumle", "baglaclar", "kosul-cumleleri", "cumle-tamamlama"] } } });
  const bySlug = new Map(topics.map((t) => [t.slug, t.id]));
  const practicePlan: [string, number, number][] = [
    ["okuma", 19, 0.05], ["paragraf-tamamlama", 17, 0.1], ["baglaclar", 15, 0.15], ["okuma", 13, 0.18],
    ["anlamda-en-yakin-cumle", 11, 0.2], ["kosul-cumleleri", 9, 0.22], ["paragraf-tamamlama", 6, 0.28], ["okuma", 4, 0.32],
    ["cumle-tamamlama", 2, 0.3],
  ];
  for (const [slug, daysAgo, lift] of practicePlan) {
    const topicId = bySlug.get(slug);
    if (!topicId) continue;
    const p = (await findOrCreatePracticeAttempt(user.id, examType.id, examType.code, family, goal.id, topicId)).attempt;
    if (!p) continue;
    await answerAll(p.id, user.id, lift);
    await backdate(p.id, daysAgo, 25);
  }

  // 4. Two full mock exams: a clear upward trend.
  for (const [setNumber, daysAgo, lift] of [[1, 10, 0.12], [2, 1, 0.26]] as const) {
    const m = (await findOrCreateMockExamAttempt(user.id, examType.id, examType.code, family, goal.id, setNumber)).attempt;
    if (!m) continue;
    await answerAll(m.id, user.id, lift);
    await backdate(m.id, daysAgo, 150);
  }

  // 4b. Mastery checks passed on topics she has worked on, so the prep roadmap shows progress.
  const roadmap = await db.studyRoadmapItem.findMany({ where: { userId: user.id, goalId: goal.id }, include: { topic: { select: { slug: true } } }, orderBy: { priorityRank: "asc" } });
  const mastered = roadmap.filter((r) => ["zamanlar", "kelime-bilgisi", "edilgen-cati", "modal-fiiller", "baglaclar", "ulac-mastar"].includes(r.topic.slug));
  for (const [i, item] of mastered.entries()) {
    const m = (await findOrCreateMasteryCheckAttempt(user.id, examType.id, examType.code, family, goal.id, item.topicId)).attempt;
    if (!m) continue;
    await answerAll(m.id, user.id, 0.45);
    await backdate(m.id, 8 - i, 15);
  }

  // 4c. Konu Anlatımı lessons read (the "Okunan Konu Anlatımı" count on the progress report).
  const lessons = await db.topicLesson.findMany({ where: { topic: { examTypeId: examType.id, name: { in: ["Paragraf Soruları", "Tense (Zaman) Soruları", "Kelime – Phrasal Verb Soruları", "Çeviri Soruları"] } } }, select: { id: true } });
  for (const [i, l] of lessons.entries()) {
    const at = new Date(Date.now() - (18 - i) * DAY);
    await db.topicLessonProgress.create({ data: { userId: user.id, topicLessonId: l.id, completedAt: at, createdAt: at } });
  }

  // 5. A level-test retake left open, so the "taking the test" screen can be filmed mid-way.
  const retake = (await retakeLevelTestAttempt(user.id, level.id, goal.id)).attempt;
  if (retake) {
    const firstFive = retake.questionOrder.slice(0, 5);
    for (const id of firstFive) {
      const q = await db.diagnosticQuestion.findUniqueOrThrow({ where: { id } });
      await submitAnswer(retake.id, user.id, id, q.correctAnswer ?? "0");
    }
  }

  // 6. Coaching week: plan generated on Monday, Monday–yesterday completed, today half done.
  await db.coachingProfile.update({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 22 * DAY) } });
  const profile = (await getCoachingProfile(user.id))!;
  const todayKey = todayKeyFor(profile);
  const weekKey = weekStartOf(todayKey);
  const monday = new Date(`${weekKey}T07:00:00Z`);
  await refreshCoaching(user, monday);
  const tasks = await getWeekTasks(user.id, weekKey);
  let doneToday = 0;
  for (const task of tasks) {
    const key = dateToDayKey(task.date);
    if (task.status === "DONE") continue;
    if (key < todayKey || (key === todayKey && doneToday++ < 2)) await completeTask(user.id, task.id, task.minutes);
  }
  for (const card of (await dueVocab(user.id)).slice(0, 12)) await reviewCard(user.id, card.id, rand() < 0.8);
  await db.coachingProfile.update({ where: { userId: user.id }, data: { lastSyncedAt: new Date(Date.now() - DAY) } });
  await refreshCoaching(user);

  // 7. Kelime Motoru: B1 sets 1–3 studied and tested, a few words still in review.
  for (const n of [1, 2, 3]) {
    const words = setWords("B1", n);
    for (const [i, w] of words.entries()) await setWordStatus(user.id, w, i % 6 === 0 ? "LEARNING" : "KNOWN");
    await recordSetTest(user.id, "B1", n, 20 - (n === 1 ? 4 : n === 2 ? 2 : 1), 20, []);
  }

  const summary = await db.diagnosticAttempt.findMany({ where: { userId: user.id, status: "COMPLETED" }, include: { responses: { select: { isCorrect: true } } }, orderBy: { completedAt: "asc" } });
  for (const a of summary) {
    const correct = a.responses.filter((r) => r.isCorrect).length;
    console.log(`${a.kind.padEnd(16)} ${a.completedAt?.toISOString().slice(0, 10)}  ${correct}/${a.questionOrder.length} (${Math.round((100 * correct) / a.questionOrder.length)}%)`);
  }
  const week = await getWeekTasks(user.id, weekKey);
  const rm = await db.studyRoadmapItem.findMany({ where: { userId: user.id, goalId: goal.id } });
  console.log(`roadmap: ${rm.filter((r) => r.status === "COMPLETED").length}/${rm.length} completed; lessons read: ${lessons.length}`);
  console.log(`coaching week ${weekKey}: ${week.filter((t) => t.status === "DONE").length}/${week.length} tasks done`);
  console.log(`\nLog in as ${EMAIL} / ${PASSWORD}`);
}

main().finally(() => db.$disconnect());
