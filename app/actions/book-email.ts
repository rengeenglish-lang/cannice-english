"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { isTokenShaped } from "@/lib/auth/tokens";
import { resendBookSignin } from "@/server/services/account-email.service";

export type BookEmailState = { message?: string };
export async function confirmBookEmailAction(_previous: BookEmailState, form: FormData): Promise<BookEmailState> {
  const token = form.get("token");
  if (!isTokenShaped(token)) return { message: "Bağlantı geçersiz. Yeni bir bağlantı isteyebilirsin." };
  try { await signIn("book-email", { token, redirectTo: "/dashboard/books" }); }
  catch (error) {
    if (error instanceof AuthError) return { message: "Bağlantının süresi dolmuş veya daha önce kullanılmış. Yeni bir bağlantı isteyebilir ya da şifrenle giriş yapabilirsin." };
    throw error;
  }
  return {};
}

export async function resendBookEmailAction(_previous: BookEmailState, form: FormData): Promise<BookEmailState> {
  const email = String(form.get("email") ?? "").trim();
  if (email.length > 254 || !email.includes("@")) return { message: "E-posta adresini kontrol et." };
  await resendBookSignin(email).catch(() => undefined);
  return { message: "Bu e-posta adresiyle bir kitap seçtiysen yeni bağlantın gönderilecek. Gelen kutunu ve spam klasörünü kontrol et." };
}
