import Link from "next/link";
import type { DiagnosticSeverity } from "@/lib/generated/prisma/enums";
import type { TopicRecommendations } from "@/lib/diagnostics/recommendations";
import { startMasteryCheckAction } from "@/app/actions/diagnostic-attempt";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";
import { RecommendationList } from "@/components/diagnostics/RecommendationList";
import { formatStudyMinutes, recommendedMinutes } from "@/lib/diagnostics/skill-analysis";
import type { SkillRow } from "@/server/services/skill-analysis.service";

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
  cefr,
  skills,
}: {
  examName: string;
  targetScoreRaw: string;
  targetDate: string | null;
  topicResults: { topicId: string; topic: { name: string; estimatedMinutes: number | null }; accuracy: number; severity: DiagnosticSeverity }[];
  topPriority: { topicId: string; topic: { name: string; description: string | null } } | null;
  recommendationsByTopic: Map<string, TopicRecommendations>;
  kind?: "FULL_DIAGNOSTIC" | "MOCK_EXAM";
  mockSetNumber?: number | null;
  overall?: { total: number; correct: number; incorrect: number; pendingReview: number; unanswered: number; percentage: number };
  /** Indicative CEFR band — only for IELTS/TOEFL/PTE level tests. */
  cefr?: string | null;
  /** Beceri Analizi columns per topic: Konu Anlatımı link, questions solved, reading time. */
  skills?: Map<string, SkillRow>;
}) {
  const isMockExam = kind === "MOCK_EXAM";
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="eyebrow">{isMockExam ? `Deneme${mockSetNumber ? ` ${mockSetNumber}` : ""} Sonucun` : "Seviye Tespit Sonucun"}</p>
        <h1 className="page-title">{examName}{targetScoreRaw !== "—" ? ` · Hedef: ${targetScoreRaw}` : ""}</h1>
        {targetDate ? <p className="page-copy mt-2">Hedef tarih: {new Date(targetDate).toLocaleDateString("tr-TR")}</p> : null}
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Bu sonuçlar tahmini seviyeni gösterir, resmi sınav puanı değildir.</p>
      </header>

      {!isMockExam && overall ? (
        <section className="dashboard-panel text-center">
          {cefr ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Tahmini CEFR seviyen</p>
              <p className="mt-1 text-5xl font-black text-[color:var(--brand)]">{cefr}</p>
            </>
          ) : (
            <p className="text-5xl font-black text-[color:var(--foreground)]">%{overall.percentage}</p>
          )}
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
            %{overall.percentage} başarı · {overall.correct} doğru · {overall.incorrect} yanlış · {overall.unanswered} boş · {overall.total} soru
          </p>
        </section>
      ) : null}

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
      ) : topicResults.every((r) => r.severity === "STRONG") ? (
        <p className="text-center text-sm font-semibold text-[color:var(--success)]">Tebrikler — belirgin bir zayıf noktan görünmüyor!</p>
      ) : null}

      <section className="dashboard-panel" aria-labelledby="skill-analysis">
        <h2 id="skill-analysis" className="section-title !text-lg">Beceri Analizi</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="dashboard-table skill-table">
            <thead>
              <tr>
                <th scope="col">Beceri Analizi</th>
                <th scope="col">Önerilen çalışma süresi</th>
                <th scope="col">Kendimi test ettim</th>
                <th scope="col">Çalıştığım süre</th>
              </tr>
            </thead>
            <tbody>
              {topicResults.map((r) => {
                const skill = skills?.get(r.topicId);
                const recommended = recommendedMinutes(r.topic.estimatedMinutes, r.severity);
                const studied = skill?.studiedMinutes ?? 0;
                const progress = recommended ? Math.min(100, Math.round((studied / recommended) * 100)) : 0;
                return (
                  <tr key={r.topicId}>
                    <th scope="row" className="text-left">
                      {skill?.lessonHref ? (
                        <Link href={skill.lessonHref} className="font-bold text-[color:var(--accent)] hover:underline" title={skill.lessonLabel ? `Konu anlatımı: ${skill.lessonLabel}` : undefined}>
                          {r.topic.name} <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <span className="font-bold text-[color:var(--foreground)]">{r.topic.name}</span>
                      )}
                      <span className="mt-1 flex flex-wrap items-center gap-2 font-normal">
                        <span className="text-xs font-semibold text-[color:var(--muted)]">%{Math.round(r.accuracy * 100)}</span>
                        <SeverityBadge severity={r.severity} />
                      </span>
                    </th>
                    <td data-label="Önerilen çalışma süresi" className="whitespace-nowrap font-semibold">{recommended ? formatStudyMinutes(recommended) : "—"}</td>
                    <td data-label="Kendimi test ettim" className="whitespace-nowrap">
                      <span className="font-semibold">{skill?.questionsSolved ?? 0} soru</span>
                      {skill?.questionsSolved ? <span className="block text-xs text-[color:var(--muted)]">{skill.questionsCorrect} doğru</span> : null}
                    </td>
                    <td data-label="Çalıştığım süre" className="whitespace-nowrap">
                      <span className="font-semibold">{formatStudyMinutes(studied)}</span>
                      {recommended ? (
                        <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-[color:var(--border)]" role="img" aria-label={`Önerilen sürenin %${progress}'i`}>
                          <span className="block h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${progress}%` }} />
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">
          Beceri adına tıklayınca ilgili konu anlatımı açılır. <strong>Kendimi test ettim</strong>: sitede bu beceriden çözdüğün tüm sorular.{" "}
          <strong>Çalıştığım süre</strong>: bu becerinin konu anlatımı açıkken aktif olarak geçirdiğin süre (sekme arka plandayken veya uzun süre hareketsiz kaldığında sayılmaz).
        </p>
      </section>

      <div className="text-center">
        <Link href="/dashboard/plan" className="ghost-button">Tüm Hazırlık Planını Gör</Link>
      </div>
    </div>
  );
}
