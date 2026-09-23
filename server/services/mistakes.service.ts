import "server-only";
import { db } from "@/server/db";
import { recommendationsForTopics } from "@/lib/diagnostics/recommendations";
import { KONU_SLUG_CANDIDATES, konuAnlatimHref } from "@/lib/konu-links";
import { ATTEMPT_KIND_TITLES } from "@/lib/diagnostics/attempt-kind-labels";

export const MISTAKE_WINDOW_DAYS = 30;

/**
 * Hatalarım: every question answered wrongly in the last 30 days (latest wrong answer per
 * question, so re-failing the same question doesn't list it twice), each with its explanation,
 * the related extra materials, and the exact Konu Anlatımı topic to revisit.
 */
export async function listRecentMistakes(userId: string) {
  const since = new Date(Date.now() - MISTAKE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const responses = await db.diagnosticResponse.findMany({
    where: { isCorrect: false, answeredAt: { gte: since }, attempt: { userId } },
    include: {
      question: { include: { topic: true } },
      attempt: { include: { examType: true } },
    },
    orderBy: { answeredAt: "desc" },
  });

  const seen = new Set<string>();
  const latest = responses.filter((r) => (seen.has(r.questionId) ? false : (seen.add(r.questionId), true)));
  // A later correct answer to the same question means the mistake has been fixed — drop it.
  const fixedLater = latest.length
    ? await db.diagnosticResponse.findMany({
        where: { isCorrect: true, attempt: { userId }, questionId: { in: latest.map((r) => r.questionId) } },
        select: { questionId: true, answeredAt: true },
      })
    : [];
  const fixedAt = new Map<string, Date>();
  for (const f of fixedLater) if (!fixedAt.has(f.questionId) || fixedAt.get(f.questionId)! < f.answeredAt) fixedAt.set(f.questionId, f.answeredAt);
  const open = latest.filter((r) => !(fixedAt.get(r.questionId) && fixedAt.get(r.questionId)! > r.answeredAt));

  const topicIds = [...new Set(open.map((r) => r.question.topicId))];
  const [recs, examTopics] = await Promise.all([
    recommendationsForTopics(userId, topicIds),
    db.examTopic.findMany({
      where: { examTypeId: { in: [...new Set(open.map((r) => r.attempt.examTypeId))] } },
      select: { slug: true, name: true, examTypeId: true },
    }),
  ]);
  const recsByTopic = new Map(recs.map((r) => [r.topicId, r]));

  return open.map((r) => {
    const rec = recsByTopic.get(r.question.topicId);
    const exam = r.attempt.examType;
    let konu: { href: string; label: string } | null = null;
    const tagged = rec?.free.find((f) => f.examSlug === exam.slug) ?? rec?.free[0];
    if (tagged) {
      konu = { href: konuAnlatimHref(tagged.examSlug, tagged.topicSlug), label: tagged.title };
    } else {
      for (const slug of KONU_SLUG_CANDIDATES[r.question.topic.slug] ?? []) {
        const match = examTopics.find((t) => t.examTypeId === exam.id && t.slug === slug);
        if (match) {
          konu = { href: konuAnlatimHref(exam.slug, match.slug), label: match.name };
          break;
        }
      }
    }
    return {
      id: r.id,
      questionId: r.questionId,
      prompt: r.question.prompt,
      passageText: r.question.passageText,
      options: Array.isArray(r.question.options) ? (r.question.options as unknown[]).map(String) : [],
      studentAnswer: r.answerRaw,
      correctAnswer: r.question.correctAnswer,
      explanation: r.question.explanation,
      topicName: r.question.topic.name,
      examName: exam.name,
      sourceLabel: ATTEMPT_KIND_TITLES[r.attempt.kind],
      answeredAt: r.answeredAt,
      konu,
      materials: rec?.premium ?? [],
    };
  });
}
