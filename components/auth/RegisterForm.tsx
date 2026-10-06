"use client";

import { useActionState } from "react";
import { registerAction, type RegisterFormState } from "@/app/actions/register";

const initialState: RegisterFormState = { status: "idle" };

export function RegisterForm({next, src}: {next?: string; src?: string}) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  return (
    <form action={formAction} className="panel space-y-4">
<input type="hidden" name="next" value={next || ""} />
<input type="hidden" name="src" value={src || ""} />
      <div>
        <label className="label" htmlFor="name">Adın Soyadın</label>
        <input id="name" name="name" required className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" name="email" type="email" required className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telefon (opsiyonel)</label>
        <input id="phone" name="phone" className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Şifre</label>
        <input id="password" name="password" type="password" required minLength={8} className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Hesap oluşturuluyor…" : "Ücretsiz Denemeye Başla"}
      </button>
    </form>
  );
}
