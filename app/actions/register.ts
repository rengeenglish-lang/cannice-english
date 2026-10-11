"use server";

import { safeNextPath } from "@/lib/availability";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { recordRegistrationAttribution } from "@/server/services/seo/conversions.service";
import { registerSchema } from "@/lib/validation/auth";
import { sendWelcomeVerification } from "@/server/services/account-email.service";
import { recordTermsAcceptance, setMarketingConsents } from "@/server/services/consent.service";
import { applyReferral, REFERRAL_COOKIE } from "@/server/services/referrals.service";
import { cookies } from "next/headers";
import { INTEREST_EXAMS, MAX_EXAM_INTERESTS } from "@/lib/exam-interests";
import { setExamInterests } from "@/server/services/exam-interests.service";

export type RegisterFormState = { status: "idle" | "error"; message?: string };

export async function registerAction(_prev: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: "Lütfen bilgilerini kontrol et." };
  if (formData.get("terms") !== "on") return { status: "error", message: "Devam etmek için Üyelik Sözleşmesi'ni kabul etmelisin." };

  const exams = INTEREST_EXAMS.filter((e) => formData.get(`exam-${e.code}`) === "on").map((e) => ({ code: e.code }));
  if (exams.length > MAX_EXAM_INTERESTS) return { status: "error", message: `En fazla ${MAX_EXAM_INTERESTS} sınav seçebilirsin.` };

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { status: "error", message: "Bu e-posta adresi zaten kayıtlı." };

  const password = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: { name: parsed.data.name, email, phone: parsed.data.phone, password, role: "STUDENT" },
  });

  // The exams picked on the form start the countdown bar and filter study material right away.
  if (exams.length) await setExamInterests(user.id, exams).catch((e) => console.error("[exam-interests] save failed", e));
  // First-touch attribution to the article whose register link was used. Never blocks signup.
  await recordRegistrationAttribution(user.id, formData.get("src")).catch(() => undefined);
  // Proof of the sign-up boxes: the required agreement and each optional marketing channel.
  await recordTermsAcceptance(user.id, "REGISTER");
  await setMarketingConsents(
    user.id,
    { marketingEmail: formData.get("marketingEmail") === "on", marketingSms: formData.get("marketingSms") === "on", marketingPhone: formData.get("marketingPhone") === "on" },
    "REGISTER",
  );
  // Signed up through a friend's invite link: link the accounts and give the welcome coupon.
  const store = await cookies();
  await applyReferral(user.id, String(formData.get("ref") || store.get(REFERRAL_COOKIE)?.value || "")).catch((e) => console.error("[referral] apply failed", e));
  store.delete(REFERRAL_COOKIE);
  // Welcome + verification link. Never blocks signup; the dashboard offers a resend.
  await sendWelcomeVerification(user).catch(() => undefined);

  const next = safeNextPath(formData.get("next"));
redirect(`/sign-in?registered=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}
