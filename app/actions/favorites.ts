"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { toggleFavorite } from "@/server/services/favorites.service";
import { addToCart } from "@/server/services/cart.service";
import { safeNextPath } from "@/lib/availability";

/** Heart button. Visitors are sent to log in first and brought back to the page they were on. */
export async function toggleFavoriteAction(productId: string, returnPath: string) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect(`/sign-in?next=${encodeURIComponent(safeNextPath(returnPath) ?? "/")}`);
  const isFavorite = await toggleFavorite(userId, productId);
  revalidatePath("/dashboard/favoriler");
  return isFavorite;
}

export async function favoriteToCartAction(productId: string) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/sign-in?next=%2Fdashboard%2Ffavoriler");
  await addToCart(productId, userId);
  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeFavoriteAction(productId: string) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/sign-in");
  await db.favoriteProduct.deleteMany({ where: { userId, productId } });
  revalidatePath("/dashboard/favoriler");
}
