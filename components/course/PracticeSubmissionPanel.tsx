"use client";

import { useActionState } from "react";
import { submitPracticeExamAction, type SubmissionFormState } from "@/app/actions/submissions";

const initialState: SubmissionFormState = { status: "idle" };

type Submission = {
  id: string;
  title: string;
  status: "PENDING" | "REVIEWED";
  studentAnswer: string;
  teacherFeedback: string | null;
  score: unknown;
  submittedAt: Date;
};

export function PracticeSubmissionPanel({
  courseId,
  enrollmentId,
  submissions,
}: {
  courseId: string;
  enrollmentId: string;
  submissions: Submission[];
}) {
  const action = submitPracticeExamAction.bind(null, courseId, enrollmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="panel">
      <p className="eyebrow">Deneme Sınavı Değerlendirmesi</p>
      <h2 className="section-title mt-1 text-lg">Yazılı cevabınızı gönderin, öğretmeniniz geri bildirim yapsın</h2>

      {state.status === "success" ? (
        <p className="success-banner">{state.message}</p>
      ) : (
        <form action={formAction} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="submission-title">Başlık</label>
            <input id="submission-title" name="title" required placeholder="Örn. Writing Task 2 - Deneme 1" className="auth-input" />
          </div>
          <div>
            <label className="label" htmlFor="submission-answer">Cevabınız</label>
            <textarea id="submission-answer" name="studentAnswer" required rows={6} minLength={20} className="auth-input" />
          </div>
          {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
          <button type="submit" disabled={pending} className="primary-button">{pending ? "Gönderiliyor…" : "Değerlendirmeye Gönder"}</button>
        </form>
      )}

      {submissions.length > 0 ? (
        <div className="mt-6 space-y-3 border-t border-[color:var(--border)] pt-6">
          <p className="eyebrow">Geçmiş Gönderileriniz</p>
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-2xl border border-[color:var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-[color:var(--foreground)]">{submission.title}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${submission.status === "REVIEWED" ? "bg-[color:var(--success-soft)] text-[color:var(--success)]" : "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"}`}>
                  {submission.status === "REVIEWED" ? "Değerlendirildi" : "Beklemede"}
                </span>
              </div>
              {submission.status === "REVIEWED" ? (
                <div className="mt-3 rounded-xl bg-[color:var(--canvas)] p-3 text-sm">
                  {submission.score !== null ? <p className="font-bold text-[color:var(--foreground)]">Puan: {String(submission.score)}/100</p> : null}
                  <p className="mt-1 text-[color:var(--muted)]">{submission.teacherFeedback}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[color:var(--muted)]">Öğretmeniniz henüz değerlendirmedi.</p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
