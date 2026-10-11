"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleTopicLessonProgressAction,
  saveTopicNoteAction,
} from "@/app/actions/topics";
import { parseExampleBlocks } from "@/components/topics/parseExampleBlock";
import { parseAccordionSections } from "@/components/topics/parseAccordionSections";
import { hasStrategyBoxes } from "@/components/topics/parseStrategyBoxes";
import {
  parseGlossaryEntries,
  groupGlossaryIntoAccordion,
} from "@/components/topics/parseGlossaryEntries";
import { StudyContent } from "@/components/topics/StudyContent";
import { ContentAccordion } from "@/components/topics/ContentAccordion";
import { useStudyTimer } from "@/components/topics/useStudyTimer";
import { pickStudyQuote } from "@/lib/study-quotes";
import { CourseNav, stepLabel } from "@/components/topics/CourseNav";
import { TopicSummaryStrip } from "@/components/topics/TopicSummaryStrip";
import { ChevronLeft, ChevronRight, ListTree } from "lucide-react";
import { QuestionCard } from "@/components/topics/QuestionCard";
import { QuestionNavigator } from "@/components/topics/QuestionNavigator";

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

const CATEGORY_LABEL: Record<string, string> = {
  SPEAKING: "Konuşma",
  WRITING: "Yazma",
  READING: "Okuma",
  LISTENING: "Dinleme",
};

const CARD = "relative overflow-hidden rounded-lg border border-slate-200 bg-white px-6 py-6 sm:px-8 sm:py-7";

