"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { getAuthContext } from "@/server/auth/context";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validation/profile";

export type ProfileFormState = { status: "idle" | "error" | "success"; message?: string };

export async function updateProfileAction(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturum bulunamadı." };

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    nationalId: formData.get("nationalId"),
    birthDate: formData.get("birthDate"),
    occupation: formData.get("occupation"),
    educationLevel: formData.get("educationLevel"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Lütfen bilgilerinizi kontrol edin." };

  await db.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      nationalId: parsed.data.nationalId || null,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      occupation: parsed.data.occupation || null,
      educationLevel: parsed.data.educationLevel || null,
    },
  });

  revalidatePath("/dashboard/profile");
  return { status: "success", message: "Bilgileriniz güncellendi." };
}

export async function changePasswordAction(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturum bulunamadı." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Lütfen bilgilerinizi kontrol edin." };

  const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!dbUser?.password || !(await verifyPassword(parsed.data.currentPassword, dbUser.password))) {
    return { status: "error", message: "Mevcut şifreniz hatalı." };
  }

  const password = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id: user.id }, data: { password } });

  return { status: "success", message: "Şifreniz güncellendi." };
}
