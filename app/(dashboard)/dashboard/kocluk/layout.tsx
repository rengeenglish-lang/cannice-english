import { Bot } from "lucide-react";
import { CoachingNav } from "@/components/coaching/CoachingNav";
import { loadCoaching } from "@/server/services/coaching/context";

const BASE = "/dashboard/kocluk";

export default async function CoachingLayout({ children }: { children: React.ReactNode }) {
  const { profile, t } = await loadCoaching();
  const nav = [
    { href: BASE, label: t.sections.dashboard },
    { href: `${BASE}/plan`, label: t.sections.plan },
    { href: `${BASE}/kelime`, label: t.sections.vocab },
    { href: `${BASE}/defter`, label: t.sections.notebook },
    { href: `${BASE}/performans`, label: t.sections.performance },
    { href: `${BASE}/degerlendirme`, label: t.sections.checkin },
    { href: `${BASE}/raporlar`, label: t.sections.reports },
    { href: `${BASE}/ayarlar`, label: t.sections.settings },
  ];
  return (
    <div lang={t.locale} className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="no-print">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">{t.title}</p>
          <span className="rounded-full bg-[color:var(--success-soft)] px-2.5 py-0.5 text-[11px] font-black text-emerald-800">{t.free}</span>
        </div>
      </header>
      {profile?.enabled ? <CoachingNav items={nav} label={t.title} /> : null}
      <div className="mt-6">{children}</div>
      <p className="no-print mt-10 flex items-start gap-2 border-t border-[color:var(--border)] pt-4 text-xs leading-5 text-[color:var(--muted)]">
        <Bot size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{t.automated} {t.estimateNote}</span>
      </p>
    </div>
  );
}
