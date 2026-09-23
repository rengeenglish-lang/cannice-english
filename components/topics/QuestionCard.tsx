import { Sparkles, Tag } from "lucide-react";
import type { ParsedExample } from "@/components/topics/parseExampleBlock";
import { AnswerOption } from "@/components/topics/AnswerOption";
import { AnswerExplanation } from "@/components/topics/AnswerExplanation";
import { DistractorExplanation } from "@/components/topics/DistractorExplanation";

export function QuestionCard({
  example,
  total,
  typeLabel,
}: {
  example: ParsedExample;
  total: number;
  typeLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-1.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(19,47,89,.25)]">
          <Sparkles className="size-4" />
          Örnek Soru {example.index + 1}
          {total > 1 ? (
            <span className="font-bold text-white/70">/ {total}</span>
          ) : null}
        </span>
        {typeLabel ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-soft)] px-4 py-1.5 text-sm font-extrabold text-[color:var(--accent-strong)]">
            <Tag className="size-4" />
            {typeLabel}
          </span>
        ) : null}
      </div>

      {example.kind === "mcq" ? (
        <>
          <p className="mt-5 whitespace-pre-line text-2xl font-bold leading-9 text-slate-900 sm:text-3xl">
            {example.question}
          </p>
          <ul className="mt-6 space-y-3">
            {example.options.map((option) => (
              <AnswerOption
                key={option.letter}
                option={option}
                isCorrect={option.letter === example.correctLetter}
              />
            ))}
          </ul>
          <AnswerExplanation
            correctOption={
              example.options.find(
                (option) => option.letter === example.correctLetter,
              )!
            }
            explanation={example.explanation}
          />
          {example.distractorNotes ? (
            <DistractorExplanation notes={example.distractorNotes} />
          ) : null}
        </>
      ) : (
        <p className="mt-5 whitespace-pre-line text-xl font-semibold leading-9 text-slate-900">
          {example.text}
        </p>
      )}
    </div>
  );
}
