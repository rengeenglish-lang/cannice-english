import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
export const metadata: Metadata = { title: "Soru & Cevap" };
const ITEMS = [
  {
    q: "Kaynakları ayrı ayrı satın alabilir miyim?",
    a: "Kitaplar ve çalışma paketleri ayrı ürünler olarak sunulur. Ürün sayfasında formatı, içeriği ve fiyatı inceleyerek seçim yapabilirsiniz.",
  },
  {
    q: "Canlı grup derslerine nasıl katılırım?",
    a: "İlgilendiğiniz grubun içeriğini ve programını inceleyip sipariş oluşturabilirsiniz. Ödeme ve kayıt onayından sonra dersiniz öğrenci panelinizde görünür.",
  },
  {
    q: "Satın almadan önce deneyebilir miyim?",
    a: "Ana sayfadaki tanıtım alıştırmalarını ve konu anlatımlarını üye olmadan inceleyebilirsiniz. Örnek içerikler her ücretli ürünün kapsamını temsil etmez.",
  },
  {
    q: "Sipariş ve ödeme nasıl işliyor?",
    a: "Online ödeme altyapısı kurulum aşamasındadır. Siparişiniz ödeme bekleniyor durumunda kaydedilir; ekip ödeme ve erişim adımları için sizinle iletişime geçer.",
  },
  {
    q: "Canlı derslerin kaydı paylaşılır mı?",
    a: "Kayıt ve tekrar izleme imkânı seçtiğiniz paketin kapsamına bağlıdır. Satın almadan önce ilgili ürünün açıklamasını inceleyin.",
  },
  {
    q: "Ders ilerlememi nereden takip edebilirim?",
    a: "Giriş yaptıktan sonra Çalışma Alanım bölümünden kayıtlı kurslarınızı, tamamladığınız dersleri ve canlı ders programını görebilirsiniz.",
  },
];
export default function FaqPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">YANINIZDAYIZ</p>
        <h1 className="page-title">
          Başlamadan önce,
          <br />
          aklınızda soru kalmasın.
        </h1>
        <p className="page-copy">
          Kaynak seçimi, derslere erişim ve sipariş süreci hakkında.
        </p>
      </PageHero>
      <div className="space-y-3">
        {ITEMS.map((item) => (
          <details key={item.q} className="panel group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold">
              {item.q}
              <span
                className="text-xl text-[color:var(--accent)] group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
      <p className="mt-7 text-sm leading-7 text-[color:var(--muted)]">
        Teslim ve iade koşulları için{" "}
        <Link
          href="/legal/mesafeli-satis-sozlesmesi"
          className="font-bold underline"
        >
          Mesafeli Satış Sözleşmesi
        </Link>{" "}
        sayfasını inceleyin.
      </p>
    </main>
  );
}
