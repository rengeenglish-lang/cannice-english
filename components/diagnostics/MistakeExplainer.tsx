"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { explainMistakeAction, type ExplainActionResult } from "@/app/actions/mistake-explain";
import { LETTERS, type MistakeExplanationResult } from "@/lib/mistake-explain";

function PracticeQuestion({ q }: { q: MistakeExplanationResult["similarQuestion"] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  return (
    <div className="mt-4 rounded-xl bg-[color:var(--canvas)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Benzer bir soru dene</p>
      <p className="mt-2 whitespace-pre-wrap font-semibold leading-7">{q.prompt}</p>
      <div className="mt-3 grid gap-2" role="group" aria-label="Seçenekler">
        {q.options.map((o, i) => {
          const isCorrect = i === q.correctIndex;
          const state = !answered ? "" : isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-900" : i === picked ? "border-rose-200 bg-rose-50 text-rose-900" : "opacity-70";
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex items-start gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-left text-sm leading-6 transition enabled:hover:border-[color:var(--accent)] ${state}`}
            >
              <span className="font-bold">{LETTERS[i] ?? i + 1})</span>
              <span className="flex-1">{o}</span>
              {answered && isCorrect ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-label="Doğru cevap" /> : null}
              {answered && i === picked && !isCorrect ? <XCircle size={18} className="mt-0.5 shrink-0" aria-label="Senin cevabın" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="mt-3 text-sm leading-6" role="status">
          <strong>{picked === q.correctIndex ? "Doğru! " : `Doğru cevap ${LETTERS[q.correctIndex] ?? q.correctIndex + 1}. `}</strong>
          {q.explanation}
        </p>
      ) : null}
    </div>
  );
}

/** "Neden yanlış yaptım?": an AI explanation of the student's chosen option, plus one practice question. */
export function MistakeExplainer({ responseId }: { responseId: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ExplainActionResult | null>(null);

  if (state?.status === "done") {
    const r = state.result;
    return (
      <div className="mt-4 rounded-xl border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)]/40 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[color:var(--accent-strong)]">
          <Sparkles size={14} aria-hidden="true" /> Neden yanlış yaptın?
        </p>
        <p className="mt-2 text-sm leading-6">{r.whyWrong}</p>
        <p className="mt-3 text-sm leading-6"><strong>Kilit nokta:</strong> {r.keyPoint}</p>
        <p className="mt-2 text-sm leading-6"><strong>Bir dahaki sefere:</strong> {r.howToSpot}</p>
        <PracticeQuestion q={r.similarQuestion} />
        <p className="mt-3 text-[11px] text-[color:var(--muted)]">
          Yapay zekâ tarafından hazırlandı; doğru cevap ve yukarıdaki açıklama sorunun cevap anahtarına dayanır.
          {state.remaining !== null ? ` Bugün kalan yeni açıklama hakkın: ${state.remaining}.` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        className="secondary-button text-xs"
        disabled={pending}
        onClick={() => start(async () => setState(await explainMistakeAction(responseId)))}
      >
        {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
        {pending ? "Açıklama hazırlanıyor…" : "Neden yanlış yaptım?"}
      </button>
      {state?.status === "error" ? <p role="alert" className="mt-2 text-sm font-semibold text-rose-700">{state.message}</p> : null}
    </div>
  );
}
