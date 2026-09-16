"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleTopicLessonProgressAction } from "@/app/actions/topics";

type Lesson = {
  id: string;
  title: string;
  position: number;
  videoUrl: string | null;
  durationMinutes: number | null;
  contentBody: string | null;
};

type Topic = {
  id: string;
  name: string;
  description: string | null;
  questionCount: number | null;
  lessons: Lesson[];
};

export function KonuAnlatimDashboard({
  topics,
  initialCompletedLessonIds,
  isSignedIn,
}: {
  topics: Topic[];
  initialCompletedLessonIds: string[];
  isSignedIn: boolean;
}) {
  const firstLesson = topics.find((topic) => topic.lessons.length > 0)?.lessons[0];
  const [selectedId, setSelectedId] = useState(firstLesson?.id);
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedLessonIds));
  const [pending, startTransition] = useTransition();

  const selectedTopic = topics.find((topic) => topic.lessons.some((lesson) => lesson.id === selectedId));
  const selected = selectedTopic?.lessons.find((lesson) => lesson.id === selectedId);

  const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  const totalCompleted = topics.reduce((sum, topic) => sum + topic.lessons.filter((lesson) => completedIds.has(lesson.id)).length, 0);
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const handleToggle = (lessonId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
    startTransition(() => {
      toggleTopicLessonProgressAction(lessonId);
    });
  };

  return (
    <div>
      {isSignedIn ? (
        <div className="panel mb-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-[color:var(--foreground)]">Genel İlerleme</p>
            <p className="text-sm font-bold text-[color:var(--accent-strong)]">{totalCompleted}/{totalLessons} ders — %{overallPercent}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]">
            <div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
      ) : (
        <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--muted)]">İlerlemenizi kaydetmek için üye girişi yapın.</p>
          <Link href="/sign-in" className="secondary-button">Üye Girişi</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit lg:sticky lg:top-24">
          <p className="eyebrow mb-3">Ders İçeriği</p>
          <div className="space-y-3">
            {topics.map((topic, index) => {
              const done = topic.lessons.filter((lesson) => completedIds.has(lesson.id)).length;
              return (
                <details key={topic.id} className="panel group" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-bold text-[color:var(--foreground)]">
                    <span>{index + 1}. {topic.name}</span>
                    <span className="shrink-0 text-right text-xs font-semibold text-[color:var(--muted)]">
                      {done}/{topic.lessons.length} tamamlandı
                      {topic.questionCount ? <><br />Sınavda {topic.questionCount} soru</> : null}
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4">
                    {topic.lessons.map((lesson) => {
                      const lessonDone = completedIds.has(lesson.id);
                      const active = lesson.id === selectedId;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(lesson.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition ${
                              active ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]" : "hover:bg-[color:var(--canvas)]"
                            }`}
                          >
                            <span
                              className={`grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black ${
                                lessonDone ? "border-[color:var(--success)] bg-[color:var(--success)] text-white" : "border-[color:var(--border-strong)] text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                            <span className="min-w-0 flex-1 truncate font-semibold">{lesson.title}</span>
                            {lesson.durationMinutes ? <span className="shrink-0 text-xs text-[color:var(--muted)]">{lesson.durationMinutes} dk</span> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        </aside>

        <div className="panel">
          {selected ? (
            <>
              <p className="eyebrow">{selectedTopic?.name}</p>
              {selectedTopic?.description ? (
                <p className="mt-2 whitespace-pre-line rounded-2xl bg-[color:var(--canvas)] p-4 text-sm leading-6 text-[color:var(--muted)]">
                  {selectedTopic.description}
                </p>
              ) : null}
              <h2 className="section-title mt-4 text-xl">{selected.title}</h2>
              {selected.videoUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
                  <video src={selected.videoUrl} controls className="size-full" />
                </div>
              ) : null}
              {selected.contentBody ? (
                <p className="mt-5 whitespace-pre-line leading-7 text-[color:var(--foreground)]">{selected.contentBody}</p>
              ) : (
                <p className="mt-5 text-sm text-[color:var(--muted)]">Bu ders için içerik yakında eklenecek.</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5">
                {isSignedIn ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(selected.id)}
                    className={completedIds.has(selected.id) ? "secondary-button" : "primary-button"}
                  >
                    {completedIds.has(selected.id) ? "Tamamlandı ✓" : "Tamamlandı Olarak İşaretle"}
                  </button>
                ) : (
                  <Link href="/sign-in" className="primary-button">Giriş yapıp ilerlemeyi kaydet</Link>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">Bu konu için ders içeriği yakında eklenecek.</p>
          )}
        </div>
      </div>
    </div>
  );
}
