/**
 * Netfener brand. "Fener" is Turkish for lighthouse: a white lighthouse on a green tile, its beams
 * shining both ways. Same artwork as app/apple-icon.png and public/netfener-logo.svg;
 * app/icon.svg is the simplified favicon cut for 16–32 px.
 */

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nf-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdeedb" />
        </linearGradient>
        <linearGradient id="nf-ray-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="nf-ray-l" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
        </linearGradient>
        <clipPath id="nf-tower">
          <path d="M26.5 27 L37.5 27 L41 55 L23 55 Z" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="15" fill="#0b6b3a" />
      <path d="M37 17.5 L60 10 L60 27 L37 21.5 Z" fill="url(#nf-ray-r)" />
      <path d="M27 17.5 L4 10 L4 27 L27 21.5 Z" fill="url(#nf-ray-l)" />
      <circle cx="32" cy="7.2" r="1.6" fill="url(#nf-light)" />
      <path d="M25.5 14.5 Q32 5.5 38.5 14.5 Z" fill="url(#nf-light)" />
      <rect x="26.5" y="14.5" width="11" height="8.5" rx="1" fill="url(#nf-light)" />
      <rect x="29" y="16.5" width="6" height="4.5" rx="0.6" fill="#a7f0c2" />
      <rect x="24" y="23" width="16" height="3" rx="1" fill="url(#nf-light)" />
      <g clipPath="url(#nf-tower)">
        <rect x="20" y="26" width="24" height="30" fill="url(#nf-light)" />
        <path d="M20 36 L44 30 L44 34.5 L20 40.5 Z M20 46 L44 40 L44 44.5 L20 50.5 Z" fill="#0b6b3a" />
      </g>
      <path d="M30 55 L30 50.5 Q32 48.5 34 50.5 L34 55 Z" fill="#0b6b3a" />
      <rect x="17" y="55" width="30" height="3.2" rx="1.2" fill="url(#nf-light)" />
    </svg>
  );
}

/**
 * Mark + "Netfener" wordmark. `tone="dark"` is for the always-green sections (sidebar, footer, auth
 * panel) and uses white; on light backgrounds the brand green keeps the name readable, switching to
 * light mint automatically in dark mode.
 */
export function Logo({ size = 40, tone = "light", subtitle, className = "" }: { size?: number; tone?: "light" | "dark"; subtitle?: string; className?: string }) {
  const wordmark = tone === "dark" ? "text-white" : "text-[#0b6b3a] dark:text-[#a7f0c2]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className={tone === "dark" ? "rounded-[23%] ring-1 ring-white/15" : ""} />
      <span className="leading-none">
        <span className={`whitespace-nowrap text-xl font-bold tracking-[-.01em] ${wordmark}`}>Netfener</span>
        {subtitle ? <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-widest text-blue-200">{subtitle}</span> : null}
      </span>
    </span>
  );
}
