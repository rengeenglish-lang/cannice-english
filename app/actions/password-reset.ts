"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requestPasswordReset, resetPassword } from "@/server/services/account-email.service";

export type ForgotPasswordState = { status: "idle" | "sent" | "error"; message?: string };
export type ResetPasswordState = { status: "idle" | "error"; message?: string };

export async function requestPasswordResetAction(_prev: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { status: "error", message: "Geçerli bir e-posta adresi yaz." };
  await requestPasswordReset(email.data);
  // Same answer whether or not the address has an account.
  return { status: "sent" };
}

export async function resetPasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8 || password.length > 128) return { status: "error", message: "Şifre en az 8 karakter olmalı." };
  if (password !== confirm) return { status: "error", message: "Şifreler birbiriyle aynı değil." };
  const ok = await resetPassword(formData.get("token"), password);
  if (!ok) return { status: "error", message: "Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı iste." };
  redirect("/sign-in?sifre=yenilendi");
}
