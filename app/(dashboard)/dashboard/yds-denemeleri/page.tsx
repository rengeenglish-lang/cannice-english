import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ListChecks, Lock, Timer } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getPlanAccess } from "@/server/services/plans.service";
import { denemeOverview } from "@/server/services/online-deneme.service";
import { PLANNED_DENEME_COUNT, RELEASED_DENEME_COUNT } from "@/content/yds-denemeler/registry";

export const metadata: Metadata = { title: "Online YDS Denemeleri" };

const formatScore = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

export default async function OnlineDenemelerPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const [access, overview] = await Promise.all([getPlanAccess(user), denemeOverview(user.id)]);
  const batches = Array.from({ length: PLANNED_DENEME_COUNT / 10 }, (_, b) => b);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <section className="rounded-3xl bg-[color:var(--night)] p-8 text-white sm:p-10">
        <p className="text-xs font-extrabold tracking-[0.22em] text-white/70">YDS · TAM DENEME</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Online YDS Denemeleri</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Her biri 80 soru ve 180 dakika. Sınav portalında çözersin, bitirdiğin anda puanın ve her sorunun çözümü açılır. Süre sunucuda tutulur; 180 dakika dolunca deneme kilitlenir.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2"><ListChecks size={16} aria-hidden="true" /> 80 soru · A–E</span>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2"><Clock size={16} aria-hidden="true" /> 180 dakika</span>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2">
            {RELEASED_DENEME_COUNT} / {PLANNED_DENEME_COUNT} deneme yayında
          </span>
        </div>
      </section>

      {!access.can("MOCK_EXAMS") ? (
        <div className="dashboard-panel flex flex-wrap items-center justify-between gap-4">
          <p className="page-copy">Online denemeler tüm Deneme Sınavı planlarına dahildir. Başlamak için bir plan seç.</p>
          <Link href="/dashboard/mock-exam#planlar" className="primary-button">Planları gör</Link>
        </div>
      ) : null}

      {batches.map((b) => {
        const from = b * 10 + 1;
        const released = from <= RELEASED_DENEME_COUNT;
        return (
          <section key={b} aria-labelledby={`paket-${b}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id={`paket-${b}`} className="text-lg font-extrabold text-[color:var(--foreground)]">
                {b + 1}. paket · Deneme {from}–{from + 9}
              </h2>
              {!released ? <span className="text-xs font-bold text-[color:var(--muted)]">Yakında</span> : null}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => from + i).map((no) => {
                if (no > RELEASED_DENEME_COUNT) {
                  return (
                    <div key={no} className="flex items-center justify-between rounded-2xl border border-dashed border-[color:var(--border)] p-4 text-[color:var(--muted)]">
                      <span className="font-bold">Deneme {no}</span>
                      <Lock size={14} aria-label="yakında" />
                    </div>
                  );
                }
                const e = overview.get(no);
                return (
                  <Link
                    key={no}
                    href={`/dashboard/yds-denemeleri/${no}`}
                    className="group flex flex-col gap-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--accent)] hover:shadow-md"
                  >
                    <span className="font-extrabold text-[color:var(--foreground)]">Deneme {no}</span>
                    {e?.openId ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--accent-strong)]">
                        <Timer size={12} aria-hidden="true" /> Devam ediyor
                      </span>
                    ) : e?.latestScore != null ? (
                      <span className="text-xs font-semibold text-[color:var(--muted)]">
                        Son puan <strong className="text-[color:var(--foreground)]">{formatScore(e.latestScore)}</strong>
                        {e.finished > 1 ? ` · en iyi ${formatScore(e.bestScore ?? 0)}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[color:var(--muted)]">Başlanmadı</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
