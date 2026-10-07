import { parseSource } from "@/lib/seo/attribution";
import { safeNextPath } from "@/lib/availability";
import Link from "next/link";
import type { Metadata } from "next";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { isGoogleConfigured } from "@/server/auth/google";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default async function RegisterPage({searchParams}: {searchParams: Promise<{next?: string; src?: string}>}) {
const params = await searchParams;
const next = safeNextPath(params.next);
const src = parseSource(params.src) ? params.src : undefined;
  return (
    <div>
      <p className="eyebrow text-center">Öğrenme Yolculuğuna Başla</p>
      <h1 className="page-title text-center">Hesabını Oluştur</h1>
      <div className="mt-6 space-y-4">
        {isGoogleConfigured() ? <GoogleButton next={next} src={src} label="Google ile üye ol" /> : null}
        <RegisterForm next={next} src={src} />
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
