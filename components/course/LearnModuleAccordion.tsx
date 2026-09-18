"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, PlayCircle, ChevronDown } from "lucide-react";
import { toggleLessonProgressAction } from "@/app/actions/learning";
type Lesson = {
  id: string;
  title: string;
  durationMinutes: number | null;
  videoUrl?: string | null;
  description?: string | null;
};
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
  const [error, setError] = useState("");
  const next = modules
    .flatMap((m) => m.lessons)
    .find((l) => !completedLessonIds.has(l.id));
  if (!modules.length)
    return (
      <div className="learning-empty">
        <p className="font-bold">Ders içeriği hazırlanıyor.</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Yayımlanan dersler burada görünecek. Canlı ders programınızı aşağıdan
          takip edebilirsiniz.
        </p>
      </div>
    );
  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {modules.map((module, index) => (
        <details
          key={module.id}
          className="panel group"
          open={
            next ? module.lessons.some((l) => l.id === next.id) : index === 0
          }
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 font-bold">
            <span className="flex items-center gap-3">
              <span className="learning-icon text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              {module.title}
            </span>
            <span className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              {
                module.lessons.filter((l) => completedLessonIds.has(l.id))
                  .length
              }
              /{module.lessons.length}
              <ChevronDown size={17} aria-hidden="true" />
            </span>
          </summary>
          <div className="mt-5 space-y-3 border-t border-[color:var(--border)] pt-5">
            {module.lessons.map((lesson) => {
              const done = completedLessonIds.has(lesson.id);
              return (
                <details
                  id={"lesson-" + lesson.id}
                  key={lesson.id}
                  open={lesson.id === next?.id}
                  className="scroll-mt-28 rounded-xl border border-[color:var(--border)] bg-white p-4"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold">
                    <span className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2
                          size={20}
                          className="shrink-0 text-[color:var(--success)]"
                          aria-hidden="true"
                        />
                      ) : (
                        <PlayCircle
                          size={20}
                          className="shrink-0 text-[color:var(--accent)]"
                          aria-hidden="true"
                        />
                      )}
                      {lesson.title}
                    </span>
                    {lesson.durationMinutes ? (
                      <span className="shrink-0 text-xs font-normal text-[color:var(--muted)]">
                        {lesson.durationMinutes} dk
                      </span>
                    ) : null}
                  </summary>
                  <div className="mt-5">
                    {lesson.videoUrl ? (
                      <video
                        controls
                        preload="metadata"
                        src={lesson.videoUrl}
                        aria-label={lesson.title}
                        className="aspect-video w-full rounded-xl bg-black"
                      />
                    ) : null}
                    {lesson.description ? (
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[color:var(--muted)]">
                        {lesson.description}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={pending}
                      aria-pressed={done}
                      onClick={() => {
                        setError("");
                        startTransition(async () => {
                          try {
                            await toggleLessonProgressAction(
                              courseId,
                              enrollmentId,
                              lesson.id,
                            );
                          } catch {
                            setError(
                              "İlerleme kaydedilemedi. Lütfen tekrar deneyin.",
                            );
                          }
                        });
                      }}
                      className="secondary-button mt-5 text-xs"
                    >
                      {pending
                        ? "Kaydediliyor…"
                        : done
                          ? "Tamamlandı · Geri al"
                          : "Dersi tamamladım"}
                    </button>
                  </div>
                </details>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
