/**
 * Netfener brand: a folded-ribbon "N". The light ribbon parts take the ink colour (dark text on
 * light pages, white on the always-dark sections and in dark mode); the two accent wedges follow the
 * colour switcher through --accent (and --gold on dark sections). public/netfener-logo.svg, app/icon.svg and the
 * PNG app icons are the same artwork on the default green tile.
 */

/** Shared N geometry in a 100×100 box: the ribbon (diagonal + the two ink stems) and the accent wedges. */
export const LOGO_N = {
  diagonal: "10,10 36,10 90,86 64,86",
  leftStem: "10,72 34,62 34,96 10,96",
  rightStem: "66,38 90,28 90,80.4 66,46.6",
  leftWedge: "10,15.6 34,49.4 34,56 10,66",
  rightWedge: "66,4 90,4 90,22 66,32",
};

export function LogoMark({ size = 40, tone = "light", className = "" }: { size?: number; tone?: "light" | "dark"; className?: string }) {
  const ink = tone === "dark" ? "#ffffff" : "var(--foreground)";
  // On the dark brand sections the light tint of the palette (--gold) keeps the wedges visible.
  const wedgeA = tone === "dark" ? "var(--gold)" : "var(--accent)";
  const wedgeB = tone === "dark" ? "color-mix(in srgb, var(--gold) 60%, #ffffff)" : "color-mix(in srgb, var(--accent) 80%, #ffffff)";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <g strokeLinejoin="round" strokeWidth="2">
        <polygon points={LOGO_N.leftWedge} style={{ fill: wedgeA, stroke: wedgeA }} />
        <polygon points={LOGO_N.rightWedge} style={{ fill: wedgeB, stroke: wedgeB }} />
        <polygon points={LOGO_N.leftStem} style={{ fill: ink, stroke: ink }} />
        <polygon points={LOGO_N.rightStem} style={{ fill: ink, stroke: ink, opacity: 0.82 }} />
        <polygon points={LOGO_N.diagonal} style={{ fill: ink, stroke: ink }} />
      </g>
    </svg>
  );
}

/**
 * Mark + "Netfener" wordmark. `tone="dark"` is for the always-dark brand sections (sidebar, footer,
 * auth panel) and draws in white; on light pages it uses the text colour, which turns light in dark mode.
 */
export function Logo({ size = 40, tone = "light", subtitle, className = "" }: { size?: number; tone?: "light" | "dark"; subtitle?: string; className?: string }) {
  const wordmark = tone === "dark" ? "text-white" : "text-[color:var(--foreground)]";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} tone={tone} />
      <span className="leading-none">
        <span className={`whitespace-nowrap text-xl font-extrabold tracking-[-.02em] ${wordmark}`}>Netfener</span>
        {subtitle ? <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-widest text-blue-200">{subtitle}</span> : null}
      </span>
    </span>
  );
}
