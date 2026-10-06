import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { SeoNav } from "@/components/admin/seo/SeoNav";
import { SeoControls } from "@/components/admin/seo/SeoControls";
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
        <SeoControls kind="pause" />
      </header>
      <p className="text-sm text-[color:var(--muted)]">
        Her yazı sizin onayınızla yayınlanır. AI üretimi ve tam otomatik yayın kapalıdır.
      </p>
      <SeoNav />
      {children}
    </div>
  );
}
