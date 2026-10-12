"use client";
import { useActionState } from "react";
import {
  manageSlotAction,
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
