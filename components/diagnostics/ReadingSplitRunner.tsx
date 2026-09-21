import { answerAndAdvanceAction } from "@/app/actions/diagnostic-attempt";
import { ExamTimer } from "@/components/diagnostics/ExamTimer";

const LETTERS = ["A", "B", "C", "D"];

export function ReadingSplitRunner({
  attemptId,
  passageText,
  question,
  globalIndex,
  globalTotal,
  passageNumber,
  totalPassages,
  indexInPassage,
  totalInPassage,
  startedAt,
  timeLimitMinutes,
}: {
  attemptId: string;
  passageText: string;
  question: { id: string; prompt: string; options: unknown };
  globalIndex: number;
  globalTotal: number;
  passageNumber: number;
  totalPassages: number;
  indexInPassage: number;
  totalInPassage: number;
  startedAt?: string;
  timeLimitMinutes?: number;
}) {
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  const boundAction = answerAndAdvanceAction.bind(null, attemptId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {startedAt && timeLimitMinutes ? <ExamTimer attemptId={attemptId} startedAt={startedAt} timeLimitMinutes={timeLimitMinutes} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
        <span>Parça {passageNumber} / {totalPassages}</span>
        <span>Soru {globalIndex + 1} / {globalTotal}</span>
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_1px_2px_rgba(15,23,42,.06),0_20px_40px_rgba(15,23,42,.08)] md:grid-cols-2">
        <div className="max-h-[60vh] overflow-y-auto border-b border-[color:var(--border)] bg-[color:var(--canvas)] p-6 md:max-h-[72vh] md:border-b-0 md:border-r">
          <p className="whitespace-pre-line text-sm leading-7 text-[color:var(--foreground)]">{passageText}</p>
        </div>

        <form action={boundAction} className="flex flex-col gap-5 p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[color:var(--muted)]">
              <span>Bu parça için soru {indexInPassage + 1} / {totalInPassage}</span>
            </div>
            <progress className="learning-progress w-full" value={indexInPassage} max={totalInPassage} aria-label="Parça ilerlemesi" />
          </div>

          <p className="whitespace-pre-line text-lg font-bold leading-8 text-[color:var(--foreground)]">{question.prompt}</p>

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

          <button type="submit" className="primary-button mt-auto w-full justify-center">
            {globalIndex + 1 >= globalTotal ? "Bitir" : "Sonraki Soru"}
          </button>
        </form>
      </div>
    </div>
  );
}
