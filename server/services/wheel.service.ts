import "server-only";
import { randomInt } from "node:crypto";
import { db } from "@/server/db";
import { WHEEL_PRIZES } from "@/lib/wheel-prizes";

export class WheelError extends Error {}

/** Draws a prize for a new email and records it. Each email can spin once. */
export async function enterWheel(email: string): Promise<{ prizeIndex: number }> {
  const existing = await db.wheelEntry.findUnique({ where: { email } });
  if (existing) throw new WheelError("Bu e-posta adresiyle çarkı zaten çevirdin.");

  const prizeIndex = randomInt(WHEEL_PRIZES.length);
  try {
    await db.wheelEntry.create({
      data: { email, prize: WHEEL_PRIZES[prizeIndex].id, consentAt: new Date() },
    });
  } catch (error) {
    // Two spins for the same email at once: the unique constraint rejects the second one.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw new WheelError("Bu e-posta adresiyle çarkı zaten çevirdin.");
    }
    throw error;
  }
  return { prizeIndex };
}
