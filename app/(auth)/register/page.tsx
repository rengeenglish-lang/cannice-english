import { parseSource } from "@/lib/seo/attribution";
import { safeNextPath } from "@/lib/availability";
import Link from "next/link";
import type { Metadata } from "next";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { isGoogleConfigured } from "@/server/auth/google";
import { ebookFromNextPath } from "@/lib/ebook-library";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cookies } from "next/headers";
import { REFERRAL_COOKIE, REFERRAL_PERCENT, isReferralCode } from "@/server/services/referrals.service";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default async function RegisterPage({searchParams}: {searchParams: Promise<{next?: string; src?: string; ref?: string}>}) {
const params = await searchParams;
const next = safeNextPath(params.next);
const book = ebookFromNextPath(next);
const src = parseSource(params.src) ? params.src : undefined;
const ref = isReferralCode(params.ref?.toUpperCase()) ? params.ref!.toUpperCase() : (await cookies()).get(REFERRAL_COOKIE)?.value;
  return (
    <div>
      <p className="eyebrow text-center">Öğrenme Yolculuğuna Başla</p>
      <h1 className="page-title text-center">Hesabını Oluştur</h1>
      {book ? <p className="mt-3 text-center text-sm">Seçtiğin kitap: <strong>{book.title}</strong>. Kayıttan sonra e-postandaki bağlantı seni kitabına götürür.</p> : null}
      {isReferralCode(ref) ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-800">
          Bir arkadaşın seni davet etti: üye olunca ilk siparişinde %{REFERRAL_PERCENT} indirim kazanırsın.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        {!book && isGoogleConfigured() ? (
          <div>
            <GoogleButton next={next} src={src} label="Google ile üye ol" />
            <p className="mt-2 text-center text-xs text-[color:var(--muted)]">
              Google ile devam ederek <Link href="/legal/uyelik-sozlesmesi" className="underline">Üyelik Sözleşmesi</Link>&apos;ni kabul etmiş olursun.
            </p>
          </div>
        ) : null}
        <RegisterForm bookFlow={Boolean(book)} next={next} src={src} referral={isReferralCode(ref) ? ref : undefined} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Zaten üye misin?{" "}
        <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"} className="font-bold text-[color:var(--brand)]">
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
