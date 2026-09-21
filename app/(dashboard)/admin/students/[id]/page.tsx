import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStudentForAdmin } from "@/server/services/admin-students.service";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getRoadmap } from "@/server/services/study-roadmap.service";
import { getAttemptHistory } from "@/server/services/diagnostic-results.service";
import { db } from "@/server/db";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";

export const metadata: Metadata = { title: "Öğrenci Detayı" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminStudentDetailPage({ params }: Props) {
  const { id } = await params;
  const student = await getStudentForAdmin(id);
  if (!student) notFound();

  const goal = await getActiveGoal(id);
  const [roadmap, history, responses] = await Promise.all([
    goal ? getRoadmap(id, goal.id) : Promise.resolve([]),
    getAttemptHistory(id),
    db.diagnosticResponse.findMany({ where: { attempt: { userId: id } }, select: { isCorrect: true } }),
  ]);

  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.isCorrect === true).length;
  const overallAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const weakTopics = roadmap.filter((item) => item.status !== "COMPLETED");
  const completedCount = roadmap.filter((item) => item.status === "COMPLETED").length;

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/students" className="hover:underline">Öğrenciler</Link> › {student.name}
      </p>
      <h1 className="page-title">{student.name}</h1>
      <p className="page-copy">{student.email}</p>

      {goal ? (
        <div className="dashboard-panel mt-6">
          <p className="eyebrow">Aktif Hedef</p>
          <p className="mt-2 font-bold text-[color:var(--foreground)]">{goal.examType.name} · Hedef: {goal.targetScoreRaw}</p>
        </div>
      ) : (
        <p className="page-copy mt-6">Bu öğrenci henüz bir hedef belirlemedi.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: completedCount, label: "Tamamlanan Konu" },
          { value: totalAnswered, label: "Çözülen Soru" },
          { value: `%${overallAccuracy}`, label: "Ortalama Doğruluk" },
          { value: history.length, label: "Toplam Deneme" },
        ].map((stat) => (
          <div key={stat.label} className="learning-stat">
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

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
        <h2 className="section-title !text-lg">Geçmiş</h2>
        {history.length ? (
          <ul className="mt-4 divide-y divide-[color:var(--border)]">
            {history.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="font-bold">{a.topicName ?? a.examName} · {a.completedAt?.toLocaleDateString("tr-TR")}</span>
                <span className="font-bold text-[color:var(--accent-strong)]">%{a.percentage} ({a.correct}/{a.total})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[color:var(--muted)]">Henüz soru çözmemiş.</p>
        )}
      </section>
    </div>
  );
}
