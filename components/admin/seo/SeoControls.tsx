"use client";
import { useActionState } from "react";
import {
  pauseSeoAction,
  refreshSeoInventoryAction,
  type SeoActionState,
} from "@/app/actions/admin-seo";
const initial: SeoActionState = { status: "idle" };
export function SeoControls({ kind }: { kind: "refresh" | "pause" }) {
  const [state, action, pending] = useActionState(
    kind === "refresh" ? refreshSeoInventoryAction : pauseSeoAction,
    initial,
  );
  return (
    <form action={action} className="space-y-2">
      <button
        className={
          kind === "refresh"
            ? "primary-button"
            : "ghost-button border border-[color:var(--border)]"
        }
        disabled={pending}
      >
        {pending
          ? "İşleniyor…"
          : kind === "refresh"
            ? "İçerik envanterini tara"
            : "Autopilot'u duraklat"}
      </button>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="max-w-lg text-sm"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
