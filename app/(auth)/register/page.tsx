import { safeNextPath } from "@/lib/availability";
import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default async function RegisterPage({searchParams}: {searchParams: Promise<{next?: string}>}) {
const next = safeNextPath((await searchParams).next);
  return (
    <div>
      <p className="eyebrow text-center">Öğrenme Yolculuğuna Başla</p>
      <h1 className="page-title text-center">Hesabını Oluştur</h1>
      {next === "/checkout" ? (
        <p className="mt-3 text-center text-sm font-semibold text-emerald-700">Seçtiğin ürün sepetinde. Ücretsiz hesabını oluştur, ödemeye devam et.</p>
      ) : null}
      <div className="mt-6">
        <RegisterForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Zaten üye misin?{" "}
        <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"} className="font-bold text-[color:var(--brand)]">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}
