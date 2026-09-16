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

export function TopicLearnDashboard({
  topicSlug,
  topicName,
  examName,
  examSlug,
  lessons,
  initialCompletedLessonIds,
  isSignedIn,
}: {
  topicSlug: string;
  topicName: string;
  examName: string;
  examSlug: string;
  lessons: Lesson[];
  initialCompletedLessonIds: string[];
  isSignedIn: boolean;
}) {
  const [selectedId, setSelectedId] = useState(lessons[0]?.id);
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedLessonIds));
  const [pending, startTransition] = useTransition();

  const selected = lessons.find((lesson) => lesson.id === selectedId) ?? lessons[0];
  const percent = lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  const handleToggle = (lessonId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
    startTransition(() => {
      toggleTopicLessonProgressAction(topicSlug, lessonId);
    });
  };

  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
        <Link href="/" className="hover:text-[color:var(--accent-strong)]">Ana Sayfa</Link>
        <span aria-hidden>›</span>
        <Link href={`/konu-anlatim?exam=${examSlug}`} className="hover:text-[color:var(--accent-strong)]">{examName} Konu Anlatım</Link>
        <span aria-hidden>›</span>
        <span className="text-[color:var(--foreground)]">{topicName}</span>
      </p>

      <h1 className="page-title mt-2">{topicName}</h1>

      {isSignedIn ? (
        <div className="panel mt-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-[color:var(--foreground)]">İlerleme</p>
            <p className="text-sm font-bold text-[color:var(--accent-strong)]">{completedIds.size}/{lessons.length} ders — %{percent}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--canvas)]">
            <div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : (
        <div className="panel mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--muted)]">İlerlemenizi kaydetmek için üye girişi yapın.</p>
          <Link href="/sign-in" className="secondary-button">Üye Girişi</Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="panel h-fit lg:sticky lg:top-24">
          <p className="eyebrow mb-3">Dersler</p>
          <ul className="space-y-1">
            {lessons.map((lesson, index) => {
              const done = completedIds.has(lesson.id);
              const active = lesson.id === selected?.id;
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(lesson.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]" : "hover:bg-[color:var(--canvas)]"
                    }`}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black ${
                        done ? "border-[color:var(--success)] bg-[color:var(--success)] text-white" : "border-[color:var(--border-strong)] text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{index + 1}. {lesson.title}</span>
                      {lesson.durationMinutes ? <span className="text-xs text-[color:var(--muted)]">{lesson.durationMinutes} dk</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="panel">
          {selected ? (
            <>
              <h2 className="section-title text-xl">{selected.title}</h2>
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
