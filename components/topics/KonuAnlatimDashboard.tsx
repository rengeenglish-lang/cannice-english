"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Mic, PenLine, BookOpen, Headphones, Sprout } from "lucide-react";
import { toggleTopicLessonProgressAction, saveTopicNoteAction } from "@/app/actions/topics";
import { ProgressRing } from "@/components/topics/ProgressRing";
import { pickStudyQuote } from "@/lib/study-quotes";

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
  category: string | null;
  skillsTested: string | null;
  difficulty: string | null;
  lessons: Lesson[];
};

const CATEGORY_META: Record<string, { label: string; Icon: typeof Mic }> = {
  SPEAKING: { label: "Konuşma", Icon: Mic },
  WRITING: { label: "Yazma", Icon: PenLine },
  READING: { label: "Okuma", Icon: BookOpen },
  LISTENING: { label: "Dinleme", Icon: Headphones },
};

const DIFFICULTY_STYLE: Record<string, { width: string; className: string }> = {
  Kolay: { width: "33%", className: "bg-[color:var(--success)]" },
  Orta: { width: "66%", className: "bg-amber-500" },
  Zor: { width: "100%", className: "bg-[color:var(--danger)]" },
};

export function KonuAnlatimDashboard({
  examName,
  topics,
  initialCompletedLessonIds,
  initialNotes,
  isSignedIn,
}: {
  examName: string;
  topics: Topic[];
  initialCompletedLessonIds: string[];
  initialNotes: Record<string, string>;
  isSignedIn: boolean;
}) {
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id);
  const [selectedLessonId, setSelectedLessonId] = useState(topics[0]?.lessons[0]?.id);
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedLessonIds));
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pending, startTransition] = useTransition();

  const hasCategories = topics.some((topic) => topic.category);
  const groups = useMemo(() => {
    if (!hasCategories) return [{ category: null, topics }];
    const order = ["SPEAKING", "WRITING", "READING", "LISTENING"];
    return order
      .map((category) => ({ category, topics: topics.filter((topic) => topic.category === category) }))
      .filter((group) => group.topics.length > 0);
  }, [topics, hasCategories]);

  const topicIndex = topics.findIndex((topic) => topic.id === selectedTopicId);
  const selectedTopic = topics[topicIndex];
  const selectedLesson = selectedTopic?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? selectedTopic?.lessons[0];

  const topicCompleted = (topic: Topic) => topic.lessons.length > 0 && topic.lessons.every((lesson) => completedIds.has(lesson.id));
  const completedTopicCount = topics.filter(topicCompleted).length;
  const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  const totalCompleted = topics.reduce((sum, topic) => sum + topic.lessons.filter((lesson) => completedIds.has(lesson.id)).length, 0);
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const selectTopic = (topic: Topic) => {
    setSelectedTopicId(topic.id);
    setSelectedLessonId(topic.lessons[0]?.id);
    setNoteStatus("idle");
  };

  const goToTopic = (offset: number) => {
    const next = topics[topicIndex + offset];
    if (next) selectTopic(next);
  };

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

  const handleSaveNote = () => {
    if (!selectedTopic) return;
    setNoteStatus("saving");
    startTransition(async () => {
      const result = await saveTopicNoteAction(selectedTopic.id, notes[selectedTopic.id] ?? "");
      setNoteStatus(result.status === "success" ? "saved" : "idle");
    });
  };

  if (!selectedTopic) return null;

  const difficultyStyle = selectedTopic.difficulty ? DIFFICULTY_STYLE[selectedTopic.difficulty] : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
      {/* Left sidebar: topic navigation */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="panel">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[color:var(--foreground)]">{examName} Konuları</p>
            <p className="text-xs font-bold text-[color:var(--muted)]">{completedTopicCount} / {topics.length}</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--canvas)]">
            <div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${topics.length > 0 ? Math.round((completedTopicCount / topics.length) * 100) : 0}%` }} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {groups.map((group) => {
            const meta = group.category ? CATEGORY_META[group.category] : null;
            const body = (
              <ul className="space-y-1">
                {group.topics.map((topic) => {
                  const globalIndex = topics.findIndex((item) => item.id === topic.id);
                  const active = topic.id === selectedTopicId;
                  const done = topicCompleted(topic);
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => selectTopic(topic)}
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
                        <span className="min-w-0 flex-1 truncate font-semibold">{globalIndex + 1}. {topic.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
            if (!meta) return <div key="flat" className="panel">{body}</div>;
            const { label, Icon } = meta;
            return (
              <details key={group.category} className="panel group" open>
                <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-[color:var(--foreground)]">
                  <Icon className="size-4 text-[color:var(--accent-strong)]" />
                  <span>{label} ({group.topics.length})</span>
                </summary>
                <div className="mt-3 border-t border-[color:var(--border)] pt-3">{body}</div>
              </details>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--brand-soft)] p-4 text-center">
          <Sprout className="mx-auto size-6 text-[color:var(--success)]" />
          <p className="mt-2 text-xs font-bold text-[color:var(--foreground)]">Küçük adımlar, büyük sonuçlar</p>
        </div>
      </aside>

      {/* Main content: selected topic */}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
          <span>{examName}</span>
          {selectedTopic.category ? (
            <>
              <span aria-hidden>›</span>
              <span>{CATEGORY_META[selectedTopic.category]?.label}</span>
            </>
          ) : null}
          <span aria-hidden>›</span>
          <span className="text-[color:var(--foreground)]">{selectedTopic.name}</span>
        </p>

        <h1 className="page-title mt-1 text-2xl sm:text-3xl">{topicIndex + 1}. {selectedTopic.name}</h1>

        {selectedTopic.description ? (
          <p className="mt-3 whitespace-pre-line rounded-2xl bg-[color:var(--canvas)] p-4 text-sm leading-6 text-[color:var(--muted)]">
            {selectedTopic.description}
          </p>
        ) : null}

        {selectedTopic.lessons.length > 1 ? (
          <div className="mt-5 flex flex-wrap gap-1 rounded-2xl border border-[color:var(--border)] bg-white p-1.5">
            {selectedTopic.lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  lesson.id === selectedLessonId
                    ? "bg-[color:var(--accent)] text-white"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--canvas)] hover:text-[color:var(--foreground)]"
                }`}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        ) : null}

        <div className="panel mt-5">
          {selectedLesson ? (
            <>
              {selectedTopic.lessons.length === 1 ? <h2 className="section-title text-lg">{selectedLesson.title}</h2> : null}
              {selectedLesson.videoUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
                  <video src={selectedLesson.videoUrl} controls className="size-full" />
                </div>
              ) : null}
              {selectedLesson.contentBody ? (
                <p className="mt-3 whitespace-pre-line leading-7 text-[color:var(--foreground)]">{selectedLesson.contentBody}</p>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--muted)]">Bu ders için içerik yakında eklenecek.</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5">
                {isSignedIn ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(selectedLesson.id)}
                    className={completedIds.has(selectedLesson.id) ? "secondary-button" : "primary-button"}
                  >
                    {completedIds.has(selectedLesson.id) ? "Tamamlandı ✓" : "Tamamlandı Olarak İşaretle"}
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

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToTopic(-1)}
            disabled={topicIndex <= 0}
            className="ghost-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Önceki Konu
          </button>
          <button
            type="button"
            onClick={() => goToTopic(1)}
            disabled={topicIndex >= topics.length - 1}
            className="ghost-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sonraki Konu →
          </button>
        </div>
      </div>

      {/* Right sidebar: progress, topic info, notes, quote */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="panel flex flex-col items-center text-center">
          <p className="mb-3 text-sm font-bold text-[color:var(--foreground)]">İlerlemeniz</p>
          <ProgressRing percent={overallPercent} />
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            <span className="font-extrabold text-[color:var(--foreground)]">{completedTopicCount} / {topics.length}</span> konu tamamlandı
          </p>
        </div>

        <div className="panel">
          <p className="text-sm font-bold text-[color:var(--foreground)]">Bu Konu</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[color:var(--muted)]">Tahmini süre</dt>
              <dd className="font-semibold text-[color:var(--foreground)]">
                {selectedTopic.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0)} dk
              </dd>
            </div>
            {selectedTopic.questionCount ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[color:var(--muted)]">Sınavda soru sayısı</dt>
                <dd className="font-semibold text-[color:var(--foreground)]">{selectedTopic.questionCount}</dd>
              </div>
            ) : null}
            {selectedTopic.skillsTested ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-[color:var(--muted)]">Ölçülen beceriler</dt>
                <dd className="text-right font-semibold text-[color:var(--foreground)]">{selectedTopic.skillsTested}</dd>
              </div>
            ) : null}
            {selectedTopic.difficulty && difficultyStyle ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--muted)]">Zorluk</dt>
                  <dd className="font-semibold text-[color:var(--foreground)]">{selectedTopic.difficulty}</dd>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                  <div className={`h-full rounded-full ${difficultyStyle.className}`} style={{ width: difficultyStyle.width }} />
                </div>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="panel">
          <p className="text-sm font-bold text-[color:var(--foreground)]">Notlarım</p>
          {isSignedIn ? (
            <>
              <textarea
                value={notes[selectedTopic.id] ?? ""}
                onChange={(event) => {
                  setNotes((prev) => ({ ...prev, [selectedTopic.id]: event.target.value }));
                  setNoteStatus("idle");
                }}
                placeholder="Bu konuyla ilgili notlarınızı buraya yazın..."
                rows={4}
                className="auth-input mt-3 resize-none text-sm"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button type="button" onClick={handleSaveNote} disabled={noteStatus === "saving"} className="secondary-button px-4 py-2 text-xs">
                  {noteStatus === "saving" ? "Kaydediliyor…" : "Notu Kaydet"}
                </button>
                {noteStatus === "saved" ? <span className="text-xs font-bold text-[color:var(--success)]">Kaydedildi ✓</span> : null}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              Not alabilmek için{" "}
              <Link href="/sign-in" className="font-bold text-[color:var(--accent-strong)]">giriş yapın</Link>.
            </p>
          )}
        </div>

        <div className="panel bg-[color:var(--brand-soft)]">
          <p className="text-sm italic leading-6 text-[color:var(--foreground)]">&ldquo;{pickStudyQuote(topicIndex)}&rdquo;</p>
          <p className="mt-2 text-xs font-bold text-[color:var(--accent-strong)]">— Can Nice</p>
        </div>
      </aside>
    </div>
  );
}
