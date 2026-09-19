"use client";

import { useActionState } from "react";
import { signInAction, type SignInFormState } from "@/app/actions/sign-in";

const initialState: SignInFormState = { status: "idle" };

export function SignInForm({next}: {next?: string}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  return (
    <form action={formAction} className="panel space-y-4">
<input type="hidden" name="next" value={next || ""} />
      <div>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" name="email" type="email" required className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Şifre</label>
        <input id="password" name="password" type="password" required className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
