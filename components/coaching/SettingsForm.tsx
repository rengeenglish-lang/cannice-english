"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { coachingCopy } from "@/lib/coaching/i18n";
import { TIMEZONE_OPTIONS } from "@/lib/coaching/time";
import { updateSettingsAction } from "@/app/actions/coaching";

type Value = { notifyInApp: boolean; frequency: "NORMAL" | "LOW"; quietStart: string; quietEnd: string; reminderTime: string; timezone: string; locale: "tr" | "en" };

export function SettingsForm({ locale, initial, pausedLabel }: { locale: string; initial: Value; pausedLabel: string | null }) {
  const t = coachingCopy(locale);
  const s = t.settings;
  const router = useRouter();
  const [v, setV] = useState<Value>(initial);
  const [pause, setPause] = useState("-1");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, start] = useTransition();
  const zones = TIMEZONE_OPTIONS.includes(v.timezone as (typeof TIMEZONE_OPTIONS)[number]) ? TIMEZONE_OPTIONS : [v.timezone, ...TIMEZONE_OPTIONS];
  const label = "block text-sm font-bold";
  return (
    <form
      className="dashboard-panel space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateSettingsAction({ ...v, pauseDays: Number(pause) });
          setStatus(res.ok ? "saved" : "error");
          if (res.ok) { setPause("-1"); router.refresh(); }
        });
      }}
    >
      <h2 className="section-title !text-lg">{s.notifications}</h2>
      <label className="flex items-center gap-3 text-sm font-bold">
        <input type="checkbox" className="size-5" checked={v.notifyInApp} onChange={(e) => setV({ ...v, notifyInApp: e.target.checked })} />
        {s.inApp}
      </label>
      <div>
        <label className="flex items-center gap-3 text-sm font-bold text-[color:var(--muted)]">
          <input type="checkbox" className="size-5" checked={false} disabled aria-describedby="email-note" />
          {s.email}
        </label>
        <p id="email-note" className="mt-1 text-xs text-[color:var(--muted)]">{s.emailUnavailable}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          {s.frequency}
          <select className="auth-input mt-2" value={v.frequency} onChange={(e) => setV({ ...v, frequency: e.target.value as Value["frequency"] })}>
            {Object.entries(s.frequencies).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className={label}>
          {t.onboarding.reminder}
          <input type="time" required className="auth-input mt-2" value={v.reminderTime} onChange={(e) => setV({ ...v, reminderTime: e.target.value })} />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-bold">{s.quiet}</legend>
          <div className="mt-2 flex items-center gap-2">
            <input type="time" required aria-label={s.quietFrom} className="auth-input w-36" value={v.quietStart} onChange={(e) => setV({ ...v, quietStart: e.target.value })} />
            <span aria-hidden="true">–</span>
            <input type="time" required aria-label={s.quietTo} className="auth-input w-36" value={v.quietEnd} onChange={(e) => setV({ ...v, quietEnd: e.target.value })} />
          </div>
        </fieldset>
        <label className={label}>
          {s.pause}
          <select className="auth-input mt-2" value={pause} onChange={(e) => setPause(e.target.value)}>
            <option value="-1">{pausedLabel ?? s.pauseKeep}</option>
            {Object.entries(s.pauseOptions).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className={label}>
          {s.timezone}
          <select className="auth-input mt-2" value={v.timezone} onChange={(e) => setV({ ...v, timezone: e.target.value })}>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>
        <label className={label}>
          {s.language}
          <select className="auth-input mt-2" value={v.locale} onChange={(e) => setV({ ...v, locale: e.target.value as Value["locale"] })}>
            {Object.entries(s.languages).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>
      {status === "saved" ? <p role="status" className="success-banner">{s.saved}</p> : null}
      {status === "error" ? <p role="alert" className="text-sm font-semibold text-rose-700">{t.onboarding.errors.generic}</p> : null}
      <button type="submit" className="primary-button" disabled={pending}>{pending ? t.saving : t.save}</button>
    </form>
  );
}
