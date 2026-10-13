"use client";
import { useActionState } from "react";
import { importCurriculumPlansAction } from "@/app/actions/admin-curriculum";

export function ImportCurriculumPlans() {
  const [state, action, pending] = useActionState(importCurriculumPlansAction, { message: "", success: false });
  return <form action={action} className="mt-4 space-y-3">
    <button type="submit" disabled={pending} className="primary-button focus-ring disabled:opacity-60">
      {pending ? "Planlar kaydediliyor…" : "Onaylı planları taslak olarak ekle"}
    </button>
    <p role="status" className="text-sm">{state.message}</p>
  </form>;
}
