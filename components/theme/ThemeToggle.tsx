"use client";
import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";

type Choice = "light" | "dark" | "system";
const LABEL: Record<Choice, string> = { light: "Açık tema", dark: "Koyu (gece) tema", system: "Cihaz ayarı" };
const NEXT: Record<Choice, Choice> = { light: "dark", dark: "system", system: "light" };

function apply(choice: Choice) {
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Cycles Açık → Koyu → Cihaz ayarı. The choice is remembered on this device only. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    let saved: Choice = "system";
    try {
      const v = localStorage.getItem("theme");
      if (v === "light" || v === "dark") saved = v;
    } catch {}
    setChoice(saved); // eslint-disable-line react-hooks/set-state-in-effect -- reading the device-only preference after hydration
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let current: string | null = null;
      try { current = localStorage.getItem("theme"); } catch {}
      if (current !== "light" && current !== "dark") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const current = choice ?? "system";
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : SunMoon;
  const next = NEXT[current];
  return (
    <button
      type="button"
      className={`ghost-button !min-h-10 !px-2.5 ${className}`}
      aria-label={`Tema: ${LABEL[current]}. Değiştir: ${LABEL[next]}`}
      title={`Tema: ${LABEL[current]}`}
      onClick={() => {
        setChoice(next);
        try {
          if (next === "system") localStorage.removeItem("theme");
          else localStorage.setItem("theme", next);
        } catch {}
        apply(next);
      }}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}
