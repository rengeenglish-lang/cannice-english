"use client";
import { useActionState, useState } from "react";
import { saveLegalContentAction } from "@/app/actions/admin-legal";
import type { LegalDoc } from "@/content/legal-terms";
import type { ConsentWording } from "@/lib/legal-content";
import { CONSENT_INFORMATION_LINKS } from "@/lib/checkout-consent";

const WORDING_LABELS: Record<keyof ConsentWording, string> = { agreement: "Sözleşme ve Ön Bilgilendirme", immediateDigital: "Dijital İçeriğin Hemen Sunulması", earlyService: "Canlı Hizmetin Erken Başlatılması" };
export function LegalContentEditor({ target, revision, document, wording }: { target: string; revision: number; document?: LegalDoc; wording: ConsentWording }) {
  const [state, action, pending] = useActionState(saveLegalContentAction, { message: "", revision });
  const [title, setTitle] = useState(document?.title ?? "");
  const [body, setBody] = useState(document?.body ?? "");
  const [sections, setSections] = useState((document?.sections ?? []).map((section, index) => ({ key: `initial-${index}`, id: section.id, heading: section.heading, text: section.paragraphs.join("\n\n") })));
  const [text, setText] = useState(wording);
  const [preview, setPreview] = useState(false);
  const isCheckout = target === "checkout";
  const content = isCheckout ? text : { title, body, sections: sections.map(({ id, heading, text: paragraphs }) => ({ ...(id ? { id } : {}), heading, paragraphs: paragraphs.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) })) };
  const requiredAnchors = Object.values(CONSENT_INFORMATION_LINKS).flat().flatMap((link) => link.href.startsWith(`/legal/${target}#`) ? [link.href.split("#")[1]] : []);

  return <form action={action} className="dashboard-panel space-y-5 p-4 sm:p-6" aria-busy={pending}>
    <input type="hidden" name="target" value={target} />
    <input type="hidden" name="revision" value={state.revision ?? revision} />
    <input type="hidden" name="content" value={JSON.stringify(content)} />
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{isCheckout ? "Ödeme Onay Metinleri" : document?.title}</h2><button type="button" aria-pressed={preview} className="ghost-button" onClick={() => setPreview(!preview)}>{preview ? "Düzenlemeye Dön" : "Taslağı Önizle"}</button></div>
    <p className="text-sm text-[color:var(--muted)]">Taslak kaydetmek siteyi değiştirmez. Yayımla düğmesi bu metni sitede kullanıma açar. Eski siparişlerin onay kayıtları korunur.</p>
    <fieldset disabled={pending} className={`space-y-5 ${preview ? "hidden" : ""}`}>
      {isCheckout ? (Object.keys(WORDING_LABELS) as (keyof ConsentWording)[]).map((key) => <label key={key} className="block"><span className="label">{WORDING_LABELS[key]}</span><textarea className="auth-input min-h-28" value={text[key]} onChange={(event) => setText((current) => ({ ...current, [key]: event.target.value }))} minLength={20} maxLength={2000} /></label>) : <>
        <label className="block"><span className="label">Belge başlığı</span><input className="auth-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} /></label>
        <label className="block"><span className="label">Giriş / açıklama</span><textarea className="auth-input min-h-32" value={body} onChange={(event) => setBody(event.target.value)} maxLength={15000} /></label>
        {sections.map((section, index) => <section key={section.key} className="space-y-3 rounded-xl border border-[color:var(--border)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Bölüm {index+1}</h3><button type="button" className="ghost-button" disabled={Boolean(section.id && requiredAnchors.includes(section.id))} onClick={() => setSections((current) => current.filter((s) => s.key !== section.key))}>Bölümü Kaldır</button></div>
          {section.id ? <p className="text-xs text-[color:var(--muted)]">Bağlantı: #{section.id}{requiredAnchors.includes(section.id) ? " — ödeme formunda kullanılıyor; bölüm korunur." : ""}</p> : null}
          <label className="block"><span className="label">Bölüm başlığı</span><input className="auth-input" value={section.heading} maxLength={250} onChange={(event) => setSections((current) => current.map((s) => s.key === section.key ? { ...s, heading: event.target.value } : s))} /></label>
          <label className="block"><span className="label">Bölüm metni</span><textarea className="auth-input min-h-40" value={section.text} onChange={(event) => setSections((current) => current.map((s) => s.key === section.key ? { ...s, text: event.target.value } : s))} /><span className="mt-1 block text-xs text-[color:var(--muted)]">Paragrafları boş satırla ayırın. Metin düz yazı olarak gösterilir.</span></label>
        </section>)}
        <button type="button" className="ghost-button" disabled={sections.length >= 60} onClick={() => setSections((current) => [...current, { key: crypto.randomUUID(), id: undefined, heading: "", text: "" }])}>+ Bölüm Ekle</button>
      </>}
    </fieldset>
    {preview ? <section aria-label="Taslak önizlemesi" className="space-y-4 rounded-xl border border-[color:var(--border)] p-5"><p className="eyebrow">Yayımlanmamış önizleme</p>{isCheckout ? (Object.keys(WORDING_LABELS) as (keyof ConsentWording)[]).map((key) => <div key={key}><h3 className="font-bold">{WORDING_LABELS[key]}</h3><p className="mt-2 whitespace-pre-wrap leading-7">{text[key]}</p></div>) : <><h2 className="text-2xl font-bold">{title}</h2><p className="whitespace-pre-wrap leading-7">{body}</p>{sections.map((section) => <div key={section.key}><h3 className="text-lg font-bold">{section.heading}</h3><p className="mt-2 whitespace-pre-wrap leading-7">{section.text}</p></div>)}</>}</section> : null}
    <p role="status" aria-live="polite" className={`text-sm font-semibold ${state.ok ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>{state.message}</p>
    <div className="flex flex-wrap gap-3 border-t border-[color:var(--border)] pt-4"><button name="operation" value="SAVE_DRAFT" disabled={pending} className="secondary-button">{pending ? "Kaydediliyor…" : "Taslağı Kaydet"}</button><button name="operation" value="PUBLISH" disabled={pending} className="primary-button">Yayımla</button></div>
  </form>;
}
