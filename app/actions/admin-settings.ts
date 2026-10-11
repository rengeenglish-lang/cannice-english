"use server";
import { revalidatePath } from "next/cache";
import { getAuthContext, requireStaff } from "@/server/auth/context";
import { saveSpeakingClub, setSetting, TRY_USD_RATE_KEY } from "@/server/services/settings.service";

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

export type SpeakingClubState = { status: "idle" | "error" | "success"; message?: string };

/** Only admins set the Speaking Club meeting link; students only ever see it as the "Derse Katıl" button. */
export async function updateSpeakingClubAction(_prev: SpeakingClubState, formData: FormData): Promise<SpeakingClubState> {
  const actor = await getAuthContext();
  if (!actor || actor.role !== "ADMIN") return { status: "error", message: "Yönetici oturumu gerekli." };
  const url = String(formData.get("url") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "").trim().slice(0, 200);
  const note = String(formData.get("note") ?? "").trim().slice(0, 600);
  if (url && !/^https:\/\/[^\s]+$/i.test(url)) return { status: "error", message: "Bağlantı https:// ile başlamalı (Zoom, Google Meet, Teams vb.)." };
  await saveSpeakingClub({ url, schedule, note });
  revalidatePath("/admin/speaking-club");
  revalidatePath("/dashboard");
  return { status: "success", message: "Speaking Club bilgileri kaydedildi." };
}
