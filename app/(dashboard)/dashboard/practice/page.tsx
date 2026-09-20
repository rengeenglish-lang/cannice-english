import type { Metadata } from "next";
import { Shuffle } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { db } from "@/server/db";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { startPracticeAction } from "@/app/actions/diagnostic-attempt";

export const metadata: Metadata = { title: "Pratik Sorular" };

export default async function PracticePage() {
  const user = await getAuthContext();
  if (!user) return null;
  const goal = await getActiveGoal(user.id);
  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="page-copy">Pratik yapabilmek için önce hedefini belirlemelisin.</p>
      </main>
    );
  }

  const examFamily = examFamilyForCode(goal.examType.code);
  const topics = await db.diagnosticTopic.findMany({
    where: { isActive: true, examFamilies: { has: examFamily } },
    orderBy: { displayOrder: "asc" },
  });
  const topLevel = topics.filter((t) => !t.parentTopicId);
  const childrenByParent = new Map<string, typeof topics>();
  for (const t of topics) {
    if (!t.parentTopicId) continue;
    childrenByParent.set(t.parentTopicId, [...(childrenByParent.get(t.parentTopicId) ?? []), t]);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{goal.examType.name}</p>
      <h1 className="page-title">Pratik Sorular</h1>
      <p className="page-copy">Bir konu seç, istediğin zaman pratik yap.</p>

      <form action={startPracticeAction.bind(null, null)} className="mt-6">
        <button type="submit" className="dashboard-panel flex w-full items-center gap-4 text-left transition hover:border-[color:var(--accent)]">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
            <Shuffle size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-[color:var(--foreground)]">Karma Sorular</span>
            <span className="block text-xs text-[color:var(--muted)]">Tüm konulardan karışık sorularla pratik yap</span>
          </span>
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {topLevel.map((topic) => {
          const children = childrenByParent.get(topic.id);
          if (children?.length) {
            return (
              <div key={topic.id} className="dashboard-panel sm:col-span-2">
                <p className="font-bold text-[color:var(--foreground)]">{topic.name}</p>
                {topic.description ? <p className="mt-1 text-xs text-[color:var(--muted)]">{topic.description}</p> : null}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {children.map((child) => (
                    <form key={child.id} action={startPracticeAction.bind(null, child.id)}>
                      <button type="submit" className="secondary-button w-full justify-center">{child.name}</button>
                    </form>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <form key={topic.id} action={startPracticeAction.bind(null, topic.id)}>
              <button type="submit" className="dashboard-panel w-full text-left transition hover:border-[color:var(--accent)]">
                <span className="block font-bold text-[color:var(--foreground)]">{topic.name}</span>
                {topic.description ? <span className="mt-1 block text-xs text-[color:var(--muted)]">{topic.description}</span> : null}
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
