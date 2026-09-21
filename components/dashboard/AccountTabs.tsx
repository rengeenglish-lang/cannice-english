import Link from "next/link";

const TABS = [
  { href: "/dashboard/profile", label: "Hesabım" },
  { href: "/dashboard/addresses", label: "Adreslerim" },
  { href: "/dashboard/orders", label: "Siparişlerim" },
  { href: "/dashboard/discounts", label: "İndirimlerim" },
  { href: "/dashboard/reviews", label: "Yorumlarım" },
  { href: "/dashboard/notifications", label: "Bildirim Ayarlarım" },
] as const;

export function AccountTabs({
  active,
}: {
  active: (typeof TABS)[number]["label"];
}) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-2xl border border-[color:var(--border)] bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => {
        const isActive = tab.label === active;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              isActive
                ? "bg-[color:var(--accent)] text-white"
                : "text-[color:var(--muted)] hover:bg-[color:var(--canvas)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
