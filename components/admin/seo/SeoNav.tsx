"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, NAV_HOME, currentLabel, isActive } from "@/lib/seo/nav";

function Groups({ pathname }: { pathname: string }) {
  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.id} className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((i) =>
              i.soon ? (
                <li key={i.slug} aria-disabled="true" className="px-2 py-1 text-sm text-[color:var(--muted)]">
                  {i.label} <span className="text-xs">· {i.soon}</span>
                </li>
              ) : (
                <li key={i.slug}>
                  <Link
                    href={i.href}
                    title={i.hint}
                    aria-current={isActive(pathname, i.href) ? "page" : undefined}
                    className={`block rounded-lg px-2 py-1 text-sm ${isActive(pathname, i.href) ? "bg-[color:var(--brand)] font-bold text-white" : "hover:bg-black/5"}`}
                  >
                    {i.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SeoNav() {
  const pathname = usePathname();
  const home = isActive(pathname, NAV_HOME.href);
  return (
    <nav aria-label="SEO bölümleri" className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
      <div className="flex items-center gap-3">
        <Link
          href={NAV_HOME.href}
          aria-current={home ? "page" : undefined}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold ${home ? "bg-[color:var(--brand)] text-white" : "border border-[color:var(--border)]"}`}
        >
          {NAV_HOME.label}
        </Link>
        <p className="text-sm text-[color:var(--muted)] lg:hidden">Şu an: <strong>{currentLabel(pathname)}</strong></p>
      </div>
      <details className="mt-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-bold">Tüm bölümler</summary>
        <div className="mt-3">
          <Groups pathname={pathname} />
        </div>
      </details>
      <div className="mt-3 hidden lg:block">
        <Groups pathname={pathname} />
      </div>
    </nav>
  );
}