export function KonuAnlatimDashboard({
  examName,
  topics,
  initialCompletedLessonIds,
  initialNotes,
  isSignedIn,
  initialTopicId,
  lockedTopicIds = [],
}: {
  examName: string;
  topics: Topic[];
  initialCompletedLessonIds: string[];
  initialNotes: Record<string, string>;
  isSignedIn: boolean;
  /** Preselected topic (from `?topic=` — e.g. Hatalarım and Derslerim deep links). */
  initialTopicId?: string;
  /** Topics outside the student's plan; their lesson content is never sent to the client. */
  lockedTopicIds?: string[];
}) {
  const initialTopic = topics.find((topic) => topic.id === initialTopicId) ?? topics[0];
  const locked = useMemo(() => new Set(lockedTopicIds), [lockedTopicIds]);
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopic?.id);
  // Reading time for Beceri Analizi; only for signed-in students on topics they can read.
  useStudyTimer(selectedTopicId, isSignedIn && !!selectedTopicId && !locked.has(selectedTopicId));
  const [selectedLessonId, setSelectedLessonId] = useState(
    initialTopic?.lessons[0]?.id,
  );
  const [exampleIndex, setExampleIndex] = useState(0);
  const [exampleIndexLessonId, setExampleIndexLessonId] =
    useState(selectedLessonId);
  if (selectedLessonId !== exampleIndexLessonId) {
    setExampleIndexLessonId(selectedLessonId);
    setExampleIndex(0);
  }
  const [completedIds, setCompletedIds] = useState(
    new Set(initialCompletedLessonIds),
  );
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [pending, startTransition] = useTransition();
  const [navOpen, setNavOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Every lesson in reading order; a topic without lessons is one step of its own.
  const steps = useMemo(
    () => topics.flatMap((topic) => (topic.lessons.length ? topic.lessons.map((l) => ({ topic, lessonId: l.id as string | undefined })) : [{ topic, lessonId: undefined }])),
    [topics],
  );

  const hasCategories = topics.some((topic) => topic.category);
  const groups = useMemo(() => {
    if (!hasCategories) return [{ category: null, topics }];
    const order = ["SPEAKING", "WRITING", "READING", "LISTENING"];
    return order
      .map((category) => ({
        category,
        topics: topics.filter((topic) => topic.category === category),
      }))
      .filter((group) => group.topics.length > 0);
  }, [topics, hasCategories]);

  const topicIndex = topics.findIndex((topic) => topic.id === selectedTopicId);
  const selectedTopic = topics[topicIndex];
  const selectedLesson =
    selectedTopic?.lessons.find((lesson) => lesson.id === selectedLessonId) ??
    selectedTopic?.lessons[0];

  const isExampleLesson = selectedLesson
    ? /Örnek Sorular/i.test(selectedLesson.title)
    : false;
  const parsedExamples =
    isExampleLesson && selectedLesson?.contentBody
      ? parseExampleBlocks(selectedLesson.contentBody)
      : [];

  const isGirisLesson = selectedLesson
    ? /Konuya Giriş/i.test(selectedLesson.title) ||
      hasStrategyBoxes(selectedLesson.contentBody ?? "")
    : false;
  const isGlossaryLesson = selectedLesson
    ? /Sözlüğü|Referansı/i.test(selectedLesson.title)
    : false;
  const accordionSections = (() => {
    if (isGirisLesson && selectedLesson?.contentBody)
      return parseAccordionSections(selectedLesson.contentBody);
    if (isGlossaryLesson && selectedLesson?.contentBody) {
      return groupGlossaryIntoAccordion(
        parseGlossaryEntries(selectedLesson.contentBody),
      );
    }
    return null;
  })();

  const topicCompleted = (topic: Topic) =>
    topic.lessons.length > 0 &&
    topic.lessons.every((lesson) => completedIds.has(lesson.id));
  const completedTopicCount = topics.filter(topicCompleted).length;
  const totalLessons = topics.reduce(
    (sum, topic) => sum + topic.lessons.length,
    0,
  );
  const totalCompleted = topics.reduce(
    (sum, topic) =>
      sum +
      topic.lessons.filter((lesson) => completedIds.has(lesson.id)).length,
    0,
  );
  const overallPercent =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const selectLesson = (topic: Topic, lessonId: string | undefined) => {
    if (topic.id !== selectedTopicId) setNoteStatus("idle");
    setSelectedTopicId(topic.id);
    setSelectedLessonId(lessonId ?? topic.lessons[0]?.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      const result = await saveTopicNoteAction(
        selectedTopic.id,
        notes[selectedTopic.id] ?? "",
      );
      setNoteStatus(result.status === "success" ? "saved" : "idle");
    });
  };

  if (!selectedTopic) return null;

  const categoryLabel = selectedTopic.category
    ? CATEGORY_LABEL[selectedTopic.category]
    : undefined;
  const breadcrumb = [
    examName,
    ...(categoryLabel ? [categoryLabel] : []),
    selectedTopic.name,
  ];

  const lessonIndex = selectedLesson ? selectedTopic.lessons.findIndex((l) => l.id === selectedLesson.id) : -1;
  const doneInTopic = selectedTopic.lessons.filter((l) => completedIds.has(l.id)).length;
  const stepIndex = steps.findIndex((st) => st.topic.id === selectedTopic.id && (st.lessonId ?? null) === (selectedLesson?.id ?? null));
  const goStep = (offset: number) => {
    const st = steps[stepIndex + offset];
    if (st) selectLesson(st.topic, st.lessonId);
  };
  const isLockedTopic = locked.has(selectedTopic.id);
  const heading = isLockedTopic || !selectedLesson ? selectedTopic.name : stepLabel(selectedLesson.title, selectedTopic.name);

  const nav = (
    <CourseNav
      examName={examName}
      topics={topics}
      groups={groups}
      selectedTopicId={selectedTopicId}
      selectedLessonId={selectedLesson?.id}
      completedIds={completedIds}
      locked={locked}
      completedTopicCount={completedTopicCount}
      onSelectLesson={(topic, lessonId) => {
        selectLesson(topic, lessonId);
        setMobileNavOpen(false);
      }}
    />
  );

  return (
    <div className={`course-layout ${navOpen ? "" : "course-layout-collapsed"}`}>
      {navOpen ? <aside className="course-sidebar hidden lg:block">{nav}</aside> : null}

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="hidden size-9 place-items-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--accent)] transition hover:border-[color:var(--accent)] lg:grid"
            aria-label={navOpen ? "Konu listesini gizle" : "Konu listesini göster"}
            aria-expanded={navOpen}
          >
            {navOpen ? <ChevronLeft size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-bold lg:hidden"
            aria-expanded={mobileNavOpen}
          >
            <ListTree size={16} aria-hidden="true" /> Konular ve adımlar
          </button>
          <div className="min-w-0 basis-full lg:flex-1 lg:basis-auto">
            <TopicSummaryStrip
              percent={overallPercent}
              completedTopicCount={completedTopicCount}
              totalTopics={topics.length}
              durationMinutes={selectedTopic.lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0)}
              questionCount={selectedTopic.questionCount}
              skillsTested={selectedTopic.skillsTested}
              difficulty={selectedTopic.difficulty}
              isSignedIn={isSignedIn}
              note={notes[selectedTopic.id] ?? ""}
              noteStatus={noteStatus}
              onNoteChange={(value) => {
                setNotes((prev) => ({ ...prev, [selectedTopic.id]: value }));
                setNoteStatus("idle");
              }}
              onNoteSave={handleSaveNote}
            />
          </div>
        </div>
        {mobileNavOpen ? <div className="course-sidebar mb-5 lg:hidden">{nav}</div> : null}

        <article className="mx-auto max-w-[960px]">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] pb-3">
            <span className="rounded border border-[color:var(--border)] bg-[color:var(--canvas)] px-2 py-1 text-xs font-extrabold text-[color:var(--foreground)]">
              {topicIndex + 1}
              {lessonIndex >= 0 ? `.${lessonIndex + 1}` : ""}
            </span>
            <span className="text-right text-sm font-semibold text-[color:var(--muted)]">
              Konu {topicIndex + 1}&apos;de {doneInTopic} / {selectedTopic.lessons.length} adımı tamamladın
            </span>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[color:var(--muted)]">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 ? <span aria-hidden="true">›</span> : null}
                {crumb}
              </span>
            ))}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-.02em] text-[color:var(--foreground)] sm:text-[42px]">{heading}</h1>
          {lessonIndex <= 0 && selectedTopic.description ? (
            <p className="mt-4 whitespace-pre-line text-lg leading-8 text-[color:var(--muted)]">{selectedTopic.description}</p>
          ) : null}

          <div className="mt-8">
          {locked.has(selectedTopic.id) ? (
            <div className={`${CARD} text-center`}>
              <p className="text-3xl" aria-hidden="true">🔒</p>
              <p className="mt-3 text-xl font-extrabold text-slate-900">
                Bu konu planına dahil değil
              </p>
              <p className="mx-auto mt-2 max-w-lg text-base text-slate-600">
                Her sınavın ilk konusu ücretsiz önizlemedir. Tüm konu
                anlatımlarına erişmek için Başlangıç, Çırak veya Uzman planlarından
                birini seç.
              </p>
              <Link
                href={isSignedIn ? "/dashboard/mock-exam#planlar" : "/planlar"}
                className="primary-button mt-5"
              >
                Planları incele
              </Link>
            </div>
          ) : selectedLesson ? (
            <>
              {selectedLesson.videoUrl ? (
                <div className="mb-5 aspect-video overflow-hidden rounded-2xl bg-black">
                  <video
                    src={selectedLesson.videoUrl}
                    controls
                    className="size-full"
                  />
                </div>
              ) : null}

              {isExampleLesson && parsedExamples.length > 0 ? (
                <>
                  <QuestionCard
                    example={parsedExamples[exampleIndex]}
                    total={parsedExamples.length}
                    typeLabel={categoryLabel}
                  />
                  {parsedExamples.length > 1 ? (
                    <QuestionNavigator
                      index={exampleIndex}
                      total={parsedExamples.length}
                      onPrev={() => setExampleIndex((i) => Math.max(0, i - 1))}
                      onNext={() =>
                        setExampleIndex((i) =>
                          Math.min(parsedExamples.length - 1, i + 1),
                        )
                      }
                    />
                  ) : null}
                </>
              ) : accordionSections ? (
                <>
                  {isGlossaryLesson ? (
                    <p className="mb-4 text-lg font-semibold text-slate-700">
                      Aşağıdaki liste, her biri bir örnek cümleyle birlikte,
                      onluk gruplar halinde düzenlenmiştir.
                    </p>
                  ) : null}
                  <ContentAccordion sections={accordionSections} glossary={isGlossaryLesson} />
                </>
              ) : selectedLesson.contentBody ? (
                <div className={CARD}>
                  <StudyContent text={selectedLesson.contentBody} />
                </div>
              ) : (
                <div className={CARD}>
                  <p className="text-lg text-slate-600">
                    Bu ders için içerik yakında eklenecek.
                  </p>
                </div>
              )}

            </>
          ) : (
            <div className={CARD}>
              <p className="text-lg text-slate-600">
                Bu konu için ders içeriği yakında eklenecek.
              </p>
            </div>
          )}
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-6">
            <button
              type="button"
              onClick={() => goStep(-1)}
              disabled={stepIndex <= 0}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-base font-bold text-[color:var(--accent)] transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" /> Önceki adım
            </button>
            <div className="flex flex-wrap items-center gap-3">
              {selectedLesson && !isLockedTopic ? (
                isSignedIn ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(selectedLesson.id)}
                    className={
                      completedIds.has(selectedLesson.id)
                        ? "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-50 px-5 py-2 text-base font-bold text-emerald-700 transition hover:bg-emerald-100"
                        : "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[color:var(--accent)] px-5 py-2 text-base font-bold text-[color:var(--accent)] transition hover:bg-[color:var(--accent-soft)] disabled:opacity-60"
                    }
                  >
                    {completedIds.has(selectedLesson.id) ? "Tamamlandı ✓" : "Tamamlandı olarak işaretle"}
                  </button>
                ) : (
                  <Link href="/sign-in" className="text-sm font-bold text-[color:var(--accent)] underline-offset-2 hover:underline">
                    Giriş yapıp ilerlemeyi kaydet
                  </Link>
                )
              ) : null}
              <button
                type="button"
                onClick={() => goStep(1)}
                disabled={stepIndex < 0 || stepIndex >= steps.length - 1}
                className="primary-button disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sonraki adım <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </footer>
          <p className="mt-8 text-center text-sm italic text-[color:var(--muted)]">&ldquo;{pickStudyQuote(topicIndex)}&rdquo; <span className="not-italic font-bold">— Can Nice</span></p>
        </article>
      </div>
    </div>
  );
}
