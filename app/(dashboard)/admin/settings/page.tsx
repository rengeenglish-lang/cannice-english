import type { Metadata } from "next";
import { requireStaff } from "@/server/auth/context";
import { getTryToUsdRate, getWheelEnabled } from "@/server/services/settings.service";
import { TryUsdRateForm } from "@/components/admin/TryUsdRateForm";
import { WheelToggleForm } from "@/components/admin/WheelToggleForm";

export const metadata: Metadata = { title: "Ödeme Ayarları" };

export default async function AdminSettingsPage() {
  await requireStaff();
  const rate = await getTryToUsdRate();
  const wheelEnabled = await getWheelEnabled();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Ödeme Ayarları</h1>
      <p className="page-copy">PayPal ödemeleri için kullanılan TL → USD dönüşüm kuru.</p>
      <div className="mt-8">
        <TryUsdRateForm currentRate={String(rate)} />
      </div>
      <h2 className="page-title mt-12 !text-2xl">Çark (indirim popup’ı)</h2>
      <p className="page-copy">Ziyaretçilere gösterilen çarkı açar veya kapatır.</p>
      <div className="mt-6">
        <WheelToggleForm initialEnabled={wheelEnabled} />
      </div>
    </div>
  );
}
