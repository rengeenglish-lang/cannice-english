import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { DiagnosticRunner } from "@/components/diagnostics/DiagnosticRunner";
import { BookletRunner } from "@/components/diagnostics/BookletRunner";
import { ReadingSplitRunner } from "@/components/diagnostics/ReadingSplitRunner";
import { ExamViewToggle } from "@/components/diagnostics/ExamViewToggle";
import { attemptConfigForExam } from "@/lib/diagnostics/attempt-config";
import { ATTEMPT_KIND_TITLES } from "@/lib/diagnostics/attempt-kind-labels";
import { getExamViewMode } from "@/lib/diagnostics/exam-view-mode";
import { packBookletPage } from "@/lib/diagnostics/booklet-pagination";
import { buildPassageRuns, locateRun } from "@/lib/diagnostics/reading-passages";

const SPLIT_SCREEN_EXAM_CODES = ["IELTS", "TOEFL"];

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

  // Booklet view (a real-exam-booklet-style page of several questions at once) is only offered
  // for YDS/YÖKDİL — IELTS/TOEFL/PTE are already screen-based exams in real life, one item at a time.
  const canToggleView = attempt.examFamily === "TRANSLATION_GRAMMAR";
  const [examType, viewMode] = await Promise.all([
    db.examType.findUnique({ where: { id: attempt.examTypeId } }),
    canToggleView ? getExamViewMode() : Promise.resolve<Awaited<ReturnType<typeof getExamViewMode>>>("single"),
  ]);
  const timeLimitMinutes = attempt.kind === "MOCK_EXAM" ? (examType ? attemptConfigForExam(examType.code).mockExamTimeLimitMinutes : 180) : undefined;

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
  // Whether this exam gets the split-screen treatment is known from examType alone (doesn't need
  // the question itself), so its lookahead fetch can run in parallel with the question/topic
  // fetches below instead of waiting on them first.
  const wantsSplitScreen = Boolean(examType && SPLIT_SCREEN_EXAM_CODES.includes(examType.code));

  const [question, orderedRows, topic] = await Promise.all([
    db.diagnosticQuestion.findUnique({ where: { id: questionId } }),
    wantsSplitScreen ? db.diagnosticQuestion.findMany({ where: { id: { in: attempt.questionOrder } }, select: { id: true, passageText: true } }) : Promise.resolve(null),
    !wantsSplitScreen && attempt.scopeTopicId ? db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : Promise.resolve(null),
  ]);
  if (!question) notFound();

  // IELTS/TOEFL Reading is a real split-screen, passage-fixed-on-one-side computer test in real
  // life — show it that way instead of the generic one-question-per-screen runner.
  if (wantsSplitScreen && question.passageText && orderedRows) {
    const byId = new Map(orderedRows.map((r) => [r.id, r]));
    const ordered = attempt.questionOrder.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
    const runs = buildPassageRuns(ordered);
    const located = locateRun(runs, attempt.currentIndex);

    if (located?.run.passageText) {
      return (
        <main className="px-4 py-10 sm:px-6">
          <ReadingSplitRunner
            attemptId={attempt.id}
            passageText={located.run.passageText}
            question={question}
            globalIndex={attempt.currentIndex}
            globalTotal={attempt.questionOrder.length}
            passageNumber={located.runIndex + 1}
            totalPassages={runs.length}
            indexInPassage={attempt.currentIndex - located.run.start}
            totalInPassage={located.run.end - located.run.start + 1}
            startedAt={attempt.startedAt.toISOString()}
            timeLimitMinutes={timeLimitMinutes}
          />
        </main>
      );
    }
  }

  // `topic` was already fetched above in the common case; only re-fetch here for the rare edge
  // case where this exam wants split-screen but this particular question has no passage.
  const resolvedTopic = topic ?? (wantsSplitScreen && attempt.scopeTopicId ? await db.diagnosticTopic.findUnique({ where: { id: attempt.scopeTopicId } }) : null);

  return (
    <main className="space-y-6 px-4 py-10 sm:px-6">
      {canToggleView ? <ExamViewToggle attemptId={attempt.id} mode={viewMode} /> : null}
      <DiagnosticRunner
        attemptId={attempt.id}
        question={question}
        index={attempt.currentIndex}
        total={attempt.questionOrder.length}
        kind={attempt.kind}
        topicName={resolvedTopic?.name}
        startedAt={attempt.startedAt.toISOString()}
        timeLimitMinutes={timeLimitMinutes}
        mockSetNumber={attempt.mockSetNumber}
      />
    </main>
  );
}
