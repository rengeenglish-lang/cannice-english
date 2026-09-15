"use client";

import { useActionState } from "react";
import { submitCallbackFormAction, type CallbackFormState } from "@/app/actions/leads";

const initialState: CallbackFormState = { status: "idle" };

export function CallMeBackForm() {
  const [state, formAction, pending] = useActionState(submitCallbackFormAction, initialState);

  return (
    <section className="mx-auto mt-20 w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="panel grid grid-cols-1 gap-8 bg-[color:var(--brand)] text-white lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow text-[#a99cf5]">Biz Sizi Arayalım?</p>
          <h2 className="section-title text-white">Dersler, uygulamalar ve platform hakkında sorularınızın cevabını hemen alın</h2>
          <p className="section-copy text-white/70">Adınızı ve telefon numaranızı bırakın, size en uygun paketi birlikte belirleyelim.</p>
        </div>
        {state.status === "success" ? (
          <p className="success-banner">{state.message}</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
            <input name="name" required placeholder="Adınız Soyadınız" className="auth-input border-white/20 bg-white/10 text-white placeholder:text-white/50 sm:flex-1" />
            <input name="phone" required placeholder="0 (5XX) XXX XX XX" className="auth-input border-white/20 bg-white/10 text-white placeholder:text-white/50 sm:flex-1" />
            <button type="submit" disabled={pending} className="primary-button shrink-0">
              {pending ? "Gönderiliyor…" : "Beni Arayın"}
            </button>
          </form>
        )}
        {state.status === "error" ? <p className="mt-2 text-sm font-semibold text-red-300">{state.message}</p> : null}
      </div>
    </section>
  );
}
