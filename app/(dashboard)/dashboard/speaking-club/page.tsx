import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Mic, Video } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getSpeakingClubRooms, speakingLevel } from "@/server/services/speaking-club.service";
import { CLUB_GROUPS, clubGroupName } from "@/lib/speaking-club";

export const metadata: Metadata = { title: "Speaking Club" };

export default async function SpeakingClubPage({ searchParams }: { searchParams: Promise<{ sonuc?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const [{ sonuc }, level, { rooms, note }] = await Promise.all([searchParams, speakingLevel(user.id), getSpeakingClubRooms()]);
  const room = level ? rooms.find((r) => r.key === level.group)! : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Speaking Club</p>
        <h1 className="page-title flex items-center gap-2"><Mic aria-hidden="true" /> Speaking Club</h1>
        <p className="page-copy">Seviyene göre üç ayrı oda: {CLUB_GROUPS.map((g) => `${g.name} (${g.bands})`).join(" · ")}.</p>
      </div>

      {!level ? (
        <section className="dashboard-panel space-y-3">
          <h2 className="text-lg font-extrabold">Önce seviyeni öğrenelim</h2>
          <p className="text-sm leading-6">
            Speaking Club&apos;a katılmadan önce kısa bir <strong>Genel İngilizce Seviye Testi</strong> çözmen gerekiyor. Bu test yalnızca
            seni <strong>doğru gruba</strong> yerleştirmek için: aynı seviyedeki öğrencilerle konuşmak hem daha rahat hem daha verimli.
          </p>
          <Link href="/dashboard/speaking-club/seviye-testi" className="primary-button">Seviye testine başla (30 soru, ~10 dk)</Link>
        </section>
      ) : (
        <section className="dashboard-panel space-y-4">
          {sonuc ? <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">Test tamamlandı! Seviyen {level.cefr}.</p> : null}
          <div>
            <p className="text-sm text-[color:var(--muted)]">Senin grubun</p>
            <p className="text-3xl font-black text-[color:var(--brand)]">{clubGroupName(level.group)}</p>
            <p className="text-sm text-[color:var(--muted)]">
              Seviye: {level.cefr} ({level.source === "PLACEMENT" ? "Genel İngilizce Seviye Testi" : "seviye tespit sonucun"}, {level.at.toLocaleDateString("tr-TR")})
            </p>
          </div>
          {room?.schedule ? <p className="flex items-center gap-2 rounded-xl bg-[color:var(--brand-soft)] p-3 text-sm font-bold"><CalendarClock size={16} aria-hidden="true" /> {room.schedule}</p> : null}
          {note ? <p className="whitespace-pre-wrap text-sm leading-6">{note}</p> : null}
          {room?.url ? (
            <a href={room.url} target="_blank" rel="noopener noreferrer" className="primary-button"><Video size={18} aria-hidden="true" /> {clubGroupName(level.group)} odasına katıl</a>
          ) : (
            <p className="rounded-xl border border-[color:var(--border)] p-3 text-sm text-[color:var(--muted)]">Grubunun oturum bağlantısı yakında burada olacak.</p>
          )}
          <p className="text-xs text-[color:var(--muted)]">
            Grubun sana uygun değil mi? <Link href="/dashboard/speaking-club/seviye-testi" className="underline">Testi yeniden çöz</Link>; en son sonucun geçerlidir.
          </p>
        </section>
      )}
    </div>
  );
}
