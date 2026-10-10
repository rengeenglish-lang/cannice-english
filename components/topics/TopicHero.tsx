function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="hidden h-24 w-auto shrink-0 sm:block"
      aria-hidden
    >
      <rect x="18" y="70" width="90" height="14" rx="4" fill="var(--accent)" />
      <rect x="26" y="52" width="90" height="14" rx="4" fill="var(--brand)" />
      <rect x="34" y="34" width="90" height="14" rx="4" fill="var(--success)" />
      <path d="M108 30 L118 14 L128 30 Z" fill="var(--brand)" />
      <circle cx="140" cy="20" r="8" fill="var(--border)" />
    </svg>
  );
}

export function TopicHero({
  index,
  breadcrumb,
  name,
  description,
}: {
  index: number;
  breadcrumb: string[];
  name: string;
  description: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--accent-soft)] via-[color:var(--brand-soft)] to-white p-6 shadow-[0_1px_2px_rgba(15,23,42,.04),0_10px_24px_rgba(15,23,42,.06)] sm:p-8">
      <div
        className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[color:var(--accent)]/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-[color:var(--brand)]/10 blur-2xl"
        aria-hidden
      />
      <p className="relative flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>›</span> : null}
            <span
              className={
                i === breadcrumb.length - 1 ? "text-slate-900" : undefined
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </p>
      <div className="relative mt-3 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-[color:var(--accent)] px-3.5 py-1.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_24px_rgb(var(--accent-rgb)/.3)]">
            Konu {index + 1}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-.02em] text-slate-900 sm:text-5xl lg:text-[52px]">
            {name}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-lg font-semibold leading-8 text-slate-900 sm:text-xl">
              {description}
            </p>
          ) : null}
        </div>
        <HeroIllustration />
      </div>
    </div>
  );
}
