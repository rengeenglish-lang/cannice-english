"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { coachingCopy, pick } from "@/lib/coaching/i18n";
import { PATHWAYS, PATHWAY_CODES, SKILL_LABELS, parseScore, type CoachingPathwayCode } from "@/lib/coaching/exams";
import { saveOnboardingAction } from "@/app/actions/coaching";

export type OnboardingInitial = {
  pathway: CoachingPathwayCode | null;
  examVersion: string;
  targetScore: string;
  skillTargets: Record<string, string>;
  examDate: string;
  currentLevel: string;
  recentScore: string;
  recentScoreKind: "PRACTICE" | "OFFICIAL";
  studyDays: number[];
  dailyMinutes: number;
  commitment: string;
  difficulties: string[];
  reminderTime: string;
  isMinor: boolean;
  guardianConsent: boolean;
};

const MINUTE_OPTIONS = [15, 20, 30, 45, 60, 90, 120, 180];
const TOTAL = 5;

export function OnboardingWizard({ locale, initial, isEdit, minorKnown }: { locale: string; initial: OnboardingInitial; isEdit: boolean; minorKnown: boolean }) {
  const t = coachingCopy(locale);
  const o = t.onboarding;
  const router = useRouter();
  const [step, setStep] = useState(initial.pathway ? 1 : 1);
  const [v, setV] = useState<OnboardingInitial>(initial);
  const [syncGoal, setSyncGoal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const config = v.pathway ? PATHWAYS[v.pathway] : null;
  const set = <K extends keyof OnboardingInitial>(k: K, value: OnboardingInitial[K]) => setV((prev) => ({ ...prev, [k]: value }));

  function validate(s: number): string | null {
    if (s === 1 && !v.pathway) return o.errors.exam;
    if (s === 2 && config) {
      if (v.targetScore && parseScore(v.targetScore, config.overall) === null) return o.errors.score;
      for (const { skill, scale } of config.skillScores) if (v.skillTargets[skill] && parseScore(v.skillTargets[skill], scale) === null) return o.errors.score;
    }
    if (s === 4) {
      if (!v.studyDays.length) return o.errors.days;
      if (v.dailyMinutes < 10 || v.dailyMinutes > 240) return o.errors.minutes;
    }
    if (s === 5 && v.isMinor && !v.guardianConsent) return o.errors.guardian;
    return null;
  }

  function next() {
    const e = validate(step);
    setError(e);
    if (!e) setStep((s) => Math.min(TOTAL, s + 1));
  }

  function submit() {
    for (let s = 1; s <= TOTAL; s++) {
      const e = validate(s);
      if (e) {
        setError(e);
        setStep(s);
        return;
      }
    }
    start(async () => {
      const res = await saveOnboardingAction({ ...v, pathway: v.pathway!, syncGoal, commitment: (v.commitment || undefined) as never, currentLevel: v.currentLevel as never, recentScoreKind: v.recentScoreKind });
      if (!res.ok) {
        setError(o.errors[res.error]);
        return;
      }
      router.push("/dashboard/kocluk");
      router.refresh();
    });
  }

  const field = "text-sm font-bold text-[color:var(--foreground)]";
  const help = "mt-1 text-xs leading-5 text-[color:var(--muted)]";
  const chip = (on: boolean) =>
    `min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition ${on ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-strong)] bg-white text-slate-700 hover:border-[color:var(--brand)]"}`;

  return (
    <section className="dashboard-panel" aria-labelledby="onb-title">
      <p className="eyebrow">{o.step(step, TOTAL)}</p>
      <h1 id="onb-title" className="page-title mt-1">{isEdit ? t.settings.editProfile : o.title}</h1>
      {!isEdit ? <p className="page-copy mt-2">{o.lead}</p> : null}
      <progress className="learning-progress mt-4 w-full" value={step} max={TOTAL} aria-hidden="true" />

      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < TOTAL) next();
          else submit();
        }}
      >
        {step === 1 ? (
          <>
            <fieldset>
              <legend className={field}>{o.exam}</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PATHWAY_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={v.pathway === code}
                    className={chip(v.pathway === code)}
                    onClick={() => setV((prev) => ({ ...prev, pathway: code, examVersion: PATHWAYS[code].versions[0].key, skillTargets: {}, targetScore: prev.pathway === code ? prev.targetScore : "", difficulties: [] }))}
                  >
                    {PATHWAYS[code].name === "YOKDIL" ? "YÖKDİL" : PATHWAYS[code].name}
                  </button>
                ))}
              </div>
            </fieldset>
            {config && config.versions.length > 1 ? (
              <fieldset>
                <legend className={field}>{o.version}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {config.versions.map((ver) => (
                    <button key={ver.key} type="button" aria-pressed={v.examVersion === ver.key} className={chip(v.examVersion === ver.key)} onClick={() => set("examVersion", ver.key)}>
                      {pick(locale, ver.name)}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : config ? (
              <p className="text-sm font-semibold text-[color:var(--muted)]">{pick(locale, config.versions[0].name)}</p>
            ) : null}
            {config?.contentNote ? <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{pick(locale, config.contentNote)}</p> : null}
          </>
        ) : null}

        {step === 2 && config ? (
          <>
            <label className="block">
              <span className={field}>{o.target}</span>
              <input
                inputMode="decimal"
                className="auth-input mt-2 max-w-xs"
                value={v.targetScore}
                onChange={(e) => set("targetScore", e.target.value)}
                placeholder={`${config.overall.min}–${config.overall.max}`}
                aria-describedby="target-help"
              />
              <span id="target-help" className={`${help} block`}>{pick(locale, config.overall.label)}</span>
            </label>
            {config.skillScores.length ? (
              <fieldset>
                <legend className={field}>{o.skillTargets}</legend>
                <p className={help}>{o.skillTargetsHelp}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {config.skillScores.map(({ skill, scale }) => (
                    <label key={skill} className="text-xs font-bold text-[color:var(--muted)]">
                      {pick(locale, SKILL_LABELS[skill])}
                      <input
                        inputMode="decimal"
                        className="auth-input mt-1"
                        value={v.skillTargets[skill] ?? ""}
                        placeholder={`${scale.min}–${scale.max}`}
                        onChange={(e) => set("skillTargets", { ...v.skillTargets, [skill]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <label className="block">
              <span className={field}>{o.examDate}</span>
              <input type="date" className="auth-input mt-2 max-w-xs" value={v.examDate} onChange={(e) => set("examDate", e.target.value)} />
              <span className={`${help} block`}>{o.examDateHelp}</span>
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label className="block">
              <span className={field}>{o.currentLevel}</span>
              <select className="auth-input mt-2 max-w-xs" value={v.currentLevel} onChange={(e) => set("currentLevel", e.target.value)}>
                {Object.entries(o.levelOptions).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={field}>{o.recentScore}</span>
                <input className="auth-input mt-2" maxLength={20} value={v.recentScore} onChange={(e) => set("recentScore", e.target.value)} />
              </label>
              <label className="block">
                <span className={field}>{o.recentScoreKind}</span>
                <select className="auth-input mt-2" value={v.recentScoreKind} onChange={(e) => set("recentScoreKind", e.target.value as "PRACTICE" | "OFFICIAL")}>
                  {Object.entries(o.recentKinds).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </label>
            </div>
            <p className="rounded-xl bg-[color:var(--brand-soft)] p-3 text-sm leading-6">{o.diagnosticOffer}</p>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <fieldset>
              <legend className={field}>{o.days}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.days7.map((label, i) => {
                  const day = i + 1;
                  const on = v.studyDays.includes(day);
                  return (
                    <button key={day} type="button" aria-pressed={on} className={chip(on)} onClick={() => set("studyDays", on ? v.studyDays.filter((d) => d !== day) : [...v.studyDays, day].sort())}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <fieldset>
              <legend className={field}>{o.dailyMinutes}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {MINUTE_OPTIONS.map((m) => (
                  <button key={m} type="button" aria-pressed={v.dailyMinutes === m} className={chip(v.dailyMinutes === m)} onClick={() => set("dailyMinutes", m)}>
                    {t.minutes(m)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={field}>{o.commitment}</span>
                <select className="auth-input mt-2" value={v.commitment} onChange={(e) => set("commitment", e.target.value)}>
                  <option value="">—</option>
                  {Object.entries(o.commitments).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={field}>{o.reminder}</span>
                <input type="time" className="auth-input mt-2" value={v.reminderTime} onChange={(e) => set("reminderTime", e.target.value)} />
              </label>
            </div>
          </>
        ) : null}

        {step === 5 && config ? (
          <>
            <fieldset>
              <legend className={field}>{o.difficulties}</legend>
              <p className={help}>{o.difficultiesHelp}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {config.skills.map((s) => {
                  const on = v.difficulties.includes(s);
                  return (
                    <button key={s} type="button" aria-pressed={on} className={chip(on)} onClick={() => set("difficulties", on ? v.difficulties.filter((d) => d !== s) : [...v.difficulties, s])}>
                      {pick(locale, SKILL_LABELS[s])}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {!minorKnown ? (
              <label className="flex items-center gap-3 text-sm font-bold">
                <input type="checkbox" className="size-5" checked={v.isMinor} onChange={(e) => set("isMinor", e.target.checked)} />
                {o.age}
              </label>
            ) : null}
            {v.isMinor ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <label className="flex items-start gap-3 text-sm font-semibold">
                  <input type="checkbox" className="mt-0.5 size-5 shrink-0" checked={v.guardianConsent} onChange={(e) => set("guardianConsent", e.target.checked)} />
                  {o.guardian}
                </label>
                <p className="mt-2 text-xs leading-5 text-amber-900">{o.guardianHelp}</p>
              </div>
            ) : null}
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 size-5 shrink-0" checked={syncGoal} onChange={(e) => setSyncGoal(e.target.checked)} />
              {o.syncGoal}
            </label>
            <p className="text-xs leading-5 text-[color:var(--muted)]">
              {o.privacy} <Link href="/legal/aydinlatma-metni" className="font-bold underline">{o.privacyLink}</Link>
            </p>
          </>
        ) : null}

        {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p> : null}

        <div className="flex flex-wrap gap-3 border-t border-[color:var(--border)] pt-5">
          {step > 1 ? (
            <button type="button" className="ghost-button" onClick={() => { setError(null); setStep((s) => s - 1); }}>{t.back}</button>
          ) : null}
          <button type="submit" className="primary-button" disabled={pending} aria-busy={pending}>
            {step < TOTAL ? t.next : pending ? t.saving : isEdit ? t.save : o.finish}
          </button>
        </div>
      </form>
    </section>
  );
}
