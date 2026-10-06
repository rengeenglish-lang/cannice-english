import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { SeoNav } from "@/components/admin/seo/SeoNav";
import { EmergencyStopButton } from "@/components/admin/seo/SeoAutomationControls";
import { readAutomation } from "@/server/services/seo/automation.service";
export const metadata = {
  title: "SEO Autopilot",
  robots: { index: false, follow: false },
};
export default async function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getAuthContext();
  if (!actor) redirect("/sign-in");
  if (actor.role !== "ADMIN") forbidden();
  const automation = await readAutomation();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Netfener · Yönetim</p>
          <h1 className="page-title">SEO Autopilot</h1>
          <p className="page-copy">
            İçerik, öğrenci faydası ve dönüşüm için ortak çalışma alanı.
          </p>
        </div>
        <EmergencyStopButton stopped={automation.state.emergencyStop} revision={automation.revision} />
      </header>
      {automation.state.emergencyStop ? (
        <p role="alert" className="rounded-xl border border-[color:var(--danger)] p-4 text-sm font-bold">
          ACİL DURDURMA etkin: arka plan işleri ve zamanlanmış otomatik yayın çalışmıyor.
        </p>
      ) : null}
      <p className="text-sm text-[color:var(--muted)]">
        Her yazı sizin onayınızla yayınlanır. AI üretimi ve tam otomatik yayın kapalıdır.
      </p>
      <SeoNav />
      {children}
    </div>
  );
}
