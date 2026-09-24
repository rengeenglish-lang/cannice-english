"use server";

import { safeNextPath } from "@/lib/availability";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { registerSchema } from "@/lib/validation/auth";

export type RegisterFormState = { status: "idle" | "error"; message?: string };

export async function registerAction(_prev: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: "Lütfen bilgilerini kontrol et." };

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { status: "error", message: "Bu e-posta adresi zaten kayıtlı." };

  const password = await hashPassword(parsed.data.password);
  await db.user.create({
    data: { name: parsed.data.name, email, phone: parsed.data.phone, password, role: "STUDENT" },
  });

  const next = safeNextPath(formData.get("next"));
  // Sign the new student straight in so they land on `next` (e.g. /checkout with the plan they
  // picked) instead of re-typing the password they just chose on the sign-in page.
  try {
    await signIn("credentials", { email, password: parsed.data.password, redirectTo: next ?? "/dashboard" });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
  }
  redirect(`/sign-in?registered=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}
