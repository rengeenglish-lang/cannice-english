"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies a ready-made Claude prompt to the clipboard. */
export function CopyPromptButton({ text, label = "Prompt'u kopyala", primary = false }: { text: string; label?: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${primary ? "primary-button" : "secondary-button"} !min-h-10 !py-2 text-sm`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Kopyalandı" : label}</span>
    </button>
  );
}
