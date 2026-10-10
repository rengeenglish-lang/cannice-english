import "server-only";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getPlanAccess } from "@/server/services/plans.service";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { konuAnlatimHref } from "@/lib/konu-links";
import { practiceSectionForTopic } from "@/lib/practice-sections";
import { pathwayConfig, type PathwayConfig, type SkillKey, type TaskType } from "@/lib/coaching/exams";
import { coachingCopy, pick as pickLocale } from "@/lib/coaching/i18n";
import type { CatalogActivity, TaskKindCode } from "@/lib/coaching/planner";
import type { CoachingProfileRow } from "@/server/services/coaching/profile.service";

const GAP_KIND: Partial<Record<SkillKey, TaskKindCode>> = { writing: "WRITING", listening: "LISTENING", reading: "READING", speaking: "SPEAKING" };

export type Catalog = {
  config: PathwayConfig;
  examTypeId: string | null;
  activities: CatalogActivity[];
  mock: CatalogActivity | null;
  timedPractice: CatalogActivity | null;
  /** Task types with no lesson, practice or tool on the site. */
  gaps: TaskType[];
  /** Some content was left out because the student's plan doesn't include it. */
  lockedContent: boolean;
  /** Practice/mocks follow the site-wide ExamGoal; they're only linked when it matches the coaching exam. */
  goalMismatch: boolean;
  levelTestHref: string | null;
};

/** Maps a Pratik Bankası topic to the coaching skill it trains, using the pathway's task-type table first. */
export function skillForDiagnosticTopic(config: PathwayConfig, slug: string, parentSlug?: string | null): SkillKey {
  const byType = config.taskTypes.find((t) => t.practiceSlugs?.includes(slug));
  if (byType) return byType.skill;
  const section = practiceSectionForTopic({ slug, parentSlug });
  return section === "grammar" ? "grammar" : section === "reading" ? "reading" : section === "listening" ? "listening" : section === "speaking" ? "speaking" : "writing";
}

/**
 * Everything a plan may link to for this student: real Konu Anlatımı lessons, Pratik Bankası
 * topics, the speaking simulator and Deneme Sınavı papers that exist on the site right now and
 * that the student's plan unlocks. A task type with nothing behind it becomes an editable
 * self-study task flagged as a gap — never an invented link.
 */
