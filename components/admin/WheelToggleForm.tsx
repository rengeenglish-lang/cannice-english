"use client";

import { useState, useTransition } from "react";
import { updateWheelEnabledAction } from "@/app/actions/admin-settings";

export function WheelToggleForm({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="panel max-w-md space-y-4">
      <p className="text-sm">Çark popup’ı şu anda <strong>{enabled ? "açık" : "kapalı"}</strong>.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateWheelEnabledAction(!enabled);
            setEnabled(!enabled);
            setMessage(result.message ?? null);
          })
        }
        className="primary-button"
      >
        {pending ? "Kaydediliyor…" : enabled ? "Çarkı kapat" : "Çarkı aç"}
      </button>
      {message ? <p className="text-sm font-semibold text-[color:var(--success)]">{message}</p> : null}
    </div>
  );
}
