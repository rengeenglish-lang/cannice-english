"use client";

import { CheckoutConsents } from "@/components/checkout/CheckoutConsents";
import { CHECKOUT_ORDER_BUTTON, type ConsentConfiguration, type ConsentRequirements } from "@/lib/checkout-consent";
import { useActionState, useState } from "react";
import { placeOrderAction, type CheckoutFormState } from "@/app/actions/checkout";

const initialState: CheckoutFormState = { status: "idle" };

export function CheckoutForm({ isGuest, defaultCoupon = "", consentRequirements, documentsDraft = false, consentConfiguration }: { isGuest: boolean; defaultCoupon?: string; consentRequirements: ConsentRequirements; documentsDraft?: boolean; consentConfiguration: ConsentConfiguration }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  const [paymentMethod, setPaymentMethod] = useState<"MANUAL" | "PAYPAL">("PAYPAL");

  return (
    <form action={formAction} className="panel space-y-4">
      <input type="hidden" name="paymentMethod" value={paymentMethod} />
      <div>
        <p className="label">Ödeme Yöntemi</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("PAYPAL")}
            aria-pressed={paymentMethod === "PAYPAL"}
            disabled={pending}
            className={`rounded-xl border p-4 text-left transition ${paymentMethod === "PAYPAL" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}
          >
            <span className="block font-bold text-[color:var(--foreground)]">PayPal ile Öde</span>
            <span className="mt-1 block text-xs text-[color:var(--muted)]">Kart veya PayPal hesabınla anında öde.</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("MANUAL")}
            aria-pressed={paymentMethod === "MANUAL"}
            disabled={pending}
            className={`rounded-xl border p-4 text-left transition ${paymentMethod === "MANUAL" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}
          >
            <span className="block font-bold text-[color:var(--foreground)]">Banka Havalesi</span>
            <span className="mt-1 block text-xs text-[color:var(--muted)]">Ekibimiz sizinle iletişime geçer.</span>
          </button>
        </div>
      </div>
      {isGuest ? (
        <>
          <div>
            <label className="label" htmlFor="guestName">Adın Soyadın</label>
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
        <input id="couponCode" name="couponCode" placeholder="PASS25" defaultValue={defaultCoupon} className="auth-input uppercase" />
      </div>
      {paymentMethod === "MANUAL" ? (
        <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-4 text-sm text-[color:var(--brand)]">
          Siparişin &ldquo;ödeme bekleniyor&rdquo; durumunda oluşturulacak ve ekibimiz banka havalesi bilgileri için seninle iletişime geçecek.
        </p>
      ) : null}
      <CheckoutConsents requirements={consentRequirements} pending={pending} documentsDraft={documentsDraft} configuration={consentConfiguration} />
      {state.status === "error" ? <p role="alert" className="rounded-xl border border-[color:var(--danger)] p-3 text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <p className="text-xs leading-5 text-[color:var(--muted)]">{paymentMethod === "PAYPAL" ? "Siparişi onayladıktan sonra ödeme adımına geçersiniz." : "Siparişiniz ödeme bekler. Erişiminiz, havaleniz doğrulandıktan sonra açılır."}</p>
      <button type="submit" disabled={pending} className="primary-button min-h-14 w-full justify-center whitespace-normal px-4 py-4 text-center text-sm leading-6 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Sipariş oluşturuluyor…" : CHECKOUT_ORDER_BUTTON}
      </button>
    </form>
  );
}
