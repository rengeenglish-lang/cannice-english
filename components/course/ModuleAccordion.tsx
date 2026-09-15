type Lesson = { id: string; title: string; durationMinutes: number | null; isPreviewable: boolean };
type ModuleData = { id: string; title: string; lessons: Lesson[] };

export function ModuleAccordion({ modules }: { modules: ModuleData[] }) {
  if (modules.length === 0) return null;
  return (
    <div className="space-y-3">
      {modules.map((module, index) => (
        <details key={module.id} className="panel group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[color:var(--foreground)]">
            <span>{index + 1}. {module.title}</span>
            <span className="text-sm text-slate-400">{module.lessons.length} ders</span>
          </summary>
          <ul className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4">
            {module.lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <span>{lesson.title}</span>
                <span className="flex items-center gap-2 text-xs">
                  {lesson.isPreviewable ? <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 font-bold text-[color:var(--accent-strong)]">Örnek Ders</span> : null}
                  {lesson.durationMinutes ? <span className="text-slate-400">{lesson.durationMinutes} dk</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
