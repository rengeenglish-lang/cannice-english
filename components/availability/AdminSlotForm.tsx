"use client";
import { useActionState, useState } from "react";
import {
  saveSlotAction,
  type AvailabilityFormState,
} from "@/app/actions/group-availability";
import {
  DEFAULT_CAPACITY,
  occupancyStatus,
  STATUS_LABELS,
} from "@/lib/availability";
export type SlotFormValues = {
  id?: string;
  title: string;
  courseId: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  instructorId?: string;
  adminNotes?: string;
  displayedOccupancy?: number;
  useDisplayedOccupancy: boolean;
  enrollmentOpen: boolean;
  recurringSeriesId?: string;
};
export function AdminSlotForm({
  slot,
  courses,
  teachers,
  actual = 0,
}: {
  slot: SlotFormValues;
  courses: { id: string; title: string }[];
  teachers: { id: string; name: string }[];
  actual?: number;
}) {
  const [state, action, pending] = useActionState(
    saveSlotAction.bind(null, slot.id),
    {} as AvailabilityFormState,
  );
  const [capacity, setCapacity] = useState(slot.capacity || DEFAULT_CAPACITY),
    [simulated, setSimulated] = useState(slot.useDisplayedOccupancy),
    [display, setDisplay] = useState(slot.displayedOccupancy ?? 0),
    [repeat, setRepeat] = useState(false);
  const count = Math.min(
    capacity,
    Math.max(actual, simulated ? display : actual),
  );
  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="label">
          Ders başlığı
          <input
            name="title"
            required
            maxLength={160}
            defaultValue={slot.title}
            className="auth-input"
          />
        </label>
        <label className="label">
          Ders paketi
          <select
            name="courseId"
            defaultValue={slot.courseId}
            required
            className="auth-input"
          >
            {courses
              .filter((c) => !slot.id || c.id === slot.courseId)
              .map((c) => (
                <option value={c.id} key={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
        </label>
        <label className="label">
          Tarih
          <input
            name="date"
            type="date"
            required
            defaultValue={slot.date}
            className="auth-input"
          />
        </label>
        <label className="label">
          Başlangıç saati (Türkiye)
          <input
            name="time"
            type="time"
            required
            defaultValue={slot.time}
            className="auth-input"
          />
        </label>
        <label className="label">
          Süre (dakika)
          <input
            name="duration"
            type="number"
            min={15}
            max={480}
            required
            defaultValue={slot.duration}
            className="auth-input"
          />
        </label>
        <label className="label">
          Maksimum öğrenci
          <input
            name="capacity"
            type="number"
            min={Math.max(1, actual)}
            max={200}
            required
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="auth-input"
          />
        </label>
        <label className="label">
          Eğitmen
          <select
            name="instructorId"
            defaultValue={slot.instructorId || ""}
            className="auth-input"
          >
            <option value="">Henüz atanmadı</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          name="enrollmentOpen"
          type="checkbox"
          defaultChecked={slot.enrollmentOpen}
        />{" "}
        Kayıt açık (doluluk otomatik hesaplanır)
      </label>
      <fieldset className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <legend className="px-2 font-bold">Gösterim / demo doluluğu</legend>
        <p>
          Gerçek öğrenci kaydı: <strong>{actual}</strong>
        </p>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="useDisplayedOccupancy"
            checked={simulated}
            onChange={(e) => setSimulated(e.target.checked)}
          />{" "}
          Demo doluluğu kullan
        </label>
        <label className="label">
          Gösterilecek doluluk
          <input
            className="auth-input"
            name="displayedOccupancy"
            type="number"
            min={0}
            max={capacity}
            value={display}
            onChange={(e) => setDisplay(Number(e.target.value))}
          />
        </label>
        {simulated && (
          <p className="text-xs font-extrabold text-amber-900">
            SIMULATED OCCUPANCY
          </p>
        )}
        <p className="text-sm">
          Doluluk önizlemesi:{" "}
          <strong>
            {STATUS_LABELS[occupancyStatus(count, Math.max(1, capacity))]} ·{" "}
            {count} / {capacity}
          </strong>
        </p>
        <p className="text-sm">
          Demo sayıları öğrenci, ödeme veya katılım kaydı oluşturmaz; gerçek
          kontenjanı azaltmaz. Demo kullanımını kapatarak gerçek kayıtlara
          dönebilirsiniz.
        </p>
      </fieldset>
      {!slot.id && (
        <fieldset className="space-y-3">
          <label className="flex min-h-11 items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />{" "}
            Her hafta aynı gün ve saatte tekrarla
          </label>
          {repeat ? (
            <label className="label">
              Toplam hafta (ilk ders dahil)
              <input
                name="repeatWeeks"
                className="auth-input"
                type="number"
                min={2}
                max={52}
                defaultValue={12}
                required
              />
            </label>
          ) : (
            <input type="hidden" name="repeatWeeks" value={1} />
          )}
          <p className="text-sm text-slate-500">
            Seçilen haftaların dersleri otomatik oluşturulur. Her ders ayrı
            düzenlenebilir.
          </p>
        </fieldset>
      )}
      {slot.recurringSeriesId && (
        <label className="label">
          Değişiklik kapsamı
          <select name="scope" className="auth-input">
            <option value="single">Yalnızca bu ders</option>
            <option value="future">Bu ders ve serideki sonraki dersler</option>
          </select>
        </label>
      )}
      <label className="label">
        Yönetici notları
        <textarea
          name="adminNotes"
          maxLength={4000}
          defaultValue={slot.adminNotes || ""}
          rows={4}
          className="auth-input"
        />
      </label>
      {state.error && (
        <p role="alert" className="font-semibold text-red-700">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="primary-button">
        {pending
          ? "Kaydediliyor…"
          : slot.id
            ? "Değişiklikleri kaydet"
            : "Ders oluştur"}
      </button>
    </form>
  );
}
