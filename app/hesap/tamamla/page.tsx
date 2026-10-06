import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { safeNextPath } from "@/lib/availability";
import { db } from "@/server/db";
import { recordRegistrationAttribution } from "@/server/services/seo/conversions.service";

export const metadata: Metadata = { title: "Giriş tamamlanıyor", robots: { index: false, follow: false } };

/** Post-Google hop: records the article attribution for brand-new accounts, then sends the user on. */
export default async function CompleteSignIn({ searchParams }: { searchParams: Promise<{ next?: string; src?: string }> }) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const params = await searchParams;
  if (params.src) {
    const row = await db.user.findUnique({ where: { id: user.id }, select: { createdAt: true } });
    if (row && Date.now() - row.createdAt.getTime() < 15 * 60_000)
      await recordRegistrationAttribution(user.id, params.src).catch(() => undefined);
  }
  const staff = user.role === "TEACHER" || user.role === "ADMIN";
  redirect(safeNextPath(params.next) ?? (staff ? "/admin" : "/dashboard"));
}
