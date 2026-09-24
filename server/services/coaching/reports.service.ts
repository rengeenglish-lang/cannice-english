import "server-only";
import { db } from "@/server/db";
import { pathwayConfig, SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { addDays, dateToDayKey, dayKeyToDate, daysBetween, localDayRange, weekStartOf } from "@/lib/coaching/time";
import { examPerformance, mockHistory, recordedMinutes, type MockResult, type SkillStat } from "@/server/services/coaching/insights.service";
import { recurringMistakeTopics } from "@/server/services/coaching/notebook.service";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

/** A sentence in both coaching languages, so a report reads correctly after the student switches language. */
export type Bilingual = { tr: string; en: string };

export type ReportData = {
  period: { start: string; end: string };
  exam: { pathway: string; version: string; targetScore: string | null; skillTargets: Record<string, string> | null; examDate: string | null };
  tasks: { planned: number; done: number; auto: number; self: number; busySkipped: number; skipped: number; postponed: number; byKind: Record<string, { planned: number; done: number }> };
  consistency: { activeDays: number; studyDaysPlanned: number };
  time: { recordedMinutes: number; selfMinutes: number };
  vocab: { reviewed: number; added: number; mastered: number };
  mistakes: { added: number; retried: number; mastered: number; recurring: { tag: string; times: number }[] };
  skills: { skill: SkillKey; answered: number; accuracy: number | null; prevAnswered: number; prevAccuracy: number | null; blank: number }[];
  mocks: (Omit<MockResult, "date"> & { date: string })[];
  achievements: Bilingual[];
  attention: Bilingual[];
  recommendation: Bilingual;
  insufficient: Bilingual[];
};

const b = (tr: string, en: string): Bilingual => ({ tr, en });
const MIN_ANSWERS = 5;

/**
 * Builds a report for [startKey, endKey] (inclusive local days) from real records only: plan
 * tasks, completed site attempts, vocabulary and notebook reviews. Where a figure can't be
 * computed meaningfully it is listed under `insufficient` rather than guessed.
 */
export async function buildReport(profile: CoachingProfileRow, startKey: string, endKey: string): Promise<ReportData> {
  const userId = profile.userId;
  const tz = profile.timezone;
  const config = pathwayConfig(profile.pathway)!;
  const since = localDayRange(startKey, tz).start;
  const until = localDayRange(endKey, tz).end;
  const length = daysBetween(startKey, endKey) + 1;
  const prevSince = localDayRange(addDays(startKey, -length), tz).start;
  const examType = profile.contentExamSlug ? await db.examType.findUnique({ where: { slug: profile.contentExamSlug } }) : null;
  const examTypeId = examType?.id ?? null;

  const [tasks, perf, prevPerf, mocks, recMinutes, reviewedCards, addedCards, masteredCards, addedMistakes, retriedMistakes, masteredMistakes, recurring, attempts] = await Promise.all([
    db.studyTask.findMany({ where: { userId, date: { gte: dayKeyToDate(startKey), lte: dayKeyToDate(endKey) } } }),
    examPerformance(userId, config, examTypeId, since, until),
    examPerformance(userId, config, examTypeId, prevSince, since),
    mockHistory(userId, config, examTypeId, since, until),
    recordedMinutes(userId, since, until),
    db.vocabCard.findMany({ where: { userId, lastReviewedAt: { gte: since, lt: until } }, select: { lastReviewedAt: true } }),
    db.vocabCard.count({ where: { userId, createdAt: { gte: since, lt: until } } }),
    db.vocabCard.count({ where: { userId, masteredAt: { gte: since, lt: until } } }),
    db.mistakeEntry.count({ where: { userId, createdAt: { gte: since, lt: until } } }),
    db.mistakeEntry.findMany({ where: { userId, lastRetryDay: { gte: startKey, lte: endKey } }, select: { lastRetryDay: true } }),
    db.mistakeEntry.count({ where: { userId, masteredAt: { gte: since, lt: until } } }),
    recurringMistakeTopics(userId, 5),
    db.diagnosticAttempt.findMany({ where: { userId, status: "COMPLETED", completedAt: { gte: since, lt: until } }, select: { completedAt: true } }),
  ]);

  // ---- Plan vs. done ----
  const counted = tasks.filter((t) => t.skipReason !== "BUSY");
  const byKind: ReportData["tasks"]["byKind"] = {};
  for (const t of counted) {
    const k = (byKind[t.kind] ??= { planned: 0, done: 0 });
    k.planned += 1;
    if (t.status === "DONE") k.done += 1;
  }
  const done = counted.filter((t) => t.status === "DONE");
  const taskStats = {
    planned: counted.length,
    done: done.length,
    auto: done.filter((t) => t.completion === "AUTO").length,
    self: done.filter((t) => t.completion === "SELF").length,
    busySkipped: tasks.filter((t) => t.skipReason === "BUSY").length,
    skipped: counted.filter((t) => t.status === "SKIPPED").length,
    postponed: tasks.filter((t) => t.postponedCount > 0).length,
    byKind,
  };

  // ---- Consistency: local days with any recorded study ----
  const activeDays = new Set<string>();
  const toKey = (d: Date | null) => (d ? new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d) : null);
  for (const t of done) activeDays.add(dateToDayKey(t.date));
  for (const a of attempts) { const k = toKey(a.completedAt); if (k) activeDays.add(k); }
  for (const c of reviewedCards) { const k = toKey(c.lastReviewedAt); if (k) activeDays.add(k); }
  for (const m of retriedMistakes) if (m.lastRetryDay) activeDays.add(m.lastRetryDay);
  const studyDaysPlanned = new Set(counted.map((t) => dateToDayKey(t.date))).size;

  // ---- Skills: this period vs. the one before ----
  const prevBySkill = new Map<SkillKey, SkillStat>(prevPerf.skills.map((s) => [s.skill, s]));
  const skills = perf.skills
    .filter((s) => config.skills.includes(s.skill))
    .map((s) => ({ skill: s.skill, answered: s.answered, accuracy: s.accuracy, blank: s.blank, prevAnswered: prevBySkill.get(s.skill)?.answered ?? 0, prevAccuracy: prevBySkill.get(s.skill)?.accuracy ?? null }))
    .sort((a, b) => config.skills.indexOf(a.skill) - config.skills.indexOf(b.skill));

  const label = (s: SkillKey) => SKILL_LABELS[s];
  const rate = taskStats.planned ? taskStats.done / taskStats.planned : null;

  // ---- Achievements (facts, no causal claims) ----
  const achievements: Bilingual[] = [];
  if (taskStats.planned && taskStats.done === taskStats.planned) achievements.push(b("Planladığın görevlerin hepsini tamamladın.", "You completed every planned task."));
  else if (rate !== null && rate >= 0.8) achievements.push(b(`Görevlerinin %${Math.round(rate * 100)}'ini tamamladın.`, `You completed ${Math.round(rate * 100)}% of your tasks.`));
  if (activeDays.size >= 4) achievements.push(b(`${activeDays.size} farklı gün çalıştın.`, `You studied on ${activeDays.size} different days.`));
  if (masteredCards) achievements.push(b(`${masteredCards} kelimeyi öğrenilmiş seviyeye taşıdın.`, `${masteredCards} words reached the learned level.`));
  if (masteredMistakes) achievements.push(b(`Hata defterinden ${masteredMistakes} soruyu farklı günlerde doğru çözerek kapattın.`, `You closed ${masteredMistakes} notebook questions by answering them correctly on different days.`));
  for (const s of skills) {
    if (s.answered >= MIN_ANSWERS && s.prevAnswered >= MIN_ANSWERS && s.accuracy !== null && s.prevAccuracy !== null && s.accuracy - s.prevAccuracy >= 5) {
      achievements.push(b(`${label(s.skill).tr} doğruluğun önceki döneme göre %${s.prevAccuracy}'ten %${s.accuracy}'e çıktı.`, `${label(s.skill).en} accuracy went from ${s.prevAccuracy}% to ${s.accuracy}% compared with the previous period.`));
    }
  }
  if (mocks.length) achievements.push(b(`${mocks.length} deneme sınavı tamamladın.`, `You completed ${mocks.length} mock exam${mocks.length > 1 ? "s" : ""}.`));

  // ---- Areas needing attention ----
  const attention: Bilingual[] = [];
  const weak = skills.filter((s) => s.answered >= MIN_ANSWERS && (s.accuracy ?? 100) < 60).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
  for (const s of weak.slice(0, 2)) attention.push(b(`${label(s.skill).tr}: doğruluk %${s.accuracy} (${s.answered} soru).`, `${label(s.skill).en}: ${s.accuracy}% accuracy (${s.answered} questions).`));
  if (recurring.length) attention.push(b(`Tekrarlayan hatalar: ${recurring.slice(0, 3).map((r) => r.tag).join(", ")}.`, `Recurring mistakes: ${recurring.slice(0, 3).map((r) => r.tag).join(", ")}.`));
  const timedOut = mocks.filter((m) => m.timedOut).length;
  if (timedOut) attention.push(b(`${timedOut} denemede süre doldu; zaman yönetimine dikkat.`, `Time ran out in ${timedOut} mock${timedOut > 1 ? "s" : ""}; watch your timing.`));
  const blanks = mocks.reduce((n, m) => n + m.blank, 0);
  if (blanks >= 5) attention.push(b(`Denemelerde ${blanks} soru boş kaldı.`, `${blanks} questions were left unanswered in mocks.`));
  if (rate !== null && taskStats.planned >= 3 && rate < 0.5) attention.push(b(`Görevlerin %${Math.round(rate * 100)}'i tamamlandı; plan yoğun gelmiş olabilir.`, `${Math.round(rate * 100)}% of tasks were completed; the plan may have been too much.`));
  if (taskStats.postponed >= 3) attention.push(b(`${taskStats.postponed} görev ertelendi.`, `${taskStats.postponed} tasks were postponed.`));

  // ---- One concrete recommendation for next week ----
  const examDateKey = profile.examDate ? dateToDayKey(profile.examDate) : null;
  const daysLeft = examDateKey ? daysBetween(endKey, examDateKey) : null;
  let recommendation: Bilingual;
  if (rate !== null && taskStats.planned >= 3 && rate < 0.5) {
    recommendation = b("Gelecek hafta günlük süreyi biraz azaltıp her gün en az kelime tekrarını tamamlamayı hedefle. Planını Koçluk panelinden sadeleştirebilirsin.", "Next week, lower your daily time a little and aim to finish at least your vocabulary review every day. You can simplify the plan from the coaching dashboard.");
  } else if (weak.length) {
    const w = weak[0];
    recommendation = b(`Gelecek hafta ${label(w.skill).tr} için en az iki pratik görevi tamamla ve yanlışlarını hata defterinde yeniden dene.`, `Next week, complete at least two ${label(w.skill).en.toLowerCase()} practice tasks and retry your mistakes in the notebook.`);
  } else if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 21 && config.siteMock) {
    recommendation = b("Sınavına az kaldı: gelecek hafta süreli bir deneme çöz ve süre kullanımını kontrol et.", "Your exam is close: take a timed mock next week and check how you use the time.");
  } else if (recurring.length) {
    recommendation = b(`Gelecek hafta "${recurring[0].tag}" konusunu konu anlatımından tekrar et ve ilgili hatalarını yeniden dene.`, `Next week, review "${recurring[0].tag}" in the lessons and retry the related mistakes.`);
  } else {
    recommendation = b("Aynı düzende devam et; her gün kelime tekrarını yap ve haftada en az bir kez süreli pratik çöz.", "Keep the same rhythm: review vocabulary daily and do timed practice at least once a week.");
  }

  // ---- What we can't say yet ----
  const insufficient: Bilingual[] = [];
  if (!taskStats.planned) insufficient.push(b("Bu dönem için planlanmış görev yok.", "No tasks were planned for this period."));
  if (perf.answered < MIN_ANSWERS) insufficient.push(b("Beceri doğruluğunu değerlendirmek için bu dönemde yeterli soru çözülmedi.", "Not enough questions were answered this period to assess skill accuracy."));
  else if (!skills.some((s) => s.prevAnswered >= MIN_ANSWERS)) insufficient.push(b("Önceki dönemde yeterli veri olmadığı için beceri değişimi karşılaştırılamıyor.", "Skill changes can't be compared because the previous period has too little data."));
  if (!mocks.length) insufficient.push(b("Bu dönemde tamamlanmış deneme sınavı yok.", "No completed mock exams in this period."));
  if (config.skills.some((s) => s === "writing" || s === "speaking")) insufficient.push(b("Yazma ve konuşma otomatik puanlanmaz; bu beceriler için doğruluk gösterilmez.", "Writing and speaking aren't scored automatically, so no accuracy is shown for them."));

  return {
    period: { start: startKey, end: endKey },
    exam: {
      pathway: profile.pathway,
      version: profile.examVersion,
      targetScore: profile.targetScore,
      skillTargets: (profile.skillTargets as Record<string, string> | null) ?? null,
      examDate: examDateKey,
    },
    tasks: taskStats,
    consistency: { activeDays: activeDays.size, studyDaysPlanned },
    time: { recordedMinutes: recMinutes, selfMinutes: done.reduce((n, t) => n + (t.selfMinutes ?? 0), 0) },
    vocab: { reviewed: reviewedCards.length, added: addedCards, mastered: masteredCards },
    mistakes: { added: addedMistakes, retried: retriedMistakes.length, mastered: masteredMistakes, recurring },
    skills,
    mocks: mocks.map((m) => ({ ...m, date: m.date.toISOString() })),
    achievements,
    attention,
    recommendation,
    insufficient,
  };
}

