import { BarChart3 } from "lucide-react";
import { ProgressRing } from "@/components/topics/ProgressRing";

const CARD =
  "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(7,27,52,.07)]";

export function TopicProgressCard({
  percent,
  completedTopicCount,
  totalTopics,
}: {
  percent: number;
  completedTopicCount: number;
  totalTopics: number;
}) {
  return (
    <div className={`${CARD} flex flex-col items-center text-center`}>
      <p className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <BarChart3 className="size-6 text-[color:var(--accent)]" />
        İlerleme Durumum
      </p>
      <ProgressRing percent={percent} size={112} />
      <p className="mt-4 text-lg text-slate-700">
        <span className="font-extrabold text-slate-900">
          {completedTopicCount} / {totalTopics}
        </span>{" "}
        konu tamamlandı
      </p>
      <p className="mt-1 text-base font-bold text-[color:var(--accent)]">
        Her soru seni hedefine bir adım daha yaklaştırıyor!
      </p>
    </div>
  );
}
