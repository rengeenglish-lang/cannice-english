"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, Lock } from "lucide-react";
import { createPaypalOrderAction, capturePaypalOrderAction } from "@/app/actions/paypal-checkout";

type FieldHandle = { render: (selector: string) => Promise<void> | void };
type CardFieldsHandle = {
  isEligible: () => boolean;
  NumberField: (o?: object) => FieldHandle;
  ExpiryField: (o?: object) => FieldHandle;
  CVVField: (o?: object) => FieldHandle;
  NameField: (o?: object) => FieldHandle;
  submit: () => Promise<void>;
};
type CallbackOptions = {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: (error: unknown) => void;
};

declare global {
  interface Window {
    paypal?: {
      FUNDING: { CARD: string };
      CardFields?: (options: CallbackOptions & { style?: object }) => CardFieldsHandle;
      Buttons: (options: CallbackOptions & { fundingSource?: string; style?: Record<string, string> }) => {
        isEligible: () => boolean;
        render: (selector: string) => void;
      };
    };
  }
}

const FIELD_STYLE = {
  input: { "font-size": "16px", "font-family": "Inter, system-ui, sans-serif", padding: "12px", color: "#10291c" },
  ".invalid": { color: "#be123c" },
};

/**
 * Card payment, processed by PayPal; a PayPal-account option is never shown. When the account is
 * approved for card fields, the card inputs are embedded and paid with our own "Ödeme Yap"
 * button. Otherwise PayPal's "Debit or Credit Card" button is used, left in English because
 * PayPal's Turkish card form renders its pay button without a label.
 */
export function PaypalCheckoutButton({ orderId, clientId }: { orderId: string; clientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"loading" | "fields" | "button" | "unavailable">("loading");
  const [paying, setPaying] = useState(false);
  const rendered = useRef(false);
  const cardFields = useRef<CardFieldsHandle | null>(null);

  const callbacks: CallbackOptions = {
    createOrder: async () => {
      setError(null);
      const { paypalOrderId } = await createPaypalOrderAction(orderId);
      return paypalOrderId;
    },
    onApprove: async (data) => {
      await capturePaypalOrderAction(orderId, data.orderID);
      router.push(`/checkout/received?order=${orderId}`);
    },
    onError: () => {
      setPaying(false);
      setError("Ödeme tamamlanamadı. Lütfen kart bilgilerini kontrol edip tekrar dene veya banka havalesi seçeneğini kullan.");
    },
  };

  function renderCard() {
    const paypal = window.paypal;
    if (rendered.current || !paypal) return;
    rendered.current = true;

    const fields = paypal.CardFields?.({ ...callbacks, style: FIELD_STYLE });
    if (fields?.isEligible()) {
      cardFields.current = fields;
      setMode("fields");
      // The containers exist once React has rendered the "fields" layout.
      window.setTimeout(() => {
        void fields.NameField({ placeholder: "Kart üzerindeki ad soyad" }).render("#card-name");
        void fields.NumberField({ placeholder: "Kart numarası" }).render("#card-number");
        void fields.ExpiryField({ placeholder: "AA / YY" }).render("#card-expiry");
        void fields.CVVField({ placeholder: "CVV" }).render("#card-cvv");
      }, 0);
      return;
    }

    const button = paypal.Buttons({ ...callbacks, fundingSource: paypal.FUNDING.CARD, style: { layout: "vertical", color: "black", shape: "rect", label: "pay" } });
    if (!button.isEligible()) {
      setMode("unavailable");
      return;
    }
    setMode("button");
    window.setTimeout(() => button.render("#paypal-button-container"), 0);
  }

  async function pay() {
    if (!cardFields.current || paying) return;
    setError(null);
    setPaying(true);
    try {
      await cardFields.current.submit();
    } catch {
      setPaying(false);
      setError("Kart bilgileri eksik veya hatalı görünüyor. Lütfen kontrol edip tekrar dene.");
    }
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields&enable-funding=card&disable-funding=paylater,venmo,credit`}
        onReady={renderCard}
      />
      {mode === "loading" ? <p className="text-sm text-[color:var(--muted)]">Kart ödeme formu yükleniyor…</p> : null}
      {mode === "fields" ? (
        <div className="space-y-2">
          <div id="card-name" />
          <div id="card-number" />
          <div className="grid grid-cols-2 gap-2">
            <div id="card-expiry" />
            <div id="card-cvv" />
          </div>
          <button type="button" className="primary-button mt-2 w-full justify-center" onClick={pay} disabled={paying}>
            {paying ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
            {paying ? "Ödeme yapılıyor…" : "Ödeme Yap"}
          </button>
        </div>
      ) : null}
      <div id="paypal-button-container" hidden={mode !== "button"} />
      {mode === "unavailable" ? <p className="text-sm font-semibold text-[color:var(--danger)]">Kartla ödeme şu anda kullanılamıyor. Lütfen banka havalesi ile sipariş ver veya bize yaz.</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
