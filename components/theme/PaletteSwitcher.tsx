"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, Palette } from "lucide-react";

/** Keep in sync with the data-palette blocks at the end of app/globals.css and PALETTE_SCRIPT in app/layout.tsx. */
export const PALETTES = [
  { id: "green", name: "Yeşil", swatch: "#138a43" },
  { id: "blue", name: "Mavi", swatch: "#2563c9" },
  { id: "purple", name: "Mor", swatch: "#7042d1" },
  { id: "orange", name: "Turuncu", swatch: "#c24e0c" },
  { id: "red", name: "Kırmızı", swatch: "#c1272d" },
] as const;
type PaletteId = (typeof PALETTES)[number]["id"];
const DEFAULT: PaletteId = "green";

function applyPalette(id: PaletteId) {
  if (id === DEFAULT) delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = id;
}

/** Timed exam screens stay distraction-free, as with the live chat bubble. */
function hiddenOn(pathname: string) {
  return pathname.startsWith("/dashboard/sinav");
}

/**
 * Floating colour switcher on the left edge. Picking a swatch recolours the whole site (and the
 * logo's accent wedges); the arrow tucks it away into a small tab (the default on phones). Both
 * choices are remembered on this device only.
 */
export function PaletteSwitcher() {
  const pathname = usePathname();
  const [palette, setPalette] = useState<PaletteId>(DEFAULT);
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("palette");
      if (PALETTES.some((p) => p.id === saved)) setPalette(saved as PaletteId); // eslint-disable-line react-hooks/set-state-in-effect -- reading the device-only preference after hydration
    } catch {}
    // Open by default on wider screens; on phones it starts tucked away so it never covers the page.
    let shown: string | null = null;
    try { shown = localStorage.getItem("palette-switcher"); } catch {}
    setOpen(shown ? shown === "shown" : matchMedia("(min-width: 640px)").matches);
    setReady(true);
  }, []);

  if (!ready || hiddenOn(pathname)) return null;

  function choose(id: PaletteId) {
    setPalette(id);
    applyPalette(id);
    try {
      if (id === DEFAULT) localStorage.removeItem("palette");
      else localStorage.setItem("palette", id);
    } catch {}
  }

  function toggle(next: boolean) {
    setOpen(next);
    try {
      localStorage.setItem("palette-switcher", next ? "shown" : "hidden");
    } catch {}
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        aria-label="Renk seçiciyi göster"
        title="Site rengi"
        className="fixed left-0 top-1/2 z-40 flex h-11 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--accent-strong)] shadow-[var(--shadow-md)] transition hover:w-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--accent-soft)]"
      >
        <Palette size={17} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Site rengi"
      className="fixed left-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5 shadow-[var(--shadow-md)] sm:left-3"
    >
      <span className="flex size-7 items-center justify-center text-[color:var(--accent-strong)]" title="Site rengi">
        <Palette size={16} aria-hidden="true" />
      </span>
      {PALETTES.map((p) => {
        const active = p.id === palette;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => choose(p.id)}
            aria-label={`Renk: ${p.name}`}
            aria-pressed={active}
            title={p.name}
            className={`flex size-7 items-center justify-center rounded-full transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--accent-soft)] ${active ? "ring-2 ring-[color:var(--foreground)] ring-offset-2 ring-offset-[color:var(--surface)]" : ""}`}
            style={{ backgroundColor: p.swatch }}
          >
            {active ? <Check size={14} strokeWidth={3} className="text-white" aria-hidden="true" /> : null}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => toggle(false)}
        aria-label="Renk seçiciyi gizle"
        title="Gizle"
        className="flex size-7 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--foreground)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--accent-soft)]"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
