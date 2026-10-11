"use client";

import { useActionState } from "react";
import { registerAction, type RegisterFormState } from "@/app/actions/register";
import { MARKETING_CHANNELS, MARKETING_CONSENT_TEXT } from "@/lib/consent";
import { RegisterExamPicker } from "@/components/exam-interests/RegisterExamPicker";

const initialState: RegisterFormState = { status: "idle" };

export function RegisterForm({next, src, referral}: {next?: string; src?: string; referral?: string}) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  return (
    <form action={formAction} className="panel space-y-4">
<input type="hidden" name="next" value={next || ""} />
<input type="hidden" name="src" value={src || ""} />
<input type="hidden" name="ref" value={referral || ""} />
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
      <RegisterExamPicker />
      <div className="space-y-3 rounded-lg border border-[color:var(--border)] p-3 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" name="terms" required className="mt-1 size-4 shrink-0" />
          <span>
            <a href="/legal/uyelik-sozlesmesi" target="_blank" className="font-bold text-[color:var(--brand)] underline">Üyelik Sözleşmesi</a>&apos;ni okudum ve kabul ediyorum. <span className="text-[color:var(--danger)]">*</span>
          </span>
        </label>
        <p className="text-xs text-[color:var(--muted)]">
          Kişisel verilerinin işlenmesine ilişkin <a href="/legal/aydinlatma-metni" target="_blank" className="underline">KVKK Aydınlatma Metni</a>&apos;ni okuyabilirsin.
        </p>
        <fieldset className="border-t border-[color:var(--border)] pt-3">
          <legend className="text-xs font-bold text-[color:var(--muted)]">İsteğe bağlı</legend>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {MARKETING_CONSENT_TEXT} <a href="/legal/acik-riza-metni" target="_blank" className="underline">Açık Rıza Metni</a>
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {MARKETING_CHANNELS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-xs">
                <input type="checkbox" name={c.key} className="size-4" />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Hesap oluşturuluyor…" : "Ücretsiz Denemeye Başla"}
      </button>
    </form>
  );
}
