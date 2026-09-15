"use client";

import { useTransition } from "react";
import { toggleLessonProgressAction } from "@/app/actions/learning";

type Lesson = { id: string; title: string; durationMinutes: number | null };
type ModuleData = { id: string; title: string; lessons: Lesson[] };

export function LearnModuleAccordion({
  courseId,
  enrollmentId,
  modules,
  completedLessonIds,
}: {
  courseId: string;
  enrollmentId: string;
  modules: ModuleData[];
  completedLessonIds: Set<string>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {modules.map((module, index) => (
        <details key={module.id} className="panel group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[color:var(--foreground)]">
            <span>{index + 1}. {module.title}</span>
            <span className="text-sm text-[color:var(--muted)]">
              {module.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length}/{module.lessons.length} tamamlandı
            </span>
          </summary>
          <ul className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4">
            {module.lessons.map((lesson) => {
              const done = completedLessonIds.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => toggleLessonProgressAction(courseId, enrollmentId, lesson.id))}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm transition hover:bg-[color:var(--brand-soft)] disabled:opacity-60"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black ${
                          done ? "border-[color:var(--success)] bg-[color:var(--success)] text-white" : "border-[color:var(--border-strong)] text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={done ? "text-[color:var(--muted)] line-through" : "text-[color:var(--foreground)]"}>{lesson.title}</span>
                    </span>
                    {lesson.durationMinutes ? <span className="shrink-0 text-xs text-[color:var(--muted)]">{lesson.durationMinutes} dk</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}
