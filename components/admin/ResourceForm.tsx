"use client";

import { useActionState } from "react";
import { createResourceAction, type ResourceFormState } from "@/app/actions/admin-resources";

export function ResourceForm({ exams }: { exams: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createResourceAction, { status: "idle" } as ResourceFormState);
  return (
    <form action={action} className="panel grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="title">Başlık</label>
        <input id="title" name="title" required className="auth-input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">Kısa açıklama (opsiyonel)</label>
        <input id="description" name="description" className="auth-input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="fileUrl">Dosya bağlantısı (PDF vb.)</label>
        <input id="fileUrl" name="fileUrl" type="url" required placeholder="https://" className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="examTypeId">Sınav</label>
        <select id="examTypeId" name="examTypeId" required className="auth-input">
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="kind">Bölüm</label>
        <select id="kind" name="kind" className="auth-input">
          <option value="E_BOOK">E-Kitaplar</option>
          <option value="TOPIC">Konu Konu</option>
          <option value="PDF_MOCK">PDF Denemeler</option>
        </select>
      </div>
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)] sm:col-span-2">{state.message}</p> : null}
      {state.status === "success" ? <p role="status" className="text-sm font-semibold text-emerald-700 sm:col-span-2">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button sm:col-span-2 sm:w-fit">{pending ? "Ekleniyor…" : "Kaynak ekle"}</button>
    </form>
  );
}
