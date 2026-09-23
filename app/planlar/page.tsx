import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { PlanCards } from "@/components/plans/PlanCards";
import { getAuthContext } from "@/server/auth/context";
import { getActivePlan, listPlanProducts } from "@/server/services/plans.service";

export const metadata: Metadata = {
  title: "Planlar",
  description: "Başlangıç, Çırak ve Uzman planlarıyla deneme sınavlarına, konu anlatımlarına, pratik sorulara ve canlı derslere erişin.",
};

export default async function PlansPage() {
  const user = await getAuthContext();
  const [products, plan] = await Promise.all([listPlanProducts(), user ? getActivePlan(user.id) : null]);
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">PLANLAR</p>
        <h1 className="page-title">Hedefine uygun planı seç.</h1>
        <p className="page-copy">
          Deneme sınavları, konu anlatımları, pratik sorular ve canlı dersler — ihtiyacın kadarını seç, istediğin zaman yükselt.
        </p>
      </PageHero>
      <div className="mt-10">
        <PlanCards products={products} currentTier={plan?.tier ?? null} currentExpiresAt={plan?.expiresAt} />
      </div>
      <p className="mt-8 text-center text-sm text-[color:var(--muted)]">
        Satın alımdan itibaren 14 gün içinde iade talep edebilirsin. Ayrıntılar için{" "}
        <Link href="/legal/iade-politikasi" className="font-bold underline">İade Politikası</Link>.
      </p>
    </main>
  );
}
