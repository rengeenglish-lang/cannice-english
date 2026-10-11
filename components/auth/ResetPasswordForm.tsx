"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions/password-reset";

const initialState: ResetPasswordState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);
  return (
    <form action={formAction} className="panel space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="password">Yeni şifre</label>
        <input id="password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="auth-input" />
        <p className="mt-1 text-xs text-slate-500">En az 8 karakter.</p>
      </div>
      <div>
        <label className="label" htmlFor="confirm">Yeni şifre (tekrar)</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Kaydediliyor…" : "Şifremi kaydet"}
      </button>
    </form>
  );
}
