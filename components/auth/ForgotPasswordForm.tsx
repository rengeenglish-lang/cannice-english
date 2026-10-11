"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type ForgotPasswordState } from "@/app/actions/password-reset";

const initialState: ForgotPasswordState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);
  if (state.status === "sent") {
    return (
      <div className="panel space-y-2 text-center" role="status">
        <p className="font-bold">E-postanı kontrol et</p>
        <p className="text-sm text-slate-600">
          Bu adresle kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderdik. Bağlantı 1 saat geçerlidir. Birkaç dakika içinde gelmezse Spam klasörüne de bak.
        </p>
      </div>
    );
  }
  return (
    <form action={formAction} className="panel space-y-4">
      <div>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
      </button>
    </form>
  );
}
