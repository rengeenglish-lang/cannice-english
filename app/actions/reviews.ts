"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { upsertReview, deleteReview } from "@/server/services/reviews.service";

export type ReviewFormState = { status: "idle" | "error"; message?: string };

export async function upsertReviewAction(productId: string, _prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "1 ile 5 arasında bir puan seçin." };
  }
  await upsertReview(user.id, productId, { rating, comment: String(formData.get("comment") ?? "") });
  revalidatePath("/dashboard/reviews");
  return { status: "idle", message: "Yorumunuz kaydedildi." };
}

export async function deleteReviewAction(id: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  await deleteReview(id, user.id);
  revalidatePath("/dashboard/reviews");
}
