import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";

export const metadata: Metadata = { title: "Yorumlarım" };

export default async function ReviewsPage() {
  const user = await getAuthContext();
  if (!user) return null;

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Yorumlarım" />
      <AccountTabs active="Yorumlarım" />
      <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
        <p className="font-bold text-[color:var(--foreground)]">Yorumlarım yakında burada olacak</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Satın aldığınız paketler hakkında bıraktığınız değerlendirmeleri burada görebileceksiniz.</p>
      </div>
    </div>
  );
}
