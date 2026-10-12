"use server";

import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { saveSpeakingClubRooms, submitPlacement } from "@/server/services/speaking-club.service";
import { CLUB_GROUPS } from "@/lib/speaking-club";

export async function submitPlacementAction(form: FormData) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in?next=/dashboard/speaking-club/seviye-testi");
  const answers: Record<string, number> = {};
  for (const [key, value] of form.entries()) {
    if (key.startsWith("q_")) answers[key.slice(2)] = Number(value);
  }
  await submitPlacement(user.id, answers);
  revalidatePath("/dashboard");
  redirect("/dashboard/speaking-club?sonuc=1");
}

export type RoomsFormState = { status: "idle" | "success" | "error"; message?: string };

export async function saveSpeakingClubRoomsAction(_prev: RoomsFormState, form: FormData): Promise<RoomsFormState> {
  const user = await getAuthContext();
  if (!user || user.role !== "ADMIN") forbidden();
  try {
    await saveSpeakingClubRooms({
      rooms: CLUB_GROUPS.map((g) => ({ key: g.key, url: String(form.get(`url_${g.key}`) ?? ""), schedule: String(form.get(`schedule_${g.key}`) ?? "") })),
      note: String(form.get("note") ?? ""),
    });
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
  revalidatePath("/admin/speaking-club");
  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Speaking Club odaları kaydedildi." };
}
