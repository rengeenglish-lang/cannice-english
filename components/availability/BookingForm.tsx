"use client";
import { useActionState } from "react";
import {
  bookSlotAction,
  cancelBookingAction,
  type AvailabilityFormState,
} from "@/app/actions/group-availability";
export function BookingForm({ id, booked }: { id: string; booked: boolean }) {
  const [state, action, pending] = useActionState(
    (booked ? cancelBookingAction : bookSlotAction).bind(null, id),
    {} as AvailabilityFormState,
  );
  return (
    <form action={action} className="mt-5 space-y-3">
      <button
        disabled={pending}
        className={booked ? "secondary-button" : "primary-button"}
      >
        {pending
          ? "İşleniyor…"
          : booked
            ? "Rezervasyonumu iptal et"
            : "Bu gruba kaydımı onayla"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm font-semibold text-emerald-700">
          {state.success}
        </p>
      )}
    </form>
  );
}
