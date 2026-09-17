import { BarChart3 } from "lucide-react";
import { ProgressRing } from "@/components/topics/ProgressRing";

const CARD =
  "relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/80 before:via-white/0 before:content-['']";

export function TopicProgressCard({ percent, completedTopicCount, totalTopics }: { percent: number; completedTopicCount: number; totalTopics: number }) {
  return (
    <div className={`${CARD} flex flex-col items-center text-center`}>
      <p className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-900">
        <BarChart3 className="size-5 text-blue-600" />
        İlerleme Durumum
      </p>
      <ProgressRing percent={percent} size={104} />
      <p className="mt-4 text-base text-slate-600">
        <span className="font-extrabold text-slate-900">
          {completedTopicCount} / {totalTopics}
        </span>{" "}
        konu tamamlandı
      </p>
      <p className="mt-1 text-sm font-semibold text-blue-600">Her soru seni hedefine bir adım daha yaklaştırıyor!</p>
    </div>
  );
}
