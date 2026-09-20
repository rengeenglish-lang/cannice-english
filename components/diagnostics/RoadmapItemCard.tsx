import { startRoadmapItemAction, startMasteryCheckAction } from "@/app/actions/diagnostic-attempt";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";
import { RecommendationList } from "@/components/diagnostics/RecommendationList";
import type { TopicRecommendations } from "@/lib/diagnostics/recommendations";
import type { DiagnosticSeverity, RoadmapItemStatus } from "@/lib/generated/prisma/enums";

const STATUS_LABEL: Record<RoadmapItemStatus, string> = {
  NOT_STARTED: "Başlanmadı",
  IN_PROGRESS: "Devam Ediyor",
  MASTERY_CHECK_REQUIRED: "Biraz Daha Pratik Gerekli",
  COMPLETED: "Tamamlandı",
};

export function RoadmapItemCard({
  item,
  recs,
}: {
  item: { id: string; topicId: string; priorityRank: number; status: RoadmapItemStatus; severityAtCreation: DiagnosticSeverity; topic: { name: string; description: string | null } };
  recs: TopicRecommendations | undefined;
}) {
  return (
    <details className="dashboard-panel" open={item.status === "IN_PROGRESS" || item.status === "MASTERY_CHECK_REQUIRED"}>
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <span className="font-bold text-[color:var(--foreground)]">
          {item.priorityRank}. {item.topic.name}
        </span>
        <span className="flex items-center gap-2">
          <SeverityBadge severity={item.severityAtCreation} />
          <span className="text-xs font-bold text-[color:var(--muted)]">{STATUS_LABEL[item.status]}</span>
        </span>
      </summary>
      <div className="mt-4 space-y-4 border-t border-[color:var(--border)] pt-4">
        {item.topic.description ? <p className="text-sm leading-7 text-[color:var(--muted)]">{item.topic.description}</p> : null}
        <RecommendationList recs={recs} />
        {item.status === "NOT_STARTED" ? (
          <form action={startRoadmapItemAction.bind(null, item.id)}>
            <button type="submit" className="primary-button">Çalışmaya Başla</button>
          </form>
        ) : item.status === "IN_PROGRESS" || item.status === "MASTERY_CHECK_REQUIRED" ? (
          <>
            {item.status === "MASTERY_CHECK_REQUIRED" ? (
              <p className="text-sm font-semibold text-[color:var(--warning)]">Bu konuda biraz daha pratiğe ihtiyacın var. Yukarıdaki kaynaklarla tekrar çalış, sonra tekrar dene.</p>
            ) : null}
            <form action={startMasteryCheckAction.bind(null, item.topicId)}>
              <button type="submit" className="secondary-button">Konu Kontrolünü Başlat</button>
            </form>
          </>
        ) : (
          <p className="text-sm font-bold text-[color:var(--success)]">✓ Bu konuyu tamamladın.</p>
        )}
      </div>
    </details>
  );
}
