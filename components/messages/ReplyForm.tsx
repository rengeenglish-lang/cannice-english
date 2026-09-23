"use client";

import { useActionState } from "react";
import { replyTeacherMessageAction, type MessageFormState } from "@/app/actions/live-lessons";

export function ReplyForm({ messageId }: { messageId: string }) {
  const [state, action, pending] = useActionState(replyTeacherMessageAction.bind(null, messageId), { status: "idle" } as MessageFormState);
  return (
    <form action={action} className="mt-3 space-y-2">
      <label className="sr-only" htmlFor={`reply-${messageId}`}>Yanıt</label>
      <textarea id={`reply-${messageId}`} name="reply" required rows={3} maxLength={4000} className="auth-input" placeholder="Öğrenciye yanıtınız…" />
      {state.status === "error" ? <p role="alert" className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? <p role="status" className="text-sm font-semibold text-emerald-700">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button text-xs">{pending ? "Gönderiliyor…" : "Yanıtla"}</button>
    </form>
  );
}
