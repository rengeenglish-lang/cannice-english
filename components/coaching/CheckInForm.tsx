"use client";
import { useState, useTransition } from "react";
import { coachingCopy, pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { saveCheckInAction } from "@/app/actions/coaching";

type Value = { manageable: "EASY" | "OK" | "HARD"; hardestSkills: string[]; blockers: string[]; workloadChange: "LESS" | "SAME" | "MORE"; note: string };

export function CheckInForm({ locale, weekStart, skills, initial }: { locale: string; weekStart: string; skills: SkillKey[]; initial: Value | null }) {
  const t = coachingCopy(locale);
  const c = t.checkin;
  const [v, setV] = useState<Value>(initial ?? { manageable: "OK", hardestSkills: [], blockers: [], workloadChange: "SAME", note: "" });
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, start] = useTransition();
  const chip = (on: boolean) => `min-h-11 rounded-xl border px-4 py-2 text-sm font-bold transition ${on ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-strong)] bg-white text-slate-700 hover:border-[color:var(--brand)]"}`;
  const toggle = (list: string[], x: string) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

  return (
    <form
      className="dashboard-panel space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveCheckInAction(weekStart, { ...v, blockers: v.blockers as never, note: v.note || undefined });
          setStatus(res.ok ? "saved" : "error");
        });
      }}
    >
      <fieldset>
        <legend className="text-sm font-bold">{c.manageable}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.entries(c.manageableOptions) as [Value["manageable"], string][]).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={v.manageable === k} className={chip(v.manageable === k)} onClick={() => setV({ ...v, manageable: k })}>{label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold">{c.hardest}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <button key={s} type="button" aria-pressed={v.hardestSkills.includes(s)} className={chip(v.hardestSkills.includes(s))} onClick={() => setV({ ...v, hardestSkills: toggle(v.hardestSkills, s) })}>{pick(locale, SKILL_LABELS[s])}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold">{c.blockers}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(c.blockerOptions).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={v.blockers.includes(k)} className={chip(v.blockers.includes(k))} onClick={() => setV({ ...v, blockers: toggle(v.blockers, k) })}>{label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold">{c.workload}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.entries(c.workloadOptions) as [Value["workloadChange"], string][]).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={v.workloadChange === k} className={chip(v.workloadChange === k)} onClick={() => setV({ ...v, workloadChange: k })}>{label}</button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-bold">
        {c.note}
        <textarea rows={3} maxLength={500} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} className="auth-input mt-2" />
      </label>
      {status === "saved" ? <p role="status" className="success-banner">{c.thanks}</p> : null}
      {status === "error" ? <p role="alert" className="text-sm font-semibold text-rose-700">{t.onboarding.errors.generic}</p> : null}
      <button type="submit" className="primary-button" disabled={pending}>{pending ? t.saving : c.submit}</button>
    </form>
  );
}
