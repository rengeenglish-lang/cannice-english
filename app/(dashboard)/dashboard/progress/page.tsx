import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getRoadmap, getTodayItem } from "@/server/services/study-roadmap.service";
import { getAttemptHistory } from "@/server/services/diagnostic-results.service";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";

export const metadata: Metadata = { title: "İlerlemem" };

export default async function ProgressPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const goal = await getActiveGoal(user.id);
  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="page-copy">İlerlemeni görebilmek için önce hedefini belirlemelisin.</p>
        <Link href="/seviye-tespit/hedef" className="primary-button mx-auto mt-5 inline-flex">Hedefini Belirle</Link>
      </main>
    );
  }

  const [responses, completedTopicCount, roadmap, todayItem, history] = await Promise.all([
    db.diagnosticResponse.findMany({ where: { attempt: { userId: user.id } }, select: { isCorrect: true } }),
    db.studyRoadmapItem.count({ where: { userId: user.id, goalId: goal.id, status: "COMPLETED" } }),
    getRoadmap(user.id, goal.id),
    getTodayItem(user.id, goal.id),
    getAttemptHistory(user.id),
  ]);

  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.isCorrect === true).length;
  const overallAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const weakTopics = roadmap.filter((item) => item.status !== "COMPLETED");
  const overallProgress = roadmap.length ? Math.round((completedTopicCount / roadmap.length) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{goal.examType.name}</p>
      <h1 className="page-title">İlerlemem</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: `%${overallProgress}`, label: "Genel İlerleme" },
          { value: completedTopicCount, label: "Tamamlanan Konu" },
          { value: totalAnswered, label: "Çözülen Soru" },
          { value: `%${overallAccuracy}`, label: "Ortalama Doğruluk" },
        ].map((stat) => (
          <div key={stat.label} className="learning-stat">
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {todayItem ? (
        <section className="dashboard-panel mt-6 border-2 border-[color:var(--brand)]">
          <p className="eyebrow">Önerilen Sıradaki Adım</p>
          <h2 className="mt-1 text-xl font-extrabold">{todayItem.topic.name}</h2>
          <Link href="/dashboard/plan" className="primary-button mt-4">Devam Et</Link>
        </section>
      ) : null}

      {weakTopics.length ? (
        <section className="dashboard-panel mt-6">
          <h2 className="section-title !text-lg">Geliştirilmesi Gereken Konular</h2>
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {weakTopics.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm font-bold">{item.topic.name}</span>
                <SeverityBadge severity={item.severityAtCreation} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-panel mt-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title !text-lg">Son Aktiviteler</h2>
          <Link href="/dashboard/history" className="ghost-button text-xs">Tümünü Gör</Link>
        </div>
        {history.length ? (
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {history.slice(0, 5).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="font-bold">{a.topicName ?? a.examName} · {a.completedAt?.toLocaleDateString("tr-TR")}</span>
                <span className="font-bold text-[color:var(--accent-strong)]">%{a.percentage}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[color:var(--muted)]">Henüz soru çözmediniz.</p>
        )}
      </section>
    </main>
  );
}
