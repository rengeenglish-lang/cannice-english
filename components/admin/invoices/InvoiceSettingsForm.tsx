"use client";

import { useActionState } from "react";
import { saveInvoiceSettingsAction, type InvoiceActionState } from "@/app/actions/admin-invoices";
import type { InvoiceSeller } from "@/lib/invoices/render";

export function InvoiceSettingsForm({ seller, taxRate }: { seller: InvoiceSeller; taxRate: number }) {
  const [state, action, pending] = useActionState(saveInvoiceSettingsAction, { status: "idle" } as InvoiceActionState);
  const field = (name: keyof InvoiceSeller | "taxRate", label: string, value: string, hint?: string) => (
    <div>
      <label className="label" htmlFor={`inv-${name}`}>{label}</label>
      <input id={`inv-${name}`} name={name} defaultValue={value} className="auth-input" />
      {hint ? <p className="mt-1 text-xs text-[color:var(--muted)]">{hint}</p> : null}
    </div>
  );
  return (
    <form action={action} className="panel grid gap-4 sm:grid-cols-2">
      {field("name", "Şirket unvanı", seller.name, "Kenya'da kayıtlı tam unvan, örn. Netfener Ltd.")}
      {field("taxId", "KRA PIN", seller.taxId, "Kenya vergi numarası (P0… ile başlar).")}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="inv-address">Adres</label>
        <textarea id="inv-address" name="address" defaultValue={seller.address} rows={2} className="auth-input" />
      </div>
      {field("country", "Ülke", seller.country)}
      {field("trVatNumber", "Türkiye KDV no (varsa)", seller.trVatNumber, "Yabancı elektronik hizmet sağlayıcısı olarak GİB'e kayıtlıysanız.")}
      {field("email", "E-posta", seller.email)}
      {field("phone", "Telefon", seller.phone)}
      {field("taxRate", "Fiyatlara dahil KDV oranı (%)", String(taxRate), "Faturada 'Dahil KDV' satırı için. 0 yazarsanız vergi satırı basılmaz.")}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="inv-note">Fatura alt notu</label>
        <textarea id="inv-note" name="note" defaultValue={seller.note} rows={2} className="auth-input" placeholder="örn. Bu belge Netfener Ltd. (Kenya) tarafından düzenlenmiştir." />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
        {state.message ? <p className={`text-sm font-semibold ${state.status === "error" ? "text-[color:var(--danger)]" : "text-emerald-700"}`}>{state.message}</p> : null}
      </div>
    </form>
  );
}
