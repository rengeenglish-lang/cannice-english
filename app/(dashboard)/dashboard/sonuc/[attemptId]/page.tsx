import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getResultsForAttempt, getPracticeResults } from "@/server/services/diagnostic-results.service";
import { ResultsSummary } from "@/components/diagnostics/ResultsSummary";
import { PracticeResults } from "@/components/diagnostics/PracticeResults";
import { logEvent } from "@/lib/diagnostics/analytics";
import { ATTEMPT_KIND_RESULT_TITLES } from "@/lib/diagnostics/attempt-kind-labels";
import { cefrFromPercentage } from "@/lib/diagnostics/cefr";

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }): Promise<Metadata> {
  const { attemptId } = await params;
  const attempt = await db.diagnosticAttempt.findUnique({ where: { id: attemptId }, select: { kind: true, mockSetNumber: true } });
  if (!attempt) return { title: "Sonuç" };
  const title =
    attempt.kind === "MOCK_EXAM" && attempt.mockSetNumber
      ? `Deneme ${attempt.mockSetNumber} Sonucun`
      : ATTEMPT_KIND_RESULT_TITLES[attempt.kind];
  return { title };
}

export default async function DiagnosticResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;

  const attemptPreview = await db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
  if (!attemptPreview) notFound();
  if (attemptPreview.status === "IN_PROGRESS") redirect(`/dashboard/sinav/${attemptId}`);

  if (attemptPreview.kind === "PRACTICE") {
    const practice = await getPracticeResults(attemptId, user.id);
    if (!practice) notFound();
    await logEvent("results_viewed", user.id, { attemptId, kind: "PRACTICE" });
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <PracticeResults
          topicName={practice.topicName}
          topicId={practice.attempt.scopeTopicId}
          items={practice.items}
          total={practice.total}
          correct={practice.correct}
          incorrect={practice.incorrect}
          pendingReview={practice.pendingReview}
          unanswered={practice.unanswered}
          percentage={practice.percentage}
        />
      </main>
    );
  }

  const results = await getResultsForAttempt(attemptId, user.id);
  if (!results) notFound();

  await logEvent("results_viewed", user.id, { attemptId, kind: attemptPreview.kind });

  const { attempt, topPriority, recommendationsByTopic, overall } = results;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <ResultsSummary
        examName={attempt.examType.name}
        targetScoreRaw={attempt.goal?.targetScoreRaw ?? "—"}
        targetDate={attempt.goal?.targetDate?.toISOString() ?? null}
        topicResults={attempt.topicResults}
        topPriority={topPriority}
        recommendationsByTopic={recommendationsByTopic}
        kind={attempt.kind === "MOCK_EXAM" ? "MOCK_EXAM" : "FULL_DIAGNOSTIC"}
        mockSetNumber={attempt.mockSetNumber}
        overall={overall}
        cefr={attempt.kind === "FULL_DIAGNOSTIC" && attempt.examFamily === "ACADEMIC_SKILLS" ? cefrFromPercentage(overall.percentage) : null}
      />
    </main>
  );
}
