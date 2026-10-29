/**
 * Reduces an email to the address it actually reaches, so one mailbox can't spin the wheel again
 * under a different spelling: Gmail ignores dots and "+tag" parts, and "+tag" aliases are common
 * on other providers too.
 */
export function normalizeWheelEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  let local = email.slice(0, at).split("+")[0];
  let domain = email.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}
