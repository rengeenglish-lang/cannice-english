"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reportStudyGoalFailureAction } from "@/app/actions/study-goals";

export function ReportFailureForm({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!reason.trim()) {
      setError("Bir sebep yazmalısın.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reportStudyGoalFailureAction(goalId, reason.trim());
      if (result.status === "error") {
        setError(result.message ?? "Kaydedilemedi.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <div className="min-w-[200px] flex-1">
        <label className="label" htmlFor={`reason-${goalId}`}>Neden ulaşamadın?</label>
        <input
          id={`reason-${goalId}`}
          className="auth-input"
          placeholder="örn. Yoğun bir haftaydı, zaman bulamadım"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <button type="button" onClick={submit} disabled={pending} className="secondary-button shrink-0 disabled:opacity-50">
        {pending ? "Kaydediliyor…" : "Sebebi Kaydet"}
      </button>
      {error ? <p className="w-full text-xs font-semibold text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
