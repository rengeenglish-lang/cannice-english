import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookMarked, CalendarClock, CheckCircle2, ClipboardCheck, FileText, Lightbulb, NotebookPen, Target, TriangleAlert } from "lucide-react";
import { db } from "@/server/db";
import { loadCoaching } from "@/server/services/coaching/context";
import { getWeekTasks, missedTasks, pendingProposals } from "@/server/services/coaching/plan.service";
import { countDueVocab } from "@/server/services/coaching/vocab.service";
import { countDueMistakes } from "@/server/services/coaching/notebook.service";
import { examPerformance, latestLevelEstimate, strongSkillsFrom, weakSkillsFrom } from "@/server/services/coaching/insights.service";
import { checkInDue } from "@/server/services/coaching/checkin.service";
import { recentWeeklyReport } from "@/server/services/coaching/reports.service";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { dateToDayKey, daysBetween, weekStartOf } from "@/lib/coaching/time";
import { pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, versionOf, type SkillKey } from "@/lib/coaching/exams";
import { TaskRow } from "@/components/coaching/TaskRow";
import { ActionButton, ReportAdviceButton } from "@/components/coaching/ActionButton";
import { busyDayAction, decideProposalAction, setCoachingEnabledAction, startTaskAction } from "@/app/actions/coaching";
import { dayLabel, toTaskView } from "@/server/services/coaching/views";

export const metadata: Metadata = { title: "Ücretsiz Öğrenci Koçluğu" };

