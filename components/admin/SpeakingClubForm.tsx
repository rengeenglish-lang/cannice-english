"use client";
import { useActionState } from "react";
import { updateSpeakingClubAction, type SpeakingClubState } from "@/app/actions/admin-settings";

const initialState: SpeakingClubState = { status: "idle" };

export function SpeakingClubForm({ current }: { current: { url: string; schedule: string; note: string } }) {
  const [state, formAction, pending] = useActionState(updateSpeakingClubAction, initialState);
  return (
    <form action={formAction} className="panel max-w-xl space-y-4">
      <div>
        <label className="label" htmlFor="sc-url">Toplantı bağlantısı</label>
        <input id="sc-url" name="url" type="url" defaultValue={current.url} className="auth-input" placeholder="https://zoom.us/j/… veya https://meet.google.com/…" />
        <p className="mt-2 text-xs text-[color:var(--muted)]">Öğrenciler &quot;Derse Katıl&quot;a bastığında bu bağlantı yeni sekmede açılır. Boş bırakırsan buton &quot;yakında&quot; olarak görünür.</p>
      </div>
      <div>
        <label className="label" htmlFor="sc-schedule">Gün ve saat</label>
        <input id="sc-schedule" name="schedule" defaultValue={current.schedule} maxLength={200} className="auth-input" placeholder="Her Salı ve Perşembe 20:00 – 21:00" />
      </div>
      <div>
        <label className="label" htmlFor="sc-note">Öğrencilere not (isteğe bağlı)</label>
        <textarea id="sc-note" name="note" defaultValue={current.note} maxLength={600} rows={3} className="auth-input" placeholder="Kamera ve mikrofonunu hazırla; her oturumda bir konu üzerine konuşuyoruz." />
      </div>
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p role="status" className="text-sm font-semibold text-[color:var(--success)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
