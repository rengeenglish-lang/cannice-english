import { safeNextPath } from "@/lib/availability";
import Link from "next/link";
import type { Metadata } from "next";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { isGoogleConfigured } from "@/server/auth/google";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Üye Girişi" };

export default async function SignInPage({searchParams}: {searchParams: Promise<{next?: string; error?: string}>}) {
const params = await searchParams;
const next = safeNextPath(params.next);
  return (
    <div>
      <p className="eyebrow text-center">Üye Girişi</p>
      <h1 className="page-title text-center">Tekrar Hoş Geldin</h1>
      {params.error ? <p role="alert" className="mt-4 text-center text-sm font-semibold text-[color:var(--danger)]">Google ile giriş tamamlanamadı: hesabınız devre dışı olabilir veya Google e-postanız doğrulanmamış. Tekrar deneyin ya da e-posta ile giriş yapın.</p> : null}
      <div className="mt-6 space-y-4">
        {isGoogleConfigured() ? <GoogleButton next={next} label="Google ile giriş yap" /> : null}
        <SignInForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Üye değil misin? <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-bold text-[color:var(--brand)]">Üye Ol</Link>
      </p>
    </div>
  );
}
