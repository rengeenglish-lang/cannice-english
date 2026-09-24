import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCoaching } from "@/server/services/coaching/context";
import { getReport } from "@/server/services/coaching/reports.service";
import { reportSurveyAnswered } from "@/server/services/coaching/checkin.service";
import { pick } from "@/lib/coaching/i18n";
import { pathwayConfig, SKILL_LABELS, versionOf } from "@/lib/coaching/exams";
import { PrintButton, ReportSurvey } from "@/components/coaching/ReportSurvey";
import { ReportAdviceButton } from "@/components/coaching/ActionButton";
import { dayLabel } from "@/server/services/coaching/views";

export const metadata: Metadata = { title: "İlerleme raporu" };

function Stat({ label, value, help }: { label: string; value: React.ReactNode; help?: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] p-3">
      <p className="text-xs font-bold text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
      {help ? <p className="mt-1 text-[11px] leading-4 text-[color:var(--muted)]">{help}</p> : null}
    </div>
  );
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, t } = await requireCoaching();
  const report = await getReport(user.id, id);
  if (!report) notFound();
  const answered = Boolean(await reportSurveyAnswered(user.id, report.id));
  const d = report.data;
  const r = t.reports;
  const locale = t.locale;
  const config = pathwayConfig(d.exam.pathway);
  const fmt = (key: string) => dayLabel(key, locale, { day: "numeric", month: "long", year: "numeric" });
  const rate = d.tasks.planned ? Math.round((d.tasks.done / d.tasks.planned) * 100) : null;

  return (
    <article className="space-y-6" aria-labelledby="report-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t.title}</p>
          <h1 id="report-title" className="page-title">{report.kind === "WEEKLY" ? r.weekly : r.monthly}</h1>
          <p className="mt-2 text-sm font-bold text-[color:var(--muted)]">
            {r.period(fmt(d.period.start), fmt(d.period.end))}
            {config ? ` · ${config.name} ${pick(locale, versionOf(config, d.exam.version).name)}` : ""}
          </p>
        </div>
        <PrintButton label={r.print} />
      </div>

      <section className="dashboard-panel" aria-labelledby="r-plan">
        <h2 id="r-plan" className="section-title !text-lg">{r.planVsDone}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={r.planned} value={d.tasks.planned} />
          <Stat label={r.completed} value={`${d.tasks.done}${rate !== null ? ` (%${rate})` : ""}`} help={r.autoSelf(d.tasks.auto, d.tasks.self)} />
          <Stat label={r.consistency} value={`${d.consistency.activeDays}`} help={r.consistencyHelp(d.consistency.studyDaysPlanned)} />
          <Stat label={r.busyDays} value={d.tasks.busySkipped} />
          <Stat label={r.recordedTime} value={t.minutes(d.time.recordedMinutes)} help={r.recordedHelp} />
          <Stat label={r.selfTime} value={t.minutes(d.time.selfMinutes)} help={r.selfHelp} />
          <Stat label={r.vocabReviewed} value={d.vocab.reviewed} help={r.vocabHelp(d.vocab.added, d.vocab.mastered)} />
          <Stat label={r.mistakesReviewed} value={d.mistakes.retried} help={r.mistakesHelp(d.mistakes.added, d.mistakes.mastered)} />
        </div>
      </section>

      <section className="dashboard-panel" aria-labelledby="r-skills">
        <h2 id="r-skills" className="section-title !text-lg">{r.skillTrend}</h2>
        {d.skills.length ? (
          <table className="dashboard-table mt-3 w-full text-sm">
            <thead><tr><th scope="col" className="text-left">{t.skills}</th><th scope="col" className="text-right">{r.thisPeriod}</th><th scope="col" className="text-right">{r.previous}</th></tr></thead>
            <tbody>
              {d.skills.map((s) => (
                <tr key={s.skill}>
                  <td>{pick(locale, SKILL_LABELS[s.skill])}</td>
                  <td className="text-right font-bold">{s.accuracy !== null ? `%${s.accuracy}` : "—"} <span className="font-normal text-[color:var(--muted)]">({s.answered})</span></td>
                  <td className="text-right">{s.prevAccuracy !== null ? `%${s.prevAccuracy}` : "—"} <span className="text-[color:var(--muted)]">({s.prevAnswered})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="mt-2 text-sm text-[color:var(--muted)]">{t.notEnoughData}</p>}
        <p className="mt-2 text-xs text-[color:var(--muted)]">{t.performance.rawAccuracy}</p>
        {d.mocks.length ? (
          <>
            <h3 className="mt-5 text-sm font-extrabold">{r.mocks}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {d.mocks.map((m) => (
                <li key={m.attemptId}>
                  {dayLabel(m.date.slice(0, 10), locale, { day: "numeric", month: "short" })}: {m.correct}/{m.total} (%{m.percent}){m.estimate !== null ? ` · ${t.estimated} ${m.estimate}` : ""}{m.blank ? ` · ${t.performance.blank(m.blank)}` : ""}{m.timedOut ? ` · ${t.performance.timeUp}` : ""}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="dashboard-panel" aria-labelledby="r-targets">
        <h2 id="r-targets" className="section-title !text-lg">{r.targets}</h2>
        <p className="mt-2 text-sm">
          {t.dash.target}: <strong>{d.exam.targetScore ?? "—"}</strong>
          {d.exam.examDate ? ` · ${t.onboarding.examDate}: ${fmt(d.exam.examDate)}` : ""} <span className="text-xs text-[color:var(--muted)]">({t.studentEntered})</span>
        </p>
        {d.exam.skillTargets && Object.keys(d.exam.skillTargets).length ? (
          <p className="mt-1 text-sm">{Object.entries(d.exam.skillTargets).map(([k, v]) => `${pick(locale, SKILL_LABELS[k as keyof typeof SKILL_LABELS] ?? { tr: k, en: k })}: ${v}`).join(" · ")}</p>
        ) : null}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="dashboard-panel" aria-labelledby="r-ach">
          <h2 id="r-ach" className="section-title !text-lg">{r.achieved}</h2>
          {d.achievements.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{d.achievements.map((a, i) => <li key={i}>{pick(locale, a)}</li>)}</ul> : <p className="mt-2 text-sm text-[color:var(--muted)]">{r.noAchievements}</p>}
        </section>
        <section className="dashboard-panel" aria-labelledby="r-att">
          <h2 id="r-att" className="section-title !text-lg">{r.attention}</h2>
          {d.attention.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{d.attention.map((a, i) => <li key={i}>{pick(locale, a)}</li>)}</ul> : <p className="mt-2 text-sm text-[color:var(--muted)]">{r.noAttention}</p>}
        </section>
      </div>

      <section className="dashboard-panel border-l-4 border-l-[color:var(--accent)]" aria-labelledby="r-rec">
        <h2 id="r-rec" className="section-title !text-lg">{r.recommendation}</h2>
        <p className="mt-2 font-semibold leading-7">{pick(locale, d.recommendation)}</p>
        <div className="no-print mt-3"><ReportAdviceButton refId={`report:${report.id}`} label={t.reportAdvice} placeholder={t.adviceNote} sendLabel={t.send} thanks={t.adviceThanks} /></div>
      </section>

      {d.insufficient.length ? (
        <section className="rounded-2xl bg-slate-50 p-4 text-sm" aria-labelledby="r-ins">
          <h2 id="r-ins" className="font-bold">{r.dataNotes}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[color:var(--muted)]">{d.insufficient.map((x, i) => <li key={i}>{pick(locale, x)}</li>)}</ul>
        </section>
      ) : null}

      <p className="text-xs leading-5 text-[color:var(--muted)]">{r.noCausal} {t.automated} {t.estimateNote}</p>

      <section className="dashboard-panel no-print" aria-labelledby="r-survey">
        <h2 id="r-survey" className="section-title !text-lg">{r.survey}</h2>
        <div className="mt-3"><ReportSurvey locale={locale} reportId={report.id} answered={answered} /></div>
      </section>
    </article>
  );
}
