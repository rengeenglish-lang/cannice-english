"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/server/auth/context";
import { setMarketingConsents } from "@/server/services/consent.service";

export type MarketingPrefsState = { status: "idle" | "success" | "error"; message?: string };

export async function updateMarketingPrefsAction(_prev: MarketingPrefsState, formData: FormData): Promise<MarketingPrefsState> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturum açman gerekiyor." };
  const changed = await setMarketingConsents(
    user.id,
    { marketingEmail: formData.get("marketingEmail") === "on", marketingSms: formData.get("marketingSms") === "on", marketingPhone: formData.get("marketingPhone") === "on" },
    "PROFILE",
  );
  revalidatePath("/dashboard/profile");
  return { status: "success", message: changed ? "İletişim tercihlerin güncellendi." : "Değişiklik yok." };
}