function monthBounds(key: string) {
  const [y, m] = key.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { start, end: addDays(next, -1) };
}

/**
 * Files last week's report (once the week is over) and last month's report (once the month is
 * over) if the student was coached during that period. Only the most recent period is filled in;
 * nothing is back-filled for weeks before coaching started. Returns newly created weekly reports.
 */
export async function ensureReports(profile: CoachingProfileRow, todayKey: string) {
  const created: { id: string; kind: "WEEKLY" | "MONTHLY" }[] = [];
  const startedKey = new Intl.DateTimeFormat("en-CA", { timeZone: profile.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(profile.createdAt);

  const lastWeek = addDays(weekStartOf(todayKey), -7);
  const lastWeekEnd = addDays(lastWeek, 6);
  const month = monthBounds(addDays(`${todayKey.slice(0, 7)}-01`, -1));

  const periods = [
    { kind: "WEEKLY" as const, start: lastWeek, end: lastWeekEnd },
    { kind: "MONTHLY" as const, start: month.start, end: month.end },
  ];
  for (const p of periods) {
    if (startedKey > p.end) continue;
    const exists = await db.coachingReport.findUnique({ where: { userId_kind_periodStart: { userId: profile.userId, kind: p.kind, periodStart: dayKeyToDate(p.start) } } });
    if (exists) continue;
    const hadPlan = await db.studyTask.count({ where: { userId: profile.userId, date: { gte: dayKeyToDate(p.start), lte: dayKeyToDate(p.end) } } });
    if (!hadPlan) continue;
    // A student who joined mid-period gets a report covering only their coached days.
    const start = startedKey > p.start ? startedKey : p.start;
    const data = await buildReport(profile, start, p.end);
    const row = await db.coachingReport.upsert({
      where: { userId_kind_periodStart: { userId: profile.userId, kind: p.kind, periodStart: dayKeyToDate(p.start) } },
      update: {},
      create: { userId: profile.userId, kind: p.kind, periodStart: dayKeyToDate(p.start), periodEnd: dayKeyToDate(p.end), data: data as object },
    });
    created.push({ id: row.id, kind: p.kind });
  }
  return created;
}

export function listReports(userId: string) {
  return db.coachingReport.findMany({ where: { userId }, orderBy: [{ periodStart: "desc" }, { kind: "asc" }], select: { id: true, kind: true, periodStart: true, periodEnd: true, createdAt: true } });
}

export async function getReport(userId: string, id: string) {
  const row = await db.coachingReport.findFirst({ where: { id, userId } });
  return row ? { ...row, data: row.data as unknown as ReportData } : null;
}

export function latestWeeklyReport(userId: string) {
  return db.coachingReport.findFirst({ where: { userId, kind: "WEEKLY" }, orderBy: { periodStart: "desc" }, select: { id: true, createdAt: true, periodStart: true } });
}

/** A weekly report filed in the last seven days (shown as "Haftalık raporun hazır"). */
export function recentWeeklyReport(userId: string, now = new Date()) {
  return db.coachingReport.findFirst({ where: { userId, kind: "WEEKLY", createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } }, orderBy: { createdAt: "desc" } });
}
