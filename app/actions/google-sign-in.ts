"use server";

import { signIn } from "@/auth";
import { safeNextPath } from "@/lib/availability";
import { parseSource } from "@/lib/seo/attribution";
import { isGoogleConfigured } from "@/server/auth/google";

/** Starts Google sign-in. `next` and the article source tag travel through the post-login hop. */
export async function googleSignInAction(formData: FormData) {
  if (!isGoogleConfigured()) throw new Error("Google sign-in is not configured");
  const next = safeNextPath(formData.get("next"));
  const src = parseSource(formData.get("src")) ? String(formData.get("src")) : null;
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (src) params.set("src", src);
  await signIn("google", { redirectTo: `/hesap/tamamla${params.size ? `?${params}` : ""}` });
}
