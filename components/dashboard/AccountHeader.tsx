import Link from "next/link";

export function AccountHeader({ name, email, activeTabLabel }: { name: string; email: string; activeTabLabel: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="mb-6">
      <p className="flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]">
        <Link href="/" className="hover:text-[color:var(--accent-strong)]">Ana Sayfa</Link>
        <span aria-hidden>›</span>
        <span className="text-[color:var(--foreground)]">{activeTabLabel}</span>
      </p>
      <div className="mt-4 flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[#0f9b8e] text-2xl font-extrabold text-white">
          {initial}
        </span>
        <div>
          <p className="text-xl font-extrabold text-[color:var(--foreground)]">{name}</p>
          <p className="text-sm text-[color:var(--muted)]">{email}</p>
        </div>
      </div>
    </div>
  );
}
