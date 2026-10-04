"use client";
import { SeoForm } from "./SeoForm";
import { useActionState } from "react";
import { saveKeywordAction } from "@/app/actions/admin-seo-keywords";
import { INTENT_LABELS, type KeywordInput } from "@/lib/seo/keywords";
export function SeoKeywordForm({
  exams,
  initial,
}: {
  exams: { id: string; name: string }[];
  initial?: KeywordInput & { id: string; revision: number; archived: boolean };
}) {
  const [state, action, pending] = useActionState(saveKeywordAction, {
    message: "",
    ok: false,
    revision: initial?.revision,
  });
  const field =
    "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";
  return (
    <SeoForm
      pending={pending}
      onSave={(form) => {
        const input = {
          keyword: String(form.get("keyword")),
          languageCode: String(form.get("languageCode")),
          market: String(form.get("market")),
          intent: String(form.get("intent")),
          examId: String(form.get("examId")) || null,
          sourceNote: String(form.get("sourceNote")),
          ...(initial
            ? {
                id: initial.id,
                revision: state.revision ?? initial.revision,
                archived: form.get("archived") === "on",
              }
            : {}),
        };
        const payload = new FormData();
        payload.set("payload", JSON.stringify(input));
        action(payload);
      }}
      className="space-y-4"
    >
      <label className="block">
        Anahtar kelime
        <input
          name="keyword"
          required
          minLength={2}
          maxLength={160}
          defaultValue={initial?.keyword}
          className={field}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          Dil
          <input
            name="languageCode"
            required
            maxLength={20}
            defaultValue={initial?.languageCode ?? "tr-TR"}
            className={field}
          />
        </label>
        <label>
          Pazar (ülke kodu)
          <input
            name="market"
            required
            pattern="[A-Z]{2}"
            defaultValue={initial?.market ?? "TR"}
            className={field}
          />
        </label>
      </div>
      <label className="block">
        Arama amacı (editör değerlendirmesi)
        <select
          aria-label="Arama amacı (editör değerlendirmesi)"
          name="intent"
          defaultValue={initial?.intent ?? "UNKNOWN"}
          className={field}
        >
          {Object.entries(INTENT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Sınav
        <select
          aria-label="Sınav"
          name="examId"
          defaultValue={initial?.examId ?? ""}
          className={field}
        >
          <option value="">Genel / seçilmedi</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Araştırma kaynağı ve öğrenci ihtiyacı
        <textarea
          aria-label="Araştırma kaynağı ve öğrenci ihtiyacı"
          name="sourceNote"
          required
          minLength={5}
          maxLength={2000}
          rows={3}
          defaultValue={initial?.sourceNote}
          className={field}
        />
      </label>
      {initial ? (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="archived"
            defaultChecked={initial.archived}
          />
          Arşivle
        </label>
      ) : null}
      <button disabled={pending} className="primary-button">
        {pending ? "Kaydediliyor…" : "Anahtar kelimeyi kaydet"}
      </button>
      <p role="status" aria-live="polite">
        {state.message}
      </p>
    </SeoForm>
  );
}
