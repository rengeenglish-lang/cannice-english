"use client";
import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportAdviceAction } from "@/app/actions/coaching";

/** Button that runs a (bound) server action; optional confirmation and a short "done" message. */
export function ActionButton({
  action,
  label,
  pendingLabel,
  doneLabel,
  confirm,
  className = "secondary-button",
}: {
  action: () => Promise<unknown>;
  label: React.ReactNode;
  pendingLabel?: string;
  doneLabel?: string;
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={pending}
        aria-busy={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            await action();
            setDone(true);
          });
        }}
      >
        {pending && pendingLabel ? pendingLabel : label}
      </button>
      {done && doneLabel ? <span role="status" className="text-sm font-semibold text-emerald-700">{doneLabel}</span> : null}
    </>
  );
}

/** "Bu öneri yardımcı olmadı" — lets the student flag automated advice, with an optional note. */
export function ReportAdviceButton({ refId, label, placeholder, sendLabel, thanks }: { refId: string; label: string; placeholder: string; sendLabel: string; thanks: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  if (sent) return <p role="status" className="text-xs font-semibold text-[color:var(--muted)]">{thanks}</p>;
  if (!open) {
    return (
      <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--muted)] underline-offset-2 hover:underline" onClick={() => setOpen(true)}>
        <Flag size={12} aria-hidden="true" /> {label}
      </button>
    );
  }
  return (
    <form
      className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          await reportAdviceAction(refId, message);
          setSent(true);
        });
      }}
    >
      <label className="sr-only" htmlFor={`advice-${refId}`}>{placeholder}</label>
      <textarea id={`advice-${refId}`} rows={2} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={placeholder} className="auth-input flex-1 text-sm" />
      <button type="submit" className="secondary-button !min-h-10 !py-2 text-sm" disabled={pending}>{sendLabel}</button>
    </form>
  );
}
