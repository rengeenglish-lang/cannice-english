"use server";

import { z } from "zod";
import { submitCallbackRequest } from "@/server/services/leads.service";

const formSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  examTypeId: z.string().trim().optional(),
});

export type CallbackFormState = { status: "idle" | "success" | "error"; message?: string };

export async function submitCallbackFormAction(_prev: CallbackFormState, formData: FormData): Promise<CallbackFormState> {
  const parsed = formSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    examTypeId: formData.get("examTypeId") || undefined,
  });
  if (!parsed.success) return { status: "error", message: "Lütfen adınızı ve telefon numaranızı kontrol edin." };
  await submitCallbackRequest(parsed.data);
  return { status: "success", message: "Talebiniz başarıyla gönderildi! Ekibimiz en kısa sürede sizinle iletişime geçecek." };
}
