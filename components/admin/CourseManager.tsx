import {
  addModuleAction, deleteModuleAction, addLessonAction, deleteLessonAction,
  addLiveSessionAction, deleteLiveSessionAction,
} from "@/app/actions/admin-products";

type Lesson = { id: string; title: string; durationMinutes: number | null; isPreviewable: boolean };
type Module = { id: string; title: string; lessons: Lesson[] };
type LiveSession = { id: string; title: string; cohortLabel: string | null; startsAt: Date; endsAt: Date };

export function CourseManager({
  productId,
  courseId,
  modules,
  liveSessions,
}: {
  productId: string;
  courseId: string;
  modules: Module[];
  liveSessions: LiveSession[];
}) {
  const addModule = addModuleAction.bind(null, productId, courseId);
  const addLiveSession = addLiveSessionAction.bind(null, productId, courseId);

  return (
    <div className="mt-8 space-y-6">
      <div className="panel">
        <h2 className="section-title text-lg">Ders İçeriği</h2>
        <div className="mt-4 space-y-4">
          {modules.map((module, index) => {
            const addLesson = addLessonAction.bind(null, productId, module.id);
            const deleteModule = deleteModuleAction.bind(null, productId, module.id);
            return (
              <div key={module.id} className="rounded-2xl border border-[color:var(--border)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-[color:var(--foreground)]">{index + 1}. {module.title}</p>
                  <form action={deleteModule}><button type="submit" className="ghost-button text-[color:var(--danger)]">Modülü Sil</button></form>
                </div>
                <ul className="mt-3 space-y-1">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between gap-2 rounded-xl bg-[color:var(--canvas)] px-3 py-2 text-sm">
                      <span>{lesson.title}{lesson.durationMinutes ? ` · ${lesson.durationMinutes} dk` : ""}{lesson.isPreviewable ? " · Örnek Ders" : ""}</span>
                      <form action={deleteLessonAction.bind(null, productId, lesson.id)}>
                        <button type="submit" className="text-xs font-bold text-[color:var(--danger)]">Sil</button>
                      </form>
                    </li>
                  ))}
                </ul>
                <form action={addLesson} className="mt-3 flex flex-wrap items-end gap-2">
                  <input name="title" required placeholder="Ders adı" className="auth-input mt-0 flex-1" />
                  <input name="durationMinutes" type="number" placeholder="Dakika" className="auth-input mt-0 w-24" />
                  <label className="flex items-center gap-1 text-xs font-semibold text-[color:var(--foreground)]">
                    <input type="checkbox" name="isPreviewable" className="size-4" /> Örnek
                  </label>
                  <button type="submit" className="ghost-button shrink-0">+ Ders Ekle</button>
                </form>
              </div>
            );
          })}
        </div>
        <form action={addModule} className="mt-4 flex gap-2">
          <input name="title" required placeholder="Yeni modül adı" className="auth-input mt-0 flex-1" />
          <button type="submit" className="secondary-button shrink-0">+ Modül Ekle</button>
        </form>
      </div>

      <div className="panel">
        <h2 className="section-title text-lg">Canlı Ders Takvimi</h2>
        <ul className="mt-4 space-y-2">
          {liveSessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm">
              <div>
                <p className="font-bold text-[color:var(--foreground)]">{session.title}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {session.cohortLabel ? `${session.cohortLabel} · ` : ""}
                  {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(session.startsAt)}
                </p>
              </div>
              <form action={deleteLiveSessionAction.bind(null, productId, session.id)}>
                <button type="submit" className="text-xs font-bold text-[color:var(--danger)]">Sil</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addLiveSession} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input name="title" required placeholder="Canlı ders başlığı" className="auth-input mt-0" />
          <input name="cohortLabel" placeholder="Grup (opsiyonel)" className="auth-input mt-0" />
          <input name="startsAt" type="datetime-local" required className="auth-input mt-0" />
          <input name="endsAt" type="datetime-local" required className="auth-input mt-0" />
          <button type="submit" className="secondary-button sm:col-span-2">+ Canlı Ders Ekle</button>
        </form>
      </div>
    </div>
  );
}
