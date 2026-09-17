export function QuestionNavigator({
  index,
  total,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={index <= 0}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Önceki Soru
      </button>
      <span className="text-sm font-extrabold text-slate-500">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={index >= total - 1}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,.3)] transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
      >
        Sonraki Soru →
      </button>
    </div>
  );
}
