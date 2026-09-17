function HeroIllustration() {
  return (
    <svg viewBox="0 0 160 120" className="hidden h-24 w-auto shrink-0 sm:block" aria-hidden>
      <rect x="18" y="70" width="90" height="14" rx="4" fill="#2563eb" />
      <rect x="26" y="52" width="90" height="14" rx="4" fill="#f59e0b" />
      <rect x="34" y="34" width="90" height="14" rx="4" fill="#17a568" />
      <path d="M108 30 L118 14 L128 30 Z" fill="#f59e0b" />
      <circle cx="140" cy="20" r="8" fill="#e2e8f0" />
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
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-white p-6 sm:p-8">
      <p className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>›</span> : null}
            <span className={i === breadcrumb.length - 1 ? "text-slate-900" : undefined}>{crumb}</span>
          </span>
        ))}
      </p>
      <div className="mt-3 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
            Konu {index + 1}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-[-.02em] text-slate-900 sm:text-4xl lg:text-[42px]">
            {name}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl whitespace-pre-line text-base leading-7 text-slate-700 sm:text-lg">{description}</p>
          ) : null}
        </div>
        <HeroIllustration />
      </div>
    </div>
  );
}
