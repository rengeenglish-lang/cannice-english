"use client";

import { useActionState } from "react";
import { changePasswordAction, type ProfileFormState } from "@/app/actions/profile";

const initialState: ProfileFormState = { status: "idle" };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="dashboard-panel space-y-4">
      <div>
        <h2 className="section-title text-lg">Oturum Ayarları</h2>
      </div>
      <div>
        <label className="label" htmlFor="currentPassword">Mevcut Şifreniz</label>
        <input id="currentPassword" name="currentPassword" type="password" required className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="newPassword">Yeni Şifre</label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="auth-input" />
      </div>

      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}

      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Kaydediliyor…" : "Kaydet →"}
      </button>
    </form>
  );
}
