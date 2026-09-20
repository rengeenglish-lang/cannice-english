import { answerAndAdvanceAction } from "@/app/actions/diagnostic-attempt";

const LETTERS = ["A", "B", "C", "D"];

export type RunnerQuestion = {
  id: string;
  prompt: string;
  passageText: string | null;
  audioUrl: string | null;
  options: unknown;
};

export function QuestionRenderer({ attemptId, question, index, total }: { attemptId: string; question: RunnerQuestion; index: number; total: number }) {
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  const boundAction = answerAndAdvanceAction.bind(null, attemptId);

  return (
    <form action={boundAction} className="dashboard-panel space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-[color:var(--muted)]">
          <span>Soru {index + 1} / {total}</span>
        </div>
        <progress className="learning-progress w-full" value={index} max={total} aria-label="Sınav ilerlemesi" />
      </div>

      {question.passageText ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-5 text-sm leading-7 text-[color:var(--foreground)]">
          {question.passageText}
        </div>
      ) : null}

      {question.audioUrl ? (
        <audio controls src={question.audioUrl} className="w-full">
          Tarayıcınız ses oynatmayı desteklemiyor.
        </audio>
      ) : null}

      <p className="text-lg font-bold leading-8 text-[color:var(--foreground)] sm:text-xl">{question.prompt}</p>

      <input type="hidden" name="questionId" value={question.id} />

      <fieldset className="space-y-3">
        <legend className="sr-only">Seçenekler</legend>
        {options.map((option, i) => (
          <label
            key={i}
            className="focus-within:border-[color:var(--accent)] flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-[color:var(--border)] p-4 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--brand-soft)]"
          >
            <input type="radio" name="answerRaw" value={String(i)} required className="size-4 accent-[color:var(--accent)]" />
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[color:var(--border-strong)] text-xs font-extrabold">
              {LETTERS[i]}
            </span>
            <span>{option}</span>
          </label>
        ))}
      </fieldset>

      <button type="submit" className="primary-button w-full justify-center sm:w-auto">
        {index + 1 >= total ? "Bitir" : "Sonraki Soru"}
      </button>
    </form>
  );
}
