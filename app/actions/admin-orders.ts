"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { markOrderPaid, markOrderCancelled, markOrderRefunded } from "@/server/services/orders.service";

async function requireStaffOrForbid() {
  const user = await getAuthContext();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) forbidden();
}

export async function markOrderPaidAction(orderId: string) {
  await requireStaffOrForbid();
  await markOrderPaid(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard");
}

export async function markOrderCancelledAction(orderId: string) {
  await requireStaffOrForbid();
  await markOrderCancelled(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function markOrderRefundedAction(orderId: string) {
  await requireStaffOrForbid();
  await markOrderRefunded(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/lessons");
}
