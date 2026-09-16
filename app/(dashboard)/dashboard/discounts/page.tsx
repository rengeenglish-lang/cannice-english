import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";

export const metadata: Metadata = { title: "İndirimlerim" };

export default async function DiscountsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="İndirimlerim" />
      <AccountTabs active="İndirimlerim" />
      <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
        <p className="font-bold text-[color:var(--foreground)]">İndirimlerim yakında burada olacak</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Size özel kupon kodları ve kampanyalar çok yakında bu sayfada listelenecek.</p>
      </div>
    </div>
  );
}
