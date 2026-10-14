import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { finishedScores, getOwnAttempt, savedAnswers, settleAttempt } from "@/server/services/online-deneme.service";
import { loadKeyedDeneme } from "@/lib/online-denemeler/paper";
import { gradeDeneme } from "@/lib/online-denemeler/grading";
import { SECTIONS } from "@/content/yds-denemeler/types";
import { RELEASED_DENEME_COUNT } from "@/content/yds-denemeler/registry";
import { ReviewList, type ReviewItem } from "@/components/online-deneme/ReviewList";

export const metadata: Metadata = { title: "Deneme Sonucu" };

const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

function duration(ms: number) {
  const m = Math.max(0, Math.round(ms / 60_000));
  return m >= 60 ? `${Math.floor(m / 60)} sa ${m % 60} dk` : `${m} dk`;
}

export default async function DenemeResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;
  const found = await getOwnAttempt(attemptId, user.id);
  if (!found) notFound();
  const attempt = await settleAttempt(found);
  // Answers and explanations are only shown once the sitting is closed.
  if (attempt.status === "IN_PROGRESS") redirect(`/dashboard/yds-denemeleri/oturum/${attempt.id}`);

  const [keyed, answers, trend] = await Promise.all([loadKeyedDeneme(attempt.denemeNo), savedAnswers(attempt.id), finishedScores(user.id)]);
  if (!keyed) notFound();
  const choices = new Map(Object.entries(answers).map(([n, a]) => [Number(n), a.choice]));
  const grade = gradeDeneme(keyed.questions, choices);
  const used = (attempt.completedAt ?? attempt.deadlineAt).getTime() - attempt.startedAt.getTime();

  const sectionRows = SECTIONS.map((s) => {
    const r = grade.sections.find((x) => x.key === s.key)!;
    return { ...s, ...r, pct: Math.round((r.correct / r.total) * 100) };
  });
  const weakest = [...sectionRows].sort((a, b) => a.pct - b.pct || b.total - a.total)[0];

  const titleOf = new Map(SECTIONS.map((s) => [s.key, s.title]));
  const items: ReviewItem[] = keyed.questions.map((q) => ({
    n: q.n,
    sectionTitle: titleOf.get(q.section) ?? "",
    stem: q.section === "cloze" ? `(${q.n}) numaralı boşluk` : q.stem,
    sentences: q.sentences,
    passage: q.passage !== undefined ? keyed.passages[q.passage] : undefined,
    options: q.options,
    answer: q.answer,
    choice: choices.get(q.n) ?? null,
    why: q.why,
  }));

  const maxTrend = 100;
  const next = attempt.denemeNo < RELEASED_DENEME_COUNT ? attempt.denemeNo + 1 : null;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      {attempt.timedOut ? (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-[color:var(--danger-soft)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)]">
          <Lock size={16} aria-hidden="true" /> Süre dolduğu için deneme kilitlendi. Süre bitene kadar işaretlediğin {grade.correct + grade.wrong} cevap puanlandı.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3 rounded-3xl bg-[color:var(--night)] p-8 text-white">
          <p className="text-xs font-extrabold tracking-[0.22em] text-white/70">DENEME {attempt.denemeNo} · SONUÇ</p>
          <p className="flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-7xl font-semibold leading-none">{fmt(grade.score)}</span>
            <span className="text-lg text-white/80">/ 100 puan</span>
          </p>
          <p className="text-sm text-white/80">{grade.correct} doğru × 1,25 · yanlışlar puan götürmez</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-xl bg-white/10 px-3.5 py-2">{grade.correct} doğru</span>
            <span className="rounded-xl bg-white/10 px-3.5 py-2">{grade.wrong} yanlış</span>
            <span className="rounded-xl bg-white/10 px-3.5 py-2">{grade.blank} boş</span>
            <span className="rounded-xl bg-white/10 px-3.5 py-2">{duration(used)}</span>
          </div>
        </section>

        <section className="dashboard-panel flex flex-col gap-3" aria-labelledby="trend-title">
          <h2 id="trend-title" className="text-base font-extrabold text-[color:var(--foreground)]">Son denemelerin</h2>
          {trend.length > 1 ? (
            <>
              <div className="flex h-40 items-end gap-3 pt-2">
                {trend.map((t) => {
                  const current = t.id === attempt.id;
                  return (
                    <div key={t.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5" title={`Deneme ${t.denemeNo}: ${fmt(t.score)} puan`}>
                      <span className={`text-xs tabular-nums ${current ? "font-black" : "font-semibold"} text-[color:var(--foreground)]`}>{fmt(t.score)}</span>
                      <div
                        className={`w-full max-w-12 rounded-t ${current ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent-soft)]"}`}
                        style={{ height: `${Math.max(4, (t.score / maxTrend) * 110)}px` }}
                      />
                      <span className={`text-[0.7rem] ${current ? "font-bold text-[color:var(--foreground)]" : "text-[color:var(--muted)]"}`}>D{t.denemeNo}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[color:var(--muted)]">Bitirdiğin son {trend.length} deneme, eskiden yeniye.</p>
            </>
          ) : (
            <p className="page-copy">İlk denemeni bitirdin. Bir sonraki denemeden itibaren puanlarını burada karşılaştırabileceksin.</p>
          )}
        </section>
      </div>

      <section className="dashboard-panel space-y-4" aria-labelledby="sections-title">
        <h2 id="sections-title" className="text-lg font-extrabold text-[color:var(--foreground)]">Bölüm bölüm</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-[color:var(--muted)]">
                <th scope="col" className="p-2">Bölüm</th>
                <th scope="col" className="p-2">Sorular</th>
                <th scope="col" className="p-2">Doğru</th>
                <th scope="col" className="p-2">Yanlış</th>
                <th scope="col" className="p-2">Boş</th>
                <th scope="col" className="w-2/5 p-2">Başarı</th>
              </tr>
            </thead>
            <tbody>
              {sectionRows.map((s) => (
                <tr key={s.key} className="border-t border-[color:var(--border)] text-[color:var(--foreground)]">
                  <td className="p-2 font-bold">{s.title}</td>
                  <td className="p-2 tabular-nums text-[color:var(--muted)]">{s.from}–{s.to}</td>
                  <td className="p-2 tabular-nums">{s.correct}</td>
                  <td className="p-2 tabular-nums">{s.wrong}</td>
                  <td className="p-2 tabular-nums">{s.blank}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded bg-[color:var(--brand-soft)]">
                        <div className="h-full rounded bg-[color:var(--accent)]" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="w-11 text-right font-bold tabular-nums">%{s.pct}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {weakest && weakest.pct < 100 ? (
          <p className="text-sm text-[color:var(--muted)]">
            En çok puan kaybettiğin bölüm: <strong className="text-[color:var(--foreground)]">{weakest.title}</strong> (%{weakest.pct}). Çözümleri okurken bu bölümden başla.
          </p>
        ) : null}
      </section>

      <ReviewList items={items} />

      <div className="flex flex-wrap gap-3">
        {next ? (
          <Link href={`/dashboard/yds-denemeleri/${next}`} className="primary-button">Sıradaki deneme: Deneme {next}</Link>
        ) : null}
        <Link href={`/dashboard/yds-denemeleri/${attempt.denemeNo}`} className="secondary-button">Bu denemeyi tekrar çöz</Link>
        <Link href="/dashboard/yds-denemeleri" className="ghost-button">Tüm denemeler</Link>
      </div>
    </main>
  );
}
