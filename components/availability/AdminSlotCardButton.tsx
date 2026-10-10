"use client";
import Link from "next/link";
import { useContext } from "react";
import { SlotDialogContext } from "./AdminSlotDialogProvider";

/**
 * Thin client wrapper so SlotCard itself can stay a Server Component — the slot data it renders
 * (including Prisma Decimal price fields on the nested product) isn't plain-object-serializable
 * across the Server→Client boundary as a prop, but pre-rendered children are fine to pass through.
 */
export function AdminSlotCardButton({ slotId, children }: { slotId: string; children: React.ReactNode }) {
  const dialog = useContext(SlotDialogContext);

  if (dialog) {
    return (
      <button
        type="button"
        onClick={() => dialog.openSlot(slotId)}
        className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-[0_12px_35px_rgba(12,46,30,.07)] transition hover:border-blue-300 hover:shadow-lg"
      >
        {children}
      </button>
    );
  }

  // No dialog provider in the tree — fall back to the old direct-navigation behavior.
  return (
    <Link href={`/admin/group-availability/${slotId}`} className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(12,46,30,.07)]">
      {children}
    </Link>
  );
}
