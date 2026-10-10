import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getWritingFeedback } from "@/server/services/writing-feedback.service";
import { WRITING_FEEDBACK_KINDS, countWords, isWritingKind, type WritingFeedbackResult, type WritingKind } from "@/lib/writing-feedback";

export const metadata: Metadata = { title: "Geri bildirim" };

const CATEGORY_LABELS: Record<string, string> = {
  grammar: "Dil bilgisi",
  vocabulary: "Kelime",
  meaning: "Anlam",
  spelling: "Yazım",
  punctuation: "Noktalama",
  style: "Üslup",
  task: "Görev",
};

export default async function WritingFeedbackResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthContext();
  if (!user) return null;
  const row = await getWritingFeedback(user.id, id);
  if (!row || !isWritingKind(row.kind)) notFound();
  const kind: WritingKind = WRITING_FEEDBACK_KINDS[row.kind];
  const result = row.status === "DONE" ? (row.result as WritingFeedbackResult | null) : null;
  const pct = (score: number) => Math.round(((score - kind.scale.min) / (kind.scale.max - kind.scale.min)) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/yazma-geri-bildirim" className="ghost-button -ml-4 gap-1.5"><ArrowLeft size={16} aria-hidden="true" /> Yeni değerlendirme</Link>
      <p className="eyebrow mt-4">{kind.exam} · {row.createdAt.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
      <h1 className="page-title">{kind.name}</h1>

      {!result ? (
        <div className="learning-empty mt-6">
          <p className="font-bold">{row.status === "FAILED" ? "Bu değerlendirme tamamlanamadı." : "Değerlendirme sürüyor."}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">{row.status === "FAILED" ? "Hakkından düşülmedi; metnini yeniden gönderebilirsin." : "Birkaç saniye sonra sayfayı yenile."}</p>
        </div>
      ) : (
        <>
          <section className="panel mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Tahmini puan · {kind.scale.label}</p>
                <p className="mt-1 text-5xl font-extrabold tracking-tight text-[color:var(--accent-strong)]">{result.overallScore}</p>
              </div>
              <p className="text-sm text-[color:var(--muted)]">{countWords(row.answer)} kelime{kind.minWords ? ` · beklenen en az ${kind.minWords}` : ""}</p>
            </div>
            <p className="mt-4 leading-7">{result.summary}</p>
            <p className="mt-3 text-xs text-[color:var(--muted)]">Yapay zekâ tahminidir; resmî sınav sonucu değildir.</p>
          </section>

          <section className="mt-8">
            <h2 className="section-title">Kriterler</h2>
            <ul className="mt-4 space-y-3">
              {result.criteria.map((c) => (
                <li key={c.name} className="dashboard-panel !p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{c.name}</p>
                    <p className="font-extrabold text-[color:var(--accent-strong)]">{c.score}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]" aria-hidden="true">
                    <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${pct(c.score)}%` }} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{c.comment}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="section-title">Hatalar ve düzeltmeler</h2>
            {result.mistakes.length === 0 ? (
              <p className="mt-3 text-sm text-[color:var(--muted)]">Belirgin bir hata bulunmadı.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="dashboard-panel !p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-[color:var(--muted)]">{CATEGORY_LABELS[m.category] ?? m.category}</p>
                    <p className="mt-1.5 leading-7">
                      <span className="rounded bg-rose-50 px-1 text-rose-800 line-through decoration-rose-400">{m.original}</span>
                      <span className="mx-2 text-[color:var(--muted)]" aria-hidden="true">→</span>
                      <span className="sr-only">düzeltme:</span>
                      <span className="rounded bg-emerald-50 px-1 font-semibold text-emerald-800">{m.correction}</span>
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-[color:var(--muted)]">{m.explanation}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="mt-8">
            <h2 className="section-title">Geliştirilmiş hâli</h2>
            <div className="panel mt-4 whitespace-pre-wrap leading-7">{result.improvedVersion}</div>
          </section>

          {result.tips.length ? (
            <section className="mt-8">
              <h2 className="section-title">Bir sonraki denemen için</h2>
              <ul className="mt-4 space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 leading-7"><Lightbulb size={18} className="mt-1 shrink-0 text-[color:var(--accent-strong)]" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <details className="mt-10 rounded-2xl border border-[color:var(--border)] p-4">
        <summary className="cursor-pointer font-bold">Gönderdiğin metin</summary>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">{kind.promptLabel}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{row.taskPrompt}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">{kind.answerLabel}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{row.answer}</p>
      </details>
    </main>
  );
}
