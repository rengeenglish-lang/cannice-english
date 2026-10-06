"use client";
import { useActionState } from "react";
import { type AutomationActionState, automationAction } from "@/app/actions/admin-seo-automation";
const initial: AutomationActionState = { ok: false, message: "" };

function Msg({ s }: { s: AutomationActionState }) {
  return s.message ? <p role={s.ok ? "status" : "alert"} className="max-w-lg text-sm">{s.message}</p> : null;
}
/** Header control. Always visible so an emergency stop is one click from any SEO page. */
export function EmergencyStopButton({ stopped, revision }: { stopped: boolean; revision: number }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="mode" value={stopped ? "resume" : "stop"} />
      <input type="hidden" name="revision" value={revision} />
      <button disabled={pending} className={stopped ? "primary-button" : "ghost-button border border-[color:var(--danger)] text-[color:var(--danger)]"}>
        {pending ? "İşleniyor…" : stopped ? "Otomasyonu devam ettir" : "Acil durdur"}
      </button>
      <Msg s={state} />
    </form>
  );
}
export function AutoSyncToggle({ enabled, revision, disabled }: { enabled: boolean; revision: number; disabled: boolean }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="mode" value="autosync" />
      <input type="hidden" name="revision" value={revision} />
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <button disabled={pending || disabled} className="ghost-button border border-[color:var(--border)]">
        {pending ? "İşleniyor…" : enabled ? "Otomatik veri eşitlemeyi kapat" : "Otomatik veri eşitlemeyi aç"}
      </button>
      <Msg s={state} />
    </form>
  );
}
export function JobButton({ jobId, mode, label }: { jobId: string; mode: "retry" | "cancel"; label: string }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="revision" value="0" />
      <button disabled={pending} className="ghost-button text-sm">{pending ? "…" : label}</button>
      <Msg s={state} />
    </form>
  );
}
