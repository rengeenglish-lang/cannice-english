"use client";
import { useActionState } from "react";
import {
  manageSlotAction,
  demoSlotsAction,
  type AvailabilityFormState,
} from "@/app/actions/group-availability";
export function AdminSlotActions({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    manageSlotAction.bind(null, id),
    {} as AvailabilityFormState,
  );
  return (
    <form action={action} className="mt-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        {[
          ["close", "Kaydı kapat"],
          ["open", "Kaydı yeniden aç"],
          ["cancel", "Dersi iptal et"],
          ["duplicate", "Gelecek haftaya kopyala"],
          ["delete", "Dersi sil"],
        ].map(([value, label]) => (
          <button
            key={value}
            className="secondary-button"
            disabled={pending}
            name="operation"
            value={value}
            onClick={(e) => {
              if (
                (value === "cancel" || value === "delete") &&
                !window.confirm(`${label}?`)
              )
                e.preventDefault();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {state.error && (
        <p role="alert" className="text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-emerald-700">
          {state.success}
        </p>
      )}
    </form>
  );
}
export function DemoSlotsForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(
    demoSlotsAction,
    {} as AvailabilityFormState,
  );
  return (
    <details className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <summary className="cursor-pointer font-bold">
        Demo doluluklarını oluştur (0, 2, 4, 7, 8, 9, 10)
      </summary>
      <form action={action} className="mt-4 space-y-3">
        <p className="text-sm">
          Önümüzdeki 7 güne demo dersler ekler. Gerçek öğrenci veya ödeme
          oluşturmaz. Aynı demo serisini çoğaltmaz.
        </p>
        <label className="label">
          Demo ders paketi
          <select name="courseId" className="auth-input" required>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={pending || !courses.length}
          className="secondary-button"
        >
          {pending ? "Oluşturuluyor…" : "Demo dersleri oluştur"}
        </button>
        {state.error && <p role="alert">{state.error}</p>}
        {state.success && <p role="status">{state.success}</p>}
      </form>
    </details>
  );
}
