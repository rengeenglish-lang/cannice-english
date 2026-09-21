import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { DiagnosticRunner } from "@/components/diagnostics/DiagnosticRunner";
import { BookletRunner } from "@/components/diagnostics/BookletRunner";
import { ExamViewToggle } from "@/components/diagnostics/ExamViewToggle";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { ATTEMPT_KIND_TITLES } from "@/lib/diagnostics/attempt-kind-labels";
import { getExamViewMode } from "@/lib/diagnostics/exam-view-mode";
import { packBookletPage } from "@/lib/diagnostics/booklet-pagination";

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }): Promise<Metadata> {
  const { attemptId } = await params;
  const attempt = await db.diagnosticAttempt.findUnique({ where: { id: attemptId }, select: { kind: true, mockSetNumber: true } });
  if (!attempt) return { title: "Sınav" };
  const title = attempt.kind === "MOCK_EXAM" && attempt.mockSetNumber ? `${ATTEMPT_KIND_TITLES[attempt.kind]} ${attempt.mockSetNumber}` : ATTEMPT_KIND_TITLES[attempt.kind];
  return { title };
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

  let timeLimitMinutes: number | undefined;
  if (attempt.kind === "MOCK_EXAM") {
    const examType = await db.examType.findUnique({ where: { id: attempt.examTypeId } });
    timeLimitMinutes = examType ? attemptConfigForExam(examType.code).mockExamTimeLimitMinutes : 180;
  }

  // Booklet view (a real-exam-booklet-style page of several questions at once) is only offered
  // for YDS/YÖKDİL — IELTS/TOEFL/PTE are already screen-based exams in real life, one item at a time.
  const canToggleView = attempt.examFamily === "TRANSLATION_GRAMMAR";
  const viewMode = canToggleView ? await getExamViewMode() : "single";

  if (viewMode === "booklet") {
    const windowIds = attempt.questionOrder.slice(attempt.currentIndex, attempt.currentIndex + 16);
    const rows = await db.diagnosticQuestion.findMany({ where: { id: { in: windowIds } } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const ordered = windowIds.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));

    const { left, right } = packBookletPage(ordered);
    if (left.length + right.length === 0) notFound();

    return (
      <main className="space-y-6 px-4 py-10 sm:px-6">
        <ExamViewToggle attemptId={attempt.id} mode={viewMode} />
        <BookletRunner
          attemptId={attempt.id}
          left={left}
          right={right}
          rangeStart={attempt.currentIndex + 1}
          rangeEnd={attempt.currentIndex + left.length + right.length}
          total={attempt.questionOrder.length}
          startedAt={attempt.startedAt.toISOString()}
          timeLimitMinutes={timeLimitMinutes}
        />
      </main>
    );
  }

  const questionId = attempt.questionOrder[attempt.currentIndex];
  const question = await db.diagnosticQuestion.findUnique({ where: { id: questionId } });
  if (!question) notFound();

  const topic = attempt.scopeTopicId ? await db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : null;

  return (
    <main className="space-y-6 px-4 py-10 sm:px-6">
      {canToggleView ? <ExamViewToggle attemptId={attempt.id} mode={viewMode} /> : null}
      <DiagnosticRunner
        attemptId={attempt.id}
        question={question}
        index={attempt.currentIndex}
        total={attempt.questionOrder.length}
        kind={attempt.kind}
        topicName={topic?.name}
        startedAt={attempt.startedAt.toISOString()}
        timeLimitMinutes={timeLimitMinutes}
        mockSetNumber={attempt.mockSetNumber}
      />
    </main>
  );
}
