import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { loadCoaching } from "@/server/services/coaching/context";
import { recentDeliveries } from "@/server/services/coaching/followups.service";
import { SettingsForm } from "@/components/coaching/SettingsForm";
import { ActionButton } from "@/components/coaching/ActionButton";
import { deleteCoachingDataAction, setCoachingEnabledAction } from "@/app/actions/coaching";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Koçluk ayarları" };

export default async function CoachingSettingsPage() {
  const { user, profile, t } = await loadCoaching();
  if (!profile) redirect("/dashboard/kocluk/baslangic");
  const s = t.settings;
  const locale = t.locale;
  const deliveries = await recentDeliveries(user.id, 10);
  const paused = profile.pausedUntil && profile.pausedUntil > new Date() ? profile.pausedUntil.toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", { timeZone: profile.timezone, day: "numeric", month: "long" }) : null;
  const when = (d: Date) => d.toLocaleString(locale === "en" ? "en-GB" : "tr-TR", { timeZone: profile.timezone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">{s.title}</h1>
      </header>

      <section className="dashboard-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title !text-lg">{s.profile}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{s.profileHelp}</p>
        </div>
        <Link href="/dashboard/kocluk/baslangic" className="secondary-button">{s.editProfile}</Link>
      </section>

      {paused ? <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{s.pausedUntil(paused)}</p> : null}
      <SettingsForm
        locale={locale}
        pausedLabel={paused ? s.pausedUntil(paused) : null}
        initial={{ notifyInApp: profile.notifyInApp, frequency: profile.frequency === "LOW" ? "LOW" : "NORMAL", quietStart: profile.quietStart, quietEnd: profile.quietEnd, reminderTime: profile.reminderTime, timezone: profile.timezone, locale: profile.locale === "en" ? "en" : "tr" }}
      />

      <section className="dashboard-panel" aria-labelledby="deliveries">
        <h2 id="deliveries" className="section-title !text-lg">{s.deliveries}</h2>
        <p className="mt-1 text-xs text-[color:var(--muted)]">{s.deliveriesHelp}</p>
        {deliveries.length ? (
          <ul className="mt-3 divide-y divide-[color:var(--border)] text-sm">
            {deliveries.map((d) => (
              <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>{s.kinds[d.kind] ?? d.kind}</span>
                <span className="text-xs text-[color:var(--muted)]">{when(d.createdAt)} · {s.statuses[d.status] ?? d.status}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-[color:var(--muted)]">{t.none}</p>}
      </section>

      <section className="dashboard-panel space-y-4" aria-labelledby="privacy">
        <h2 id="privacy" className="section-title flex items-center gap-2 !text-lg"><ShieldCheck size={20} aria-hidden="true" /> {s.privacy}</h2>
        <p className="text-sm leading-6">{s.privacyText}</p>
        <p className="text-sm leading-6 text-[color:var(--muted)]">{s.dataList}</p>
        <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--border)] pt-4">
          {profile.enabled ? (
            <ActionButton action={setCoachingEnabledAction.bind(null, false)} label={s.disable} confirm={s.disableHelp} className="secondary-button" />
          ) : (
            <ActionButton action={setCoachingEnabledAction.bind(null, true)} label={s.enable} className="primary-button" />
          )}
          <span className="text-xs text-[color:var(--muted)]">{s.disableHelp}</span>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
          <p className="text-sm leading-6 text-rose-900">{s.deleteHelp}</p>
          <div className="mt-3">
            <ActionButton action={deleteCoachingDataAction} label={s.delete} confirm={s.deleteConfirm} className="destructive-button" />
          </div>
        </div>
        <p className="text-xs text-[color:var(--muted)]">{s.kvkk} <Link href="/yardim" className="font-bold underline">{s.helpDesk}</Link> · <Link href="/legal/aydinlatma-metni" className="font-bold underline">{t.onboarding.privacyLink}</Link></p>
      </section>
    </div>
  );
}
