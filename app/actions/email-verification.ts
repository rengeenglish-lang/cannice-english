"use server";

import { getAuthContext } from "@/server/auth/context";
import { resendVerification } from "@/server/services/account-email.service";

export type ResendVerificationState = { status: "idle" | "sent" | "verified" | "limited" | "failed" };

export async function resendVerificationAction(): Promise<ResendVerificationState> {
  const user = await getAuthContext();
  if (!user) return { status: "failed" };
  return { status: await resendVerification(user.id) };
}
