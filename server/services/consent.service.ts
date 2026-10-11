import "server-only";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { CONSENT_TEXT_VERSION, MARKETING_CHANNELS, type MarketingKey } from "@/lib/consent";

type Source = "REGISTER" | "GOOGLE" | "PROFILE";

/** Who/where for the consent log; outside a request (tests, jobs) it is simply left empty. */
async function requestMeta() {
  try {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || null;
    return { ip, userAgent: h.get("user-agent")?.slice(0, 300) ?? null };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/** Records acceptance of the Üyelik Sözleşmesi. */
export async function recordTermsAcceptance(userId: string, source: Source) {
  const meta = await requestMeta();
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { termsAcceptedAt: new Date() } }),
    db.consentLog.create({ data: { userId, kind: "TERMS", granted: true, textVersion: CONSENT_TEXT_VERSION, source, ...meta } }),
  ]);
}

/**
 * Sets the marketing permissions, logging only the ones that changed (grants and withdrawals),
 * so the log is a clean history of what the person decided and when.
 */
export async function setMarketingConsents(userId: string, wanted: Record<MarketingKey, boolean>, source: Source) {
  const current = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { marketingEmail: true, marketingSms: true, marketingPhone: true } });
  const changed = MARKETING_CHANNELS.filter((c) => current[c.key] !== wanted[c.key]);
  if (!changed.length && source !== "REGISTER") return 0;
  const meta = await requestMeta();
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { marketingEmail: wanted.marketingEmail, marketingSms: wanted.marketingSms, marketingPhone: wanted.marketingPhone } }),
    ...changed.map((c) => db.consentLog.create({ data: { userId, kind: c.kind, granted: wanted[c.key], textVersion: CONSENT_TEXT_VERSION, source, ...meta } })),
  ]);
  return changed.length;
}
