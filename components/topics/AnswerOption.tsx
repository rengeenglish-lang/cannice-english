import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerOption({ option, isCorrect }: { option: ParsedOption; isCorrect: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
        isCorrect ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-black ${
          isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {option.letter}
      </span>
      <span className={`text-base sm:text-lg ${isCorrect ? "font-bold text-emerald-900" : "font-semibold text-slate-700"}`}>
        {option.text}
      </span>
    </li>
  );
}
