"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireAdministrator } from "@/server/auth/context";
import { createCommercialCheckout, closeCommercialOrder, configureCommercialSales, configureCohortSales } from "@/server/services/commercial-checkout.service";
import { markOrderPaid } from "@/server/services/orders.service";
import { z } from "zod";
export type CommercialFormState = { message: string; ok?: boolean };
export async function startMembershipCheckout(_state: CommercialFormState, form: FormData): Promise<CommercialFormState> {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  let orderId: string;
  try {
    ({ orderId } = await createCommercialCheckout(user.id, { kind: form.get("kind"), interval: form.get("interval"), cohortId: form.get("cohortId") || undefined, requestKey: form.get("requestKey") }));
  } catch (error) { return { message: error instanceof Error ? error.message : "Ödeme talebi oluşturulamadı." }; }
  redirect(`/checkout/membership/${orderId}`);
}
export async function manageCommercialOrder(_state: CommercialFormState, form: FormData): Promise<CommercialFormState> {
  const actor = await requireAdministrator();
  try {
    const orderId = z.string().min(1).parse(form.get("orderId"));
    if (form.get("operation") === "approve") await markOrderPaid(orderId, actor.id);
    else await closeCommercialOrder(actor.id, orderId, form.get("operation"), String(form.get("reason") ?? ""));
  } catch (error) { return { message: error instanceof Error ? error.message : "İşlem tamamlanamadı." }; }
  revalidatePath("/admin/orders"); revalidatePath("/dashboard"); revalidatePath("/checkout/membership", "layout");
  return { message: "İşlem kaydedildi. Güncel sipariş durumunu kontrol edin.", ok: true };
}
export async function configureSalesAction(_state: CommercialFormState, form: FormData): Promise<CommercialFormState> {
  const actor = await requireAdministrator();
  try {
    if (form.get("cohortId")) await configureCohortSales(actor.id, String(form.get("cohortId")), { salesEnabled: form.get("enabled") === "on", graceDays: Number(form.get("graceDays")), seatHoldMinutes: Number(form.get("seatHoldMinutes")) });
    else await configureCommercialSales(actor.id, z.enum(["PREMIUM", "GROUP"]).parse(form.get("kind")), z.enum(["MONTHLY", "QUARTERLY", "SIX_MONTH", "ANNUAL"]).parse(form.get("interval")), form.get("enabled") === "on");
  } catch (error) { return { message: error instanceof Error ? error.message : "Kaydedilemedi." }; }
  revalidatePath("/admin/commerce"); revalidatePath("/checkout/membership");
  return { message: "Satış ayarları kaydedildi.", ok: true };
}
