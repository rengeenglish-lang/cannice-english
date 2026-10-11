import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "E-posta bildirimleri", robots: { index: false } };

export default async function EmailUnsubscribedPage({ searchParams }: { searchParams: Promise<{ durum?: string; tur?: string }> }) {
  const { durum, tur } = await searchParams;
  const ok = durum === "tamam";
  if (tur === "sepet") {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
        {ok ? <CheckCircle2 size={40} className="mx-auto text-emerald-600" aria-hidden="true" /> : <XCircle size={40} className="mx-auto text-rose-600" aria-hidden="true" />}
        <h1 className="page-title mt-4">{ok ? "Sepet hatırlatmaları kapatıldı" : "Bağlantı geçersiz"}</h1>
        <p className="page-copy mx-auto">
          {ok
            ? "Sepetinde kalan ürünler için artık e-posta göndermeyeceğiz. Sipariş ve ders e-postaların gelmeye devam eder."
            : "Bu bağlantı tanınmadı. Sorun devam ederse destek@netfener.com adresine yazabilirsin."}
        </p>
        <Link href="/" className="primary-button mt-6">Ana sayfa</Link>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
      {ok ? <CheckCircle2 size={40} className="mx-auto text-emerald-600" aria-hidden="true" /> : <XCircle size={40} className="mx-auto text-rose-600" aria-hidden="true" />}
      <h1 className="page-title mt-4">{ok ? "E-posta bildirimleri kapatıldı" : "Bağlantı geçersiz"}</h1>
      <p className="page-copy mx-auto">
        {ok
          ? "Artık koçluk hatırlatmaları ve haftalık rapor e-postayla gönderilmeyecek. Site içi bildirimlerin açık kalır; istediğin zaman ayarlardan yeniden açabilirsin."
          : "Bu bağlantı tanınmadı. E-posta bildirimlerini koçluk ayarlarından da kapatabilirsin."}
      </p>
      <Link href="/dashboard/kocluk/ayarlar" className="primary-button mt-6">Bildirim ayarları</Link>
    </main>
  );
}
