import { Check } from "lucide-react";
import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerOption({ option, isCorrect }: { option: ParsedOption; isCorrect: boolean }) {
  return (
    <li
      className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 transition ${
        isCorrect ? "border-[color:var(--success)] bg-[color:var(--success-soft)]" : "border-[color:var(--border)] bg-white"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-black ${
          isCorrect ? "bg-[color:var(--success)] text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {option.letter}
      </span>
      <span className={`flex-1 text-lg sm:text-xl ${isCorrect ? "font-bold text-[color:var(--success)]" : "font-semibold text-slate-800"}`}>
        {option.text}
      </span>
      {isCorrect ? <Check className="size-5 shrink-0 text-[color:var(--success)]" /> : null}
    </li>
  );
}
