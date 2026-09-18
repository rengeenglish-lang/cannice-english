type Lesson = { id: string; title: string };
type Module = { lessons: Lesson[] };
type Progress = { recordedLessonId: string; completedAt: Date | string | null };

export function summarizeLearning(modules: Module[], progresses: Progress[]) {
  const lessons = modules.flatMap((module) => module.lessons);
  const validIds = new Set(lessons.map((lesson) => lesson.id));
  const completedIds = new Set(
    progresses
      .filter((p) => p.completedAt && validIds.has(p.recordedLessonId))
      .map((p) => p.recordedLessonId),
  );
  return {
    total: lessons.length,
    completed: completedIds.size,
    percent: lessons.length
      ? Math.round((completedIds.size / lessons.length) * 100)
      : 0,
    nextLesson: lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null,
  };
}
