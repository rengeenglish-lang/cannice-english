import Link from "next/link";
import {
  lessonTime,
  lessonDate,
  lessonWeekday,
  groupExamLabel,
  STATUS_LABELS,
} from "@/lib/availability";
import type { GroupSlot } from "@/server/services/group-availability.service";
import { AdminSlotCardButton } from "./AdminSlotCardButton";
const tones = {
  AVAILABLE: "bg-emerald-50 text-emerald-800",
  ALMOST_FULL: "bg-amber-50 text-amber-900",
  FULL: "bg-rose-50 text-rose-800",
  CLOSED: "bg-rose-50 text-rose-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};
const bars = {
  AVAILABLE: "bg-emerald-500",
  ALMOST_FULL: "bg-amber-500",
  FULL: "bg-rose-500",
  CLOSED: "bg-rose-400",
  CANCELLED: "bg-slate-400",
};
export function SlotCard({
  slot,
  admin = false,
  weekdayOnly = false,
}: {
  slot: GroupSlot;
  admin?: boolean;
  weekdayOnly?: boolean;
}) {
  const a = slot.availability;

  const body = (
    <>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {weekdayOnly ? lessonWeekday(slot.startsAt) : lessonDate(slot.startsAt)}
      </p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
        {lessonTime(slot.startsAt)}{" "}
        <span className="text-sm font-medium text-slate-500">
          ·{" "}
          {Math.round(
            (slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000,
          )}{" "}
          dk
        </span>
      </p>
      <h3 className="mt-2 text-base font-bold text-slate-800">{slot.title}</h3>
      <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
        {groupExamLabel(slot.course.product)} dersi
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {slot.course.product.title}
        {slot.instructor ? ` · ${slot.instructor.name}` : ""}
      </p>
      <span
        className={`mt-4 self-start rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${tones[a.status]}`}
      >
        {STATUS_LABELS[a.status]}
      </span>
      <p className="mt-4 text-sm font-semibold">
        {a.displayed} / {a.capacity}{" "}
        {a.simulated ? "gösterim doluluğu" : "öğrenci kayıtlı"}
      </p>
      <div
        role="progressbar"
        aria-label="Grup doluluğu"
        aria-valuemin={0}
        aria-valuemax={a.capacity}
        aria-valuenow={a.displayed}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full ${bars[a.status]}`}
          style={{
            width: `${Math.min(100, (a.displayed / a.capacity) * 100)}%`,
          }}
        />
      </div>
      <p
        className={`mt-3 text-base font-bold ${a.status === "ALMOST_FULL" ? "text-amber-800" : "text-slate-700"}`}
      >
        {a.status === "CANCELLED"
          ? "Bu ders iptal edildi"
          : a.status === "CLOSED"
            ? "Kayıt alınmıyor"
            : a.displayRemaining
              ? `${a.status === "ALMOST_FULL" ? "Son " : ""}${a.displayRemaining} yer ${a.simulated ? "gösteriliyor" : "kaldı"}`
              : a.simulated
                ? "Demo görünümde boş yer yok"
                : "Boş yer kalmadı"}
      </p>
      {a.simulated && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {admin ? "SIMULATED OCCUPANCY · " : "Demo görünüm · "}Gerçek kayıt:{" "}
          {a.actual}. Demo sayıları gerçek kontenjanı azaltmaz.
        </p>
      )}
    </>
  );

  if (admin) {
    return (
      <AdminSlotCardButton slotId={slot.id}>
        {body}
        <span className="primary-button mt-5 w-full justify-center">Dersi yönet</span>
      </AdminSlotCardButton>
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(7,27,52,.07)]">
      {body}
      <Link href={`/group-lessons/${slot.id}`} className="primary-button mt-5 w-full">
        {!a.canEnroll
          ? "Başka saat seç"
          : a.simulated && a.status === "FULL"
            ? "Gerçek uygunluğu gör"
            : a.status === "ALMOST_FULL"
              ? "Yerini ayır"
              : "Gruba katıl"}
      </Link>
    </article>
  );
}
