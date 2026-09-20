"use client";

import { useActionState } from "react";
import { createLessonAction, updateLessonAction, deleteLessonAction } from "@/app/actions/admin-topics";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

type Lesson = {
  id: string;
  title: string;
  position: number;
  durationMinutes: number | null;
  videoUrl: string | null;
  contentBody: string | null;
  diagnosticTopicIds?: string[];
};

function LessonFields({ lesson }: { lesson?: Lesson }) {
  return (
    <>
      <div>
        <label className="label">Ders Başlığı</label>
        <input name="title" required defaultValue={lesson?.title} className="auth-input" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Süre (dakika)</label>
          <input name="durationMinutes" type="number" min={0} defaultValue={lesson?.durationMinutes ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label">Video URL (opsiyonel)</label>
          <input name="videoUrl" defaultValue={lesson?.videoUrl ?? ""} className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label">Ders İçeriği</label>
        <textarea name="contentBody" rows={8} defaultValue={lesson?.contentBody ?? ""} className="auth-input" />
      </div>
      <div>
        <label className="label">Seviye Tespit Konuları (slug, virgülle ayırın)</label>
        <input name="diagnosticTopicSlugs" placeholder="edilgen-cati, zamanlar" className="auth-input" />
        <p className="mt-1 text-xs text-[color:var(--muted)]">Bu ders, seçilen konularda zayıf çıkan öğrencilere önerilir.</p>
      </div>
    </>
  );
}

function LessonEditor({ examSlug, topicId, lesson }: { examSlug: string; topicId: string; lesson: Lesson }) {
  const boundUpdate = updateLessonAction.bind(null, examSlug, topicId, lesson.id);
  const [state, formAction, pending] = useActionState(boundUpdate, initialState);

  return (
    <details className="rounded-2xl border border-[color:var(--border)] p-4">
      <summary className="cursor-pointer font-bold text-[color:var(--foreground)]">
        {lesson.position + 1}. {lesson.title}
        {lesson.durationMinutes ? <span className="ml-2 text-xs font-semibold text-[color:var(--muted)]">{lesson.durationMinutes} dk</span> : null}
      </summary>
      <form action={formAction} className="mt-4 space-y-3">
        <LessonFields lesson={lesson} />
        {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
        {state.status === "idle" && state.message ? <p className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <button type="submit" disabled={pending} className="secondary-button">{pending ? "Kaydediliyor…" : "Dersi Kaydet"}</button>
        </div>
      </form>
      <form action={deleteLessonAction.bind(null, examSlug, topicId, lesson.id)} className="mt-3 border-t border-[color:var(--border)] pt-3">
        <button type="submit" className="text-xs font-bold text-[color:var(--danger)]">Dersi Sil</button>
      </form>
    </details>
  );
}

export function TopicLessonManager({ examSlug, topicId, lessons }: { examSlug: string; topicId: string; lessons: Lesson[] }) {
  const addAction = createLessonAction.bind(null, examSlug, topicId);

  return (
    <div className="dashboard-panel mt-6">
      <h2 className="section-title text-lg">Dersler</h2>
      <div className="mt-4 space-y-3">
        {lessons.map((lesson) => (
          <LessonEditor key={lesson.id} examSlug={examSlug} topicId={topicId} lesson={lesson} />
        ))}
        {lessons.length === 0 ? <p className="text-sm text-slate-400">Henüz bu konuya ders eklenmedi.</p> : null}
      </div>

      <details className="mt-4 rounded-2xl border border-dashed border-[color:var(--border-strong)] p-4">
        <summary className="cursor-pointer font-bold text-[color:var(--accent-strong)]">+ Yeni Ders Ekle</summary>
        <form action={addAction} className="mt-4 space-y-3">
          <LessonFields />
          <button type="submit" className="primary-button">Ders Ekle</button>
        </form>
      </details>
    </div>
  );
}
