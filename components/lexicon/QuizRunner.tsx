"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";
import { saveTestAction } from "@/app/actions/lexicon";
import { PASS_RATIO, type QuizQuestion } from "@/lib/vocabulary/quiz";

const KIND_LABEL = { MEANING: "Bu kelimenin anlamı ne?", WORD: "Bu anlamın İngilizcesi hangisi?", BLANK: "Boşluğa hangi kelime gelir?" } as const;
const LETTERS = ["A", "B", "C", "D"];

/** One question at a time with instant feedback; the score is saved when the test ends. */
export function QuizRunner({ level, setNumber, questions, words, deckHref, nextHref, levelHref }: {
  level: string;
  setNumber: number;
  questions: QuizQuestion[];
  words: Record<string, { word: string; tr: string; exampleEn: string }>;
  deckHref: string;
  nextHref: string | null;
  levelHref: string;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [, start] = useTransition();
  const q = questions[i];
  const score = questions.length - wrong.length;

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n !== q.answer) setWrong((w) => [...w, q.wordId]);
  };
  const next = () => {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    start(async () => { await saveTestAction(level, setNumber, score, questions.length, wrong); });
  };

  if (finished) {
    const passed = score / questions.length >= PASS_RATIO;
    return (
      <div className="lex-pop mx-auto max-w-xl rounded-[1.75rem] bg-[color:var(--night)] p-8 text-center text-white">
        <Trophy size={40} className="mx-auto text-[color:var(--gold)]" aria-hidden="true" />
        <p className="mt-3 text-5xl font-bold">{score} / {questions.length}</p>
        <p className="mt-2 text-white/80">{passed ? "Tebrikler, bu seti geçtin!" : `Seti geçmek için en az %${Math.round(PASS_RATIO * 100)} gerekiyor. Yanlışlarını çalışıp tekrar dene.`}</p>
        {wrong.length ? (
          <ul className="mt-6 space-y-2 text-left">
            {wrong.map((id) => (
              <li key={id} className="rounded-xl bg-white/[.06] px-4 py-3 text-sm"><strong lang="en" className="text-[color:var(--gold)]">{words[id]?.word}</strong> — {words[id]?.tr}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {passed && nextHref ? <Link href={nextHref} className="primary-button">Sonraki set <ArrowRight size={18} aria-hidden="true" /></Link> : null}
          <Link href={deckHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-5 text-sm font-bold hover:bg-white/10">Kartlara dön</Link>
          <button type="button" onClick={() => location.reload()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-bold hover:bg-white/10"><RotateCcw size={16} aria-hidden="true" /> Testi tekrarla</button>
        </div>
        <Link href={levelHref} className="mt-5 inline-block text-sm font-semibold text-white/70 underline">Setlere dön</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between text-sm font-semibold text-[color:var(--muted)]">
        <span>Soru {i + 1} / {questions.length}</span>
        <span className="flex gap-3"><span className="text-emerald-700">✓ {i + (picked !== null ? 1 : 0) - wrong.length}</span><span className="text-rose-700">✗ {wrong.length}</span></span>
      </div>
      <progress className="learning-progress mt-2 w-full" value={i + (picked !== null ? 1 : 0)} max={questions.length} aria-hidden="true" />

      <div key={i} className="lex-in-right mt-6 rounded-[1.75rem] border-2 border-[color:var(--accent)] bg-[color:var(--surface)] p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--accent-strong)]">{KIND_LABEL[q.kind]}</p>
        <p lang={q.kind === "WORD" ? "tr" : "en"} className={`mt-3 font-bold leading-snug ${q.kind === "BLANK" ? "text-xl" : "text-3xl"}`}>{q.prompt}</p>
        {q.hint ? <p className="mt-2 text-sm text-[color:var(--muted)]">{q.hint}</p> : null}
        <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Seçenekler">
          {q.options.map((option, n) => {
            const isAnswer = picked !== null && n === q.answer;
            const isWrongPick = picked === n && n !== q.answer;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={picked === n}
                disabled={picked !== null}
                onClick={() => choose(n)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold transition ${isAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isWrongPick ? "border-rose-400 bg-rose-50 text-rose-900" : "border-[color:var(--border)] hover:border-[color:var(--accent)]"}`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{LETTERS[n]}</span>
                <span lang={q.kind === "MEANING" ? "tr" : "en"} className="flex-1">{option}</span>
                {isAnswer ? <Check size={18} aria-hidden="true" /> : isWrongPick ? <X size={18} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        {picked !== null ? (
          <div role="status" className="mt-5 rounded-2xl bg-[color:var(--accent-soft)] p-4 text-sm">
            <p><strong lang="en">{words[q.wordId]?.word}</strong> — {words[q.wordId]?.tr}</p>
            <p lang="en" className="mt-1 italic text-[color:var(--muted)]">{words[q.wordId]?.exampleEn}</p>
          </div>
        ) : null}
      </div>
      <button type="button" className="primary-button mt-5 w-full" onClick={next} disabled={picked === null}>
        {i + 1 < questions.length ? "Sonraki soru" : "Sonucu gör"} <ArrowRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
