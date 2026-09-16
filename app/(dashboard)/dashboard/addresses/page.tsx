import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { AccountHeader } from "@/components/dashboard/AccountHeader";
import { AccountTabs } from "@/components/dashboard/AccountTabs";

export const metadata: Metadata = { title: "Adreslerim" };

export default async function AddressesPage() {
  const user = await getAuthContext();
  if (!user) return null;

  return (
    <div>
      <AccountHeader name={user.name} email={user.email} activeTabLabel="Adreslerim" />
      <AccountTabs active="Adreslerim" />
      <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border-strong)] px-5 py-10 text-center">
        <p className="font-bold text-[color:var(--foreground)]">Adreslerim yakında burada olacak</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Fatura ve teslimat adreslerinizi yönetebileceğiniz bu bölüm çok yakında yayında.</p>
      </div>
    </div>
  );
}
