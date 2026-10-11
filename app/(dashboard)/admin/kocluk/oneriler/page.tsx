import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { listSuggestions } from "@/server/services/coaching/suggestions.service";
import { SUGGESTION_KIND_LABEL, buildBatchPrompt, buildSuggestionPrompt } from "@/lib/coaching/suggestion-prompt";
import { setSuggestionHandledAction } from "@/app/actions/admin-coaching";
import { CopyPromptButton } from "@/components/admin/CopyPromptButton";

export const metadata: Metadata = { title: "Gelen Koçluk Önerileri", robots: { index: false, follow: false } };

const KIND_STYLE: Record<string, string> = {
  SUGGESTION: "bg-emerald-50 text-emerald-900",
  ADVICE: "bg-rose-50 text-rose-900",
  REPORT: "bg-amber-50 text-amber-900",
};

export default async function CoachingSuggestionsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const actor = await getAuthContext();
  if (!actor) redirect("/sign-in");
  if (actor.role !== "ADMIN") forbidden();
  const handled = (await searchParams).durum === "islendi";
  const items = await listSuggestions(handled);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Yönetim · Koçluk</p>
        <h1 className="page-title">Gelen Koçluk Önerileri</h1>
        <p className="page-copy mt-2">
          Öğrencilerin koçluktan gönderdiği öneriler, &quot;Bu öneri yardımcı olmadı&quot; bildirimleri ve sorun bildiren rapor anketleri. Her biri Claude&apos;a doğrudan
          verilebilecek bir prompt olarak hazır; öğrencinin adı ve e-postası prompta eklenmez.
        </p>
      </header>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Durum">
        <Link href="/admin/kocluk/oneriler" aria-current={!handled ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-bold ${!handled ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border)]"}`}>Açık</Link>
        <Link href="/admin/kocluk/oneriler?durum=islendi" aria-current={handled ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-bold ${handled ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border)]"}`}>İşlendi</Link>
        {!handled && items.length > 1 ? <span className="ml-auto"><CopyPromptButton primary text={buildBatchPrompt(items)} label={`Tümünü tek prompt olarak kopyala (${items.length})`} /></span> : null}
      </nav>

      {items.length ? (
        <ol className="space-y-4">
          {items.map((s) => {
            const prompt = buildSuggestionPrompt(s);
            return (
              <li key={s.id} className="dashboard-panel space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className={`rounded-full px-3 py-1 ${KIND_STYLE[s.kind] ?? "bg-slate-100"}`}>{SUGGESTION_KIND_LABEL[s.kind] ?? s.kind}</span>
                  <span className="text-[color:var(--muted)]">{s.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">{s.message ?? <span className="italic text-[color:var(--muted)]">Mesaj yazılmamış.</span>}</p>
                {s.kind === "REPORT" ? (
                  <p className="text-xs text-[color:var(--muted)]">
                    Rapor faydalı: {s.useful === null ? "—" : s.useful ? "evet" : "hayır"} · Görev yükü gerçekçi: {s.workloadRealistic === null ? "—" : s.workloadRealistic ? "evet" : "hayır"}
                    {s.reminderFrequency ? ` · Hatırlatmalar: ${s.reminderFrequency}` : ""}
                  </p>
                ) : null}
                {s.about ? <p className="rounded-xl bg-[color:var(--canvas)] p-3 text-xs leading-5"><strong>{s.about.type === "proposal" ? "Plan önerisi" : "Rapor"}:</strong> {s.about.text}</p> : null}
                <details className="rounded-xl border border-[color:var(--border)] p-3">
                  <summary className="cursor-pointer text-sm font-bold">Claude prompt&apos;unu göster</summary>
                  <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[color:var(--canvas)] p-3 text-xs leading-5">{prompt}</pre>
                </details>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyPromptButton text={prompt} />
                  <form action={setSuggestionHandledAction.bind(null, s.id, !handled)}>
                    <button type="submit" className="ghost-button !min-h-10 !py-2 text-sm">{handled ? "Açığa geri al" : "İşlendi olarak işaretle"}</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="learning-empty">{handled ? "İşlendi olarak işaretlenmiş öneri yok." : "Şu an açık öneri yok."}</p>
      )}
    </div>
  );
}
