"""Regenerates the colour-switcher palette blocks at the end of app/globals.css, in place.

Usage: python3 scripts/generate-palettes.py app/globals.css

Hand-picked brand/accent/night colours per palette; the quiet neutrals (page, borders, muted text)
are the green palette's neutrals (the :root tokens) rotated to the palette's hue, or turned grey for
the monochrome palettes (Beyaz, Siyah). Keep the palette
ids in sync with components/theme/PaletteSwitcher.tsx and the pre-paint script in app/layout.tsx."""
import colorsys, re, sys
css = open(sys.argv[1]).read()
def block(sel):
    i = css.index(sel + " {"); j = css.index("}", i)
    return dict(re.findall(r"--([a-z0-9-]+): (#[0-9a-f]{6});", css[i:j]))
L, D = block(":root"), block(':root[data-theme="dark"]')
def hx(h): h = h.lstrip("#"); return [int(h[k:k+2], 16) / 255 for k in (0, 2, 4)]
def rgb(h): return " ".join(str(round(c * 255)) for c in hx(h))
BASE_HUE = colorsys.rgb_to_hls(*hx(L["brand"]))[0]
def rot(h, hue):
    """Move a green-palette colour to `hue`; hue=None makes it the same lightness in grey."""
    hh, ll, ss = colorsys.rgb_to_hls(*hx(h))
    r = colorsys.hls_to_rgb(0, ll, 0) if hue is None else colorsys.hls_to_rgb((hh - BASE_HUE + hue) % 1, ll, ss)
    return "#" + "".join(f"{round(c * 255):02x}" for c in r)
P = {
  "blue":   dict(name="Mavi",    l=dict(brand="#1d5fbf", **{"brand-strong": "#154a96", "accent": "#2563c9", "accent-strong": "#1d4f9f", "night": "#0f2f63", "night-2": "#174394", "gold": "#a9cdfb"}), d=dict(accent="#4b8ef0", **{"accent-strong": "#79abf5", "brand-ink": "#a9cdfb"})),
  "purple": dict(name="Mor",     l=dict(brand="#6a3dc2", **{"brand-strong": "#52309a", "accent": "#7042d1", "accent-strong": "#5631a8", "night": "#2f1766", "night-2": "#46228f", "gold": "#d4c2fb"}), d=dict(accent="#9a73ef", **{"accent-strong": "#b597f5", "brand-ink": "#d4c2fb"})),
  "orange": dict(name="Turuncu", l=dict(brand="#b8480c", **{"brand-strong": "#933806", "accent": "#c24e0c", "accent-strong": "#933806", "night": "#5c2405", "night-2": "#853508", "gold": "#ffcfa6"}), d=dict(accent="#f08a3e", **{"accent-strong": "#f5a66c", "brand-ink": "#ffcfa6"})),
  "red":    dict(name="Kırmızı", l=dict(brand="#b4232f", **{"brand-strong": "#8e1a24", "accent": "#c1272d", "accent-strong": "#8e1a24", "night": "#5a0f17", "night-2": "#84161f", "gold": "#ffc2c6"}), d=dict(accent="#ef5b63", **{"accent-strong": "#f4868c", "brand-ink": "#ffc2c6"})),
  "teal": dict(name="Turkuaz", l=dict(brand="#0f766e", **{"brand-strong": "#115e59", "accent": "#0f766e", "accent-strong": "#115e59", "night": "#134e4a", "night-2": "#176963", "gold": "#5eead4"}), d=dict(accent="#2dd4bf", **{"accent-strong": "#5eead4", "brand-ink": "#5eead4"})),
  "cyan": dict(name="Camgöbeği", l=dict(brand="#0e7490", **{"brand-strong": "#155e75", "accent": "#0e7490", "accent-strong": "#155e75", "night": "#164e63", "night-2": "#155e75", "gold": "#a5f3fc"}), d=dict(accent="#22d3ee", **{"accent-strong": "#67e8f9", "brand-ink": "#a5f3fc"})),
  "indigo": dict(name="İndigo", l=dict(brand="#4f46e5", **{"brand-strong": "#4338ca", "accent": "#4f46e5", "accent-strong": "#4338ca", "night": "#312e81", "night-2": "#3730a3", "gold": "#c7d2fe"}), d=dict(accent="#a5b4fc", **{"accent-strong": "#c7d2fe", "brand-ink": "#c7d2fe"})),
  "pink": dict(name="Pembe", l=dict(brand="#be185d", **{"brand-strong": "#9d174d", "accent": "#be185d", "accent-strong": "#9d174d", "night": "#500724", "night-2": "#831843", "gold": "#fbcfe8"}), d=dict(accent="#f472b6", **{"accent-strong": "#f9a8d4", "brand-ink": "#fbcfe8"})),
  "amber": dict(name="Kehribar", l=dict(brand="#a16207", **{"brand-strong": "#854d0e", "accent": "#a16207", "accent-strong": "#854d0e", "night": "#422006", "night-2": "#713f12", "gold": "#fde68a"}), d=dict(accent="#fbbf24", **{"accent-strong": "#fcd34d", "brand-ink": "#fde68a"})),
  "slate": dict(name="Füme", l=dict(brand="#475569", **{"brand-strong": "#334155", "accent": "#475569", "accent-strong": "#334155", "night": "#0f172a", "night-2": "#1e293b", "gold": "#cbd5e1"}), d=dict(accent="#94a3b8", **{"accent-strong": "#cbd5e1", "brand-ink": "#cbd5e1"})),
  # Monochrome. Beyaz turns the always-dark sections white (their text is switched to dark by the
  # data-palette="white" rules in globals.css); Siyah keeps them black. Both use black buttons.
  "white":  dict(name="Beyaz", mono=True,
                 l=dict(brand="#18181b", background="#ffffff", canvas="#f4f4f5", **{"brand-strong": "#09090b", "accent": "#27272a", "accent-strong": "#09090b", "night": "#ffffff", "night-2": "#f4f4f5", "gold": "#52525b", "gold-soft": "#e4e4e7"}),
                 d=dict(accent="#e4e4e7", gold="#d4d4d8", **{"accent-strong": "#ffffff", "brand-ink": "#e4e4e7", "on-accent": "#09090b", "gold-soft": "#e4e4e7"})),
  "black":  dict(name="Siyah", mono=True,
                 l=dict(brand="#111111", background="#ffffff", canvas="#f4f4f5", **{"brand-strong": "#000000", "accent": "#18181b", "accent-strong": "#000000", "night": "#0a0a0a", "night-2": "#262626", "gold": "#d4d4d8", "gold-soft": "#e5e5e5"}),
                 d=dict(accent="#f4f4f5", background="#000000", canvas="#050505", surface="#0f0f0f", border="#262626", night="#000000", gold="#d4d4d8",
                        **{"accent-strong": "#ffffff", "brand-ink": "#f4f4f5", "on-accent": "#000000", "surface-raised": "#171717", "border-strong": "#3f3f46", "night-2": "#171717", "gold-soft": "#e5e5e5"})),
}
ROT_L = ["background", "foreground", "brand-soft", "accent-soft", "muted", "canvas", "border", "border-strong", "gold-soft"]
ROT_D = ["background", "foreground", "brand", "brand-strong", "brand-soft", "accent-soft", "on-accent", "muted", "canvas", "surface", "surface-raised", "border", "border-strong", "night", "night-2"]
out = ["/* ------------------------------------------------------------------------------------------",
       " * Colour switcher palettes (data-palette on <html>, set by components/theme/PaletteSwitcher).",
       " * Green is the default (the :root tokens above). Generated by scripts/generate-palettes.py;",
       " * edit the colours there and re-run it rather than editing these blocks by hand.",
       " * ---------------------------------------------------------------------------------------- */"]
