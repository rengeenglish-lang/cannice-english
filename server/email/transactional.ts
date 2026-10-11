import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/server/db";
import { emailConfigured, sendEmail } from "@/server/email/send";
import type { EmailContent } from "@/lib/email/templates";

/**
 * Sends an account or order email at most once per `key`. The log row is claimed before sending,
 * so a retried webhook, a double click or two overlapping cron runs can't send it twice; if Resend
 * then fails, the claim is released so the next run can try again. Never throws: an email problem
 * must not break checkout, sign-up or payment approval.
 */
export async function sendOnce(key: string, kind: string, to: string, content: EmailContent, extra?: { unsubscribeUrl?: string }) {
  if (!emailConfigured()) return false;
  try {
    await db.emailLog.create({ data: { key, kind, to } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return false; // already sent
    console.error(`[email] could not log ${kind}`);
    return false;
  }
  try {
    await sendEmail({ to, ...content, tag: kind, ...(extra?.unsubscribeUrl ? { unsubscribeUrl: extra.unsubscribeUrl } : {}) });
    return true;
  } catch (error) {
    await db.emailLog.delete({ where: { key } }).catch(() => undefined);
    console.error(`[email] ${kind} failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}

/** Account emails that are fine to send again (a new reset link, a new verification link). */
export async function sendNow(kind: string, to: string, content: EmailContent) {
  if (!emailConfigured()) return false;
  try {
    await sendEmail({ to, ...content, tag: kind });
    return true;
  } catch (error) {
    console.error(`[email] ${kind} failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}
