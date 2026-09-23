"use client";
import { useActionState } from "react";
import { updateTryUsdRateAction, type UpdateRateState } from "@/app/actions/admin-settings";

const initialState: UpdateRateState = { status: "idle" };

export function TryUsdRateForm({ currentRate }: { currentRate: string }) {
  const [state, formAction, pending] = useActionState(updateTryUsdRateAction, initialState);

  return (
    <form action={formAction} className="panel max-w-md space-y-4">
      <div>
        <label className="label" htmlFor="rate">1 TL kaç USD?</label>
        <input id="rate" name="rate" type="text" inputMode="decimal" defaultValue={currentRate} required className="auth-input" placeholder="0.024" />
        <p className="mt-2 text-xs text-[color:var(--muted)]">
          PayPal ile ödeme yalnızca bu kur üzerinden hesaplanan USD tutarını görür — müşteriler her zaman TL fiyatı görür.
          Örnek: kur 0.024 ise 1.000 TL&apos;lik bir sipariş PayPal&apos;da 24,00 USD olarak tahsil edilir.
        </p>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kuru Kaydet"}</button>
    </form>
  );
}
