"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/dashboard/kocluk";

/** Coaching sub-navigation; horizontally scrollable on phones. */
export function CoachingNav({ items, label }: { items: { href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(href + "/"));
  return (
    <nav aria-label={label} className="no-print -mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`inline-block rounded-full border px-4 py-2 text-sm font-bold transition ${
                isActive(item.href)
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                  : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
