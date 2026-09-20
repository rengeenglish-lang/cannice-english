import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getTodayItem } from "@/server/services/study-roadmap.service";

/** "Bugün ne çalışmalısın?" — generated strictly from the student's active roadmap, never a random suggestion. */
export async function TodayWidget({ userId }: { userId: string }) {
  const goal = await getActiveGoal(userId);
  if (!goal) return null;
  const item = await getTodayItem(userId, goal.id);
  if (!item) return null;

  const minutes = item.topic.estimatedMinutes ?? 30;

  return (
    <section aria-labelledby="today-widget-title" className="dashboard-panel border-2 border-[color:var(--brand)]">
      <p className="eyebrow">Bugün Ne Çalışmalısın?</p>
      <h2 id="today-widget-title" className="mt-1 text-2xl font-extrabold text-[color:var(--foreground)]">{item.topic.name}</h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[color:var(--muted)]">
        <CalendarClock size={14} aria-hidden="true" /> Tahmini çalışma: {minutes} dakika
      </p>
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-[color:var(--foreground)]">
        <li>Konu anlatımını oku</li>
        <li>Pratik sorular çöz</li>
        <li>Konu kontrolünü tamamla</li>
      </ol>
      <Link href="/dashboard/plan" className="primary-button mt-5">Çalışmaya Başla</Link>
    </section>
  );
}
