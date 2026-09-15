"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { addToCart, removeFromCart } from "@/server/services/cart.service";

export async function addToCartAction(productId: string) {
  const session = await auth();
  await addToCart(productId, session?.user?.id);
  revalidatePath("/cart");
}

export async function removeFromCartAction(cartItemId: string) {
  await removeFromCart(cartItemId);
  revalidatePath("/cart");
}
