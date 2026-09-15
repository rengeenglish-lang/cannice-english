"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

type Testimonial = {
  studentName: string;
  studentPhotoUrl: string | null;
  examTypeId: string | null;
  resultSummary: string | null;
  quote: string;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
} | null;

export function TestimonialForm({
  exams,
  testimonial,
  action,
}: {
  exams: { id: string; name: string }[];
  testimonial: Testimonial;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel space-y-5">
      <div>
        <label className="label" htmlFor="studentName">Öğrenci Adı</label>
        <input id="studentName" name="studentName" required defaultValue={testimonial?.studentName} className="auth-input" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="examTypeId">Sınav</label>
          <select id="examTypeId" name="examTypeId" defaultValue={testimonial?.examTypeId ?? ""} className="auth-input">
            <option value="">—</option>
            {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="resultSummary">Sonuç (örn. YDS 92.5)</label>
          <input id="resultSummary" name="resultSummary" defaultValue={testimonial?.resultSummary ?? ""} className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="quote">Yorum</label>
        <textarea id="quote" name="quote" required rows={4} defaultValue={testimonial?.quote} className="auth-input" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="studentPhotoUrl">Fotoğraf URL (opsiyonel)</label>
          <input id="studentPhotoUrl" name="studentPhotoUrl" defaultValue={testimonial?.studentPhotoUrl ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="rating">Puan (1-5)</label>
          <input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="displayOrder">Sıralama</label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={testimonial?.displayOrder ?? 0} className="auth-input" />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isPublished" defaultChecked={testimonial?.isPublished ?? true} className="size-4" /> Yayında
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isFeatured" defaultChecked={testimonial?.isFeatured ?? false} className="size-4" /> Öne Çıkan
        </label>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
