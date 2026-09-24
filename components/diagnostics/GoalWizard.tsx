"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { setGoalAction } from "@/app/actions/diagnostic-goal";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

type Exam = { id: string; code: string; name: string };

const SCORE_LABEL: Record<string, string> = {
  IELTS: "Band puanı (örn. 5.5)",
  TOEFL: "Puan (0-120)",
  PTE: "Puan (10-90)",
  YDS: "Puan (0-100)",
  YOKDIL_SOSYAL: "Puan (0-100)",
  YOKDIL_SAGLIK: "Puan (0-100)",
  YOKDIL_FEN: "Puan (0-100)",
};

const TIMEFRAME_OPTIONS = [
  { value: "ONE_MONTH", label: "1 ay içinde" },
  { value: "THREE_MONTHS", label: "3 ay içinde" },
  { value: "SIX_MONTHS", label: "6 ay içinde" },
  { value: "EXACT_DATE", label: "Belirli bir tarihte" },
  { value: "UNKNOWN", label: "Henüz bilmiyorum" },
];

const STEP_TITLES = ["Hangi sınava hazırlanıyorsunuz?", "Mevcut seviyeniz", "Hedef puanınız nedir?", "Sınava ne zaman girmeyi planlıyorsunuz?"];

export function GoalWizard({ exams }: { exams: Exam[] }) {
  const [state, formAction, pending] = useActionState(setGoalAction, initialState);
  const [step, setStep] = useState(0);
  const [examTypeId, setExamTypeId] = useState("");
  const [currentScoreKnown, setCurrentScoreKnown] = useState(true);
  const [timeframe, setTimeframe] = useState("ONE_MONTH");

  const mainExams = exams.filter((e) => !e.code.startsWith("YOKDIL"));
  const yokdilExams = exams.filter((e) => e.code.startsWith("YOKDIL"));
  const selectedExam = exams.find((e) => e.id === examTypeId);
  const scoreLabel = selectedExam ? (SCORE_LABEL[selectedExam.code] ?? "Puan") : "Puan";

  const canAdvance = step === 0 ? Boolean(examTypeId) : true;

  return (
    <form
      action={formAction}
      onKeyDown={(e) => {
        // Every step's inputs stay mounted (just CSS-hidden), so once step 3 renders a real
        // type="submit" button, pressing Enter anywhere (e.g. after typing the Sınav Tarihi date)
        // implicitly submits the form. Require an explicit click on Hedefimi Kaydet instead.
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
      }}
      className="dashboard-panel mx-auto max-w-xl space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs font-bold text-[color:var(--muted)]">
          <span>Adım {step + 1} / 4</span>
        </div>
        <progress className="learning-progress w-full" value={step + 1} max={4} aria-label="Hedef belirleme ilerlemesi" />
      </div>

      <h2 className="text-xl font-extrabold text-[color:var(--foreground)]">{STEP_TITLES[step]}</h2>

      <div className={step === 0 ? "space-y-4" : "hidden"}>
        <input type="hidden" name="examTypeId" value={examTypeId} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {mainExams.map((exam) => (
            <button
              type="button"
              key={exam.id}
              onClick={() => setExamTypeId(exam.id)}
              className={`focus-ring min-h-16 rounded-2xl border-2 p-3 text-sm font-bold transition ${examTypeId === exam.id ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)] hover:border-[color:var(--accent)]"}`}
            >
              {exam.name}
            </button>
          ))}
        </div>
        {yokdilExams.length ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">YÖKDİL Alanı</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {yokdilExams.map((exam) => (
                <button
                  type="button"
                  key={exam.id}
                  onClick={() => setExamTypeId(exam.id)}
                  className={`focus-ring min-h-14 rounded-2xl border-2 p-3 text-sm font-bold transition ${examTypeId === exam.id ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)] hover:border-[color:var(--accent)]"}`}
                >
                  {exam.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input
            type="checkbox"
            name="currentScoreKnown"
            value="true"
            checked={currentScoreKnown}
            onChange={(e) => setCurrentScoreKnown(e.target.checked)}
            className="size-4"
          />
          Mevcut seviyemi biliyorum
        </label>
        <div>
          <label className="label" htmlFor="currentScoreRaw">{scoreLabel}</label>
          <input
            id="currentScoreRaw"
            name="currentScoreRaw"
            disabled={!currentScoreKnown}
            placeholder={currentScoreKnown ? "" : "Bilmiyorum"}
            className="auth-input disabled:opacity-50"
          />
        </div>
      </div>

      <div className={step === 2 ? "space-y-4" : "hidden"}>
        <label className="label" htmlFor="targetScoreRaw">{scoreLabel}</label>
        <input id="targetScoreRaw" name="targetScoreRaw" required={step === 2} className="auth-input" />
      </div>

      <div className={step === 3 ? "space-y-4" : "hidden"}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`focus-within:border-[color:var(--accent)] flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 text-sm font-semibold transition ${timeframe === opt.value ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}
            >
              <input type="radio" name="targetTimeframe" value={opt.value} checked={timeframe === opt.value} onChange={() => setTimeframe(opt.value)} className="size-4" />
              {opt.label}
            </label>
          ))}
        </div>
        {timeframe === "EXACT_DATE" ? (
          <div>
            <label className="label" htmlFor="targetDate">Sınav Tarihi</label>
            <input id="targetDate" name="targetDate" type="date" className="auth-input" />
          </div>
        ) : null}
      </div>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="ghost-button disabled:opacity-40"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        {step < 3 ? (
          <button key="advance" type="button" onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={!canAdvance} className="primary-button disabled:opacity-40">
            Devam Et <ArrowRight size={16} />
          </button>
        ) : (
          <button key="submit" type="submit" disabled={pending || !examTypeId} className="primary-button disabled:opacity-40">
            {pending ? "Kaydediliyor…" : "Hedefimi Kaydet"}
          </button>
        )}
      </div>
    </form>
  );
}
