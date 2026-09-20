import { QuestionRenderer, type RunnerQuestion } from "@/components/diagnostics/QuestionRenderer";

export function DiagnosticRunner({
  attemptId,
  question,
  index,
  total,
  kind,
  topicName,
}: {
  attemptId: string;
  question: RunnerQuestion;
  index: number;
  total: number;
  kind: "FULL_DIAGNOSTIC" | "MASTERY_CHECK";
  topicName?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <p className="eyebrow text-center">{kind === "MASTERY_CHECK" ? `Konu Kontrolü${topicName ? ` · ${topicName}` : ""}` : "Seviye Tespit Sınavı"}</p>
      <QuestionRenderer attemptId={attemptId} question={question} index={index} total={total} />
    </div>
  );
}
