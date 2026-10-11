"use client";
import { useState, useTransition } from "react";
import { Lightbulb } from "lucide-react";
import { suggestCoachingAction } from "@/app/actions/coaching";

/** "Koçluk için önerin var mı?" — goes to Yönetim → Gelen Koçluk Önerileri. */
export function SuggestionForm({ copy }: { copy: { title: string; help: string; placeholder: string; thanks: string; limit: string; send: string } }) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "limit">("idle");
  const [pending, start] = useTransition();
  if (state === "sent") return <p role="status" className="dashboard-panel text-sm font-semibold text-emerald-800">{copy.thanks}</p>;
  return (
    <form
      className="dashboard-panel space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await suggestCoachingAction(message);
          if (res.ok) setState("sent");
          else if (res.reason === "LIMIT") setState("limit");
        });
      }}
    >
      <label htmlFor="coaching-suggestion" className="flex items-center gap-2 text-sm font-bold"><Lightbulb size={16} className="text-[color:var(--accent)]" aria-hidden="true" /> {copy.title}</label>
      <p className="text-xs text-[color:var(--muted)]">{copy.help}</p>
      <textarea id="coaching-suggestion" rows={3} minLength={3} maxLength={2000} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder={copy.placeholder} className="auth-input text-sm" />
      {state === "limit" ? <p role="alert" className="text-xs font-semibold text-amber-800">{copy.limit}</p> : null}
      <button type="submit" className="secondary-button !min-h-10 !py-2 text-sm" disabled={pending || message.trim().length < 3}>{copy.send}</button>
    </form>
  );
}
