import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "E-posta doğrulama", robots: { index: false } };

export default async function EmailVerifiedPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum } = await searchParams;
  const ok = durum === "tamam";
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6">
      {ok ? <CheckCircle2 size={40} className="mx-auto text-emerald-600" aria-hidden="true" /> : <XCircle size={40} className="mx-auto text-rose-600" aria-hidden="true" />}
      <h1 className="page-title mt-4">{ok ? "E-posta adresin doğrulandı" : "Bağlantı geçersiz"}</h1>
      <p className="page-copy mx-auto">
        {ok
          ? "Teşekkürler! Hesabın doğrulandı. Şifreni unutursan sıfırlama bağlantısı bu adrese gelecek."
          : "Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Çalışma alanındaki uyarıdan yeni bir doğrulama e-postası isteyebilirsin."}
      </p>
      <Link href="/dashboard" className="primary-button mt-6">Çalışma alanıma git</Link>
    </main>
  );
}
