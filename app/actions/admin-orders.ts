"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { markOrderPaid } from "@/server/services/orders.service";

export async function markOrderPaidAction(orderId: string) {
  const user = await getAuthContext();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) forbidden();
  await markOrderPaid(orderId, user.id);
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
}
