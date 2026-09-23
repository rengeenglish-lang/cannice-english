"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthContext, requireStaff } from "@/server/auth/context";
import { db } from "@/server/db";
import { addToCart } from "@/server/services/cart.service";
import { getGroupSlot, enrollGroupSlotAndSeries } from "@/server/services/group-availability.service";
import { enrollmentGrantsAccess } from "@/lib/diagnostics/access";
import { sendTeacherMessage, replyToTeacherMessage } from "@/server/services/messages.service";

/**
 * "Gruba Katıl": students who already pay for the group are booked immediately; everyone else
 * gets the group's monthly price in the cart, tagged with this slot so paying books it.
 */
export async function joinGroupAction(slotId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/group-lessons/${slotId}`)}`);
  const slot = await getGroupSlot(slotId);
  if (!slot) redirect("/group-lessons");
  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: slot.courseId } } });
  if (enrollmentGrantsAccess(enrollment)) {
    await enrollGroupSlotAndSeries(slotId, user.id);
    revalidatePath("/dashboard/live-sessions");
    redirect("/dashboard/live-sessions");
  }
  await addToCart(slot.course.productId, user.id, { groupSlotId: slotId });
  revalidatePath("/cart");
  redirect("/checkout");
}

/** "Devam etmek için öde": one more billing month of the group in the cart, then checkout. */
export async function renewGroupAction(courseId: string) {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/live-sessions")}`);
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) redirect("/dashboard/live-sessions");
  await addToCart(course.productId, user.id);
  revalidatePath("/cart");
  redirect("/checkout");
}

export type MessageFormState = { status: "idle" | "error" | "success"; message?: string };

const messageSchema = z.object({
  body: z.string().trim().min(5, "Mesajınız en az 5 karakter olmalı.").max(2000, "Mesajınız en fazla 2000 karakter olabilir."),
  courseId: z.string().optional(),
});

export async function sendTeacherMessageAction(_state: MessageFormState, formData: FormData): Promise<MessageFormState> {
  const user = await getAuthContext();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/dashboard/mesajlar")}`);
  const parsed = messageSchema.safeParse({ body: formData.get("body"), courseId: formData.get("courseId") || undefined });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Mesaj gönderilemedi." };
  try {
    await sendTeacherMessage(user.id, parsed.data.body, parsed.data.courseId ?? null);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Mesaj gönderilemedi." };
  }
  revalidatePath("/dashboard/mesajlar");
  return { status: "success", message: "Mesajın öğretmenine iletildi. Yanıt geldiğinde bildirim alacaksın." };
}

export async function replyTeacherMessageAction(messageId: string, _state: MessageFormState, formData: FormData): Promise<MessageFormState> {
  const staff = await requireStaff();
  const reply = String(formData.get("reply") ?? "").trim();
  if (reply.length < 2) return { status: "error", message: "Lütfen bir yanıt yazın." };
  await replyToTeacherMessage(messageId, staff.id, reply.slice(0, 4000));
  revalidatePath("/admin/mesajlar");
  return { status: "success", message: "Yanıt gönderildi." };
}
