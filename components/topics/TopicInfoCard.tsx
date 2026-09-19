import { BookOpen, Clock, HelpCircle, Gauge, Target } from "lucide-react";

const CARD =
  "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(7,27,52,.07)]";

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
      <p className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <BookOpen className="size-6 text-[color:var(--accent)]" />
        Bu Konu Hakkında
      </p>
      <dl className="mt-4 space-y-4 text-lg">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-slate-600">
            <Clock className="size-5 text-blue-500" />
            Tahmini çalışma süresi
          </dt>
          <dd className="font-extrabold text-slate-900">
            {durationMinutes} dk
          </dd>
        </div>
        {questionCount ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-600">
              <HelpCircle className="size-5 text-indigo-500" />
              Sınavda soru sayısı
            </dt>
            <dd className="font-extrabold text-slate-900">{questionCount}</dd>
          </div>
        ) : null}
        {skillsTested ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex shrink-0 items-center gap-2 text-slate-600">
              <Target className="size-5 text-emerald-500" />
              Ölçülen beceriler
            </dt>
            <dd className="text-right font-extrabold text-slate-900">
              {skillsTested}
            </dd>
          </div>
        ) : null}
        {difficulty && difficultyStyle ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-600">
                <Gauge className="size-5 text-amber-500" />
                Zorluk seviyesi
              </dt>
              <dd className="font-extrabold text-slate-900">{difficulty}</dd>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${difficultyStyle.className}`}
                style={{ width: difficultyStyle.width }}
              />
            </div>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
