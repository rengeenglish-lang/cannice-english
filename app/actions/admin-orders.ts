"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { markOrderPaid, markOrderCancelled, markOrderRefunded } from "@/server/services/orders.service";

/** Payment decisions (approve, cancel, refund) are administrator-only; teachers can't move money. */
async function requireAdministrator() {
  const user = await getAuthContext();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) forbidden();
  return user;
}

export async function markOrderPaidAction(orderId: string) {
  const user = await requireAdministrator();
  await markOrderPaid(orderId, { actorId: user.id });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard");
}

export async function markOrderCancelledAction(orderId: string) {
  await requireAdministrator();
  await markOrderCancelled(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markOrderRefundedAction(orderId: string) {
  await requireAdministrator();
  await markOrderRefunded(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/lessons");
}