export async function buildCatalog(profile: CoachingProfileRow, user: { id: string; role: string }): Promise<Catalog> {
  const config = pathwayConfig(profile.pathway)!;
  const t = coachingCopy(profile.locale);
  const [access, goal, examType] = await Promise.all([
    getPlanAccess(user),
    getActiveGoal(user.id),
    profile.contentExamSlug ? db.examType.findUnique({ where: { slug: profile.contentExamSlug } }) : null,
  ]);
  const goalMatches = Boolean(examType && goal?.examTypeId === examType.id);
  let lockedContent = false;

  const [topics, diagTopics, doneLessons] = await Promise.all([
    examType ? db.examTopic.findMany({ where: { examTypeId: examType.id }, include: { lessons: { select: { id: true } } }, orderBy: { displayOrder: "asc" } }) : [],
    examType
      ? db.diagnosticTopic.findMany({
          where: { isActive: true, examFamilies: { has: examFamilyForCode(examType.code) }, OR: [{ examTypeId: null }, { examTypeId: examType.id }], primaryQuestions: { some: { isActive: true, mockSetNumber: null } } },
          include: { parent: { select: { slug: true } } },
        })
      : [],
    db.topicLessonProgress.findMany({ where: { userId: user.id, completedAt: { not: null } }, select: { topicLessonId: true } }),
  ]);
  const doneIds = new Set(doneLessons.map((d) => d.topicLessonId));
  const freePreviewTopicId = topics[0]?.id;
  const canLessons = access.can("KONU_ANLATIMI");
  const canPractice = access.can("PRACTICE_QUESTIONS") && goalMatches;

  const activities: CatalogActivity[] = [];
  const gaps: TaskType[] = [];
  const usedTopicIds = new Set<string>();

  for (const type of config.taskTypes) {
    let hasContent = false;
    // Practice for this type exists on the site (even if this student's plan doesn't unlock it).
    // Only when it doesn't is the self-study fallback flagged as a gap ("Sitede henüz içerik yok").
    let practiceOnSite = false;
    for (const slug of type.lessonSlugs ?? []) {
      const topic = topics.find((x) => x.slug === slug);
      if (!topic || usedTopicIds.has(topic.id)) continue;
      hasContent = true;
      if (!canLessons && topic.id !== freePreviewTopicId) {
        lockedContent = true;
        continue;
      }
      usedTopicIds.add(topic.id);
      activities.push({
        taskTypeKey: type.key,
        skill: type.skill,
        kind: "LESSON",
        mode: "learn",
        title: `${t.task.kinds.LESSON}: ${topic.name}`,
        href: konuAnlatimHref(profile.contentExamSlug!, topic.slug),
        refType: "EXAM_TOPIC",
        refId: topic.id,
        minutes: Math.max(15, Math.min(30, type.minutes)),
        isGap: false,
        done: topic.lessons.length > 0 && topic.lessons.every((l) => doneIds.has(l.id)),
      });
    }
    for (const slug of type.practiceSlugs ?? []) {
      const topic = diagTopics.find((x) => x.slug === slug);
      if (!topic) continue;
      hasContent = true;
      practiceOnSite = true;
      if (!canPractice) {
        lockedContent ||= !access.can("PRACTICE_QUESTIONS");
        continue;
      }
      activities.push({
        taskTypeKey: type.key,
        skill: skillForDiagnosticTopic(config, topic.slug, topic.parent?.slug),
        kind: "PRACTICE",
        mode: "practice",
        title: `${t.task.kinds.PRACTICE}: ${topic.name}`,
        refType: "DIAGNOSTIC_TOPIC",
        refId: topic.id,
        minutes: 15,
        isGap: false,
      });
    }
    if (type.skill === "time" && diagTopics.length) {
      // Time management is trained by a timed, mixed set from Pratik Bankası (the same drill as the
      // "Süreli pratik: Karma" exam-day task), so the task has real practice behind it.
      hasContent = true;
      practiceOnSite = true;
      if (canPractice) {
        activities.push({
          taskTypeKey: type.key,
          skill: "time",
          kind: "TIMED_PRACTICE",
          mode: "practice",
          title: `${t.task.kinds.TIMED_PRACTICE}: ${type.name}`,
          detail: pickLocale(profile.locale, type.selfStudy),
          refType: "DIAGNOSTIC_TOPIC",
          refId: "KARMA",
          minutes: type.minutes,
          isGap: false,
        });
      } else {
        lockedContent ||= !access.can("PRACTICE_QUESTIONS");
      }
    }
    if (type.toolHref) {
      hasContent = true;
      practiceOnSite = true;
      activities.push({ taskTypeKey: type.key, skill: type.skill, kind: "SPEAKING", mode: "practice", title: `${t.task.kinds.SPEAKING}: ${type.name}`, detail: pickLocale(profile.locale, type.selfStudy), href: type.toolHref, refType: "TOOL", refId: type.key, minutes: type.minutes, isGap: false });
    }
    const hasPractice = activities.some((a) => a.taskTypeKey === type.key && a.mode === "practice");
    if (!hasPractice) {
      // No practice on the site for this type (or none unlocked): an editable self-study task. It is a
      // gap only when the site really has nothing; locked practice is shown via `lockedContent`.
      activities.push({ taskTypeKey: type.key, skill: type.skill, kind: GAP_KIND[type.skill] ?? "CUSTOM", mode: "practice", title: type.name, detail: pickLocale(profile.locale, type.selfStudy), minutes: type.minutes, isGap: !practiceOnSite });
    }
    if (!hasContent) gaps.push(type);
  }

  let mock: CatalogActivity | null = null;
  let timedPractice: CatalogActivity | null = null;
  if (examType && config.siteMock) {
    const sets = await db.diagnosticQuestion.findMany({
      where: { isActive: true, mockSetNumber: { not: null }, examFamily: examFamilyForCode(examType.code), OR: [{ examTypeId: null }, { examTypeId: examType.id }] },
      select: { mockSetNumber: true },
      distinct: ["mockSetNumber"],
    });
    const setNumbers = sets.map((s) => s.mockSetNumber!).sort((a, b) => a - b);
    if (setNumbers.length && access.can("MOCK_EXAMS") && goalMatches) {
      const done = await db.diagnosticAttempt.findMany({ where: { userId: user.id, examTypeId: examType.id, kind: "MOCK_EXAM", status: "COMPLETED" }, select: { mockSetNumber: true } });
      const doneSets = new Set(done.map((d) => d.mockSetNumber));
      const next = setNumbers.find((n) => !doneSets.has(n)) ?? setNumbers[0];
      mock = {
        taskTypeKey: "mock",
        skill: config.skills.includes("reading") ? "reading" : config.skills[0],
        kind: "MOCK",
        mode: "practice",
        title: `${t.task.kinds.MOCK}: Deneme ${next}`,
        detail: pickLocale(profile.locale, config.siteMock.note),
        refType: "MOCK_SET",
        refId: String(next),
        minutes: attemptConfigForExam(examType.code).mockExamTimeLimitMinutes,
        isGap: false,
      };
    } else if (setNumbers.length) {
      lockedContent ||= !access.can("MOCK_EXAMS");
    }
  }
  if (canPractice && diagTopics.length) {
    timedPractice = { taskTypeKey: "timed", skill: config.skills.includes("reading") ? "reading" : config.skills[0], kind: "TIMED_PRACTICE", mode: "practice", title: `${t.task.kinds.TIMED_PRACTICE}: Karma`, detail: t.locale === "en" ? "Mixed questions — time yourself as in the exam." : "Karma sorular — sınavdaki gibi süre tutarak çöz.", refType: "DIAGNOSTIC_TOPIC", refId: "KARMA", minutes: 20, isGap: false };
  } else {
    const strategy = config.taskTypes.find((x) => x.skill === "time");
    if (strategy) timedPractice = { taskTypeKey: strategy.key, skill: "time", kind: "TIMED_PRACTICE", mode: "practice", title: strategy.name, detail: pickLocale(profile.locale, strategy.selfStudy), minutes: strategy.minutes, isGap: diagTopics.length === 0 };
  }

  return {
    config,
    examTypeId: examType?.id ?? null,
    activities,
    mock,
    timedPractice,
    gaps,
    lockedContent,
    goalMismatch: Boolean(examType) && !goalMatches,
    levelTestHref: examType ? "/seviye-tespit/yeni" : null,
  };
}
