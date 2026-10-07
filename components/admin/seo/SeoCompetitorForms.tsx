"use client";
import { useActionState } from "react";
import { SeoForm } from "./SeoForm";
import { type CompetitorState, competitorAction } from "@/app/actions/admin-seo-competitors";
const initial: CompetitorState = { ok: false, message: "" };
const field = "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";

function Form({ mode, hidden, children, className }: { mode: string; hidden?: Record<string, string>; children: React.ReactNode; className?: string }) {
  const [state, action, pending] = useActionState(competitorAction, initial);
  return (
    <SeoForm pending={pending} className={className ?? "space-y-3"} onSave={(f) => { f.set("mode", mode); for (const [k, v] of Object.entries(hidden ?? {})) f.set(k, v); action(f); }}>
      {children}
      {state.message ? <p role={state.ok ? "status" : "alert"} className="text-sm">{state.message}</p> : null}
    </SeoForm>
  );
}
export function AddCompetitorForm() {
  return (
    <Form mode="add">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">Rakip adı<input name="name" required minLength={2} maxLength={80} className={field} aria-label="Rakip adı" /></label>
        <label className="block">Alan adı<input name="domain" required placeholder="ornek.com" className={field} aria-label="Rakip alan adı" /></label>
      </div>
      <label className="block">Not (isteğe bağlı)<input name="notes" maxLength={1000} className={field} aria-label="Rakip notu" /></label>
      <button className="primary-button">Rakibi ekle</button>
    </Form>
  );
}
export function ImportTopicsForm({ id, name }: { id: string; name: string }) {
  return (
    <Form mode="topics" hidden={{ id }}>
      <label className="block">
        {name} konuları (her satır: Başlık | https://{name}/sayfa)
        <textarea name="text" rows={5} required className={field} aria-label={`${name} konu listesi`} placeholder={"IELTS speaking part 2 nasıl çalışılır | https://ornek.com/ielts-speaking"} />
      </label>
      <button className="ghost-button">Konuları içe aktar</button>
    </Form>
  );
}
export function ToggleCompetitor({ id, active }: { id: string; active: boolean }) {
  return (
    <Form mode="toggle" hidden={{ id, active: String(!active) }} className="inline">
      <button className="ghost-button text-sm">{active ? "Pasife al" : "Etkinleştir"}</button>
    </Form>
  );
}
export function RemoveCompetitor({ id, name }: { id: string; name: string }) {
  return (
    <Form mode="remove" hidden={{ id }}>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirmed" required className="mt-1" />{name} ve içe aktarılan konuları silinsin.</label>
      <button className="ghost-button text-sm">Rakibi sil</button>
    </Form>
  );
}
export function TrackGapButton({ title }: { title: string }) {
  return (
    <Form mode="track" hidden={{ title }} className="inline">
      <button className="ghost-button text-sm" aria-label={`${title} konusunu anahtar kelime olarak ekle`}>Anahtar kelime olarak ekle</button>
    </Form>
  );
}
export function SerpForm({ keywords }: { keywords: { id: string; keyword: string }[] }) {
  return (
    <Form mode="serp">
      <label className="block">Anahtar kelime
        <select name="keywordId" required className={field} aria-label="SERP anahtar kelimesi">
          {keywords.map((k) => <option key={k.id} value={k.id}>{k.keyword}</option>)}
        </select>
      </label>
      <label className="block">Gördüğünüz ilk sonuçlar (sırayla; her satır: Başlık | https://site.com/sayfa)
        <textarea name="text" rows={6} required className={field} aria-label="SERP sonuçları" />
      </label>
      <button className="ghost-button" disabled={!keywords.length}>Sonuçları kaydet</button>
    </Form>
  );
}
