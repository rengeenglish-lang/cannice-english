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

function Toggle({ mode, enabled, revision, disabled, on, off }: { mode: string; enabled: boolean; revision: number; disabled: boolean; on: string; off: string }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="revision" value={revision} />
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <button disabled={pending || disabled} className="ghost-button border border-[color:var(--border)]">
        {pending ? "İşleniyor…" : enabled ? off : on}
      </button>
      <Msg s={state} />
    </form>
  );
}
export const AutoGenerateToggle = (p: { enabled: boolean; revision: number; disabled: boolean }) => (
  <Toggle {...p} mode="autogenerate" on="Otomatik makale üretimini aç" off="Otomatik makale üretimini kapat" />
);
export const AutoPublishToggle = (p: { enabled: boolean; revision: number; disabled: boolean }) => (
  <Toggle {...p} mode="autopublish" on="Puanı geçen yazıları otomatik yayınla" off="Otomatik yayını kapat" />
);
export function RunNowButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="mode" value="runnow" />
      <input type="hidden" name="revision" value="0" />
      <button disabled={pending || disabled} className="primary-button">
        {pending ? "Çalışıyor… (yaklaşık 1 dakika sürebilir)" : "Şimdi bir iş çalıştır"}
      </button>
      <Msg s={state} />
    </form>
  );
}
export function QueueGenerationButton({ keywordId }: { keywordId: string }) {
  const [state, action, pending] = useActionState(automationAction, initial);
  return (
    <form action={action} className="space-y-1">
      <input type="hidden" name="mode" value="generate" />
      <input type="hidden" name="keywordId" value={keywordId} />
      <input type="hidden" name="revision" value="0" />
      <button disabled={pending} className="ghost-button border border-[color:var(--border)]">
        {pending ? "Sıraya alınıyor…" : "Claude ile yazdır (sıraya al)"}
      </button>
      <Msg s={state} />
    </form>
  );
}
