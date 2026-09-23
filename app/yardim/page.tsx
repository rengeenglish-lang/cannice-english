import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { OpenLiveChatButton } from "@/components/support/LiveChatWidget";
import { HELP_FAQ } from "@/content/help-faq";
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
        <p className="page-copy">Sık sorulan soruların yanıtlarını aşağıda bulabilir, aradığınızı bulamazsanız canlı destek ekibimize yazabilirsiniz.</p>
      </PageHero>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="panel flex flex-col gap-3">
          <MessageCircle className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">Canlı destek</h2>
          <p className="text-sm text-[color:var(--muted)]">Ekibimiz çevrim içiyken anında yanıt verir; çevrim dışıyken bıraktığınız mesajlara e-postayla dönüş yapılır.</p>
          <OpenLiveChatButton fallbackEmail={SUPPORT_EMAIL} className="primary-button mt-auto text-xs" />
        </div>
        <div className="panel flex flex-col gap-3">
          <Mail className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">E-posta</h2>
          <p className="text-sm text-[color:var(--muted)]">İade ve fatura talepleri için sipariş numaranızla birlikte yazın.</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="secondary-button mt-auto text-xs">{SUPPORT_EMAIL}</a>
        </div>
        <div className="panel flex flex-col gap-3">
          <LifeBuoy className="text-[color:var(--accent-strong)]" aria-hidden="true" />
          <h2 className="font-extrabold">Öğretmenine sor</h2>
          <p className="text-sm text-[color:var(--muted)]">Ders içeriğiyle ilgili sorularını doğrudan öğretmenine iletebilirsin.</p>
          <Link href="/dashboard/mesajlar" className="secondary-button mt-auto text-xs">Mesajlarım</Link>
        </div>
      </div>

      <nav aria-label="SSS kategorileri" className="mt-10 flex flex-wrap gap-2">
        {HELP_FAQ.map((category) => (
          <a key={category.key} href={`#${category.key}`} className="rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-[color:var(--brand)]">
            {category.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {HELP_FAQ.map((category) => (
          <section key={category.key} id={category.key} className="scroll-mt-24" aria-labelledby={`${category.key}-title`}>
            <h2 id={`${category.key}-title`} className="section-title !text-xl">{category.title}</h2>
            <div className="mt-4 space-y-3">
              {category.items.map((item) => (
                <details key={item.q} className="panel group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold">
                    {item.q}
                    <span className="text-xl text-[color:var(--accent)] transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm leading-7 text-[color:var(--muted)]">
        Ayrıntılı koşullar için <Link href="/legal/iade-politikasi" className="font-bold underline">İade Politikası</Link>,{" "}
        <Link href="/legal/kullanim-kosullari" className="font-bold underline">Kullanım Koşulları</Link> ve{" "}
        <Link href="/legal/mesafeli-satis-sozlesmesi" className="font-bold underline">Mesafeli Satış Sözleşmesi</Link> sayfalarını inceleyebilirsiniz.
      </p>
    </main>
  );
}
