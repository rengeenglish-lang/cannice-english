import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "E-posta bildirimleri", robots: { index: false } };

export default async function EmailUnsubscribedPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum } = await searchParams;
  const ok = durum === "tamam";
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
