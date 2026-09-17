import { CheckCircle2, BookOpen } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerExplanation({ correctOption, explanation }: { correctOption: ParsedOption; explanation: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="flex items-center gap-2 text-base font-extrabold text-emerald-800 sm:text-lg">
        <CheckCircle2 className="size-5 shrink-0" />
        Doğru Cevap: {correctOption.letter}) {correctOption.text}
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm font-bold text-emerald-700">
        <BookOpen className="mt-0.5 size-4 shrink-0" />
        Açıklama
      </p>
      <p className="mt-1 whitespace-pre-line text-base leading-7 text-emerald-900">{explanation}</p>
    </div>
  );
}
