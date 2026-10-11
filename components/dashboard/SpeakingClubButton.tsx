"use client";
import { useRef } from "react";
import { CalendarClock, Mic, Video, X } from "lucide-react";

/** "Speaking Club'a Katıl": opens a short form with the schedule and a "Derse Katıl" button for the meeting. */
export function SpeakingClubButton({ club }: { club: { url: string; schedule: string; note: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="secondary-button shrink-0" onClick={() => dialog.current?.showModal()}>
        <Mic size={18} aria-hidden="true" /> Speaking Club&apos;a Katıl
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="speaking-club-title"
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-0 text-[color:var(--foreground)] shadow-2xl backdrop:bg-black/50"
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
      >
        <form method="dialog" className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="speaking-club-title" className="flex items-center gap-2 text-xl font-extrabold"><Mic size={20} className="text-[color:var(--accent)]" aria-hidden="true" /> Speaking Club</h2>
            <button type="submit" className="rounded-full p-1 text-[color:var(--muted)] hover:text-[color:var(--foreground)]" aria-label="Kapat"><X size={18} aria-hidden="true" /></button>
          </div>
          <p className="text-sm leading-6 text-[color:var(--muted)]">Diğer öğrencilerle ve eğitmenimizle İngilizce konuşma pratiği yap. Oturuma tarayıcından katılabilirsin.</p>
          {club.schedule ? (
            <p className="flex items-center gap-2 rounded-xl bg-[color:var(--brand-soft)] p-3 text-sm font-bold"><CalendarClock size={16} aria-hidden="true" /> {club.schedule}</p>
          ) : null}
          {club.note ? <p className="whitespace-pre-wrap text-sm leading-6">{club.note}</p> : null}
          {club.url ? (
            <a href={club.url} target="_blank" rel="noopener noreferrer" className="primary-button w-full justify-center" onClick={() => dialog.current?.close()}>
              <Video size={18} aria-hidden="true" /> Derse Katıl
            </a>
          ) : (
            <p className="rounded-xl border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">Oturum bağlantısı yakında burada olacak.</p>
          )}
        </form>
      </dialog>
    </>
  );
}
