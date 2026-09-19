import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Users, Compass } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
export const metadata: Metadata = { title: "Hakkımızda" };
export default function AboutPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">CANNICE ENGLISH</p>
        <h1 className="page-title">
          Büyük hedeflere,
          <br />
          düzenli küçük adımlarla.
        </h1>
        <p className="page-copy">
          İngilizce sınav hazırlığında kendi yolunuzu oluşturun. Konu
          anlatımları, kitaplar, çalışma paketleri ve canlı grup dersleriyle
          ihtiyacınız olan desteği seçin.
        </p>
      </PageHero>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: Compass,
            title: "Hedefinizden başlayın",
            copy: "IELTS, TOEFL, PTE, YDS ve YÖKDİL için kaynakları sınavınıza göre keşfedin.",
          },
          {
            icon: BookOpen,
            title: "Size uygun kaynağı seçin",
            copy: "İçeriği, formatı ve kapsamı inceleyin; ihtiyacınız olan kaynağı ayrı olarak alın.",
          },
          {
            icon: Users,
            title: "Birlikte ilerleyin",
            copy: "Canlı grup derslerinin programını inceleyerek çalışma düzeninize uygun grubu seçin.",
          },
        ].map(({ icon: Icon, title, copy }) => (
          <section key={title} className="panel">
            <div className="learning-icon mb-5">
              <Icon aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {copy}
            </p>
          </section>
        ))}
      </div>
      <section className="learning-welcome mt-8">
        <div>
          <h2 className="text-2xl font-extrabold">
            Önce deneyin, sonra seçin.
          </h2>
          <p className="mt-3 text-sm leading-7 text-blue-100">
            Konu anlatımlarını ve tanıtım alıştırmalarını keşfederek
            başlayabilirsiniz.
          </p>
        </div>
        <Link href="/#sample" className="primary-button shrink-0">
          Örnek içeriği dene
        </Link>
      </section>
    </main>
  );
}
