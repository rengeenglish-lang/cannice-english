"use client";
import { useActionState } from "react";
import { SeoForm } from "./SeoForm";
import { type PerformanceState, performanceAction } from "@/app/actions/admin-seo-performance";
const initial: PerformanceState = { ok: false, message: "" };
const field =
  "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";
export function SearchDataForm({ mode, gscConfigured }: { mode: "csv" | "sync"; gscConfigured: boolean }) {
  const [state, action, pending] = useActionState(performanceAction, initial);
  const disabled = mode === "sync" && !gscConfigured;
  return (
    <SeoForm
      pending={pending}
      className="space-y-3"
      onSave={(f) => {
        f.set("mode", mode);
        action(f);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          Veri türü
          <select name="kind" className={field} defaultValue="PAGES" aria-label="Veri türü">
            <option value="PAGES">Sayfalar</option>
            <option value="QUERIES">Sorgular</option>
            {mode === "sync" ? <option value="PAGE_QUERIES">Sayfa + sorgu</option> : null}
          </select>
        </label>
        <label className="block">
          Dönem başlangıcı
          <input type="date" name="start" required className={field} aria-label="Dönem başlangıcı" />
        </label>
        <label className="block">
          Dönem bitişi
          <input type="date" name="end" required className={field} aria-label="Dönem bitişi" />
        </label>
      </div>
      {mode === "csv" ? (
        <label className="block">
          Search Console dışa aktarımı (CSV metni)
          <textarea name="csv" rows={8} required className={field} aria-label="CSV metni" placeholder="Sayfa,Tıklamalar,Gösterimler,TO,Konum" />
        </label>
      ) : null}
      <button className="primary-button" disabled={pending || disabled}>
        {pending ? "Kaydediliyor…" : mode === "csv" ? "CSV’yi içe aktar" : "Search Console’dan çek"}
      </button>
      {disabled ? <p>Bağlı değil: sunucuda kimlik bilgileri tanımlanmadı.</p> : null}
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}
