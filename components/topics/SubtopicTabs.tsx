import { Star } from "lucide-react";

type Lesson = { id: string; title: string };

function shortLabel(title: string, topicName: string): string {
  const stripped = title.startsWith(`${topicName} – `) ? title.slice(topicName.length + 3) : title;
  return stripped
    .replace(/^Konuya Giriş$/i, "Giriş")
    .replace(/^.*(?:Sözlüğü|Referansı) \(\d\/\d\):\s*/i, "")
    .replace(/^Örnek Sorular( ve Çözümler)?$/i, "Örnek Sorular");
}

export function SubtopicTabs({
  lessons,
  topicName,
  selectedLessonId,
  onSelect,
}: {
  lessons: Lesson[];
  topicName: string;
  selectedLessonId: string | undefined;
  onSelect: (lessonId: string) => void;
}) {
  if (lessons.length <= 1) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
      {lessons.map((lesson) => {
        const active = lesson.id === selectedLessonId;
        const isExample = /Örnek Sorular/i.test(lesson.title);
        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition ${
              active ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.3)]" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {isExample ? <Star className={`size-4 ${active ? "fill-white" : "fill-amber-400 text-amber-400"}`} /> : null}
            {shortLabel(lesson.title, topicName)}
          </button>
        );
      })}
    </div>
  );
}
