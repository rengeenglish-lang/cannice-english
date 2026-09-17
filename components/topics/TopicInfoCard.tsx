import { BookOpen, Clock, HelpCircle, Gauge, Target } from "lucide-react";

const CARD =
  "relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/80 before:via-white/0 before:content-['']";

const DIFFICULTY_STYLE: Record<string, { width: string; className: string }> = {
  Kolay: { width: "33%", className: "bg-emerald-500" },
  Orta: { width: "66%", className: "bg-amber-500" },
  Zor: { width: "100%", className: "bg-rose-500" },
};

export function TopicInfoCard({
  durationMinutes,
  questionCount,
  skillsTested,
  difficulty,
}: {
  durationMinutes: number;
  questionCount: number | null;
  skillsTested: string | null;
  difficulty: string | null;
}) {
  const difficultyStyle = difficulty ? DIFFICULTY_STYLE[difficulty] : undefined;
  return (
    <div className={CARD}>
      <p className="flex items-center gap-2 text-base font-extrabold text-slate-900">
        <BookOpen className="size-5 text-blue-600" />
        Bu Konu Hakkında
      </p>
      <dl className="mt-4 space-y-3 text-base">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-slate-500">
            <Clock className="size-4" />
            Tahmini çalışma süresi
          </dt>
          <dd className="font-extrabold text-slate-900">{durationMinutes} dk</dd>
        </div>
        {questionCount ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500">
              <HelpCircle className="size-4" />
              Sınavda soru sayısı
            </dt>
            <dd className="font-extrabold text-slate-900">{questionCount}</dd>
          </div>
        ) : null}
        {skillsTested ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex shrink-0 items-center gap-2 text-slate-500">
              <Target className="size-4" />
              Ölçülen beceriler
            </dt>
            <dd className="text-right font-extrabold text-slate-900">{skillsTested}</dd>
          </div>
        ) : null}
        {difficulty && difficultyStyle ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-500">
                <Gauge className="size-4" />
                Zorluk seviyesi
              </dt>
              <dd className="font-extrabold text-slate-900">{difficulty}</dd>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${difficultyStyle.className}`} style={{ width: difficultyStyle.width }} />
            </div>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
