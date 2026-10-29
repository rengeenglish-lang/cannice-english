"use server";

import { z } from "zod";
import { enterWheel, WheelError } from "@/server/services/wheel.service";

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Geçerli bir e-posta adresi gir."),
  consent: z.literal(true, { message: "Devam etmek için kutucuğu işaretlemelisin." }),
});

export type WheelResult = { status: "success"; prizeIndex: number } | { status: "error"; message: string };

export async function enterWheelAction(input: { email: string; consent: boolean }): Promise<WheelResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bilgileri kontrol et." };
  try {
    const { prizeIndex } = await enterWheel(parsed.data.email);
    return { status: "success", prizeIndex };
  } catch (error) {
    if (error instanceof WheelError) return { status: "error", message: error.message };
    console.error("[wheel] enter failed", error);
    return { status: "error", message: "Bir sorun oluştu. Lütfen tekrar dene." };
  }
}
