"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
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
  { id: "teal", name: "Turkuaz", swatch: "#0f766e", icon: ["#134e4a", "#ffffff", "#2dd4bf", "#5eead4"] },
  { id: "cyan", name: "Camgöbeği", swatch: "#0e7490", icon: ["#164e63", "#ffffff", "#22d3ee", "#67e8f9"] },
  { id: "indigo", name: "İndigo", swatch: "#4f46e5", icon: ["#312e81", "#ffffff", "#a5b4fc", "#c7d2fe"] },
  { id: "pink", name: "Pembe", swatch: "#be185d", icon: ["#500724", "#ffffff", "#f472b6", "#f9a8d4"] },
  { id: "amber", name: "Kehribar", swatch: "#a16207", icon: ["#422006", "#ffffff", "#fbbf24", "#fcd34d"] },
  { id: "slate", name: "Füme", swatch: "#475569", icon: ["#0f172a", "#ffffff", "#94a3b8", "#cbd5e1"] },
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

/**
 * Site colour picker in the top bar, next to the light/dark toggle: one small button showing the
 * current colour; a click opens a little menu of swatches. Picking one recolours the whole site,
 * the logo's accent wedges and the browser-tab icon, remembered on this device only. It used to
 * float on the left edge over the page; here it never covers content.
 */
export function PaletteSwitcher({ className = "" }: { className?: string }) {
  const [palette, setPalette] = useState<PaletteId>(DEFAULT);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("palette");
      if (PALETTES.some((p) => p.id === saved)) {
        setPalette(saved as PaletteId); // eslint-disable-line react-hooks/set-state-in-effect -- reading the device-only preference after hydration
        applyFavicon(saved as PaletteId);
      }
      localStorage.removeItem("palette-switcher"); // the old floating panel's show/hide setting
    } catch {}
    // Next.js re-inserts its static icon links after load and on navigation; keep them on the palette.
    const observer = new MutationObserver(() => applyFavicon(currentPalette));
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(id: PaletteId) {
    setPalette(id);
    applyPalette(id);
    try {
      if (id === DEFAULT) localStorage.removeItem("palette");
      else localStorage.setItem("palette", id);
    } catch {}
  }

  const current = PALETTES.find((p) => p.id === palette)!;
  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Site rengi: ${current.name}`}
        title="Site rengi"
        className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--accent-strong)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--accent-soft)]"
      >
        <span className="relative">
          <Palette size={18} aria-hidden="true" />
          <span
            className="absolute -bottom-0.5 -right-1 size-2.5 rounded-full ring-2 ring-[color:var(--surface)]"
            style={{ backgroundColor: current.swatch, boxShadow: current.id === "white" ? "inset 0 0 0 1px #a1a1aa" : undefined }}
            aria-hidden="true"
          />
        </span>
      </button>
      {open ? (
        <div
          role="group"
          aria-label="Site rengi"
          className="absolute right-0 top-full z-50 mt-2 w-max rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[var(--shadow-md)]"
        >
          <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-[color:var(--muted)]">Site rengi</p>
          <div className="grid grid-cols-7 gap-2">
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
