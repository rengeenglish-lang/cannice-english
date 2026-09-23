import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getLevelTestHistory } from "@/server/services/diagnostic-results.service";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";
import { CEFR_DESCRIPTIONS } from "@/lib/diagnostics/cefr";

export const metadata: Metadata = { title: "Seviye Tespit — Sonuçlar ve Analiz" };

export default async function LevelTestResultsPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const history = await getLevelTestHistory(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/seviye-tespit" className="ghost-button mb-4 -ml-4">← Seviye Tespit</Link>
      <p className="eyebrow">Sonuçlar ve Analiz</p>
      <h1 className="page-title">Seviye tespit sonuçların</h1>
      <p className="page-copy">
        IELTS, TOEFL ve PTE sonuçlarında gösterilen CEFR seviyesi, doğru oranına göre hesaplanan yaklaşık bir göstergedir; resmî bir sınav sonucu değildir.
      </p>

      {history.length === 0 ? (
        <div className="learning-empty mt-6">
          <p className="font-bold">Henüz sonuçlanmış bir seviye tespit sınavın yok.</p>
          <Link href="/seviye-tespit/yeni" className="primary-button mt-5">Yeni Test Başlat</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {history.map((a, i) => {
            // Change vs. the previous level test for the same exam (history is newest-first).
            const previous = history.slice(i + 1).find((p) => p.examTypeId === a.examTypeId);
            const delta = previous ? a.percentage - previous.percentage : null;
            const weakest = a.topicResults.filter((r) => r.severity !== "STRONG").slice(0, 3);
            const strongest = [...a.topicResults].sort((x, y) => y.accuracy - x.accuracy).filter((r) => r.severity === "STRONG").slice(0, 3);
            return (
              <article key={a.id} className="dashboard-panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">{a.examName}</h2>
                    <p className="text-xs text-[color:var(--muted)]">{a.completedAt?.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })} · {a.correct}/{a.total} doğru</p>
                  </div>
                  <div className="text-right">
                    {a.cefr ? (
                      <p className="text-3xl font-black text-[color:var(--brand)]">{a.cefr}</p>
                    ) : null}
                    <p className="text-sm font-bold text-[color:var(--accent-strong)]">%{a.percentage}</p>
                    {delta !== null ? (
                      <p className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {delta >= 0 ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
                        {delta >= 0 ? "+" : ""}{delta} puan (önceki teste göre)
                      </p>
                    ) : null}
                  </div>
                </div>
                {a.cefr ? <p className="mt-3 text-sm text-[color:var(--muted)]">{CEFR_DESCRIPTIONS[a.cefr]}</p> : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Geliştirilmesi gerekenler</p>
                    {weakest.length ? (
                      <ul className="mt-2 space-y-2">
                        {weakest.map((r) => (
                          <li key={r.name} className="flex items-center justify-between gap-2 text-sm">
                            <span>{r.name}</span>
                            <SeverityBadge severity={r.severity} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-[color:var(--muted)]">Belirgin bir eksik yok.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Güçlü yönlerin</p>
                    {strongest.length ? (
                      <ul className="mt-2 space-y-2 text-sm">
                        {strongest.map((r) => (
                          <li key={r.name} className="flex justify-between gap-2">
                            <span>{r.name}</span>
                            <strong className="text-emerald-700">%{Math.round(r.accuracy * 100)}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-[color:var(--muted)]">Henüz güçlü çıkan bir konu yok.</p>
                    )}
                  </div>
                </div>
                <Link href={`/dashboard/sonuc/${a.id}`} className="secondary-button mt-5 text-xs">Detaylı sonucu gör</Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
