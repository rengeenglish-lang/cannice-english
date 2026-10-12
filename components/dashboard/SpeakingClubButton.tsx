"use client";
import Link from "next/link";
import { useRef } from "react";
import { CalendarClock, ClipboardCheck, Mic, Video, X } from "lucide-react";

export type SpeakingClubInfo = {
  note: string;
  /** Null until the learner's level is known; then their level room. */
  level: { cefr: string; groupName: string; url: string; schedule: string } | null;
};

/**
 * "Speaking Club'a Katıl": learners whose level is known see their level room (ELEMENTARY A,
 * INTERMEDIATE B or ADVANCED C); everyone else is asked to take the short general English test
 * first, which only exists to place them with learners at the same level.
 */
export function SpeakingClubButton({ club }: { club: SpeakingClubInfo }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const level = club.level;
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
          {level ? (
            <>
              <div className="rounded-xl bg-[color:var(--brand-soft)] p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Senin grubun</p>
                <p className="text-2xl font-black text-[color:var(--brand)]">{level.groupName}</p>
                <p className="text-xs text-[color:var(--muted)]">Seviye: {level.cefr}</p>
              </div>
              {level.schedule ? <p className="flex items-center gap-2 text-sm font-bold"><CalendarClock size={16} aria-hidden="true" /> {level.schedule}</p> : null}
              {club.note ? <p className="whitespace-pre-wrap text-sm leading-6">{club.note}</p> : null}
              {level.url ? (
                <a href={level.url} target="_blank" rel="noopener noreferrer" className="primary-button w-full justify-center" onClick={() => dialog.current?.close()}>
                  <Video size={18} aria-hidden="true" /> {level.groupName} odasına katıl
                </a>
              ) : (
                <p className="rounded-xl border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">Grubunun oturum bağlantısı yakında burada olacak.</p>
              )}
              <Link href="/dashboard/speaking-club" className="block text-center text-xs underline" onClick={() => dialog.current?.close()}>Grup bilgilerim ve seviye testi</Link>
            </>
          ) : (
            <>
              <p className="text-sm leading-6">
                Speaking Club&apos;da öğrenciler seviyelerine göre <strong>ELEMENTARY A</strong>, <strong>INTERMEDIATE B</strong> ve <strong>ADVANCED C</strong> odalarında buluşur.
              </p>
              <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                Seviyeni henüz bilmiyoruz. Katılmadan önce kısa bir <strong>Genel İngilizce Seviye Testi</strong> çözmelisin. Bu test yalnızca seni
                <strong> seninle aynı seviyedeki öğrencilerle aynı gruba</strong> yerleştirmek için — not verilmez.
              </p>
              <Link href="/dashboard/speaking-club/seviye-testi" className="primary-button w-full justify-center" onClick={() => dialog.current?.close()}>
                <ClipboardCheck size={18} aria-hidden="true" /> Seviye testine başla (30 soru, ~10 dk)
              </Link>
            </>
          )}
        </form>
      </dialog>
    </>
  );
}
