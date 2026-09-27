"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { Check, ExternalLink, FileText, MonitorPlay, CalendarClock } from "lucide-react";
import { DEFAULT_CONSENT_CONFIGURATION, type ConsentConfiguration, CONSENT_INFORMATION_LINKS, type ConsentRequirements } from "@/lib/checkout-consent";

function emphasize(text: string, phrase: string) {
  const position = text.indexOf(phrase);
  if (position < 0) return text;
  return <>{text.slice(0, position)}<strong className="font-bold text-[color:var(--foreground)]">{phrase}</strong>{text.slice(position + phrase.length)}</>;
}

export function CheckoutConsents({ requirements, pending = false, documentsDraft = false, configuration = DEFAULT_CONSENT_CONFIGURATION }: { requirements: ConsentRequirements; pending?: boolean; documentsDraft?: boolean; configuration?: ConsentConfiguration }) {
  const id = useId();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const choices: { key: keyof typeof CONSENT_INFORMATION_LINKS; title: string; text: ReactNode; icon: ReactNode }[] = [
    { key: "agreementConsent", title: "Sözleşme ve Ön Bilgilendirme", text: emphasize(configuration.text.agreement, "Mesafeli Satış Sözleşmesi'ni ve Ön Bilgilendirme Formu'nu"), icon: <FileText size={18} aria-hidden="true" /> },
    ...(requirements.immediateDigital ? [{ key: "immediateDigitalConsent" as const, title: "Dijital İçeriğin Hemen Sunulması", text: emphasize(configuration.text.immediateDigital, "ödeme sonrasında hemen kullanıma açılmasını"), icon: <MonitorPlay size={18} aria-hidden="true" /> }] : []),
    ...(requirements.earlyService ? [{ key: "earlyServiceConsent" as const, title: "Canlı Hizmetin Erken Başlatılması", text: emphasize(configuration.text.earlyService, "14 günlük cayma süresi sona ermeden önce başlamasını"), icon: <CalendarClock size={18} aria-hidden="true" /> }] : []),
  ];
  const completed = choices.filter((choice) => accepted[choice.key]).length;

  return <fieldset disabled={pending} aria-describedby={`${id}-help`} className="min-w-0 space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-6">
    <legend className="px-2 text-lg font-extrabold">Sipariş Onayları</legend>
    <input type="hidden" name="consentVersion" value={configuration.version} />
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p id={`${id}-help`} className="max-w-md text-sm leading-6 text-[color:var(--muted)]">Belgeleri inceleyin ve aşağıdaki onayları ayrı ayrı işaretleyin.</p>
      <span role="status" aria-live="polite" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--brand)]">{completed === choices.length ? <Check size={14} aria-hidden="true" /> : null}{completed} / {choices.length} onay</span>
    </div>
    {documentsDraft ? <p className="text-xs leading-5 text-[color:var(--muted)]">Belge durumu: Taslak. Tam sözleşme ve ön bilgilendirme metinleri henüz yayımlanmamıştır.</p> : null}
    <div className="space-y-3">{choices.map((choice) => <div key={choice.key} className={`rounded-xl border p-4 transition ${accepted[choice.key] ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]" : "border-[color:var(--border)]"}`}>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[color:var(--brand)]">
        <input type="checkbox" name={choice.key} required aria-describedby={`${id}-${choice.key}-links`} checked={Boolean(accepted[choice.key])} onChange={(event) => setAccepted((previous) => ({ ...previous, [choice.key]: event.target.checked }))} className="mt-1 size-5 shrink-0 accent-[color:var(--brand)]" />
        <span className="min-w-0"><span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold">{choice.icon}{choice.title}<span className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] font-semibold">Zorunlu</span></span><span className="block text-sm leading-6 text-[color:var(--muted)]">{choice.text}</span></span>
      </label>
      <div id={`${id}-${choice.key}-links`} className="mt-3 space-y-1 border-t border-[color:var(--border)] pt-2 sm:ml-8">
        {CONSENT_INFORMATION_LINKS[choice.key].map((link) => <Link key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg py-2 text-sm font-semibold text-[color:var(--brand)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"><span>{link.label}<span className="sr-only"> (yeni sekmede açılır)</span></span><ExternalLink size={15} className="shrink-0" aria-hidden="true" /></Link>)}
        <p className="text-xs text-[color:var(--muted)]">Yeni sekmede açılır. Bilgi bağlantısını açmak onay kutusunu işaretlemez.</p>
      </div>
    </div>)}</div>
  </fieldset>;
}