for key, p in P.items():
    hue = None if p.get("mono") else colorsys.rgb_to_hls(*hx(p["l"]["brand"]))[0]
    l = {k: rot(L[k], hue) for k in ROT_L} | p["l"]
    l["brand-ink"] = l["brand"]
    l["accent-rgb"], l["glow-rgb"], l["shadow-rgb"] = rgb(l["accent"]), rgb(p["d"]["accent"]), rgb(rot("#0c2e1e", hue))
    d = {k: rot(D[k], hue) for k in ROT_D} | p["d"]
    d["accent-rgb"] = d["glow-rgb"] = rgb(d["accent"])
    d.setdefault("gold", l["gold"]); d.setdefault("gold-soft", l["gold-soft"])
    for sel, t in ((f':root[data-palette="{key}"]:not([data-theme="dark"])', l), (f':root[data-palette="{key}"][data-theme="dark"]', d)):
        out.append(f"{sel} {{\n" + "".join(f"  --{k}: {v};\n" for k, v in t.items()) + "}")
MARK = "/* ------------------------------------------------------------------------------------------\n * Colour switcher palettes"
head = css[: css.index(MARK)] if MARK in css else css.rstrip("\n") + "\n\n"
# Other component styles may follow the generated palettes. Preserve them on regeneration.
palette_blocks = list(re.finditer(r':root\[data-palette="[a-z]+"\][^{]*\{[^}]*\}', css[css.index(MARK):])) if MARK in css else []
tail = css[css.index(MARK) + palette_blocks[-1].end():] if palette_blocks else "\n"
open(sys.argv[1], "w").write(head + "\n".join(out) + tail)
