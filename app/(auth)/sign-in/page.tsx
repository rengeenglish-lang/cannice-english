import Link from "next/link";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Üye Girişi" };

export default function SignInPage() {
  return (
    <div>
      <p className="eyebrow text-center">Üye Girişi</p>
      <h1 className="page-title text-center">Tekrar Hoş Geldiniz</h1>
      <div className="mt-6"><SignInForm /></div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Üye değil misiniz? <Link href="/register" className="font-bold text-[color:var(--brand)]">Ücretsiz Deneyin</Link>
      </p>
    </div>
  );
}
