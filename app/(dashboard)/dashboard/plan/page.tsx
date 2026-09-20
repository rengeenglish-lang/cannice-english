import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getRoadmap } from "@/server/services/study-roadmap.service";
import { recommendationsForTopics } from "@/lib/diagnostics/recommendations";
import { RoadmapItemCard } from "@/components/diagnostics/RoadmapItemCard";
import { TopicHistoryList, type TopicHistoryEntry } from "@/components/diagnostics/TopicHistoryList";

export const metadata: Metadata = { title: "Hazırlık Planım" };

export default async function StudyPlanPage() {
  const user = await getAuthContext();
  if (!user) return null;

  const goal = await getActiveGoal(user.id);
  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="page-copy">Henüz bir hedefin yok.</p>
        <Link href="/seviye-tespit/hedef" className="primary-button mx-auto mt-5 inline-flex">Hedefini Belirle</Link>
      </main>
    );
  }

  const roadmap = await getRoadmap(user.id, goal.id);
  const recommendations = await recommendationsForTopics(user.id, roadmap.map((r) => r.topicId));
  const recsByTopic = new Map(recommendations.map((r) => [r.topicId, r]));

  const historyRows = await db.diagnosticTopicResult.findMany({
    where: { userId: user.id },
    include: { topic: true },
    orderBy: { createdAt: "asc" },
  });
  const historyByTopic = new Map<string, TopicHistoryEntry>();
  for (const row of historyRows) {
    const entry = historyByTopic.get(row.topic.name) ?? { topicName: row.topic.name, points: [] };
    entry.points.push({ date: row.createdAt.toISOString(), accuracy: row.accuracy });
    historyByTopic.set(row.topic.name, entry);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="eyebrow">Sana Özel Hazırlık Planı</p>
        <h1 className="page-title">{goal.examType.name} Hazırlık Planın</h1>
      </div>

      {roadmap.length === 0 ? (
        <p className="page-copy">Belirgin bir eksiğin görünmüyor — mevcut kaynaklarla çalışmaya devam edebilirsin.</p>
      ) : (
        <div className="space-y-3">
          {roadmap.map((item) => (
            <RoadmapItemCard key={item.id} item={item} recs={recsByTopic.get(item.topicId)} />
          ))}
        </div>
      )}

      <section className="dashboard-panel mt-10">
        <h2 className="section-title !text-lg">Gelişim Geçmişin</h2>
        <div className="mt-4">
          <TopicHistoryList entries={[...historyByTopic.values()]} />
        </div>
      </section>
    </main>
  );
}
