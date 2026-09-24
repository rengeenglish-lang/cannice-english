import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { getStudyGoalHistory, listTopicsForActiveExamGoal, syncStudyGoalStatuses } from "@/server/services/study-goals.service";
import { markStudyGoalReachedFormAction } from "@/app/actions/study-goals";
import { StudyGoalDialog } from "@/components/dashboard/StudyGoalDialog";
import { ReportFailureForm } from "@/components/dashboard/ReportFailureForm";
import { PERIOD_LABEL } from "@/lib/study-goal-periods";

export const metadata: Metadata = { title: "Hedef Geçmişim" };

const SECTIONS = [
  { key: "gunluk", label: "Günlük Hedefler" },
  { key: "haftalik", label: "Haftalık Hedefler" },
  { key: "aylik", label: "Aylık Hedefler" },
  { key: "ulasilan", label: "Ulaşılan Hedefler" },
  { key: "basarisiz", label: "Başarısız Hedefler" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Devam ediyor", REACHED: "Ulaşıldı", FAILED: "Başarısız" };
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-700",
  REACHED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-rose-50 text-rose-700",
};

const dateTR = (d: Date) => d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" });

type GoalItem = { id: string; kind: string; quantity: number | null; label: string | null; examTopic: { name: string; examType: { name: string } } | null };

function describeGoalItem(item: GoalItem) {
  if (item.kind === "TOPIC") return item.examTopic ? `${item.examTopic.name} · ${item.examTopic.examType.name}` : "Konu";
  if (item.kind === "PRACTICE") return `${item.quantity} pratik soru seti`;
  if (item.kind === "MOCK_EXAM") return `${item.quantity} deneme`;
  return item.label ?? "Özel hedef";
}

export default async function StudyGoalHistoryPage({ searchParams }: { searchParams: Promise<{ bolum?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { bolum } = await searchParams;
  const active: SectionKey = SECTIONS.some((s) => s.key === bolum) ? (bolum as SectionKey) : "gunluk";

  await syncStudyGoalStatuses(user.id);
  const [goals, topics] = await Promise.all([getStudyGoalHistory(user.id), listTopicsForActiveExamGoal(user.id)]);

  const filtered = goals.filter((g) => {
    if (active === "gunluk") return g.period === "DAY";
    if (active === "haftalik") return g.period === "WEEK";
    if (active === "aylik") return g.period === "MONTH";
    if (active === "ulasilan") return g.status === "REACHED";
    return g.status === "FAILED";
  });

  const counts: Record<SectionKey, number> = {
    gunluk: goals.filter((g) => g.period === "DAY").length,
    haftalik: goals.filter((g) => g.period === "WEEK").length,
    aylik: goals.filter((g) => g.period === "MONTH").length,
    ulasilan: goals.filter((g) => g.status === "REACHED").length,
    basarisiz: goals.filter((g) => g.status === "FAILED").length,
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Çalışma Hedefleri</p>
          <h1 className="page-title">Hedef Geçmişim</h1>
        </div>
        <StudyGoalDialog topics={topics} triggerLabel="Yeni hedef belirle" triggerClassName="primary-button" />
      </div>

      <nav aria-label="Hedef bölümleri" className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/dashboard/hedeflerim?bolum=${s.key}`}
            aria-current={s.key === active ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              s.key === active ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
            }`}
          >
            {s.label} <span className="ml-1.5 opacity-75">({counts[s.key]})</span>
          </Link>
        ))}
      </nav>

      <section className="dashboard-panel mt-6" aria-labelledby="goal-section">
        <h2 id="goal-section" className="section-title !text-lg">{SECTIONS.find((s) => s.key === active)!.label}</h2>

        {filtered.length ? (
          <ul className="mt-4 space-y-4">
            {filtered.map((goal) => (
              <li key={goal.id} className="rounded-2xl border border-[color:var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[color:var(--muted)]">
                    {PERIOD_LABEL[goal.period]} hedef · {dateTR(goal.periodStart)} – {dateTR(goal.periodEnd)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${STATUS_STYLE[goal.status]}`}>{STATUS_LABEL[goal.status]}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {goal.items.map((item) => (
                    <li key={item.id} className="text-sm font-semibold">• {describeGoalItem(item)}</li>
                  ))}
                </ul>

                {goal.status === "ACTIVE" ? (
                  <form action={markStudyGoalReachedFormAction.bind(null, goal.id)} className="mt-3">
                    <button type="submit" className="secondary-button text-xs">Hedefe Ulaştım</button>
                  </form>
                ) : null}

                {goal.status === "FAILED" ? (
                  goal.failureReason ? (
                    <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><strong>Sebep:</strong> {goal.failureReason}</p>
                  ) : (
                    <ReportFailureForm goalId={goal.id} />
                  )
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[color:var(--muted)]">Bu bölümde henüz bir hedef yok.</p>
        )}
      </section>
    </main>
  );
}
