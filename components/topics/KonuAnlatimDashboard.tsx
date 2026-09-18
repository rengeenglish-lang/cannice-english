"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleTopicLessonProgressAction,
  saveTopicNoteAction,
} from "@/app/actions/topics";
import { pickStudyQuote } from "@/lib/study-quotes";
import { parseExampleBlocks } from "@/components/topics/parseExampleBlock";
import { parseAccordionSections } from "@/components/topics/parseAccordionSections";
import {
  parseGlossaryEntries,
  groupGlossaryIntoAccordion,
} from "@/components/topics/parseGlossaryEntries";
import { StudyContent } from "@/components/topics/StudyContent";
import { ContentAccordion } from "@/components/topics/ContentAccordion";
import { TopicSidebar } from "@/components/topics/TopicSidebar";
import { TopicHero } from "@/components/topics/TopicHero";
import { SubtopicTabs } from "@/components/topics/SubtopicTabs";
import { QuestionCard } from "@/components/topics/QuestionCard";
import { QuestionNavigator } from "@/components/topics/QuestionNavigator";
import { TopicProgressCard } from "@/components/topics/TopicProgressCard";
import { TopicInfoCard } from "@/components/topics/TopicInfoCard";
import { StudentNotesCard } from "@/components/topics/StudentNotesCard";
import { MotivationCard } from "@/components/topics/MotivationCard";

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
  const [selectedLessonId, setSelectedLessonId] = useState(
    topics[0]?.lessons[0]?.id,
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
    ? /Konuya Giriş/i.test(selectedLesson.title)
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_300px] xl:gap-8">
      <TopicSidebar
        examName={examName}
        topics={topics}
        groups={groups}
        selectedTopicId={selectedTopicId}
        completedTopicCount={completedTopicCount}
        topicCompleted={topicCompleted}
        onSelect={selectTopic}
      />

      <div className="order-1 min-w-0 lg:order-2">
        <TopicHero
          index={topicIndex}
          breadcrumb={breadcrumb}
          name={selectedTopic.name}
          description={selectedTopic.description}
        />

        <SubtopicTabs
          lessons={selectedTopic.lessons}
          topicName={selectedTopic.name}
          selectedLessonId={selectedLessonId}
          onSelect={setSelectedLessonId}
        />

        <div className="mt-5">
          {selectedLesson ? (
            <>
              {selectedTopic.lessons.length === 1 ? (
                <h2 className="mb-3 text-2xl font-extrabold text-slate-900">
                  {selectedLesson.title}
                </h2>
              ) : null}
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

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                {isSignedIn ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(selectedLesson.id)}
                    className={
                      completedIds.has(selectedLesson.id)
                        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-50 px-6 py-2.5 text-base font-bold text-emerald-700 transition hover:bg-emerald-100"
                        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-2.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,.3)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)] disabled:translate-y-0 disabled:opacity-60"
                    }
                  >
                    {completedIds.has(selectedLesson.id)
                      ? "Tamamlandı ✓"
                      : "Tamamlandı Olarak İşaretle"}
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-2.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,.3)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
                  >
                    Giriş yapıp ilerlemeyi kaydet
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className={CARD}>
              <p className="text-lg text-slate-600">
                Bu konu için ders içeriği yakında eklenecek.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToTopic(-1)}
            disabled={topicIndex <= 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-base font-bold text-slate-700 transition hover:border-blue-400 hover:text-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Önceki Konu
          </button>
          <button
            type="button"
            onClick={() => goToTopic(1)}
            disabled={topicIndex >= topics.length - 1}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-base font-bold text-slate-700 transition hover:border-blue-400 hover:text-[color:var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sonraki Konu →
          </button>
        </div>
      </div>

      <aside className="order-3 h-fit space-y-4 lg:col-start-2 2xl:col-start-auto 2xl:sticky 2xl:top-24">
        <TopicProgressCard
          percent={overallPercent}
          completedTopicCount={completedTopicCount}
          totalTopics={topics.length}
        />
        <TopicInfoCard
          durationMinutes={selectedTopic.lessons.reduce(
            (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
            0,
          )}
          questionCount={selectedTopic.questionCount}
          skillsTested={selectedTopic.skillsTested}
          difficulty={selectedTopic.difficulty}
        />
        <StudentNotesCard
          isSignedIn={isSignedIn}
          value={notes[selectedTopic.id] ?? ""}
          status={noteStatus}
          onChange={(value) => {
            setNotes((prev) => ({ ...prev, [selectedTopic.id]: value }));
            setNoteStatus("idle");
          }}
          onSave={handleSaveNote}
        />
        <MotivationCard quote={pickStudyQuote(topicIndex)} />
      </aside>
    </div>
  );
}
