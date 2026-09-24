"use client";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { coachingCopy, pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import { saveTaskAction } from "@/app/actions/coaching";

export function AddTaskForm({ locale, dayOptions, skills, defaultDay }: { locale: string; dayOptions: { key: string; label: string }[]; skills: SkillKey[]; defaultDay: string }) {
  const t = coachingCopy(locale);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", detail: "", minutes: "20", date: defaultDay, skill: "" });
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  if (!open) {
    return (
      <button type="button" className="secondary-button" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" /> {t.task.add}
      </button>
    );
  }
  return (
    <form
      className="dashboard-panel grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveTaskAction({ title: form.title, detail: form.detail, minutes: Number(form.minutes), date: form.date, skill: form.skill || null });
          setError(!res.ok);
          if (res.ok) {
            setForm({ ...form, title: "", detail: "" });
            setOpen(false);
          }
        });
      }}
    >
      <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
        {t.plan.title_}
        <input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="auth-input mt-1" />
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
        {t.plan.detail}
        <textarea rows={2} maxLength={500} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="auth-input mt-1" />
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)]">
        {t.plan.date}
        <select value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="auth-input mt-1">
          {dayOptions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
        </select>
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)]">
        {t.plan.minutesLabel}
        <input type="number" min={5} max={240} required value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} className="auth-input mt-1" />
      </label>
      <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
        {t.skills}
        <select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="auth-input mt-1">
          <option value="">—</option>
          {skills.map((s) => <option key={s} value={s}>{pick(locale, SKILL_LABELS[s])}</option>)}
        </select>
      </label>
      {error ? <p role="alert" className="text-sm font-semibold text-rose-700 sm:col-span-2">{t.onboarding.errors.generic}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="primary-button" disabled={pending}>{pending ? t.saving : t.save}</button>
        <button type="button" className="ghost-button" onClick={() => setOpen(false)}>{t.cancel}</button>
      </div>
    </form>
  );
}
