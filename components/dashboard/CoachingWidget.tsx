import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { db } from "@/server/db";
import { coachingCopy } from "@/lib/coaching/i18n";
import { dayKey, dayKeyToDate } from "@/lib/coaching/time";

/** Çalışma alanım card for Ücretsiz Öğrenci Koçluğu: today's remaining tasks, or an invitation to start. */
export async function CoachingWidget({ userId }: { userId: string }) {
  const profile = await db.coachingProfile.findUnique({ where: { userId }, select: { enabled: true, timezone: true, locale: true } });
  const t = coachingCopy(profile?.locale);
  if (profile && !profile.enabled) return null;
  const open = profile
    ? await db.studyTask.findMany({ where: { userId, date: dayKeyToDate(dayKey(new Date(), profile.timezone)), status: "PLANNED" }, select: { minutes: true }, orderBy: { position: "asc" } })
    : [];
  return (
    <Link href="/dashboard/kocluk" className="dashboard-panel flex items-center justify-between gap-4 border-2 border-[color:var(--accent)] transition hover:bg-[color:var(--brand-soft)]">
      <span className="flex items-start gap-3">
        <Compass size={24} className="mt-0.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
        <span>
          <span className="eyebrow block">{t.title} · {t.free}</span>
          <strong className="mt-1 block text-[color:var(--foreground)]">
            {!profile ? t.intro : open.length ? t.dash.todayLeft(open.length, open.reduce((n, x) => n + x.minutes, 0)) : t.dash.allDoneShort}
          </strong>
        </span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
    </Link>
  );
}
