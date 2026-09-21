import { submitBookletPageAction } from "@/app/actions/diagnostic-attempt";
import { groupByPassage } from "@/lib/diagnostics/booklet-pagination";
import { ExamTimer } from "@/components/diagnostics/ExamTimer";

const LETTERS = ["A", "B", "C", "D"];

export type BookletQuestion = {
  id: string;
  prompt: string;
  passageText: string | null;
  options: unknown;
};

function QuestionBlock({ question, number }: { question: BookletQuestion; number: number }) {
  const options = Array.isArray(question.options) ? (question.options as string[]) : [];
  return (
    <div>
      <p className="text-sm leading-6 text-[color:var(--foreground)]">
        <span className="font-black">{number}.</span> {question.prompt}
      </p>
      <div className="mt-2 space-y-1.5">
        {options.map((option, i) => (
          <label key={i} className="flex cursor-pointer items-start gap-2 text-sm text-[color:var(--foreground)]">
            <input type="radio" name={`answer_${question.id}`} value={String(i)} required className="mt-0.5 size-3.5 accent-[color:var(--accent)]" />
            <span>
              <span className="font-bold">{LETTERS[i]})</span> {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function BookletColumn({ column, startNumber }: { column: BookletQuestion[]; startNumber: number }) {
  const groups = groupByPassage(column);
  const numberedGroups = groups.reduce<{ passageText: string | null; numbered: { question: BookletQuestion; number: number }[] }[]>((acc, group) => {
    const previousCount = acc.reduce((sum, g) => sum + g.numbered.length, 0);
    const numbered = group.items.map((q, i) => ({ question: q, number: startNumber + previousCount + i }));
    return [...acc, { passageText: group.passageText, numbered }];
  }, []);
  return (
    <div className="space-y-5">
      {numberedGroups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          {group.passageText ? (
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-3 text-xs leading-6 text-[color:var(--foreground)]">
              {group.passageText}
            </div>
          ) : null}
          {group.numbered.map(({ question, number }) => (
            <QuestionBlock key={question.id} question={question} number={number} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function BookletRunner({
  attemptId,
  left,
  right,
  rangeStart,
  rangeEnd,
  total,
  startedAt,
  timeLimitMinutes,
}: {
  attemptId: string;
  left: BookletQuestion[];
  right: BookletQuestion[];
  rangeStart: number;
  rangeEnd: number;
  total: number;
  startedAt?: string;
  timeLimitMinutes?: number;
}) {
  const pageIds = [...left, ...right].map((q) => q.id);
  const isLast = rangeEnd >= total;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {startedAt && timeLimitMinutes ? <ExamTimer attemptId={attemptId} startedAt={startedAt} timeLimitMinutes={timeLimitMinutes} /> : null}
      <p className="text-center text-xs font-bold text-[color:var(--muted)]">
        Soru {rangeStart}-{rangeEnd} / {total}
      </p>

      <form action={submitBookletPageAction.bind(null, attemptId)} className="space-y-6">
        {pageIds.map((id) => (
          <input key={id} type="hidden" name="pageQuestionIds" value={id} />
        ))}
        <div className="rounded-sm border border-[color:var(--border)] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,.06),0_20px_40px_rgba(15,23,42,.08)] sm:p-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 sm:divide-x sm:divide-[color:var(--border)]">
            <div className="sm:pr-8">
              <BookletColumn column={left} startNumber={rangeStart} />
            </div>
            <div className="sm:pl-8">
              <BookletColumn column={right} startNumber={rangeStart + left.length} />
            </div>
          </div>
        </div>
        <button type="submit" className="primary-button mx-auto flex w-full justify-center sm:w-auto">
          {isLast ? "Bitir" : "Sonraki Sayfa"}
        </button>
      </form>
    </div>
  );
}
