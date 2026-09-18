import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default function RegisterPage() {
  return (
    <div>
      <p className="eyebrow text-center">Öğrenme Yolculuğunuza Başlayın</p>
      <h1 className="page-title text-center">Hesabınızı Oluşturun</h1>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-slate-500">
        Zaten üye misiniz?{" "}
        <Link href="/sign-in" className="font-bold text-[color:var(--brand)]">
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
