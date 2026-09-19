"use client";
import { useActionState, type ReactNode } from "react";
import type { CommercialFormState } from "@/app/actions/commercial-checkout";
export function CommercialForm({ action, children, label, disabled = false }: { action: (state: CommercialFormState, form: FormData) => Promise<CommercialFormState>; children: ReactNode; label: string; disabled?: boolean }) {
  const [state, submit, pending] = useActionState(action, { message: "" });
  return <form action={submit} className="space-y-4">
    <fieldset disabled={pending || disabled} className="space-y-4">{children}
      <button type="submit" className="primary-button disabled:opacity-50" disabled={pending || disabled}>{pending ? "İşleniyor…" : label}</button>
    </fieldset>
    <p role="status" aria-live="polite" className={state.ok ? "text-sm text-green-800" : "text-sm text-red-700"}>{state.message}</p>
  </form>;
}
