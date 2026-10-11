import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Şifremi Unuttum", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="eyebrow text-center">Şifremi Unuttum</p>
      <h1 className="page-title text-center">Şifreni sıfırla</h1>
      <p className="page-copy mx-auto text-center">Hesabına kayıtlı e-posta adresini yaz; yeni şifre belirlemen için bir bağlantı gönderelim.</p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Şifreni hatırladın mı? <Link href="/sign-in" className="font-bold text-[color:var(--brand)]">Giriş yap</Link>
      </p>
    </div>
  );
}
