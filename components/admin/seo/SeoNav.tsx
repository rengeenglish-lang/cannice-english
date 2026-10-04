"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEO_SECTIONS } from "@/lib/seo/settings";
export function SeoNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="SEO bölümleri" className="flex flex-wrap gap-2">
      {SEO_SECTIONS.map(([slug, title, phase]) => {
        const href = `/admin/seo/${slug}`;
        return (phase === 1 || ["keywords", "opportunities"].includes(slug)) ? (
          <Link
            key={slug}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`${pathname === href ? "primary-button" : "ghost-button border border-[color:var(--border)]"} text-sm`}
          >
            {title}
          </Link>
        ) : (
          <span
            key={slug}
            aria-disabled="true"
            className="rounded-lg border border-dashed border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)]"
          >
            {title} <span className="text-xs">· Faz {phase}</span>
          </span>
        );
      })}
    </nav>
  );
}
