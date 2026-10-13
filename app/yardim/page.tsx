import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { OpenLiveChatButton } from "@/components/support/LiveChatWidget";
import { HELP_FAQ } from "@/content/help-faq";
import { HelpGallery } from "@/components/support/HelpGallery";
import { SUPPORT_EMAIL } from "@/lib/social";

export const metadata: Metadata = {
  title: "Yardım Masası",
  description: "Hesap, planlar, ödemeler, iadeler, canlı dersler, seviye tespit sınavları ve teknik sorunlar hakkında sık sorulan sorular ve canlı destek.",
};

export default function HelpDeskPage() {
  return (
    <main className="inner-page mx-auto w-full max-w-[1000px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">YARDIM MASASI</p>
        <h1 className="page-title">Size nasıl yardımcı olabiliriz?</h1>
        <p className="page-copy">Sık sorulan soruların yanıtlarını aşağıda bulabilir, aradığını bulamazsan canlı destek ekibimize yazabilirsin.</p>
      </PageHero>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="panel flex flex-col gap-3">
          <MessageCircle className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">Canlı destek</h2>
          <p className="text-sm text-[color:var(--muted)]">Ekibimiz çevrim içiyken anında yanıt verir; çevrim dışıyken bıraktığın mesajlara e-postayla dönüş yapılır.</p>
          <OpenLiveChatButton fallbackEmail={SUPPORT_EMAIL} className="primary-button mt-auto text-xs" />
        </div>
        <div className="panel flex flex-col gap-3">
          <Mail className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">E-posta</h2>
          <p className="text-sm text-[color:var(--muted)]">İade ve fatura talepleri için sipariş numaranla birlikte yaz.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="secondary-button mt-auto text-xs">{SUPPORT_EMAIL}</a>
        </div>
        <div className="panel flex flex-col gap-3">
          <LifeBuoy className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">Öğretmenine sor</h2>
          <p className="text-sm text-[color:var(--muted)]">Ders içeriğiyle ilgili sorularını doğrudan öğretmenine iletebilirsin.</p>
          <Link href="/dashboard/mesajlar" className="secondary-button mt-auto text-xs">Mesajlarım</Link>
        </div>
      </div>

      <HelpGallery categories={HELP_FAQ} />

      <p className="mt-10 text-sm leading-7 text-[color:var(--muted)]">
        Ayrıntılı koşullar için <Link href="/legal/iade-politikasi" className="font-bold underline">İade Politikası</Link>,{" "}
        <Link href="/legal/kullanim-kosullari" className="font-bold underline">Kullanım Koşulları</Link> ve{" "}
        <Link href="/legal/mesafeli-satis-sozlesmesi" className="font-bold underline">Mesafeli Satış Sözleşmesi</Link> sayfalarını inceleyebilirsin.
      </p>
    </main>
  );
}
