import { QuestionRenderer, type RunnerQuestion } from "@/components/diagnostics/QuestionRenderer";
import { ExamTimer } from "@/components/diagnostics/ExamTimer";

export function DiagnosticRunner({
  attemptId,
  question,
  index,
  total,
  kind,
  topicName,
  startedAt,
  timeLimitMinutes,
}: {
  attemptId: string;
  question: RunnerQuestion;
  index: number;
  total: number;
  kind: "FULL_DIAGNOSTIC" | "MASTERY_CHECK" | "PRACTICE" | "MOCK_EXAM";
  topicName?: string;
  startedAt?: string;
  timeLimitMinutes?: number;
}) {
  const heading =
    kind === "MASTERY_CHECK"
      ? `Konu Kontrolü${topicName ? ` · ${topicName}` : ""}`
      : kind === "PRACTICE"
        ? `Pratik${topicName ? ` · ${topicName}` : " · Karma Sorular"}`
        : kind === "MOCK_EXAM"
          ? "Deneme Sınavı"
          : "Seviye Tespit Sınavı";
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <p className="eyebrow text-center">{heading}</p>
      {kind === "MOCK_EXAM" && startedAt && timeLimitMinutes ? (
        <ExamTimer attemptId={attemptId} startedAt={startedAt} timeLimitMinutes={timeLimitMinutes} />
      ) : null}
      <QuestionRenderer attemptId={attemptId} question={question} index={index} total={total} />
    </div>
  );
}
