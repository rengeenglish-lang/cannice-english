import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { DiagnosticRunner } from "@/components/diagnostics/DiagnosticRunner";

export const metadata: Metadata = { title: "Seviye Tespit Sınavı" };

export default async function DiagnosticRunnerPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;

  const attempt = await db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
  if (!attempt) notFound();
  if (attempt.status === "COMPLETED") redirect(`/seviye-tespit/sonuc/${attempt.id}`);
  if (attempt.status === "ABANDONED") redirect("/seviye-tespit");

  if (attempt.currentIndex >= attempt.questionOrder.length) redirect(`/seviye-tespit/sonuc/${attempt.id}`);

  const questionId = attempt.questionOrder[attempt.currentIndex];
  const question = await db.diagnosticQuestion.findUnique({ where: { id: questionId } });
  if (!question) notFound();

  const topic = attempt.kind === "MASTERY_CHECK" && attempt.scopeTopicId ? await db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : null;

  return (
    <main className="px-4 py-10 sm:px-6">
      <DiagnosticRunner
        attemptId={attempt.id}
        question={question}
        index={attempt.currentIndex}
        total={attempt.questionOrder.length}
        kind={attempt.kind}
        topicName={topic?.name}
      />
    </main>
  );
}
