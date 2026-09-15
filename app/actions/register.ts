"use server";

import { redirect } from "next/navigation";
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
  if (!parsed.success) return { status: "error", message: "Lütfen bilgilerinizi kontrol edin." };

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { status: "error", message: "Bu e-posta adresi zaten kayıtlı." };

  const password = await hashPassword(parsed.data.password);
  await db.user.create({
    data: { name: parsed.data.name, email, phone: parsed.data.phone, password, role: "STUDENT" },
  });

  redirect("/sign-in?registered=1");
}
