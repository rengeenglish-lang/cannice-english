import { slotReturnPath } from "@/lib/availability";
import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default async function RegisterPage({searchParams}: {searchParams: Promise<{next?: string}>}) {
const next = slotReturnPath((await searchParams).next);
  return (
    <div>
      <p className="eyebrow text-center">Öğrenme Yolculuğunuza Başlayın</p>
      <h1 className="page-title text-center">Hesabınızı Oluşturun</h1>
      <div className="mt-6">
        <RegisterForm next={next} />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Zaten üye misiniz?{" "}
        <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"} className="font-bold text-[color:var(--brand)]">
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
