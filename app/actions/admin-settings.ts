"use server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/server/auth/context";
import { setSetting, TRY_USD_RATE_KEY } from "@/server/services/settings.service";

export type UpdateRateState = { status: "idle" | "error" | "success"; message?: string };

export async function updateTryUsdRateAction(_prev: UpdateRateState, formData: FormData): Promise<UpdateRateState> {
  await requireStaff();
  const raw = String(formData.get("rate") ?? "").trim().replace(",", ".");
  const rate = Number(raw);
  if (!Number.isFinite(rate) || rate <= 0) return { status: "error" as const, message: "Geçerli bir kur girin (örn. 0.024)." };
  await setSetting(TRY_USD_RATE_KEY, String(rate));
  revalidatePath("/admin/settings");
  return { status: "success" as const, message: "Kur güncellendi." };
}