export default async function CoachingDashboardPage({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const { user, profile, t, todayKey, config } = await loadCoaching();
  const { silindi } = await searchParams;
  const locale = t.locale;

  // ---- New student / deleted / disabled ----
  if (!profile || !config || !todayKey) {
    return (
      <section className="dashboard-panel">
        {silindi ? <p role="status" className="success-banner mb-5">{t.settings.deleted}</p> : null}
        <h1 className="page-title">{t.title}</h1>
        <p className="page-copy mt-3">{t.intro}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {t.whatYouGet.map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-2xl border border-[color:var(--border)] p-4 text-sm font-semibold">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[color:var(--muted)]">{t.dash.newStudent}</p>
        <Link href="/dashboard/kocluk/baslangic" className="primary-button mt-4">
          {t.start} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    );
  }
  if (!profile.enabled) {
    return (
      <section className="dashboard-panel">
        <h1 className="page-title">{t.title}</h1>
        <p className="page-copy mt-3">{t.dash.disabled}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ActionButton action={setCoachingEnabledAction.bind(null, true)} label={t.settings.enable} className="primary-button" />
          <Link href="/dashboard/kocluk/ayarlar" className="ghost-button">{t.sections.settings}</Link>
        </div>
      </section>
    );
  }

  const weekStart = weekStartOf(todayKey);
  const examType = profile.contentExamSlug ? await db.examType.findUnique({ where: { slug: profile.contentExamSlug } }) : null;
  const [weekTasks, missed, proposals, vocabDue, mistakesDue, perf, level, checkInWeek, goal, report] = await Promise.all([
    getWeekTasks(user.id, weekStart),
    missedTasks(user.id, todayKey),
    pendingProposals(user.id),
    countDueVocab(user.id),
    countDueMistakes(user.id),
    examPerformance(user.id, config, examType?.id ?? null),
    latestLevelEstimate(user.id, examType?.id ?? null, config.code === "IELTS" || config.code === "TOEFL" || config.code === "PTE"),
    checkInDue(user.id, todayKey),
    getActiveGoal(user.id),
    recentWeeklyReport(user.id),
  ]);

  const today = weekTasks.filter((x) => dateToDayKey(x.date) === todayKey);
  const todayOpen = today.filter((x) => x.status === "PLANNED");
  const counted = weekTasks.filter((x) => x.skipReason !== "BUSY");
  const weekDone = counted.filter((x) => x.status === "DONE").length;
  const nextTask = todayOpen[0] ?? null;
  const isRestDay = !today.length;

  const bySkill = new Map<string, { done: number; total: number }>();
  for (const x of counted) {
    if (!x.skill) continue;
    const s = bySkill.get(x.skill) ?? { done: 0, total: 0 };
    s.total += 1;
    if (x.status === "DONE") s.done += 1;
    bySkill.set(x.skill, s);
  }

  const strong = strongSkillsFrom(perf.skills);
  const weak = weakSkillsFrom(perf.skills);
  const skillName = (s: string) => pick(locale, SKILL_LABELS[s as SkillKey] ?? { tr: s, en: s });
  const examDateKey = profile.examDate ? dateToDayKey(profile.examDate) : null;
  const daysLeft = examDateKey ? daysBetween(todayKey, examDateKey) : null;
  const version = versionOf(config, profile.examVersion);
  const skillTargets = (profile.skillTargets as Record<string, string | number> | null) ?? {};
  const goalMismatch = Boolean(examType && goal && goal.examTypeId !== examType.id);
  const todayMinutes = todayOpen.reduce((n, x) => n + x.minutes, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {/* Today */}
        <section aria-labelledby="today-title" className="dashboard-panel border-2 border-[color:var(--brand)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{dayLabel(todayKey, locale, { weekday: "long", day: "numeric", month: "long" })}</p>
              <h1 id="today-title" className="mt-1 text-2xl font-extrabold text-[color:var(--foreground)]">{t.dash.today}</h1>
              {todayOpen.length ? <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{t.dash.todayLeft(todayOpen.length, todayMinutes)}</p> : null}
            </div>
            {nextTask ? (
              <ActionButton action={startTaskAction.bind(null, nextTask.id)} label={<>{t.dash.continue} <ArrowRight size={18} aria-hidden="true" /></>} className="primary-button" />
            ) : null}
          </div>

          {isRestDay ? (
            <p className="mt-4 rounded-2xl bg-[color:var(--brand-soft)] p-4 text-sm font-semibold">{t.dash.restDay}</p>
          ) : !todayOpen.length ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{t.dash.allDone}</p>
          ) : null}

          {today.length ? (
            <ul className="mt-4 space-y-3">
              {today.map((x) => <TaskRow key={x.id} task={toTaskView(x)} locale={locale} todayKey={todayKey} />)}
            </ul>
          ) : null}

          {todayOpen.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[color:var(--border)] pt-4">
              <ActionButton action={busyDayAction} label={t.dash.busyDay} doneLabel={t.dash.busyApplied} className="ghost-button" />
              <span className="text-xs text-[color:var(--muted)]">{t.dash.busyDayHelp}</span>
            </div>
          ) : null}
        </section>

        {/* Proposals — nothing substantial changes without the student's OK */}
        {proposals.map((p) => (
          <section key={p.id} className="dashboard-panel border-l-4 border-l-[color:var(--accent)]" aria-label={t.dash.proposals}>
            <p className="eyebrow flex items-center gap-1.5"><Lightbulb size={14} aria-hidden="true" /> {t.dash.proposals}</p>
            <p className="mt-2 font-semibold leading-7">{p.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActionButton action={decideProposalAction.bind(null, p.id, true)} label={t.dash.accept} className="primary-button !min-h-10 !py-2 text-sm" />
              <ActionButton action={decideProposalAction.bind(null, p.id, false)} label={t.dash.decline} className="ghost-button !min-h-10 !py-2 text-sm" />
            </div>
            <div className="mt-3">
              <ReportAdviceButton refId={`proposal:${p.id}`} label={t.reportAdvice} placeholder={t.adviceNote} sendLabel={t.send} thanks={t.adviceThanks} />
            </div>
          </section>
        ))}

        {/* Missed tasks */}
        {missed.length ? (
          <section aria-labelledby="missed-title" className="dashboard-panel">
            <h2 id="missed-title" className="section-title !text-lg">{t.dash.missed}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{t.dash.missedHelp}</p>
            <ul className="mt-4 space-y-3">
              {missed.slice(0, 5).map((x) => <TaskRow key={x.id} task={toTaskView(x)} locale={locale} todayKey={todayKey} />)}
            </ul>
          </section>
        ) : null}

        {checkInWeek ? (
          <Link href="/dashboard/kocluk/degerlendirme" className="dashboard-panel flex items-center justify-between gap-4 transition hover:border-[color:var(--accent)]">
            <span className="flex items-center gap-3 font-bold"><ClipboardCheck size={20} className="text-[color:var(--accent)]" aria-hidden="true" /> {t.dash.checkinDue}</span>
            <ArrowRight size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
          </Link>
        ) : null}
        {report ? (
          <Link href={`/dashboard/kocluk/raporlar/${report.id}`} className="dashboard-panel flex items-center justify-between gap-4 transition hover:border-[color:var(--accent)]">
            <span className="flex items-center gap-3 font-bold"><FileText size={20} className="text-[color:var(--accent)]" aria-hidden="true" /> {t.dash.reportReady}</span>
            <ArrowRight size={18} className="shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
          </Link>
        ) : null}

        {/* Week */}
        <section aria-labelledby="week-title" className="dashboard-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="week-title" className="section-title !text-lg">{t.dash.week}</h2>
            <Link href="/dashboard/kocluk/plan" className="text-sm font-bold text-[color:var(--accent)]">{t.dash.openPlan} →</Link>
          </div>
          <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">{t.dash.weekProgress(weekDone, counted.length)}</p>
          <progress className="learning-progress mt-2 w-full" value={weekDone} max={Math.max(1, counted.length)} aria-label={t.dash.weekProgress(weekDone, counted.length)} />
          {bySkill.size ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[...bySkill.entries()].map(([skill, s]) => (
                <li key={skill} className="rounded-xl border border-[color:var(--border)] p-3">
                  <div className="flex justify-between text-sm font-bold"><span>{skillName(skill)}</span><span>{s.done}/{s.total}</span></div>
                  <progress className="learning-progress mt-2 w-full" value={s.done} max={s.total} aria-label={`${skillName(skill)} ${s.done}/${s.total}`} />
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-xs text-[color:var(--muted)]">{t.plan.mixNote}</p>
        </section>
      </div>

      <aside className="space-y-6">
        {/* Target */}
        <section aria-labelledby="target-title" className="dashboard-panel">
          <p className="eyebrow flex items-center gap-1.5"><Target size={14} aria-hidden="true" /> {t.dash.target}</p>
          <h2 id="target-title" className="mt-1 text-xl font-extrabold">{config.name} · {pick(locale, version.name)}</h2>
          {profile.targetScore ? (
            <p className="mt-2 text-sm">
              <strong className="text-2xl">{profile.targetScore}</strong> <span className="text-[color:var(--muted)]">{pick(locale, config.overall.label)}</span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{t.studentEntered}</span>
            </p>
          ) : null}
          <p className="mt-3 flex items-center gap-2 text-sm font-bold">
            <CalendarClock size={16} className="text-[color:var(--accent)]" aria-hidden="true" />
            {daysLeft !== null ? t.dash.countdown(daysLeft) : t.dash.noDate}
          </p>
          {examDateKey ? <p className="mt-1 text-xs text-[color:var(--muted)]">{dayLabel(examDateKey, locale, { day: "numeric", month: "long", year: "numeric" })} · {t.studentEntered}</p> : null}
          {Object.keys(skillTargets).length ? (
            <>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-[color:var(--muted)]">{t.dash.skillTargets}</p>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(skillTargets).map(([s, v]) => (
                  <li key={s} className="rounded-lg bg-[color:var(--brand-soft)] px-3 py-2"><span className="block text-xs text-[color:var(--muted)]">{skillName(s)}</span><strong>{String(v)}</strong></li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border-strong)] p-3 text-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[color:var(--muted)]">{t.dash.estimatedLevel}</p>
            {level ? (
              <p className="mt-1 font-bold">
                {level.cefr ? `${level.cefr} · ` : ""}%{level.percent} <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">{t.estimated}</span>
              </p>
            ) : (
              <Link href="/seviye-tespit" className="mt-1 inline-block font-bold text-[color:var(--accent)]">{t.dash.levelTest} →</Link>
            )}
            {profile.recentScore ? (
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                {t.dash.recentScore}: <strong>{profile.recentScore}</strong> ({profile.recentScoreKind === "OFFICIAL" ? t.onboarding.recentKinds.OFFICIAL : t.onboarding.recentKinds.PRACTICE} · {t.studentEntered})
              </p>
            ) : null}
          </div>
          <Link href="/dashboard/kocluk/baslangic" className="mt-4 inline-block text-sm font-bold text-[color:var(--accent)]">{t.settings.editProfile} →</Link>
        </section>

        {/* Strengths & weaknesses — from real answers only */}
        <section aria-labelledby="sw-title" className="dashboard-panel">
          <h2 id="sw-title" className="section-title !text-lg">{t.skills}</h2>
          {strong.length || weak.length ? (
            <div className="mt-3 space-y-3 text-sm">
              {strong.length ? <p><strong className="text-emerald-700">{t.dash.strengths}:</strong> {strong.map(skillName).join(", ")}</p> : null}
              {weak.length ? <p><strong className="text-amber-700">{t.dash.weaknesses}:</strong> {weak.map(skillName).join(", ")}</p> : null}
              <Link href="/dashboard/kocluk/performans" className="inline-block font-bold text-[color:var(--accent)]">{t.sections.performance} →</Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--muted)]">{t.dash.skillsNotEnough}</p>
          )}
          {profile.difficulties.length ? <p className="mt-3 text-xs text-[color:var(--muted)]">{t.dash.declared}: {profile.difficulties.map(skillName).join(", ")}</p> : null}
        </section>

        {/* Reviews due */}
        <section aria-label={t.dash.reviews} className="dashboard-panel space-y-3">
          <Link href="/dashboard/kocluk/kelime" className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] p-3 font-bold transition hover:border-[color:var(--accent)]">
            <span className="flex items-center gap-2 text-sm"><BookMarked size={18} className="text-[color:var(--accent)]" aria-hidden="true" /> {t.dash.vocabDue(vocabDue)}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/dashboard/kocluk/defter" className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] p-3 font-bold transition hover:border-[color:var(--accent)]">
            <span className="flex items-center gap-2 text-sm"><NotebookPen size={18} className="text-[color:var(--accent)]" aria-hidden="true" /> {t.dash.mistakesDue(mistakesDue)}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        {goalMismatch || config.contentNote ? (
          <section className="dashboard-panel space-y-2 text-sm">
            {goalMismatch ? (
              <p className="flex items-start gap-2"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" /> {t.dash.goalMismatch}</p>
            ) : null}
            {config.contentNote ? <p className="text-[color:var(--muted)]">{pick(locale, config.contentNote)}</p> : null}
          </section>
        ) : null}

        <p className="text-xs text-[color:var(--muted)]">
          {t.dash.studyGoalsLink} <Link href="/dashboard/hedeflerim" className="font-bold underline">{t.dash.studyGoalsLabel}</Link>
        </p>
      </aside>
    </div>
  );
}
