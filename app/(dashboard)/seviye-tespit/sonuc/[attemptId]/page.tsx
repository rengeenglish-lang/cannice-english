import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getResultsForAttempt } from "@/server/services/diagnostic-results.service";
import { ResultsSummary } from "@/components/diagnostics/ResultsSummary";
import { logEvent } from "@/lib/diagnostics/analytics";

export const metadata: Metadata = { title: "Seviye Tespit Sonucun" };

export default async function DiagnosticResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;

  const results = await getResultsForAttempt(attemptId, user.id);
  if (!results) {
    const stillRunning = await db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
    if (stillRunning && stillRunning.status === "IN_PROGRESS") redirect(`/seviye-tespit/sinav/${attemptId}`);
    notFound();
  }

  await logEvent("results_viewed", user.id, { attemptId });

  const { attempt, topPriority, recommendationsByTopic } = results;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <ResultsSummary
        examName={attempt.examType.name}
        targetScoreRaw={attempt.goal?.targetScoreRaw ?? "—"}
        targetDate={attempt.goal?.targetDate?.toISOString() ?? null}
        topicResults={attempt.topicResults}
        topPriority={topPriority}
        recommendationsByTopic={recommendationsByTopic}
      />
    </main>
  );
}
