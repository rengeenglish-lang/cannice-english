import "server-only";
import { createHash, randomInt } from "node:crypto";
import { db } from "@/server/db";
import { WHEEL_PRIZES } from "@/lib/wheel-prizes";
import { normalizeWheelEmail } from "@/lib/wheel-email";

export class WheelError extends Error {}

/** One spin per connection within this many days. */
const IP_WINDOW_DAYS = 30;
const DUPLICATE_MESSAGE = "Bu e-posta adresi ya da bu bağlantı çarkı daha önce çevirdi.";

function hashIp(ip: string) {
  return createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex");
}

/** Draws a prize and records it, unless this mailbox or connection has already spun. */
export async function enterWheel(rawEmail: string, ip: string | null): Promise<{ prizeIndex: number }> {
  const email = rawEmail.trim().toLowerCase();
  const normalizedEmail = normalizeWheelEmail(email);
  const ipHash = ip ? hashIp(ip) : null;
  const since = new Date(Date.now() - IP_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const existing = await db.wheelEntry.findFirst({
    where: {
      OR: [{ normalizedEmail }, { email }, ...(ipHash ? [{ ipHash, createdAt: { gte: since } }] : [])],
    },
    select: { id: true },
  });
  if (existing) throw new WheelError(DUPLICATE_MESSAGE);

  const prizeIndex = randomInt(WHEEL_PRIZES.length);
  try {
    await db.wheelEntry.create({
      data: { email, normalizedEmail, ipHash, prize: WHEEL_PRIZES[prizeIndex].id, consentAt: new Date() },
    });
  } catch (error) {
    // Two spins at once: the unique constraint rejects the second one.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw new WheelError(DUPLICATE_MESSAGE);
    }
    throw error;
  }
  return { prizeIndex };
}
