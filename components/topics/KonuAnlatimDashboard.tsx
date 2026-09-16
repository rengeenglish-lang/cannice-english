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
  Kolay: { width: "33%", className: "bg-emerald-500" },
  Orta: { width: "66%", className: "bg-amber-500" },
  Zor: { width: "100%", className: "bg-rose-500" },
};

const CARD =
  "relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/80 before:via-white/0 before:content-['']";

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr_340px] xl:gap-8">
      {/* Left sidebar: topic navigation */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className={CARD}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">{examName} Konuları</p>
            <p className="text-xs font-bold text-slate-500">{completedTopicCount} / {topics.length}</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${topics.length > 0 ? Math.round((completedTopicCount / topics.length) * 100) : 0}%` }} />
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
                          active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black ${
                            done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                        <span className="min-w-0 flex-1 font-semibold leading-snug">{globalIndex + 1}. {topic.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
            if (!meta) return <div key="flat" className={CARD}>{body}</div>;
            const { label, Icon } = meta;
            return (
              <details key={group.category} className={`${CARD} group`} open>
                <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-900">
                  <Icon className="size-4 text-blue-600" />
                  <span>{label} ({group.topics.length})</span>
                </summary>
                <div className="mt-3 border-t border-slate-100 pt-3">{body}</div>
              </details>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-blue-50 p-4 text-center">
          <Sprout className="mx-auto size-6 text-emerald-600" />
          <p className="mt-2 text-xs font-bold text-slate-700">Küçük adımlar, büyük sonuçlar</p>
        </div>
      </aside>

      {/* Main content: selected topic */}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span>{examName}</span>
          {selectedTopic.category ? (
            <>
              <span aria-hidden>›</span>
              <span>{CATEGORY_META[selectedTopic.category]?.label}</span>
            </>
          ) : null}
          <span aria-hidden>›</span>
          <span className="text-slate-900">{selectedTopic.name}</span>
        </p>

        <h1 className="mt-1 text-2xl font-extrabold tracking-[-.02em] text-slate-900 sm:text-3xl">{topicIndex + 1}. {selectedTopic.name}</h1>

        {selectedTopic.description ? (
          <p className="mt-3 whitespace-pre-line rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-600">
            {selectedTopic.description}
          </p>
        ) : null}

        {selectedTopic.lessons.length > 1 ? (
          <div className="mt-5 flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
            {selectedTopic.lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  lesson.id === selectedLessonId
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        ) : null}

        <div className={`${CARD} mt-5`}>
          {selectedLesson ? (
            <>
              {selectedTopic.lessons.length === 1 ? <h2 className="text-lg font-extrabold text-slate-900">{selectedLesson.title}</h2> : null}
              {selectedLesson.videoUrl ? (
                <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black">
                  <video src={selectedLesson.videoUrl} controls className="size-full" />
                </div>
              ) : null}
              {selectedLesson.contentBody ? (
                <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{selectedLesson.contentBody}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Bu ders için içerik yakında eklenecek.</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                {isSignedIn ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(selectedLesson.id)}
                    className={
                      completedIds.has(selectedLesson.id)
                        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-50 px-6 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,.3)] transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-60"
                    }
                  >
                    {completedIds.has(selectedLesson.id) ? "Tamamlandı ✓" : "Tamamlandı Olarak İşaretle"}
                  </button>
                ) : (
                  <Link href="/sign-in" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,.3)] transition hover:-translate-y-0.5 hover:bg-blue-700">
                    Giriş yapıp ilerlemeyi kaydet
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Bu konu için ders içeriği yakında eklenecek.</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToTopic(-1)}
            disabled={topicIndex <= 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Önceki Konu
          </button>
          <button
            type="button"
            onClick={() => goToTopic(1)}
            disabled={topicIndex >= topics.length - 1}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sonraki Konu →
          </button>
        </div>
      </div>

      {/* Right sidebar: progress, topic info, notes, quote */}
      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className={`${CARD} flex flex-col items-center text-center`}>
          <p className="mb-3 text-sm font-bold text-slate-900">İlerlemeniz</p>
          <ProgressRing percent={overallPercent} />
          <p className="mt-3 text-sm text-slate-500">
            <span className="font-extrabold text-slate-900">{completedTopicCount} / {topics.length}</span> konu tamamlandı
          </p>
        </div>

        <div className={CARD}>
          <p className="text-sm font-bold text-slate-900">Bu Konu</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Tahmini süre</dt>
              <dd className="font-semibold text-slate-900">
                {selectedTopic.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0)} dk
              </dd>
            </div>
            {selectedTopic.questionCount ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Sınavda soru sayısı</dt>
                <dd className="font-semibold text-slate-900">{selectedTopic.questionCount}</dd>
              </div>
            ) : null}
            {selectedTopic.skillsTested ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-slate-500">Ölçülen beceriler</dt>
                <dd className="text-right font-semibold text-slate-900">{selectedTopic.skillsTested}</dd>
              </div>
            ) : null}
            {selectedTopic.difficulty && difficultyStyle ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Zorluk</dt>
                  <dd className="font-semibold text-slate-900">{selectedTopic.difficulty}</dd>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${difficultyStyle.className}`} style={{ width: difficultyStyle.width }} />
                </div>
              </div>
            ) : null}
          </dl>
        </div>

        <div className={CARD}>
          <p className="text-sm font-bold text-slate-900">Notlarım</p>
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
                className="mt-3 block w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={noteStatus === "saving"}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {noteStatus === "saving" ? "Kaydediliyor…" : "Notu Kaydet"}
                </button>
                {noteStatus === "saved" ? <span className="text-xs font-bold text-emerald-600">Kaydedildi ✓</span> : null}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Not alabilmek için{" "}
              <Link href="/sign-in" className="font-bold text-blue-600">giriş yapın</Link>.
            </p>
          )}
        </div>

        <div className={`${CARD} bg-blue-50`}>
          <p className="text-sm italic leading-6 text-slate-700">&ldquo;{pickStudyQuote(topicIndex)}&rdquo;</p>
          <p className="mt-2 text-xs font-bold text-blue-700">— Can Nice</p>
        </div>
      </aside>
    </div>
  );
}
