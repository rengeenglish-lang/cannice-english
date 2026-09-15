"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

export function ReviewSubmissionForm({
  action,
  existingFeedback,
  existingScore,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  existingFeedback: string | null;
  existingScore: unknown;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel mt-6 space-y-4">
      <p className="eyebrow">Geri Bildirim</p>
      <div>
        <label className="label" htmlFor="score">Puan (0-100, opsiyonel)</label>
        <input id="score" name="score" type="number" min={0} max={100} step="0.5" defaultValue={existingScore ? String(existingScore) : ""} className="auth-input max-w-xs" />
      </div>
      <div>
        <label className="label" htmlFor="teacherFeedback">Geri Bildiriminiz</label>
        <textarea id="teacherFeedback" name="teacherFeedback" required rows={6} defaultValue={existingFeedback ?? ""} className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Geri Bildirimi Gönder"}</button>
    </form>
  );
}
