"use client";

import { useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";

/** US / UK pronunciation with the browser's own voices (free, nothing leaves the device). */
export function Pronounce({ text, compact = false }: { text: string; compact?: boolean }) {
  const supported = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => false,
  );
  if (!supported) return null;
  const say = (lang: "en-US" | "en-GB") => {
    const spoken = text.replace(/\b(sth|sb)\b/g, (m) => (m === "sth" ? "something" : "somebody"));
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = lang;
    u.rate = 0.9;
    const voice = speechSynthesis.getVoices().find((v) => v.lang === lang);
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  return (
    <span className="inline-flex gap-1 align-middle">
      {(["en-US", "en-GB"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => say(lang)}
          aria-label={`${text}: ${lang === "en-US" ? "Amerikan" : "İngiliz"} telaffuzu`}
          className={`inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-white font-bold text-[color:var(--accent)] hover:bg-[color:var(--brand-soft)] ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
        >
          <Volume2 size={compact ? 11 : 14} aria-hidden="true" />
          {lang === "en-US" ? "US" : "UK"}
        </button>
      ))}
    </span>
  );
}
