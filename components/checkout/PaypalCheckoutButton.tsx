"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createPaypalOrderAction, capturePaypalOrderAction } from "@/app/actions/paypal-checkout";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (error: unknown) => void;
      }) => { render: (selector: string) => void };
    };
  }
}

export function PaypalCheckoutButton({ orderId, clientId }: { orderId: string; clientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const rendered = useRef(false);

  function renderButtons() {
    if (rendered.current || !window.paypal) return;
    rendered.current = true;
    window.paypal.Buttons({
      createOrder: async () => {
        setError(null);
        const { paypalOrderId } = await createPaypalOrderAction(orderId);
        return paypalOrderId;
      },
      onApprove: async (data) => {
        await capturePaypalOrderAction(orderId, data.orderID);
        router.push(`/checkout/received?order=${orderId}`);
      },
      onError: () => setError("Ödeme tamamlanamadı. Lütfen tekrar dene veya banka havalesi seçeneğini kullan."),
    }).render("#paypal-button-container");
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`}
        onReady={() => {
          setReady(true);
          renderButtons();
        }}
      />
      <div id="paypal-button-container" />
      {!ready ? <p className="text-sm text-[color:var(--muted)]">Ödeme seçenekleri yükleniyor…</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
