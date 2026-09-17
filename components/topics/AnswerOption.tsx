import type { ParsedOption } from "@/components/topics/parseExampleBlock";

export function AnswerOption({ option, isCorrect }: { option: ParsedOption; isCorrect: boolean }) {
  return (
    <li
      className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 transition ${
        isCorrect ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-black ${
          isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
        }`}
      >
        {option.letter}
      </span>
      <span className={`text-lg sm:text-xl ${isCorrect ? "font-bold text-emerald-900" : "font-semibold text-slate-800"}`}>
        {option.text}
      </span>
    </li>
  );
}
