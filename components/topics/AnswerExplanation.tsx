import { CheckCircle2, BookOpen } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerExplanation({ correctOption, explanation }: { correctOption: ParsedOption; explanation: string }) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
      <p className="flex items-center gap-2 text-xl font-extrabold text-emerald-800 sm:text-2xl">
        <CheckCircle2 className="size-6 shrink-0" />
        Doğru Cevap: {correctOption.letter}) {correctOption.text}
      </p>
      <p className="mt-4 flex items-start gap-2 text-base font-bold text-emerald-700">
        <BookOpen className="mt-0.5 size-5 shrink-0" />
        Açıklama
      </p>
      <p className="mt-1 whitespace-pre-line text-lg font-semibold leading-8 text-emerald-950">{explanation}</p>
    </div>
  );
}
