"use client";
import { useState, useTransition } from "react";
import { Printer } from "lucide-react";
import { coachingCopy } from "@/lib/coaching/i18n";
import { saveReportSurveyAction } from "@/app/actions/coaching";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="secondary-button no-print" onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" /> {label}
    </button>
  );
}

type YesNo = boolean | null;

export function ReportSurvey({ locale, reportId, answered }: { locale: string; reportId: string; answered: boolean }) {
  const t = coachingCopy(locale);
  const r = t.reports;
  const [useful, setUseful] = useState<YesNo>(null);
  const [realistic, setRealistic] = useState<YesNo>(null);
  const [freq, setFreq] = useState<"TOO_MANY" | "OK" | "TOO_FEW" | null>(null);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(answered);
  const [pending, start] = useTransition();
  if (done) return <p role="status" className="success-banner">{r.surveyThanks}</p>;
  const chip = (on: boolean) => `min-h-10 rounded-xl border px-3 py-1.5 text-sm font-bold ${on ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-strong)] bg-white text-slate-700"}`;
  const yesNo = (value: YesNo, set: (v: YesNo) => void) => (
    <div className="mt-2 flex gap-2">
      <button type="button" aria-pressed={value === true} className={chip(value === true)} onClick={() => set(true)}>{t.yes}</button>
      <button type="button" aria-pressed={value === false} className={chip(value === false)} onClick={() => set(false)}>{t.no}</button>
    </div>
  );
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveReportSurveyAction({ reportId, useful, workloadRealistic: realistic, reminderFrequency: freq, message: message || undefined });
          if (res.ok) setDone(true);
        });
      }}
    >
      <fieldset><legend className="text-sm font-bold">{r.useful}</legend>{yesNo(useful, setUseful)}</fieldset>
      <fieldset><legend className="text-sm font-bold">{r.realistic}</legend>{yesNo(realistic, setRealistic)}</fieldset>
      <fieldset>
        <legend className="text-sm font-bold">{r.reminders}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.entries(r.reminderOptions) as ["TOO_MANY" | "OK" | "TOO_FEW", string][]).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={freq === k} className={chip(freq === k)} onClick={() => setFreq(k)}>{label}</button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-bold">{r.comment}<textarea rows={2} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} className="auth-input mt-2" /></label>
      <button type="submit" className="primary-button" disabled={pending || (useful === null && realistic === null && freq === null && !message)}>{t.send}</button>
    </form>
  );
}
