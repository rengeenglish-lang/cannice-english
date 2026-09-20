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
  kind: "FULL_DIAGNOSTIC" | "MASTERY_CHECK" | "PRACTICE";
  topicName?: string;
}) {
  const heading =
    kind === "MASTERY_CHECK"
      ? `Konu Kontrolü${topicName ? ` · ${topicName}` : ""}`
      : kind === "PRACTICE"
        ? `Pratik${topicName ? ` · ${topicName}` : " · Karma Sorular"}`
        : "Seviye Tespit Sınavı";
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <p className="eyebrow text-center">{heading}</p>
      <QuestionRenderer attemptId={attemptId} question={question} index={index} total={total} />
    </div>
  );
}
