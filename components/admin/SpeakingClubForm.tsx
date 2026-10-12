"use client";
import { useActionState } from "react";
import { saveSpeakingClubRoomsAction, type RoomsFormState } from "@/app/actions/speaking-club";

type Room = { key: "A" | "B" | "C"; name: string; bands: string; url: string; schedule: string };

/** The three level rooms (ELEMENTARY A, INTERMEDIATE B, ADVANCED C) and a shared note. */
export function SpeakingClubForm({ rooms, note, counts }: { rooms: Room[]; note: string; counts: Record<string, number> }) {
  const [state, formAction, pending] = useActionState(saveSpeakingClubRoomsAction, { status: "idle" } as RoomsFormState);
  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {rooms.map((r) => (
        <fieldset key={r.key} className="panel space-y-3">
          <legend className="text-lg font-extrabold">
            {r.name} <span className="text-sm font-normal text-[color:var(--muted)]">({r.bands} · {counts[r.key] ?? 0} öğrenci)</span>
          </legend>
          <label className="label block">
            Toplantı bağlantısı
            <input name={`url_${r.key}`} type="url" defaultValue={r.url} className="auth-input mt-1" placeholder="https://meet.jit.si/… veya Zoom/Meet bağlantısı" />
          </label>
          <label className="label block">
            Gün ve saat
            <input name={`schedule_${r.key}`} defaultValue={r.schedule} maxLength={200} className="auth-input mt-1" placeholder="Her Cuma 21:00" />
          </label>
        </fieldset>
      ))}
      <label className="label block">
        Tüm gruplara not (isteğe bağlı)
        <textarea name="note" defaultValue={note} maxLength={600} rows={3} className="auth-input mt-1" placeholder="Kamera ve mikrofonunu hazırla; her oturumda bir konu üzerine konuşuyoruz." />
      </label>
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p role="status" className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
