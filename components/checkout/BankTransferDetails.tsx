"use client";
import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Eye, Landmark } from "lucide-react";
import { BANK_IBAN } from "@/lib/bank-transfer";
import { revealBankRecipientAction } from "@/app/actions/bank-transfer";

/** The revealed recipient name is hidden again after this long without any activity on the page. */
const HIDE_NAME_AFTER_MS = 2 * 60_000;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ghost-button !min-h-8 !px-2 !py-1 text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Kopyalandı" : label}</span>
    </button>
  );
}

/**
 * IBAN and recipient name, each with a copy button. The name isn't in the page until
 * "Alıcı adını göster" fetches it, and it's hidden again after two minutes of inactivity.
 */
export function BankTransferDetails({ orderId }: { orderId?: string }) {
  const [name, setName] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!name) return;
    let timer = window.setTimeout(() => setName(null), HIDE_NAME_AFTER_MS);
    const active = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setName(null), HIDE_NAME_AFTER_MS);
    };
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
    for (const e of events) window.addEventListener(e, active, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, active);
    };
  }, [name]);

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-4 text-left text-sm text-[color:var(--foreground)]">
      <p className="flex items-center gap-2 font-bold"><Landmark size={16} aria-hidden="true" /> Havale / EFT bilgileri</p>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-xs font-bold text-[color:var(--muted)]">IBAN</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wide">{BANK_IBAN}</span>
            <CopyButton text={BANK_IBAN.replace(/\s/g, "")} label="IBAN'ı kopyala" />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-[color:var(--muted)]">Alıcı</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-2" aria-live="polite">
            {name ? (
              <>
                <span className="font-bold">{name}</span>
                <CopyButton text={name} label="Adı kopyala" />
              </>
            ) : (
              <button type="button" className="ghost-button !min-h-8 !px-2 !py-1 text-xs" disabled={pending} onClick={() => start(async () => setName(await revealBankRecipientAction()))}>
                <Eye size={14} aria-hidden="true" /> Alıcı adını göster
              </button>
            )}
          </dd>
          {name ? <p className="mt-1 text-[11px] text-[color:var(--muted)]">Güvenliğin için ad, 2 dakika işlem yapılmazsa yeniden gizlenir.</p> : null}
        </div>
        {orderId ? (
          <div>
            <dt className="text-xs font-bold text-[color:var(--muted)]">Açıklama</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold">{orderId}</span>
              <CopyButton text={orderId} label="Kopyala" />
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">
        {orderId ? "Havale açıklamasına sipariş numaranı yazmayı unutma. " : "Siparişi oluşturduktan sonra havale açıklamasına sipariş numaranı yaz. "}
        Ödemen doğrulandığında erişimin açılır.
      </p>
    </div>
  );
}
