"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Sparkles } from "lucide-react";
import { submitWritingFeedbackAction, type WritingFeedbackFormState } from "@/app/actions/writing-feedback";
import { LIMITS, WRITING_FEEDBACK_KINDS, WRITING_KIND_KEYS, countWords, type WritingKindKey } from "@/lib/writing-feedback";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="primary-button w-full sm:w-auto" disabled={disabled || pending} aria-live="polite">
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Değerlendiriliyor… (30 saniye kadar sürebilir)
        </>
      ) : (
        <>
          <Sparkles size={18} aria-hidden="true" /> Geri bildirim al
        </>
      )}
    </button>
  );
}

export function WritingFeedbackForm({ defaultKind, remaining, unlimited }: { defaultKind: WritingKindKey; remaining: number; unlimited: boolean }) {
  const [state, action] = useActionState<WritingFeedbackFormState, FormData>(submitWritingFeedbackAction, { status: "idle" });
  const [kind, setKind] = useState<WritingKindKey>(defaultKind);
  const [answer, setAnswer] = useState("");
  const info = WRITING_FEEDBACK_KINDS[kind];
  const words = countWords(answer);
  const short = info.minWords !== null && words > 0 && words < info.minWords;
  const noAllowance = !unlimited && remaining <= 0;

  return (
    <form action={action} className="panel mt-6 space-y-5">
      <div>
        <label htmlFor="wf-kind" className="label">Görev türü</label>
        <select id="wf-kind" name="kind" className="auth-input" value={kind} onChange={(e) => setKind(e.target.value as WritingKindKey)}>
          {WRITING_KIND_KEYS.map((k) => (
            <option key={k} value={k}>{WRITING_FEEDBACK_KINDS[k].name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="wf-prompt" className="label">{info.promptLabel}</label>
        <textarea id="wf-prompt" name="taskPrompt" required minLength={LIMITS.promptMin} maxLength={LIMITS.promptMax} rows={4} className="auth-input leading-6" placeholder="Soruyu ya da kaynak metni buraya yapıştır." />
      </div>

      <div>
        <label htmlFor="wf-answer" className="label">{info.answerLabel}</label>
        <textarea
          id="wf-answer"
          name="answer"
          required
          minLength={LIMITS.answerMin}
          maxLength={LIMITS.answerMax}
          rows={12}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="auth-input leading-7"
          placeholder="Cevabını buraya yaz ya da yapıştır."
        />
        <p className={`mt-1.5 text-xs font-semibold ${short ? "text-amber-700" : "text-[color:var(--muted)]"}`}>
          {words} kelime
          {info.minWords !== null ? ` · bu görev en az ${info.minWords} kelime bekler` : ""}
          {short ? " — kısa cevaplar puan kaybeder" : ""}
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{state.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--muted)]">
          {unlimited ? "Yönetici hesabı: sınırsız" : noAllowance ? "Bu ayki hakkın doldu." : `Bu ay kalan hakkın: ${remaining}`}
        </p>
        <SubmitButton disabled={noAllowance} />
      </div>
    </form>
  );
}
