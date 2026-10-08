"use client";
import { useActionState } from "react";
import { importKeywordsAction, type KeywordState } from "@/app/actions/admin-seo-keywords";
const initial: KeywordState = { message: "", ok: false };
export function SeoKeywordImport() {
  const [state, action, pending] = useActionState(importKeywordsAction, initial);
  return (
    <form action={action} className="space-y-3">
      <p className="text-sm">
        Her satıra bir anahtar kelime yazın (en çok 60): <code>anahtar kelime | amaç | sınav | not</code>. Amaç, sınav ve not isteğe bağlıdır
        (amaç: bilgi, hazırlık, pratik, karşılaştırma, satın alma; sınav: IELTS, TOEFL, PTE, YDS, YOKDIL_SAGLIK, YOKDIL_FEN, YOKDIL_SOSYAL).
        Sıra önemlidir: üretim, listenin başındaki kelimelerden başlar. # ile başlayan satırlar yok sayılır.
      </p>
      <textarea name="keywords" required rows={10} maxLength={30000} className="block w-full rounded-lg border p-3 font-mono text-sm focus-ring" />
      <button disabled={pending} className="primary-button">{pending ? "İçe aktarılıyor…" : "İçe aktar"}</button>
      {state.message ? <p role={state.ok ? "status" : "alert"}>{state.message}</p> : null}
    </form>
  );
}
