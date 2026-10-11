import { Check, ChevronDown, ChevronRight, Lock } from "lucide-react";
import { useState } from "react";

type Lesson = { id: string; title: string };
type Topic = { id: string; name: string; category: string | null; lessons: Lesson[] };

const CATEGORY_LABEL: Record<string, string> = {
  SPEAKING: "Konuşma",
  WRITING: "Yazma",
  READING: "Okuma",
  LISTENING: "Dinleme",
};

/** Mid-tone band per skill: brighter than the site's dark green, still dark enough for white text. */
const CATEGORY_COLOR: Record<string, string> = {
  SPEAKING: "#c2571a",
  WRITING: "#7a52c7",
  READING: "#2f6fd0",
  LISTENING: "#0f8a7e",
};

/** "Konuya Giriş" rather than "Tense – Konuya Giriş": the topic name is already the section title. */
export function stepLabel(title: string, topicName: string): string {
  const stripped = title.startsWith(`${topicName} – `) ? title.slice(topicName.length + 3) : title;
  return stripped.replace(/^.*(?:Sözlüğü|Referansı) \((\d)\/\d\):\s*/i, "Sözlük $1: ").replace(/^Örnek Sorular ve Çözümler$/i, "Örnek Sorular");
}

/**
 * Course outline in the style of a step-by-step course: every topic is a section ("KONU 3"),
 * opened to show its lessons as steps. The open section follows the selected topic; others can be
 * opened to look ahead. Locked topics show a lock instead of their steps.
 */
export function CourseNav<T extends Topic>({
  examName,
  topics,
  groups,
  selectedTopicId,
  selectedLessonId,
  completedIds,
  locked,
  completedTopicCount,
  onSelectLesson,
}: {
  examName: string;
  topics: T[];
  groups: { category: string | null; topics: T[] }[];
  selectedTopicId: string | undefined;
  selectedLessonId: string | undefined;
  completedIds: Set<string>;
  locked: Set<string>;
  completedTopicCount: number;
  onSelectLesson: (topic: T, lessonId: string | undefined) => void;
}) {
  // Sections the student opened by hand; the selected topic is always open.
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpened((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label={`${examName} konuları`} className="course-nav">
      <div className="border-b border-[color:var(--border)] px-5 py-4">
        <p className="text-sm font-extrabold text-[color:var(--foreground)]">{examName} Konu Anlatımı</p>
        <p className="mt-0.5 text-xs font-semibold text-[color:var(--muted)]">
          {completedTopicCount} / {topics.length} konu tamamlandı
        </p>
      </div>
      {groups.map((group) => (
        <div key={group.category ?? "all"}>
          {group.category ? (
            <p
              className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white"
              style={{ backgroundColor: CATEGORY_COLOR[group.category] ?? "var(--accent)" }}
            >
              {CATEGORY_LABEL[group.category] ?? group.category}
            </p>
          ) : null}
          {group.topics.map((topic) => {
            const index = topics.findIndex((t) => t.id === topic.id);
            const isLocked = locked.has(topic.id);
            const isSelected = topic.id === selectedTopicId;
            const open = isSelected || opened.has(topic.id);
            const done = topic.lessons.filter((l) => completedIds.has(l.id)).length;
            const status = isLocked
              ? "Planına dahil değil"
              : topic.lessons.length && done === topic.lessons.length
                ? "Tamamlandı"
                : done
                  ? `${done}/${topic.lessons.length} adım`
                  : "Açık";
            return (
              <section key={topic.id} className={`border-b border-[color:var(--border)] ${isSelected ? "bg-[color:var(--canvas)]" : ""}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => (isLocked ? onSelectLesson(topic, undefined) : isSelected ? undefined : toggle(topic.id))}
                >
                  {isLocked ? <Lock size={16} className="mt-1 shrink-0 text-[color:var(--muted)]" aria-hidden="true" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-extrabold uppercase tracking-wide text-[color:var(--foreground)]">
                      Konu {index + 1} <span className="font-semibold normal-case tracking-normal text-[color:var(--muted)]">{status}</span>
                    </span>
                    <span className="mt-0.5 block text-[15px] font-bold leading-snug text-[color:var(--foreground)]">{topic.name}</span>
                  </span>
                  {isLocked ? (
                    <ChevronRight size={18} className="mt-1 shrink-0 text-[color:var(--muted)]" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={18} className={`mt-1 shrink-0 text-[color:var(--muted)] transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden="true" />
                  )}
                </button>
                {open && !isLocked && topic.lessons.length ? (
                  <ol className="pb-3">
                    {topic.lessons.map((lesson, i) => {
                      const active = isSelected && lesson.id === selectedLessonId;
                      const complete = completedIds.has(lesson.id);
                      return (
                        <li key={lesson.id} className="px-3">
                          <button
                            type="button"
                            aria-current={active ? "step" : undefined}
                            onClick={() => onSelectLesson(topic, lesson.id)}
                            className={`flex w-full items-center gap-2 rounded-md border-2 px-2 py-1.5 text-left text-sm transition ${
                              active ? "border-[color:var(--accent)] font-bold text-[color:var(--foreground)]" : "border-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                            }`}
                          >
                            <span className="w-7 shrink-0 text-xs font-bold text-[color:var(--muted)]">{index + 1}.{i + 1}</span>
                            <span className="min-w-0 flex-1 leading-snug">{stepLabel(lesson.title, topic.name)}</span>
                            {complete ? (
                              <Check size={16} className="shrink-0 text-emerald-600" aria-label="Tamamlandı" />
                            ) : (
                              <ChevronRight size={16} className="shrink-0 text-[color:var(--muted)]" aria-hidden="true" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
              </section>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
