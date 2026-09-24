"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { placeOrderAction, type CheckoutFormState } from "@/app/actions/checkout";

const initialState: CheckoutFormState = { status: "idle" };

export function CheckoutForm({ isGuest, defaultCoupon = "" }: { isGuest: boolean; defaultCoupon?: string }) {
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
            className={`rounded-xl border p-4 text-left transition ${paymentMethod === "PAYPAL" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}
          >
            <span className="block font-bold text-[color:var(--foreground)]">PayPal ile Öde</span>
            <span className="mt-1 block text-xs text-[color:var(--muted)]">Kart veya PayPal hesabınla anında öde.</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("MANUAL")}
            className={`rounded-xl border p-4 text-left transition ${paymentMethod === "MANUAL" ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}
          >
            <span className="block font-bold text-[color:var(--foreground)]">Banka Havalesi</span>
            <span className="mt-1 block text-xs text-[color:var(--muted)]">Ekibimiz seninle iletişime geçer.</span>
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
        <input id="couponCode" name="couponCode" placeholder="Kupon kodu" defaultValue={defaultCoupon} className="auth-input uppercase placeholder:normal-case" />
      </div>
      {paymentMethod === "MANUAL" ? (
        <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-4 text-sm text-[color:var(--brand)]">
          Siparişin &ldquo;ödeme bekleniyor&rdquo; durumunda oluşturulacak ve ekibimiz banka havalesi bilgileri için seninle iletişime geçecek.
        </p>
      ) : null}
      <label className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] p-4 text-sm leading-6 text-slate-700">
        <input type="checkbox" name="acceptTerms" required className="mt-1 size-5 shrink-0 accent-[color:var(--accent)]" />
        <span>
          <Link href="/legal/on-bilgilendirme-formu" target="_blank" className="font-bold underline">Ön Bilgilendirme Formu</Link>&apos;nu ve{" "}
          <Link href="/legal/mesafeli-satis-sozlesmesi" target="_blank" className="font-bold underline">Mesafeli Satış Sözleşmesi</Link>&apos;ni okudum, onaylıyorum.
          Dijital içerik ve hizmetlerin ödeme onayıyla hemen hesabıma tanımlanmasını kabul ediyorum.
        </span>
      </label>
      <p className="text-xs leading-5 text-[color:var(--muted)]">
        14 gün içinde iade talep edebilirsin. <Link href="/legal/iade-politikasi" target="_blank" className="underline">İade Politikası</Link>
      </p>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button w-full justify-center">
        {pending ? "Sipariş oluşturuluyor…" : paymentMethod === "PAYPAL" ? "Ödemeye Geç" : "Siparişi Tamamla"}
      </button>
    </form>
  );
}
