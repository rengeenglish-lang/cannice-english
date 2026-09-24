"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, CircleDashed, Info, Play, SkipForward, Undo2, CalendarArrowUp, Pencil, Trash2 } from "lucide-react";
import { coachingCopy, pick } from "@/lib/coaching/i18n";
import { SKILL_LABELS, type SkillKey } from "@/lib/coaching/exams";
import {
  completeTaskAction,
  deleteTaskAction,
  moveTaskAction,
  reopenTaskAction,
  saveTaskAction,
  skipTaskAction,
  startTaskAction,
} from "@/app/actions/coaching";

export type TaskView = {
  id: string;
  date: string;
  kind: string;
  skill: string | null;
  title: string;
  detail: string | null;
  href: string | null;
  isGap: boolean;
  minutes: number;
  status: "PLANNED" | "DONE" | "SKIPPED";
  completion: string | null;
  skipReason: string | null;
  canStart: boolean;
};

export function TaskRow({ task, locale, todayKey, editable = false, dayOptions = [] }: { task: TaskView; locale: string; todayKey: string; editable?: boolean; dayOptions?: { key: string; label: string }[] }) {
  const t = coachingCopy(locale);
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"view" | "complete" | "edit">("view");
  const [minutes, setMinutes] = useState("");
  const [form, setForm] = useState({ title: task.title, detail: task.detail ?? "", minutes: String(task.minutes), date: task.date });
  const [error, setError] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); });
  const done = task.status === "DONE";
  const skipped = task.status === "SKIPPED";
  const past = task.date < todayKey;
  const skill = task.skill ? pick(locale, SKILL_LABELS[task.skill as SkillKey] ?? { tr: task.skill, en: task.skill }) : null;

  return (
    <li className={`rounded-2xl border p-4 transition ${done ? "border-emerald-200 bg-emerald-50/60" : skipped ? "border-[color:var(--border)] bg-slate-50 opacity-80" : "border-[color:var(--border)] bg-white"}`} aria-busy={pending}>
      <div className="flex items-start gap-3">
        {done ? <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <CircleDashed size={22} className="mt-0.5 shrink-0 text-[color:var(--muted)]" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[color:var(--muted)]">
            <span>{t.task.kinds[task.kind] ?? task.kind}</span>
            {skill ? <span>· {skill}</span> : null}
            <span>· {t.minutes(task.minutes)}</span>
            {task.isGap ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 normal-case tracking-normal text-amber-900" title={t.task.gapHelp}>
                {t.task.gap}
              </span>
            ) : null}
          </div>
          <p className={`mt-1 font-bold leading-6 ${done ? "text-emerald-900" : "text-[color:var(--foreground)]"}`}>{task.title}</p>
          {task.detail ? <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{task.detail}</p> : null}
          {task.isGap ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-amber-900">
              <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {t.task.gapHelp}
            </p>
          ) : null}
          {done ? <p className="mt-1 text-xs font-semibold text-emerald-800">{task.completion === "AUTO" ? t.task.auto : t.task.self}</p> : null}
          {skipped && task.skipReason === "BUSY" ? <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">{t.task.busySkipped}</p> : null}
        </div>
      </div>

      {mode === "complete" ? (
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => completeTaskAction(task.id, minutes ? Number(minutes) : null));
            setMode("view");
          }}
        >
          <label className="text-xs font-bold text-[color:var(--muted)]">
            {t.task.minutesSpent}
            <input type="number" inputMode="numeric" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="auth-input mt-1 w-32" />
          </label>
          <button type="submit" className="primary-button !min-h-10 !py-2 text-sm" disabled={pending}>{t.task.markDone}</button>
          <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" onClick={() => setMode("view")}>{t.cancel}</button>
        </form>
      ) : null}

      {mode === "edit" ? (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await saveTaskAction({ taskId: task.id, title: form.title, detail: form.detail, minutes: Number(form.minutes), date: form.date });
              setError(!res.ok);
              if (res.ok) setMode("view");
            });
          }}
        >
          <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
            {t.plan.title_}
            <input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="auth-input mt-1" />
          </label>
          <label className="text-xs font-bold text-[color:var(--muted)] sm:col-span-2">
            {t.plan.detail}
            <textarea maxLength={500} rows={2} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="auth-input mt-1" />
          </label>
          <label className="text-xs font-bold text-[color:var(--muted)]">
            {t.plan.minutesLabel}
            <input type="number" min={5} max={240} required value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} className="auth-input mt-1" />
          </label>
          <label className="text-xs font-bold text-[color:var(--muted)]">
            {t.plan.date}
            <select value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="auth-input mt-1">
              {dayOptions.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </label>
          {error ? <p role="alert" className="text-sm font-semibold text-rose-700 sm:col-span-2">{t.onboarding.errors.generic}</p> : null}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="primary-button !min-h-10 !py-2 text-sm" disabled={pending}>{pending ? t.saving : t.save}</button>
            <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" onClick={() => setMode("view")}>{t.cancel}</button>
          </div>
        </form>
      ) : null}

      {mode === "view" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.status === "PLANNED" ? (
            <>
              {task.canStart ? (
                <button type="button" className="primary-button !min-h-10 !py-2 text-sm" disabled={pending} onClick={() => run(() => startTaskAction(task.id))}>
                  <Play size={15} aria-hidden="true" /> {t.task.start}
                </button>
              ) : null}
              <button type="button" className="secondary-button !min-h-10 !py-2 text-sm" disabled={pending} onClick={() => setMode("complete")}>
                <CheckCircle2 size={15} aria-hidden="true" /> {t.task.markDone}
              </button>
              {past ? (
                <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" disabled={pending} onClick={() => run(() => moveTaskAction(task.id, todayKey))}>
                  <CalendarArrowUp size={15} aria-hidden="true" /> {t.task.moveToday}
                </button>
              ) : (
                <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" disabled={pending} onClick={() => run(() => moveTaskAction(task.id))}>
                  <CalendarArrowUp size={15} aria-hidden="true" /> {t.task.postpone}
                </button>
              )}
              <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" disabled={pending} onClick={() => run(() => skipTaskAction(task.id))}>
                <SkipForward size={15} aria-hidden="true" /> {t.task.skip}
              </button>
            </>
          ) : (
            <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" disabled={pending} onClick={() => run(() => reopenTaskAction(task.id))}>
              <Undo2 size={15} aria-hidden="true" /> {t.task.undo}
            </button>
          )}
          {editable ? (
            <>
              <button type="button" className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm" disabled={pending} onClick={() => setMode("edit")}>
                <Pencil size={15} aria-hidden="true" /> {t.task.edit}
              </button>
              <button
                type="button"
                className="ghost-button !min-h-10 gap-1.5 !py-2 text-sm text-rose-700"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(t.task.deleteConfirm)) run(() => deleteTaskAction(task.id));
                }}
              >
                <Trash2 size={15} aria-hidden="true" /> {t.task.delete}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
