"use client";
import { useActionState, useState } from "react";
import { SeoForm } from "./SeoForm";
import {
  type PublishingState,
  publishingAction,
} from "@/app/actions/admin-seo-publishing";
const initial: PublishingState = { ok: false, message: "" };
const field =
  "mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 focus-ring";
function body(mode: string, input: unknown) {
  const f = new FormData();
  f.set("mode", mode);
  f.set("payload", JSON.stringify(input));
  return f;
}
type Base = { id: string; revision: number };

/** One small form per transition keeps each state change an explicit, separately confirmed action. */
export function PublishingStepForm({
  id,
  revision,
  mode,
  label,
  confirmLabel,
  extra,
  disabled,
  tone = "primary-button",
}: Base & {
  mode: "approve" | "revoke" | "cancel" | "publish" | "unpublish";
  label: string;
  confirmLabel?: string;
  extra?: Record<string, unknown>;
  disabled?: boolean;
  tone?: string;
}) {
  const [state, action, pending] = useActionState(publishingAction, initial);
  return (
    <SeoForm
      pending={pending}
      key={revision}
      className="space-y-3"
      onSave={(f) =>
        action(
          body(mode, {
            id,
            revision,
            ...extra,
            ...(confirmLabel ? { confirmed: f.get("confirmed") === "on" } : {}),
          }),
        )
      }
    >
      {confirmLabel ? (
        <label className="flex items-start gap-2">
          <input type="checkbox" name="confirmed" required className="mt-1" />
          {confirmLabel}
        </label>
      ) : null}
      <button className={tone} disabled={pending || disabled}>
        {pending ? "İşleniyor…" : label}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}

export function ScheduleForm({
  id,
  revision,
  current,
}: Base & { current: string | null }) {
  const [state, action, pending] = useActionState(publishingAction, initial);
  const [local, setLocal] = useState("");
  return (
    <SeoForm
      pending={pending}
      key={revision}
      className="space-y-3"
      onSave={() => {
        const when = new Date(local);
        if (Number.isNaN(when.getTime())) return;
        action(body("schedule", { id, revision, scheduledFor: when.toISOString() }));
      }}
    >
      <label className="block">
        Yayın zamanı (tarayıcınızın saat dilimi)
        <input
          type="datetime-local"
          required
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className={field}
          aria-label="Yayın zamanı"
        />
      </label>
      <button className="primary-button" disabled={pending || !local}>
        {pending ? "Planlanıyor…" : current ? "Zamanı değiştir" : "Yayını zamanla"}
      </button>
      <p role="status">{state.message}</p>
    </SeoForm>
  );
}

export function RestoreVersionForm({
  id,
  revision,
  postUpdatedAt,
  versionId,
  version,
}: Base & { postUpdatedAt: string; versionId: string; version: number }) {
  const [state, action, pending] = useActionState(publishingAction, initial);
  return (
    <SeoForm
      pending={pending}
      key={revision}
      className="inline-flex items-center gap-3"
      onSave={() => action(body("restore", { id, revision, postUpdatedAt, versionId }))}
    >
      <button className="ghost-button" disabled={pending} aria-label={`Sürüm ${version} geri yükle`}>
        {pending ? "Yükleniyor…" : "Geri yükle"}
      </button>
      <span role="status">{state.message}</span>
    </SeoForm>
  );
}
