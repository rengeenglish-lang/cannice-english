import type { Metadata } from "next";
import { db } from "@/server/db";
import { requireCoaching } from "@/server/services/coaching/context";
import { checkInWeekFor, getCheckIn } from "@/server/services/coaching/checkin.service";
import { CheckInForm } from "@/components/coaching/CheckInForm";
import { addDays, dayKeyToDate } from "@/lib/coaching/time";
import { dayLabel } from "@/server/services/coaching/views";

export const metadata: Metadata = { title: "Haftalık değerlendirme" };

export default async function CheckInPage() {
  const { user, t, todayKey, config } = await requireCoaching();
  const week = checkInWeekFor(todayKey);
  const [existing, tasks] = await Promise.all([
    getCheckIn(user.id, week),
    db.studyTask.findMany({ where: { userId: user.id, date: { gte: dayKeyToDate(week), lt: dayKeyToDate(addDays(week, 7)) }, NOT: { skipReason: "BUSY" } }, select: { status: true } }),
  ]);
  const done = tasks.filter((x) => x.status === "DONE").length;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{t.checkin.title}</h1>
        <p className="page-copy mt-2">{t.checkin.lead}</p>
        <p className="mt-3 text-sm font-bold text-[color:var(--muted)]">
          {dayLabel(week, t.locale, { day: "numeric", month: "long" })} – {dayLabel(addDays(week, 6), t.locale, { day: "numeric", month: "long" })} · {t.dash.weekProgress(done, tasks.length)}
        </p>
        {existing ? <p className="mt-2 text-sm text-[color:var(--muted)]">{t.checkin.already}</p> : null}
      </header>
      <CheckInForm
        locale={t.locale}
        weekStart={week}
        skills={config.skills}
        initial={existing ? { manageable: existing.manageable as "EASY" | "OK" | "HARD", hardestSkills: existing.hardestSkills, blockers: existing.blockers, workloadChange: existing.workloadChange as "LESS" | "SAME" | "MORE", note: existing.note ?? "" } : null}
      />
      <p className="text-xs text-[color:var(--muted)]">{t.checkin.howUsed}</p>
    </div>
  );
}
