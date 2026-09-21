import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { DiagnosticRunner } from "@/components/diagnostics/DiagnosticRunner";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { ATTEMPT_KIND_TITLES } from "@/lib/diagnostics/attempt-kind-labels";

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }): Promise<Metadata> {
  const { attemptId } = await params;
  const attempt = await db.diagnosticAttempt.findUnique({ where: { id: attemptId }, select: { kind: true } });
  return { title: attempt ? ATTEMPT_KIND_TITLES[attempt.kind] : "Sınav" };
}

export default async function DiagnosticRunnerPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;

  const attempt = await db.diagnosticAttempt.findFirst({ where: { id: attemptId, userId: user.id } });
  if (!attempt) notFound();
  if (attempt.status === "COMPLETED") redirect(`/dashboard/sonuc/${attempt.id}`);
  if (attempt.status === "ABANDONED") redirect("/seviye-tespit");

  if (attempt.currentIndex >= attempt.questionOrder.length) redirect(`/dashboard/sonuc/${attempt.id}`);

  const questionId = attempt.questionOrder[attempt.currentIndex];
  const question = await db.diagnosticQuestion.findUnique({ where: { id: questionId } });
  if (!question) notFound();

  const topic = attempt.scopeTopicId ? await db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : null;

  let timeLimitMinutes: number | undefined;
  if (attempt.kind === "MOCK_EXAM") {
    const examType = await db.examType.findUnique({ where: { id: attempt.examTypeId } });
    timeLimitMinutes = examType ? attemptConfigForExam(examType.code).mockExamTimeLimitMinutes : 180;
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <DiagnosticRunner
        attemptId={attempt.id}
        question={question}
        index={attempt.currentIndex}
        total={attempt.questionOrder.length}
        kind={attempt.kind}
        topicName={topic?.name}
        startedAt={attempt.startedAt.toISOString()}
        timeLimitMinutes={timeLimitMinutes}
      />
    </main>
  );
}
