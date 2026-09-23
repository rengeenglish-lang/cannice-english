"use client";

import { useActionState } from "react";
import { sendTeacherMessageAction, type MessageFormState } from "@/app/actions/live-lessons";

export function TeacherMessageForm({ courses, defaultCourseId }: { courses: { id: string; title: string }[]; defaultCourseId?: string }) {
  const [state, action, pending] = useActionState(sendTeacherMessageAction, { status: "idle" } as MessageFormState);
  return (
    <form action={action} className="dashboard-panel space-y-4">
      <div>
        <label className="label" htmlFor="courseId">Konu</label>
        <select id="courseId" name="courseId" defaultValue={defaultCourseId ?? ""} className="auth-input">
          <option value="">Genel soru</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="body">Mesajın</label>
        <textarea id="body" name="body" required minLength={5} maxLength={2000} rows={5} className="auth-input" placeholder="Öğretmenine sormak istediğini yaz…" />
      </div>
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p role="status" className="text-sm font-semibold text-emerald-700">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Gönderiliyor…" : "Mesajı gönder"}</button>
    </form>
  );
}
