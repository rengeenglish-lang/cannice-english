import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { isResetTokenValid } from "@/server/services/account-email.service";

export const metadata: Metadata = { title: "Yeni Şifre", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  // Only checked here; the link is used up when the form is sent, so mail scanners opening it do no harm.
  const valid = await isResetTokenValid(t);
  return (
    <div>
      <p className="eyebrow text-center">Şifre Sıfırlama</p>
      <h1 className="page-title text-center">{valid ? "Yeni şifreni belirle" : "Bağlantı geçersiz"}</h1>
      {valid && t ? (
        <div className="mt-6">
          <ResetPasswordForm token={t} />
        </div>
      ) : (
        <div className="panel mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-600">Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Bağlantılar 1 saat geçerlidir ve bir kez kullanılabilir.</p>
          <Link href="/sifremi-unuttum" className="primary-button justify-center">Yeni bağlantı iste</Link>
        </div>
      )}
    </div>
  );
}
