import type { Metadata } from "next";
import { requireStaff } from "@/server/auth/context";
import { getTryToUsdRate } from "@/server/services/settings.service";
import { TryUsdRateForm } from "@/components/admin/TryUsdRateForm";

export const metadata: Metadata = { title: "Ödeme Ayarları" };

export default async function AdminSettingsPage() {
  await requireStaff();
  const rate = await getTryToUsdRate();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Ödeme Ayarları</h1>
      <p className="page-copy">PayPal ödemeleri için kullanılan TL → USD dönüşüm kuru.</p>
      <div className="mt-8">
        <TryUsdRateForm currentRate={String(rate)} />
      </div>
    </div>
  );
}
