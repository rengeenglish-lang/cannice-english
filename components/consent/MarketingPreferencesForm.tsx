"use client";

import { useActionState } from "react";
import { updateMarketingPrefsAction, type MarketingPrefsState } from "@/app/actions/consent";
import { MARKETING_CHANNELS, MARKETING_CONSENT_TEXT, type MarketingKey } from "@/lib/consent";

export function MarketingPreferencesForm({ values }: { values: Record<MarketingKey, boolean> }) {
  const [state, action, pending] = useActionState(updateMarketingPrefsAction, { status: "idle" } as MarketingPrefsState);
  return (
    <form action={action} className="dashboard-panel space-y-3">
      <h2 className="text-lg font-extrabold">İletişim tercihlerim</h2>
      <p className="text-sm text-[color:var(--muted)]">
        {MARKETING_CONSENT_TEXT} Sipariş, ders ve hesap e-postaları bu tercihten bağımsız olarak gönderilir.{" "}
        <a href="/legal/acik-riza-metni" target="_blank" className="underline">Açık Rıza Metni</a>
      </p>
      <div className="space-y-2">
        {MARKETING_CHANNELS.map((c) => (
          <label key={c.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={c.key} defaultChecked={values[c.key]} className="size-4" />
            {c.label}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="primary-button text-sm">{pending ? "Kaydediliyor…" : "Tercihleri kaydet"}</button>
        {state.message ? <p className={`text-sm font-semibold ${state.status === "error" ? "text-[color:var(--danger)]" : "text-emerald-700"}`}>{state.message}</p> : null}
      </div>
      <p className="text-xs text-[color:var(--muted)]">
        Çerez tercihlerini sayfanın altındaki <strong>Çerez tercihleri</strong> bağlantısından değiştirebilirsin.
      </p>
    </form>
  );
}
