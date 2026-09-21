"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";

export async function markLeadContactedAction(leadId: string) {
  const user = await getAuthContext();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) forbidden();
  await db.callbackRequest.update({ where: { id: leadId }, data: { status: "CONTACTED", contactedAt: new Date() } });
  revalidatePath("/admin/leads");
}

export async function markLeadClosedAction(leadId: string) {
  const user = await getAuthContext();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) forbidden();
  await db.callbackRequest.update({ where: { id: leadId }, data: { status: "CLOSED" } });
  revalidatePath("/admin/leads");
}
