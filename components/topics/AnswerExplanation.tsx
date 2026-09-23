import { CheckCircle2, BookOpen } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerExplanation({ correctOption, explanation }: { correctOption: ParsedOption; explanation: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-[color:var(--success)]/30 bg-[color:var(--success-soft)] p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--success)] text-white shadow-[0_8px_18px_rgba(23,165,104,.3)]">
          <CheckCircle2 className="size-5" />
        </span>
        <p className="text-lg font-extrabold leading-tight text-[color:var(--success)] sm:text-xl">
          Doğru Cevap: {correctOption.letter}) {correctOption.text}
        </p>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[color:var(--success)]">
        <BookOpen className="size-4 shrink-0" />
        Açıklama
      </p>
      <p className="mt-1 whitespace-pre-line text-lg font-semibold leading-8 text-slate-900">{explanation}</p>
    </div>
  );
}
