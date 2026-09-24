import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { requireCoaching } from "@/server/services/coaching/context";
import { examPerformance, latestLevelEstimate, mockHistory } from "@/server/services/coaching/insights.service";
import { recurringMistakeTopics } from "@/server/services/coaching/notebook.service";
import { pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { dayLabel } from "@/server/services/coaching/views";
import { dayKey } from "@/lib/coaching/time";

export const metadata: Metadata = { title: "Sınav performansı" };

const QUESTION_TYPE_LABEL: Record<string, { tr: string; en: string }> = {
  MCQ: { tr: "Çoktan seçmeli", en: "Multiple choice" },
  LISTENING_MCQ: { tr: "Dinleme", en: "Listening" },
  CLOZE: { tr: "Cloze", en: "Cloze" },
  TRANSLATION_EN_TR: { tr: "Çeviri EN→TR", en: "Translation EN→TR" },
  TRANSLATION_TR_EN: { tr: "Çeviri TR→EN", en: "Translation TR→EN" },
  SENTENCE_COMPLETION: { tr: "Cümle tamamlama", en: "Sentence completion" },
  PARAGRAPH_COMPLETION: { tr: "Paragraf tamamlama", en: "Paragraph completion" },
  READING_COMPREHENSION: { tr: "Okuma", en: "Reading comprehension" },
  RESTATEMENT: { tr: "Yakın anlam", en: "Restatement" },
};

export default async function PerformancePage() {
  const { user, profile, t, config } = await requireCoaching();
  const locale = t.locale;
  const p = t.performance;
  const examType = profile.contentExamSlug ? await db.examType.findUnique({ where: { slug: profile.contentExamSlug } }) : null;
  const examTypeId = examType?.id ?? null;
  const [perf, mocks, level, recurring] = await Promise.all([
    examPerformance(user.id, config, examTypeId),
    mockHistory(user.id, config, examTypeId),
    latestLevelEstimate(user.id, examTypeId, ["IELTS", "TOEFL", "PTE"].includes(config.code)),
    recurringMistakeTopics(user.id, 8),
  ]);
  const skillName = (s: string) => pick(locale, SKILL_LABELS[s as SkillKey] ?? { tr: s, en: s });
  const skills = perf.skills.filter((s) => config.skills.includes(s.skill)).sort((a, b) => config.skills.indexOf(a.skill) - config.skills.indexOf(b.skill));
  const blanks = skills.reduce((n, s) => n + s.blank, 0);
  const topics = perf.topics.filter((x) => x.answered >= 3).slice(0, 12);
  const timedOut = mocks.filter((m) => m.timedOut).length;
  const lastEstimate = [...mocks].reverse().find((m) => m.estimate !== null)?.estimate ?? null;

  if (!perf.answered && !mocks.length) {
    return (
      <div className="space-y-6">
        <h1 className="page-title">{p.title}</h1>
        <div className="learning-empty">
          <p className="font-bold">{t.notEnoughData}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">{p.emptyHelp}</p>
          <Link href="/seviye-tespit" className="primary-button mt-5">{t.dash.levelTest}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{p.title}</h1>
        <p className="page-copy mt-2">{p.lead}</p>
      </header>

      <section className="dashboard-panel" aria-labelledby="by-skill">
        <h2 id="by-skill" className="section-title !text-lg">{p.bySkill}</h2>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{p.rawAccuracy}</p>
        <ul className="mt-4 space-y-3">
          {skills.map((s) => (
            <li key={s.skill}>
              <div className="flex justify-between text-sm font-bold"><span>{skillName(s.skill)}</span><span>{s.accuracy !== null ? `%${s.accuracy}` : "—"} <span className="font-semibold text-[color:var(--muted)]">({p.answered(s.answered)}{s.blank ? `, ${p.blank(s.blank)}` : ""})</span></span></div>
              <progress className="learning-progress mt-1 w-full" value={s.accuracy ?? 0} max={100} aria-label={`${skillName(s.skill)} %${s.accuracy ?? 0}`} />
              {s.answered < 5 ? <p className="mt-1 text-xs text-[color:var(--muted)]">{p.fewAnswers}</p> : null}
            </li>
          ))}
        </ul>
        {config.skills.some((s) => s === "writing" || s === "speaking") ? <p className="mt-4 text-xs text-[color:var(--muted)]">{p.writingNote}</p> : null}
      </section>

      {topics.length ? (
        <section className="dashboard-panel" aria-labelledby="by-topic">
          <h2 id="by-topic" className="section-title !text-lg">{p.byTopic}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="dashboard-table w-full text-sm">
              <thead><tr><th scope="col" className="text-left">{p.topic}</th><th scope="col" className="text-left">{p.qType}</th><th scope="col" className="text-right">{p.accuracyCol}</th></tr></thead>
              <tbody>
                {topics.map((x) => (
                  <tr key={`${x.topicId}:${x.questionType}`}>
                    <td>{x.name}</td>
                    <td>{pick(locale, QUESTION_TYPE_LABEL[x.questionType] ?? { tr: x.questionType, en: x.questionType })}</td>
                    <td className="text-right font-bold">%{x.accuracy} <span className="font-normal text-[color:var(--muted)]">({x.correct}/{x.answered})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="dashboard-panel" aria-labelledby="timing">
          <h2 id="timing" className="section-title !text-lg">{p.timing}</h2>
          <p className="mt-2 text-sm">{p.unanswered}: <strong>{blanks}</strong></p>
          {mocks.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {mocks.slice(-5).map((m) => (
                <li key={m.attemptId}>{dayLabel(dayKey(m.date, profile.timezone), locale, { day: "numeric", month: "short" })}: {m.usedMinutes ?? "—"} / {t.minutes(m.limitMinutes)}{m.timedOut ? ` · ${p.timeUp}` : ""}</li>
              ))}
            </ul>
          ) : null}
          {timedOut ? <p className="mt-2 text-sm font-bold text-amber-800">{p.timedOut(timedOut)}</p> : null}
          <p className="mt-3 text-xs text-[color:var(--muted)]">{p.timingNote}</p>
        </section>

        <section className="dashboard-panel" aria-labelledby="targets">
          <h2 id="targets" className="section-title !text-lg">{p.targets}</h2>
          <p className="mt-2 text-sm">{t.dash.target}: <strong>{profile.targetScore ?? "—"}</strong> <span className="text-xs text-[color:var(--muted)]">({pick(locale, config.overall.label)} · {t.studentEntered})</span></p>
          {config.estimate ? (
            <>
              <p className="mt-2 text-sm">{p.estimate}: <strong>{lastEstimate ?? "—"}</strong> {lastEstimate !== null ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">{t.estimated}</span> : null}</p>
              <p className="mt-2 text-xs text-[color:var(--muted)]">{pick(locale, config.estimate.note)}</p>
            </>
          ) : (
            <p className="mt-2 text-xs text-[color:var(--muted)]">{p.noEstimate}</p>
          )}
          {level ? <p className="mt-3 text-sm">{t.dash.estimatedLevel}: <strong>{level.cefr ? `${level.cefr} · ` : ""}%{level.percent}</strong> <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">{t.estimated}</span></p> : null}
        </section>
      </div>

      {mocks.length ? (
        <section className="dashboard-panel" aria-labelledby="mocks">
          <h2 id="mocks" className="section-title !text-lg">{p.mockTrend}</h2>
          <ol className="mt-4 flex items-end gap-2" aria-label={p.mockTrend}>
            {mocks.slice(-10).map((m) => (
              <li key={m.attemptId} className="flex flex-1 flex-col items-center gap-1 text-[11px] font-bold">
                <span>%{m.percent}</span>
                <span className="w-full max-w-10 rounded-t-md bg-[color:var(--accent)]" style={{ height: `${Math.max(4, m.percent * 1.2)}px` }} aria-hidden="true" />
                <span className="text-[color:var(--muted)]">{dayLabel(dayKey(m.date, profile.timezone), locale, { day: "numeric", month: "numeric" })}</span>
                {m.estimate !== null ? <span className="text-amber-800">≈{m.estimate}</span> : null}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-[color:var(--muted)]">{p.rawAccuracy}</p>
        </section>
      ) : null}

      {recurring.length ? (
        <section className="dashboard-panel" aria-labelledby="recurring">
          <h2 id="recurring" className="section-title !text-lg">{p.recurring}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recurring.map((r) => <li key={r.tag} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">{r.tag} · {t.notebook.timesWrong(r.times)}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="text-xs leading-5 text-[color:var(--muted)]" aria-labelledby="sources">
        <h2 id="sources" className="font-bold">{p.sources(config.verifiedOn)}</h2>
        <ul className="mt-1 list-disc pl-5">
          {config.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a></li>)}
        </ul>
      </section>
    </div>
  );
}
