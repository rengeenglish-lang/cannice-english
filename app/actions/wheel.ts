"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { enterWheel, WheelError } from "@/server/services/wheel.service";
import { getWheelEnabled } from "@/server/services/settings.service";

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Geçerli bir e-posta adresi gir."),
  consent: z.literal(true, { message: "Devam etmek için kutucuğu işaretlemelisin." }),
});

export type WheelResult = { status: "success"; prizeIndex: number } | { status: "error"; message: string };

async function requestIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || null;
}

export async function wheelStatusAction(): Promise<boolean> {
  return getWheelEnabled();
}

export async function enterWheelAction(input: { email: string; consent: boolean }): Promise<WheelResult> {
  if (!(await getWheelEnabled())) return { status: "error", message: "Çark şu anda kapalı." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bilgileri kontrol et." };
  try {
    const { prizeIndex } = await enterWheel(parsed.data.email, await requestIp());
    return { status: "success", prizeIndex };
  } catch (error) {
    if (error instanceof WheelError) return { status: "error", message: error.message };
    console.error("[wheel] enter failed", error);
    return { status: "error", message: "Bir sorun oluştu. Lütfen tekrar dene." };
  }
}
