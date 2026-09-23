"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { addToCart } from "@/server/services/cart.service";
import { claimPerkForCourse } from "@/server/services/plans.service";
import { enrollGroupSlotAndSeries } from "@/server/services/group-availability.service";

/** Plan card "Satın Al" button: puts the plan in the cart and goes straight to payment. */
export async function buyPlanAction(productId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/planlar")}`);
  const product = await db.product.findFirst({ where: { id: productId, category: "PLAN", isPublished: true } });
  if (!product) redirect("/planlar");
  await addToCart(product.id, user.id);
  revalidatePath("/cart");
  redirect("/checkout");
}

/** Uzman plan: join a live group for free using one of the plan's live-lesson perks. */
export async function claimPerkAction(courseId: string, slotId: string | null) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(slotId ? `/group-lessons/${slotId}` : "/dashboard/live-sessions")}`);
  await claimPerkForCourse(user.id, courseId);
  if (slotId) await enrollGroupSlotAndSeries(slotId, user.id).catch(() => undefined);
  revalidatePath("/dashboard/live-sessions");
  redirect("/dashboard/live-sessions");
}
