"use client";

import { CheckoutConsents } from "@/components/checkout/CheckoutConsents";
import { CHECKOUT_ORDER_BUTTON, type ConsentConfiguration, type ConsentRequirements } from "@/lib/checkout-consent";
import { useActionState, useState } from "react";
import { placeOrderAction, type CheckoutFormState } from "@/app/actions/checkout";
import { formatTRY } from "@/lib/pricing";

const initialState: CheckoutFormState = { status: "idle" };

export function CheckoutForm({ isGuest, defaultCoupon = "", consentRequirements, documentsDraft = false, consentConfiguration, shippingTotal = 0 }: { isGuest: boolean; defaultCoupon?: string; consentRequirements: ConsentRequirements; documentsDraft?: boolean; consentConfiguration: ConsentConfiguration; shippingTotal?: number }) {
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
      {shippingTotal > 0 ? (
        <fieldset className="rounded-xl border border-[color:var(--border)] p-4">
          <legend className="label px-1">Teslimat Adresi</legend>
          <p className="mb-3 text-xs text-[color:var(--muted)]">
            Basılı kitap siparişe özel basılır ve bu adrese kargolanır. Kargo ücreti {formatTRY(shippingTotal)} olarak siparişe eklenir.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="shipName">Alıcı Adı Soyadı</label>
              <input id="shipName" name="shipName" required autoComplete="name" className="auth-input" />
            </div>
            <div>
              <label className="label" htmlFor="shipPhone">Telefon</label>
              <input id="shipPhone" name="shipPhone" required autoComplete="tel" className="auth-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="shipLine1">Adres</label>
              <input id="shipLine1" name="shipLine1" required autoComplete="address-line1" placeholder="Mahalle, cadde, sokak, kapı no" className="auth-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="shipLine2">Adres (devamı, opsiyonel)</label>
              <input id="shipLine2" name="shipLine2" autoComplete="address-line2" placeholder="Apartman, daire, kat" className="auth-input" />
            </div>
            <div>
              <label className="label" htmlFor="shipDistrict">İlçe</label>
              <input id="shipDistrict" name="shipDistrict" required autoComplete="address-level2" className="auth-input" />
            </div>
            <div>
              <label className="label" htmlFor="shipCity">İl</label>
              <input id="shipCity" name="shipCity" required autoComplete="address-level1" className="auth-input" />
            </div>
            <div>
              <label className="label" htmlFor="shipPostalCode">Posta Kodu (opsiyonel)</label>
              <input id="shipPostalCode" name="shipPostalCode" inputMode="numeric" autoComplete="postal-code" className="auth-input" />
            </div>
            <div>
              <label className="label" htmlFor="shipNote">Kargo Notu (opsiyonel)</label>
              <input id="shipNote" name="shipNote" placeholder="Kapıcıya bırakılabilir" className="auth-input" />
            </div>
          </div>
        </fieldset>
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
