"use client";
import { useState, useTransition } from "react";
import { Check, Copy, Eye, Landmark } from "lucide-react";
import { BANK_IBAN } from "@/lib/bank-transfer";
import { revealBankRecipientAction } from "@/app/actions/bank-transfer";

/** IBAN with a copy button; the recipient's name appears only after "Alıcı adını göster". */
export function BankTransferDetails({ orderId }: { orderId?: string }) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--brand-soft)] p-4 text-left text-sm text-[color:var(--foreground)]">
      <p className="flex items-center gap-2 font-bold"><Landmark size={16} aria-hidden="true" /> Havale / EFT bilgileri</p>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-xs font-bold text-[color:var(--muted)]">IBAN</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wide">{BANK_IBAN}</span>
            <button
              type="button"
              className="ghost-button !min-h-8 !px-2 !py-1 text-xs"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(BANK_IBAN.replace(/\s/g, ""));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Kopyalandı" : "IBAN'ı kopyala"}</span>
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold text-[color:var(--muted)]">Alıcı</dt>
          <dd className="mt-0.5">
            {name ? (
              <span className="font-bold">{name}</span>
            ) : (
              <button type="button" className="ghost-button !min-h-8 !px-2 !py-1 text-xs" disabled={pending} onClick={() => start(async () => setName(await revealBankRecipientAction()))}>
                <Eye size={14} aria-hidden="true" /> Alıcı adını göster
              </button>
            )}
          </dd>
        </div>
        {orderId ? (
          <div>
            <dt className="text-xs font-bold text-[color:var(--muted)]">Açıklama</dt>
            <dd className="mt-0.5 font-mono font-bold">{orderId}</dd>
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
