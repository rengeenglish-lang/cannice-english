import "server-only";

/**
 * Transactional email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Off unless RESEND_API_KEY and EMAIL_FROM are set; the sending domain in EMAIL_FROM must be
 * verified in Resend (SPF/DKIM DNS records), or Resend rejects the message.
 */
const API_URL = "https://api.resend.com/emails";

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export class EmailSendError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export type OutgoingEmail = { to: string; subject: string; html: string; text: string; unsubscribeUrl?: string; tag?: string };

export async function sendEmail(email: OutgoingEmail): Promise<{ id: string | null }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new EmailSendError(0, "Email is not configured");
  const headers: Record<string, string> = {};
  if (email.unsubscribeUrl) {
    // RFC 8058 one-click unsubscribe: mail clients POST to this URL.
    headers["List-Unsubscribe"] = `<${email.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers,
      ...(email.tag ? { tags: [{ name: "kind", value: email.tag }] } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new EmailSendError(response.status, `Resend ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json().catch(() => ({}))) as { id?: string };
  return { id: data.id ?? null };
}
