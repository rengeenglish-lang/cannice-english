"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, Palette } from "lucide-react";
import { LOGO_N } from "@/components/brand/Logo";

/**
 * Keep in sync with scripts/generate-palettes.py (the data-palette blocks in app/globals.css) and
 * THEME_SCRIPT in app/layout.tsx. `icon` is the favicon for the palette: tile, ribbon ink, and the
 * two accent wedges.
 */
export const PALETTES = [
  { id: "green", name: "Yeşil", swatch: "#138a43", icon: ["#0b4d2c", "#ffffff", "#34c46e", "#67d392"] },
  { id: "blue", name: "Mavi", swatch: "#2563c9", icon: ["#0f2f63", "#ffffff", "#4b8ef0", "#79abf5"] },
  { id: "purple", name: "Mor", swatch: "#7042d1", icon: ["#2f1766", "#ffffff", "#9a73ef", "#b597f5"] },
  { id: "orange", name: "Turuncu", swatch: "#c24e0c", icon: ["#5c2405", "#ffffff", "#f08a3e", "#f5a66c"] },
  { id: "red", name: "Kırmızı", swatch: "#c1272d", icon: ["#5a0f17", "#ffffff", "#ef5b63", "#f4868c"] },
  { id: "white", name: "Beyaz", swatch: "#ffffff", icon: ["#ffffff", "#18181b", "#71717a", "#a1a1aa"] },
  { id: "black", name: "Siyah", swatch: "#111111", icon: ["#0a0a0a", "#ffffff", "#a1a1aa", "#d4d4d8"] },
] as const;
type PaletteId = (typeof PALETTES)[number]["id"];
const DEFAULT: PaletteId = "green";

/** The N on its palette tile, as an SVG data URL (same artwork as app/icon.svg). */
function faviconUrl(id: PaletteId) {
  const [tile, ink, a, b] = PALETTES.find((p) => p.id === id)!.icon;
  const poly = (points: string, fill: string, extra = "") => `<polygon points="${points}" fill="${fill}" stroke="${fill}"${extra}/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect x="1" y="1" width="98" height="98" rx="22" fill="${tile}"${tile === "#ffffff" ? ` stroke="#d4d4d8" stroke-width="2"` : ""}/>` +
    `<g stroke-linejoin="round" stroke-width="2" transform="translate(14 13) scale(0.72)">` +
    poly(LOGO_N.leftWedge, a) + poly(LOGO_N.rightWedge, b) + poly(LOGO_N.leftStem, ink) +
    poly(LOGO_N.rightStem, ink, ` opacity="0.82"`) + poly(LOGO_N.diagonal, ink) +
    `</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

let currentPalette: PaletteId = "green";

/** Points every browser-tab icon link at the palette's favicon (the default green uses the static files). */
function applyFavicon(id: PaletteId) {
  currentPalette = id;
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')) {
    if (link.dataset.palette === id) continue;
    link.dataset.palette = id;
    if (!link.dataset.staticHref) {
      link.dataset.staticHref = link.href;
      link.dataset.staticType = link.type;
    }
    if (id === DEFAULT) {
      link.href = link.dataset.staticHref;
      link.type = link.dataset.staticType ?? "";
    } else {
      link.href = faviconUrl(id);
      link.type = "image/svg+xml";
    }
  }
}

function applyPalette(id: PaletteId) {
  if (id === DEFAULT) delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = id;
  applyFavicon(id);
}

/** Timed exam screens stay distraction-free, as with the live chat bubble. */
function hiddenOn(pathname: string) {
  return pathname.startsWith("/dashboard/sinav");
}

/**
 * Floating colour switcher on the left edge. Picking a swatch recolours the whole site, the logo's
 * accent wedges and the browser-tab icon; the arrow tucks it away into a small tab (the default on phones). Both
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
      if (PALETTES.some((p) => p.id === saved)) {
        setPalette(saved as PaletteId); // eslint-disable-line react-hooks/set-state-in-effect -- reading the device-only preference after hydration
        applyFavicon(saved as PaletteId);
      }
    } catch {}
    // Open by default on wider screens; on phones it starts tucked away so it never covers the page.
    let shown: string | null = null;
    try { shown = localStorage.getItem("palette-switcher"); } catch {}
    setOpen(shown ? shown === "shown" : matchMedia("(min-width: 640px)").matches);
    setReady(true);
    // Next.js re-inserts its static icon links after load and on navigation; keep them on the palette.
    const observer = new MutationObserver(() => applyFavicon(currentPalette));
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
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
            style={{ backgroundColor: p.swatch, border: p.id === "white" ? "1.5px solid #a1a1aa" : undefined }}
          >
            {active ? <Check size={14} strokeWidth={3} className={p.id === "white" ? "text-zinc-900" : "text-white"} aria-hidden="true" /> : null}
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
