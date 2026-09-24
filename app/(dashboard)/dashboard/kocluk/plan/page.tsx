import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, RefreshCw } from "lucide-react";
import { db } from "@/server/db";
import { requireCoaching } from "@/server/services/coaching/context";
import { ensureWeekPlan, getWeekTasks } from "@/server/services/coaching/plan.service";
import { buildCatalog } from "@/server/services/coaching/catalog.service";
import { addDays, dateToDayKey, dayKeyToDate, isoWeekday, weekStartOf } from "@/lib/coaching/time";
import { pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { TaskRow } from "@/components/coaching/TaskRow";
import { AddTaskForm } from "@/components/coaching/AddTaskForm";
import { ActionButton } from "@/components/coaching/ActionButton";
import { regeneratePlanAction } from "@/app/actions/coaching";
import { dayLabel, toTaskView } from "@/server/services/coaching/views";

export const metadata: Metadata = { title: "Haftalık çalışma planı" };

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export default async function CoachingPlanPage({ searchParams }: { searchParams: Promise<{ hafta?: string }> }) {
  const { user, profile, t, todayKey, config } = await requireCoaching();
  const locale = t.locale;
  const { hafta } = await searchParams;
  const thisWeek = weekStartOf(todayKey);
  let week = hafta && DAY_KEY.test(hafta) ? weekStartOf(hafta) : thisWeek;
  // Plans exist for the past and up to one week ahead.
  if (week > addDays(thisWeek, 7)) week = addDays(thisWeek, 7);
  if (week >= thisWeek) await ensureWeekPlan(profile, user, week, todayKey);

  const [tasks, weekRow, catalog] = await Promise.all([
    getWeekTasks(user.id, week),
    db.studyPlanWeek.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart: dayKeyToDate(week) } } }),
    buildCatalog(profile, user),
  ]);
  const basis = (weekRow?.basis ?? null) as { dailyMinutes?: number; studyDays?: number[]; focus?: string[] } | null;
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const editableDays = [...days, ...Array.from({ length: 7 }, (_, i) => addDays(week, 7 + i))].filter((d) => d >= todayKey);
  const dayOptions = editableDays.map((key) => ({ key, label: dayLabel(key, locale) }));
  const skillName = (s: string) => pick(locale, SKILL_LABELS[s as SkillKey] ?? { tr: s, en: s });
  const gapTitles = [...new Set(tasks.filter((x) => x.isGap).map((x) => x.title))];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{t.plan.title}</h1>
          <p className="page-copy mt-2">{t.plan.lead}</p>
        </div>
        <nav aria-label={t.plan.title} className="flex items-center gap-2">
          <Link href={`/dashboard/kocluk/plan?hafta=${addDays(week, -7)}`} className="ghost-button !min-h-10 !px-3" aria-label={t.plan.prevWeek}><ChevronLeft size={18} aria-hidden="true" /></Link>
          <Link href="/dashboard/kocluk/plan" className={`ghost-button !min-h-10 text-sm ${week === thisWeek ? "!border-[color:var(--brand)]" : ""}`} aria-current={week === thisWeek ? "page" : undefined}>{t.plan.thisWeek}</Link>
          {week < addDays(thisWeek, 7) ? (
            <Link href={`/dashboard/kocluk/plan?hafta=${addDays(week, 7)}`} className="ghost-button !min-h-10 !px-3" aria-label={t.plan.nextWeek}><ChevronRight size={18} aria-hidden="true" /></Link>
          ) : null}
        </nav>
      </header>

      <section className="dashboard-panel space-y-3 text-sm">
        <p className="font-bold">{dayLabel(week, locale, { day: "numeric", month: "long" })} – {dayLabel(addDays(week, 6), locale, { day: "numeric", month: "long", year: "numeric" })}</p>
        {basis?.dailyMinutes ? (
          <p className="text-[color:var(--muted)]">
            {t.plan.basis(basis.dailyMinutes, basis.studyDays?.length ?? 0)}
            {basis.focus?.length ? ` · ${t.plan.focus}: ${basis.focus.map(skillName).join(", ")}` : ""}
          </p>
        ) : null}
        <p className="text-[color:var(--muted)]">{t.plan.mixNote}</p>
        {catalog.lockedContent ? <p className="flex items-start gap-2 text-amber-900"><Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {t.plan.lockedNote} <Link href="/planlar" className="font-bold underline">{t.plan.seePlans}</Link></p> : null}
        {catalog.goalMismatch ? <p className="flex items-start gap-2 text-amber-900"><Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {t.dash.goalMismatch}</p> : null}
        {week === thisWeek ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--border)] pt-3">
            <ActionButton action={regeneratePlanAction} label={<><RefreshCw size={16} aria-hidden="true" /> {t.plan.regenerate}</>} confirm={t.plan.regenerateHelp} className="secondary-button" />
            <span className="text-xs text-[color:var(--muted)]">{t.plan.regenerateHelp}</span>
          </div>
        ) : null}
      </section>

      {editableDays.length ? <AddTaskForm locale={locale} dayOptions={dayOptions} skills={config.skills} defaultDay={editableDays[0]} /> : null}

      <ol className="space-y-4">
        {days.map((key) => {
          const list = tasks.filter((x) => dateToDayKey(x.date) === key);
          const total = list.filter((x) => x.status !== "SKIPPED").reduce((n, x) => n + x.minutes, 0);
          const isToday = key === todayKey;
          return (
            <li key={key} className={`dashboard-panel ${isToday ? "border-2 border-[color:var(--brand)]" : ""}`} aria-current={isToday ? "date" : undefined}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold">{dayLabel(key, locale, { weekday: "long", day: "numeric", month: "short" })}{isToday ? ` · ${t.plan.today}` : ""}</h2>
                {list.length ? <span className="text-xs font-bold text-[color:var(--muted)]">{t.minutes(total)}</span> : null}
              </div>
              {list.length ? (
                <ul className="mt-3 space-y-3">
                  {list.map((x) => <TaskRow key={x.id} task={toTaskView(x)} locale={locale} todayKey={todayKey} editable dayOptions={dayOptions} />)}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[color:var(--muted)]">{profile.studyDays.includes(isoWeekday(key)) && key < todayKey ? t.plan.noTasks : t.plan.rest}</p>
              )}
            </li>
          );
        })}
      </ol>

      {gapTitles.length || catalog.gaps.length ? (
        <section className="dashboard-panel" aria-labelledby="gaps-title">
          <h2 id="gaps-title" className="section-title !text-lg">{t.plan.contentGaps}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{t.task.gapHelp}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {catalog.gaps.map((g) => <li key={g.key} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">{g.name} · {skillName(g.skill)}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
