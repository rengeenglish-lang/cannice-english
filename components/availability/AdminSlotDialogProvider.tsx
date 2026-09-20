"use client";
import { createContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { STATUS_LABELS, localDate, type AvailabilityStatus } from "@/lib/availability";
import { AdminSlotForm, type SlotFormValues } from "./AdminSlotForm";
import { AdminSlotActions } from "./AdminSlotActions";

export type SlotDetailData = {
  formValues: SlotFormValues;
  actual: number;
  status: AvailabilityStatus;
  enrollmentOpen: boolean;
  cancelled: boolean;
  updatedAt: string;
  seriesInfo: { sessionCount: number; repeatUntil: string } | null;
  bookings: { id: string; status: string; enrolledAt: string; studentName: string; studentEmail: string }[];
};

export const SlotDialogContext = createContext<{ openSlot: (id: string) => void } | undefined>(undefined);

/**
 * Admin can click any slot card to manage it in place (§22) instead of navigating to a separate
 * page. All slot detail data is pre-fetched by the server page and passed in here, so opening a
 * slot is instant — no extra round trip.
 */
export function AdminSlotDialogProvider({
  slots,
  courses,
  teachers,
  children,
}: {
  slots: Record<string, SlotDetailData>;
  courses: { id: string; title: string }[];
  teachers: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openSlotId, setOpenSlotId] = useState<string | null>(null);

  const detail = openSlotId ? slots[openSlotId] : null;

  useEffect(() => {
    // If the open slot vanished from fresh data (e.g. just deleted), close instead of showing a
    // blank dialog — the dialog's own onClose handler (already wired below) resets openSlotId.
    if (openSlotId && !detail) dialogRef.current?.close();
    else if (openSlotId) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [openSlotId, detail]);

  return (
    <SlotDialogContext.Provider value={{ openSlot: setOpenSlotId }}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label="Ders yönetimi"
        onClose={() => setOpenSlotId(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto max-h-[90vh] w-[min(680px,92vw)] overflow-y-auto rounded-2xl border-0 p-0 backdrop:bg-black/50"
      >
        {detail && openSlotId ? (
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="page-title !text-xl">Ders yönetimi</h2>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Kapat"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6 rounded-xl bg-blue-50 p-5">
              <p className="font-bold">
                {STATUS_LABELS[detail.status]} · {detail.actual} gerçek öğrenci
              </p>
              <p className="mt-2">
                Kayıt {detail.enrollmentOpen ? "açık" : "kapalı"}
                {detail.cancelled ? " · DERS İPTAL EDİLDİ" : ""}
              </p>
              {detail.seriesInfo && (
                <p className="mt-2 text-sm">
                  Haftalık seri: {detail.seriesInfo.sessionCount} ders · Son tarih{" "}
                  {localDate(new Date(detail.seriesInfo.repeatUntil))}. Tek ders veya bu dersten sonrasını
                  düzenleyebilirsiniz.
                </p>
              )}
            </div>
            <AdminSlotForm key={detail.updatedAt} actual={detail.actual} courses={courses} teachers={teachers} slot={detail.formValues} />
            <AdminSlotActions id={openSlotId} />
            <section className="mt-8">
              <h3 className="text-xl font-bold">Gerçek öğrenci kayıtları</h3>
              {!detail.bookings.length ? (
                <p className="mt-3">Henüz gerçek öğrenci kaydı yok. Demo doluluğu bu listede görünmez.</p>
              ) : (
                <ul className="mt-4 divide-y rounded-xl border bg-white">
                  {detail.bookings.map((b) => (
                    <li key={b.id} className="p-4">
                      <strong>{b.studentName}</strong>
                      <p className="break-all text-sm text-slate-600">{b.studentEmail}</p>
                      <p className="text-sm">
                        {b.status === "ACTIVE" ? "Aktif" : "İptal"} · {localDate(new Date(b.enrolledAt))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </dialog>
    </SlotDialogContext.Provider>
  );
}
