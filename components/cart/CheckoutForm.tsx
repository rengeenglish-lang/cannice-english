"use client";

import { useActionState } from "react";
import { placeOrderAction, type CheckoutFormState } from "@/app/actions/checkout";

const initialState: CheckoutFormState = { status: "idle" };

export function CheckoutForm({ isGuest }: { isGuest: boolean }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);

  return (
    <form action={formAction} className="panel space-y-4">
      {isGuest ? (
        <>
          <div>
            <label className="label" htmlFor="guestName">Adınız Soyadınız</label>
            <input id="guestName" name="guestName" required className="auth-input" />
          </div>
          <div>
            <label className="label" htmlFor="guestEmail">E-posta</label>
            <input id="guestEmail" name="guestEmail" type="email" required className="auth-input" />
          </div>
          <div>
            <label className="label" htmlFor="guestPhone">Telefon</label>
            <input id="guestPhone" name="guestPhone" required className="auth-input" />
          </div>
        </>
      ) : null}
      <div>
        <label className="label" htmlFor="couponCode">Kupon Kodu (opsiyonel)</label>
        <input id="couponCode" name="couponCode" placeholder="PASS25" className="auth-input uppercase" />
      </div>
      <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-4 text-sm text-[color:var(--brand)]">
        Ödeme altyapımız şu anda kurulum aşamasındadır. Siparişiniz &ldquo;ödeme bekleniyor&rdquo; durumunda oluşturulacak ve ekibimiz sizinle iletişime geçecektir.
      </p>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Sipariş oluşturuluyor…" : "Siparişi Tamamla"}
      </button>
    </form>
  );
}
