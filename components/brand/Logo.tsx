/**
 * Netfener brand. "Fener" is Turkish for lighthouse: the mark is a lighthouse whose beam shows
 * the way to the student's goal. Same artwork as app/apple-icon.png; app/icon.svg is the
 * simplified favicon cut for 16–32 px.
 */

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nf-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f4a8f" />
          <stop offset="1" stopColor="#071b34" />
        </linearGradient>
        <linearGradient id="nf-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcc4d" />
          <stop offset="1" stopColor="#ffcc4d" stopOpacity="0.15" />
        </linearGradient>
        <clipPath id="nf-clip">
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath="url(#nf-clip)">
        <rect width="64" height="64" fill="url(#nf-bg)" />
        <path d="M30 16 L64 4 L64 36 L30 23 Z" fill="url(#nf-beam)" />
        <path d="M0 57 C9 52 17 52 26 57 C35 62 43 62 52 57 C56 55 60 54 64 55 L64 64 L0 64 Z" fill="#4162da" />
        <path d="M13 58 L17 26 L29 26 L33 58 Z" fill="#ffffff" />
        <path d="M15 42 L31 42 L31.8 48.5 L14.2 48.5 Z" fill="#4162da" />
        <rect x="16" y="15" width="14" height="10" rx="2" fill="#ffcc4d" />
        <path d="M14 16 L23 7 L32 16 Z" fill="#ffffff" />
        <rect x="14" y="24" width="18" height="3.5" rx="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** Mark + "Netfener" wordmark. `tone="dark"` is for navy backgrounds (sidebar, footer, auth panel). */
export function Logo({ size = 40, tone = "light", subtitle, className = "" }: { size?: number; tone?: "light" | "dark"; subtitle?: string; className?: string }) {
  const net = tone === "dark" ? "text-white" : "text-[color:var(--foreground)]";
  const fener = tone === "dark" ? "text-[#ffcc4d]" : "text-[color:var(--accent-strong)]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className={tone === "dark" ? "rounded-[23%] ring-1 ring-white/25" : ""} />
      <span className="leading-none">
        <span className={`whitespace-nowrap text-lg font-extrabold tracking-[-.01em] ${net}`}>
          Net<span className={fener}>fener</span>
        </span>
        {subtitle ? <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-widest text-blue-200">{subtitle}</span> : null}
      </span>
    </span>
  );
}
