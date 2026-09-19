import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { KaynaklarHub } from "@/components/nav/KaynaklarHub";

export const metadata: Metadata = { title: "Kaynaklar" };

export default function KaynaklarPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">KAYNAKLAR</p>
        <h1 className="page-title">Tüm kaynaklarınız tek yerde.</h1>
        <p className="page-copy">
          Materyaller, Konu Anlatım ve Kitaplar ve Kaynaklar arasında geçiş
          yapın, size uygun olanı seçin.
        </p>
      </PageHero>
      <KaynaklarHub />
    </main>
  );
}
