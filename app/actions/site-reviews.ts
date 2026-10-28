"use server";

import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import {
  approveSiteReview,
  createReviewVideoUpload,
  rejectSiteReview,
  setReviewPromotion,
  setSiteReviewFeatured,
  submitSiteReview,
} from "@/server/services/site-reviews.service";

export type ReviewUploadResult = { ok: true; key: string; url: string } | { ok: false; message: string };

/** Step 1 of a video review: a signed URL the browser uploads the file to (straight to R2). */
export async function requestReviewUploadAction(contentType: string, size: number): Promise<ReviewUploadResult> {
  const user = await getAuthContext();
  if (!user) return { ok: false, message: "Oturum açman gerekiyor." };
  try {
    return { ok: true, ...(await createReviewVideoUpload(user.id, contentType, size)) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Yükleme başlatılamadı." };
  }
}

export type SiteReviewFormState = { status: "idle" | "success" | "error"; message?: string; couponCode?: string; percent?: number; ebookUnlocked?: boolean; trialEndsAt?: string };

export async function submitSiteReviewAction(_prev: SiteReviewFormState, form: FormData): Promise<SiteReviewFormState> {
  const user = await getAuthContext();
  if (!user) return { status: "error", message: "Oturum açman gerekiyor." };
  try {
    const result = await submitSiteReview(user, {
      kind: form.get("kind") === "VIDEO" ? "VIDEO" : "TEXT",
      rating: Number(form.get("rating")),
      displayName: String(form.get("displayName") ?? ""),
      examCode: String(form.get("examCode") ?? "") || null,
      body: String(form.get("body") ?? ""),
      videoKey: String(form.get("videoKey") ?? "") || null,
      videoLink: String(form.get("videoLink") ?? "") || null,
      usageConsent: form.get("usageConsent") === "on",
      videoSeconds: Number(form.get("videoSeconds")) || null,
      confirmsMaxLength: form.get("confirmsMaxLength") === "on",
    });
    revalidatePath("/dashboard/reviews");
    revalidatePath("/admin/yorumlar");
    revalidatePath("/dashboard/books");
    revalidatePath("/dashboard");
    return {
      status: "success", couponCode: result.coupon?.code, percent: result.percent,
      ebookUnlocked: Boolean(result.ebookReward?.unlockedAt),
      trialEndsAt: result.ebookReward?.trialSubscription?.expiresAt.toISOString(),
      message: result.ebookReward?.unlockedAt ? "Yorumun alındı. Kampanya süresince tüm e-kitap PDF’lerin açıldı; 7 günlük dijital deneme hakkın hesabına tanımlandı." : `Yorumun alındı ve incelemeye gönderildi.${result.rewardMessage ? ` (${result.rewardMessage})` : ""}`,
    };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Yorum gönderilemedi." };
  }
}

async function requireAdmin() {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") forbidden();
  return user;
}

function refresh() {
  revalidatePath("/admin/yorumlar");
  revalidatePath("/yorumlar");
  revalidatePath("/");
}

export async function approveSiteReviewAction(id: string) {
  const admin = await requireAdmin();
  await approveSiteReview(id, admin.id);
  refresh();
}

export async function rejectSiteReviewAction(id: string, form: FormData) {
  const admin = await requireAdmin();
  await rejectSiteReview(id, admin.id, String(form.get("reason") ?? ""));
  refresh();
}

export async function featureSiteReviewAction(id: string, featured: boolean) {
  await requireAdmin();
  await setSiteReviewFeatured(id, featured);
  refresh();
}

export async function toggleReviewPromotionAction(on: boolean) {
  await requireAdmin();
  await setReviewPromotion(on);
  revalidatePath("/admin/yorumlar");
  revalidatePath("/dashboard/reviews");
}
