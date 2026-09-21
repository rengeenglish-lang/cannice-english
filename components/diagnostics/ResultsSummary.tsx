import Link from "next/link";
import type { DiagnosticSeverity } from "@/lib/generated/prisma/enums";
import type { TopicRecommendations } from "@/lib/diagnostics/recommendations";
import { startMasteryCheckAction } from "@/app/actions/diagnostic-attempt";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";
import { RecommendationList } from "@/components/diagnostics/RecommendationList";

export function ResultsSummary({
  examName,
  targetScoreRaw,
  targetDate,
  topicResults,
  topPriority,
  recommendationsByTopic,
  kind = "FULL_DIAGNOSTIC",
  mockSetNumber,
  overall,
}: {
  examName: string;
  targetScoreRaw: string;
  targetDate: string | null;
  topicResults: { topicId: string; topic: { name: string }; accuracy: number; severity: DiagnosticSeverity }[];
  topPriority: { topicId: string; topic: { name: string; description: string | null } } | null;
  recommendationsByTopic: Map<string, TopicRecommendations>;
  kind?: "FULL_DIAGNOSTIC" | "MOCK_EXAM";
  mockSetNumber?: number | null;
  overall?: { total: number; correct: number; incorrect: number; pendingReview: number; unanswered: number; percentage: number };
}) {
  const isMockExam = kind === "MOCK_EXAM";
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="eyebrow">{isMockExam ? `Deneme${mockSetNumber ? ` ${mockSetNumber}` : ""} Sonucun` : "Seviye Tespit Sonucun"}</p>
        <h1 className="page-title">{examName} · Hedef: {targetScoreRaw}</h1>
        {targetDate ? <p className="page-copy mt-2">Hedef tarih: {new Date(targetDate).toLocaleDateString("tr-TR")}</p> : null}
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Bu sonuçlar tahmini seviyeni gösterir, resmi sınav puanı değildir.</p>
      </header>

      {isMockExam && overall ? (
        <section className="dashboard-panel text-center">
          <p className="text-5xl font-black text-[color:var(--foreground)]">%{overall.percentage}</p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
            {overall.correct} doğru · {overall.incorrect} yanlış
            {overall.pendingReview ? ` · ${overall.pendingReview} inceleniyor` : ""} · {overall.unanswered} boş · {overall.total} soru
          </p>
        </section>
      ) : null}

      {topPriority ? (
        <section className="dashboard-panel space-y-4 border-2 border-[color:var(--brand)]">
          <p className="eyebrow">İlk Olarak Buradan Başlamalısın</p>
          <h2 className="text-2xl font-extrabold text-[color:var(--foreground)]">{topPriority.topic.name}</h2>
          {topPriority.topic.description ? <p className="text-sm leading-7 text-[color:var(--muted)]">{topPriority.topic.description}</p> : null}
          <RecommendationList recs={recommendationsByTopic.get(topPriority.topicId)} />
          <form action={startMasteryCheckAction.bind(null, topPriority.topicId)}>
            <button type="submit" className="primary-button">Konuya Başla</button>
          </form>
        </section>
      ) : (
        <p className="text-center text-sm font-semibold text-[color:var(--success)]">Tebrikler — belirgin bir zayıf noktan görünmüyor!</p>
      )}

      <section className="dashboard-panel">
        <h2 className="section-title !text-lg">Beceri Analizi</h2>
        <ul className="mt-4 divide-y divide-[color:var(--border)]">
          {topicResults.map((r) => (
            <li key={r.topicId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="text-sm font-bold">{r.topic.name}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[color:var(--muted)]">%{Math.round(r.accuracy * 100)}</span>
                <SeverityBadge severity={r.severity} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-center">
        <Link href="/dashboard/plan" className="ghost-button">Tüm Hazırlık Planını Gör</Link>
      </div>
    </div>
  );
}
