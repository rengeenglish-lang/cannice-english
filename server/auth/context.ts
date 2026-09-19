import "server-only";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";

export const getAuthContext = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      phone: true,
      nationalId: true,
      birthDate: true,
      occupation: true,
      educationLevel: true,
    },
  });
  if (!user || !user.isActive) return null;
  return user;
});

export async function requireStaff() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  if (user.role !== "TEACHER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") forbidden();
  return user;
}

export async function requireAdministrator() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") forbidden();
  return user;
}
