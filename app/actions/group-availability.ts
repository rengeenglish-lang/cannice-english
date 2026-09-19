"use server";
import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { cookies } from "next/headers";
import { getAuthContext } from "@/server/auth/context";
import {
  saveGroupSlot,
  manageGroupSlot,
  enrollGroupSlot,
  cancelGroupBooking,
  createDemoGroupSlots,
  getGroupSlot,
} from "@/server/services/group-availability.service";
import { z } from "zod";
export type AvailabilityFormState = { error?: string; success?: string };
async function requireAdmin() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") forbidden();
  return user;
}
function refresh() {
  for (const path of [
    "/",
    "/group-lessons",
    "/admin/group-availability",
    "/dashboard",
  ])
    revalidatePath(path);
  revalidatePath("/group-lessons/[id]", "page");
  revalidatePath("/admin/group-availability/[id]", "page");
}
export async function saveSlotAction(
  id: string | undefined,
  _state: AvailabilityFormState,
  form: FormData,
): Promise<AvailabilityFormState> {
  await requireAdmin();
  let saved: string;
  try {
    saved = await saveGroupSlot(
      {
        ...Object.fromEntries(form),
        enrollmentOpen: form.get("enrollmentOpen") === "on",
        useDisplayedOccupancy: form.get("useDisplayedOccupancy") === "on",
        displayedOccupancy: form.get("displayedOccupancy") || undefined,
      },
      id,
      form.get("scope") === "future",
    );
  } catch (e) {
    return {
      error:
        e instanceof z.ZodError
          ? "Lütfen alanları ve sayı sınırlarını kontrol edin."
          : e instanceof Error
            ? e.message
            : "Ders kaydedilemedi.",
    };
  }
  refresh();
  redirect(`/admin/group-availability/${saved}?saved=1`);
}
export async function manageSlotAction(
  id: string,
  _state: AvailabilityFormState,
  form: FormData,
): Promise<AvailabilityFormState> {
  await requireAdmin();
  const op = z
    .enum(["open", "close", "cancel", "duplicate", "delete"])
    .safeParse(form.get("operation"));
  if (!op.success) return { error: "Geçersiz işlem." };
  let target: string | null;
  try {
    target = await manageGroupSlot(id, op.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "İşlem yapılamadı." };
  }
  refresh();
  if (op.data === "delete") redirect("/admin/group-availability");
  if (op.data === "duplicate" && target)
    redirect(`/admin/group-availability/${target}`);
  return { success: "Ders güncellendi." };
}
export async function demoSlotsAction(
  _state: AvailabilityFormState,
  form: FormData,
): Promise<AvailabilityFormState> {
  await requireAdmin();
  try {
    await createDemoGroupSlots(String(form.get("courseId") || ""));
  } catch {
    return { error: "Bir ders paketi seçin." };
  }
  refresh();
  return { success: "Demo dersler hazır. Gerçek öğrenci kaydı oluşturulmadı." };
}
export async function bookSlotAction(
  id: string,
  _state: AvailabilityFormState,
): Promise<AvailabilityFormState> {
  void _state;
  const user = await getAuthContext();
  if (!user)
    redirect(`/sign-in?next=${encodeURIComponent(`/group-lessons/${id}`)}`);
  try {
    await enrollGroupSlot(id, user.id);
  } catch (e) {
    refresh();
    return { error: e instanceof Error ? e.message : "Kayıt tamamlanamadı." };
  }
  (await cookies()).delete("selected-group-slot");
  refresh();
  return {
    success: "Yeriniz ayrıldı. Ders kaydınız çalışma alanınızda görünüyor.",
  };
}
export async function cancelBookingAction(
  id: string,
  _state: AvailabilityFormState,
): Promise<AvailabilityFormState> {
  void _state;
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await cancelGroupBooking(id, user.id);
  refresh();
  return { success: "Rezervasyonunuz iptal edildi." };
}
export async function purchaseSlotAction(id: string) {
  const slot = await getGroupSlot(id);
  if (!slot) redirect("/group-lessons");
  (await cookies()).set("selected-group-slot", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 604800,
  });
  redirect(`/packages/${slot.course.product.slug}`);
}
