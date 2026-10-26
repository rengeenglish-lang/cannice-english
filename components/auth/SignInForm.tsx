"use client";

import Link from "next/link";
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
        <div className="flex items-baseline justify-between gap-3">
          <label className="label" htmlFor="password">Şifre</label>
          <Link href="/sifremi-unuttum" className="inline-flex min-h-11 items-center rounded-xl border border-[color:var(--border)] px-3 text-xs font-bold text-[color:var(--brand)] hover:bg-[color:var(--brand-soft)]">Şifremi unuttum</Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="auth-input" />
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
