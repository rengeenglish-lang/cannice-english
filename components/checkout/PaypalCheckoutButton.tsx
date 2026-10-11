"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createPaypalOrderAction, capturePaypalOrderAction } from "@/app/actions/paypal-checkout";

declare global {
  interface Window {
    paypal?: {
      FUNDING: { CARD: string };
      Buttons: (options: {
        fundingSource?: string;
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (error: unknown) => void;
      }) => { isEligible: () => boolean; render: (selector: string) => void };
    };
  }
}

/**
 * Card payment, processed by PayPal. Only the "Debit or Credit Card" button is rendered: paying
 * with a PayPal account (and Pay Later / Venmo) is not offered.
 */
export function PaypalCheckoutButton({ orderId, clientId }: { orderId: string; clientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const rendered = useRef(false);

  function renderButtons() {
    if (rendered.current || !window.paypal) return;
    rendered.current = true;
    const buttons = window.paypal.Buttons({
      fundingSource: window.paypal.FUNDING.CARD,
      style: { layout: "vertical", color: "black", shape: "rect", label: "pay" },
      createOrder: async () => {
        setError(null);
        const { paypalOrderId } = await createPaypalOrderAction(orderId);
        return paypalOrderId;
      },
      onApprove: async (data) => {
        await capturePaypalOrderAction(orderId, data.orderID);
        router.push(`/checkout/received?order=${orderId}`);
      },
      onError: () => setError("Ödeme tamamlanamadı. Lütfen kart bilgilerini kontrol edip tekrar dene veya banka havalesi seçeneğini kullan."),
    });
    if (!buttons.isEligible()) {
      setUnavailable(true);
      return;
    }
    buttons.render("#paypal-button-container");
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&enable-funding=card&disable-funding=paylater,venmo,credit&locale=tr_TR`}
        onReady={() => {
          setReady(true);
          renderButtons();
        }}
      />
      <div id="paypal-button-container" />
      {!ready ? <p className="text-sm text-[color:var(--muted)]">Kart ödeme formu yükleniyor…</p> : null}
      {unavailable ? <p className="text-sm font-semibold text-[color:var(--danger)]">Kartla ödeme şu anda kullanılamıyor. Lütfen banka havalesi ile sipariş ver veya bize yaz.</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
