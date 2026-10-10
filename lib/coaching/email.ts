/**
 * Coaching emails: which follow-ups also go out by email, when, and what they look like. Pure (no
 * DB, no network) so the rules and templates are unit-tested; delivery lives in
 * server/services/coaching/followups.service.ts and server/email/send.ts.
 *
 * Email is opt-in (CoachingProfile.notifyEmail) and deliberately quieter than in-app: only the
 * kinds below, at most one non-essential reminder per local day, never in quiet hours, and every
 * message carries a one-click unsubscribe link.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { ESSENTIAL, type FollowUpCandidate, type FollowUpKind } from "@/lib/coaching/followups";
import { inQuietHours, localTime } from "@/lib/coaching/time";

export const EMAIL_KINDS: ReadonlySet<FollowUpKind> = new Set(["SESSION_SOON", "MISSED", "INACTIVE", "MOCK_SCHEDULED", "WEEKLY_REPORT"]);
/** Non-essential reminder emails per local day. */
export const EMAIL_DAILY_CAP = 1;

export type EmailPrefs = {
  enabled: boolean;
  notifyEmail: boolean;
  frequency: string;
  pausedUntil: Date | null;
  quietStart: string;
  quietEnd: string;
  timezone: string;
};

export type EmailDecision = { action: "SEND"; candidate: FollowUpCandidate } | { action: "DEFER"; candidate: FollowUpCandidate };

/**
 * Picks the follow-ups to email now. Anything not returned is simply not emailed (no log entry), so
 * turning email on later never triggers a backlog. Quiet hours defer; the daily cap drops the rest.
 */
export function decideEmails(candidates: FollowUpCandidate[], prefs: EmailPrefs, now: Date, nonEssentialSentToday: number): EmailDecision[] {
  if (!prefs.enabled || !prefs.notifyEmail) return [];
  if (prefs.pausedUntil && prefs.pausedUntil > now) return [];
  const out: EmailDecision[] = [];
  let budget = Math.max(0, EMAIL_DAILY_CAP - nonEssentialSentToday);
  const quiet = inQuietHours(localTime(now, prefs.timezone), prefs.quietStart, prefs.quietEnd);
  // Essential first, so a busy day never crowds out the weekly report or a mock-exam notice.
  const ordered = [...candidates].filter((c) => EMAIL_KINDS.has(c.kind)).sort((a, b) => Number(ESSENTIAL.has(b.kind)) - Number(ESSENTIAL.has(a.kind)));
  for (const candidate of ordered) {
    const essential = ESSENTIAL.has(candidate.kind);
    if (!essential && prefs.frequency === "LOW") continue;
    if (quiet) {
      out.push({ action: "DEFER", candidate });
      continue;
    }
    if (!essential) {
      if (budget <= 0) continue;
      budget -= 1;
    }
    out.push({ action: "SEND", candidate });
  }
  return out;
}

// ---------- unsubscribe token ----------

const sign = (userId: string, secret: string) => createHmac("sha256", secret).update(`coaching-email:${userId}`).digest("base64url");

export function unsubscribeToken(userId: string, secret: string) {
  return `${Buffer.from(userId).toString("base64url")}.${sign(userId, secret)}`;
}

/** Returns the user id when the token is genuine, else null. */
export function verifyUnsubscribeToken(token: string, secret: string): string | null {
  const [idPart, sig] = token.split(".");
  if (!idPart || !sig) return null;
  const userId = Buffer.from(idPart, "base64url").toString();
  if (!userId) return null;
  const expected = Buffer.from(sign(userId, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given) ? userId : null;
}

// ---------- templates ----------

export type EmailContent = { subject: string; html: string; text: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type Locale = "tr" | "en";
const L = (locale: string): Locale => (locale === "en" ? "en" : "tr");

const COPY = {
  tr: {
    subject: {
      SESSION_SOON: "Bugünkü çalışma planın seni bekliyor",
      MISSED: "Dünkü planın yarım kaldı — bugün kısa bir tekrarla devam et",
      INACTIVE: "Kaldığın yerden devam edelim mi?",
      MOCK_SCHEDULED: "Bugün deneme günü",
    } as Record<string, string>,
    open: "Planımı aç",
    today: "Bugünkü görevlerin",
    minutes: (n: number) => `${n} dk`,
    footer: "Bu e-postayı Netfener Öğrenci Koçluğu'nda e-posta bildirimlerini açtığın için aldın.",
    unsubscribe: "E-posta bildirimlerini kapat",
    settings: "Bildirim ayarları",
    report: {
      subject: (done: number, planned: number) => (planned ? `Haftalık raporun: ${done}/${planned} görev tamamlandı` : "Haftalık ilerleme raporun hazır"),
      heading: "Haftalık ilerleme raporun",
      tasks: "Tamamlanan görev",
      days: "Çalıştığın gün",
      minutes: "Kayıtlı çalışma",
      vocab: "Tekrar edilen kelime",
      achievements: "Bu hafta iyi gidenler",
      attention: "Dikkat etmen gerekenler",
      next: "Gelecek hafta için önerimiz",
      open: "Raporun tamamını gör",
    },
  },
  en: {
    subject: {
      SESSION_SOON: "Your study plan for today is waiting",
      MISSED: "Yesterday's plan was left unfinished — pick it up with a short review",
      INACTIVE: "Shall we pick up where you left off?",
      MOCK_SCHEDULED: "Today is mock exam day",
    } as Record<string, string>,
    open: "Open my plan",
    today: "Today's tasks",
    minutes: (n: number) => `${n} min`,
    footer: "You're receiving this because you turned on email notifications in Netfener Student Coaching.",
    unsubscribe: "Turn off email notifications",
    settings: "Notification settings",
    report: {
      subject: (done: number, planned: number) => (planned ? `Your weekly report: ${done}/${planned} tasks done` : "Your weekly progress report is ready"),
      heading: "Your weekly progress report",
      tasks: "Tasks done",
      days: "Days studied",
      minutes: "Study time logged",
      vocab: "Words reviewed",
      achievements: "What went well",
      attention: "Watch out for",
      next: "Our suggestion for next week",
      open: "See the full report",
    },
  },
};

type Frame = {
  locale: Locale;
  heading: string;
  intro: string[];
  stats?: { label: string; value: string }[];
  lists?: { title: string; items: string[] }[];
  cta: { label: string; href: string };
  siteUrl: string;
  unsubscribeUrl: string;
};

const GREEN = "#0b6b3a";

function frame(f: Frame): { html: string; text: string } {
  const c = COPY[f.locale];
  const p = (s: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:24px;color:#10291c">${esc(s)}</p>`;
  const stats = f.stats?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px"><tr>${f.stats
        .map((s) => `<td style="padding:12px;background:#edf5ef;border-radius:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:${GREEN}">${esc(s.value)}</div><div style="font-size:12px;color:#55665c">${esc(s.label)}</div></td>`)
        .join('<td style="width:8px"></td>')}</tr></table>`
    : "";
  const lists = (f.lists ?? [])
    .filter((l) => l.items.length)
    .map((l) => `<p style="margin:18px 0 6px;font-size:14px;font-weight:700;color:#10291c">${esc(l.title)}</p><ul style="margin:0;padding-left:20px">${l.items.map((i) => `<li style="margin:0 0 6px;font-size:15px;line-height:22px;color:#10291c">${esc(i)}</li>`).join("")}</ul>`)
    .join("");
  const html = `<!doctype html><html lang="${f.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(f.heading)}</title></head>
<body style="margin:0;padding:0;background:#f6faf7;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf7"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #d8e8dd;border-radius:16px">
<tr><td style="padding:22px 28px;border-bottom:1px solid #d8e8dd"><a href="${esc(f.siteUrl)}" style="font-size:20px;font-weight:700;color:${GREEN};text-decoration:none">Netfener</a></td></tr>
<tr><td style="padding:26px 28px 8px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:28px;color:#10291c">${esc(f.heading)}</h1>
${f.intro.map(p).join("")}${stats}${lists}
<p style="margin:22px 0 6px"><a href="${esc(f.cta.href)}" style="display:inline-block;background:${GREEN};color:#ffffff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px;text-decoration:none">${esc(f.cta.label)}</a></p>
</td></tr>
<tr><td style="padding:18px 28px 24px;font-size:12px;line-height:18px;color:#55665c">${esc(c.footer)}<br><a href="${esc(f.unsubscribeUrl)}" style="color:#55665c">${esc(c.unsubscribe)}</a> · <a href="${esc(f.siteUrl)}/dashboard/kocluk/ayarlar" style="color:#55665c">${esc(c.settings)}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    f.heading,
    "",
    ...f.intro,
    ...(f.stats?.length ? ["", ...f.stats.map((s) => `${s.label}: ${s.value}`)] : []),
    ...(f.lists ?? []).filter((l) => l.items.length).flatMap((l) => ["", `${l.title}:`, ...l.items.map((i) => `- ${i}`)]),
    "",
    `${f.cta.label}: ${f.cta.href}`,
    "",
    "--",
    c.footer,
    `${c.unsubscribe}: ${f.unsubscribeUrl}`,
  ].join("\n");
  return { html, text };
}

export type ReminderInput = {
  locale: string;
  candidate: FollowUpCandidate;
  /** Today's open tasks (shown in the study-time reminder). */
  tasks?: { title: string; minutes: number }[];
  siteUrl: string;
  unsubscribeUrl: string;
};

export function renderReminderEmail(input: ReminderInput): EmailContent {
  const locale = L(input.locale);
  const c = COPY[locale];
  const subject = c.subject[input.candidate.kind] ?? input.candidate.title;
  const { html, text } = frame({
    locale,
    heading: subject,
    intro: [input.candidate.title, ...(input.candidate.body ? [input.candidate.body] : [])],
    lists: input.tasks?.length ? [{ title: c.today, items: input.tasks.slice(0, 6).map((t) => `${t.title} (${c.minutes(t.minutes)})`) }] : [],
    cta: { label: c.open, href: `${input.siteUrl}${input.candidate.href}` },
    siteUrl: input.siteUrl,
    unsubscribeUrl: input.unsubscribeUrl,
  });
  return { subject, html, text };
}

type Bilingual = { tr: string; en: string };
/** The fields of a stored weekly CoachingReport the email uses (see server/services/coaching/reports.service.ts). */
export type WeeklyReportSummary = {
  tasks: { planned: number; done: number };
  consistency: { activeDays: number; studyDaysPlanned: number };
  time: { recordedMinutes: number; selfMinutes: number };
  vocab: { reviewed: number };
  achievements: Bilingual[];
  attention: Bilingual[];
  recommendation: Bilingual;
};

export function renderWeeklyReportEmail(input: { locale: string; report: WeeklyReportSummary; reportHref: string; siteUrl: string; unsubscribeUrl: string }): EmailContent {
  const locale = L(input.locale);
  const r = COPY[locale].report;
  const d = input.report;
  const minutes = d.time.recordedMinutes + d.time.selfMinutes;
  const pick = (b: Bilingual) => b[locale];
  const subject = r.subject(d.tasks.done, d.tasks.planned);
  const { html, text } = frame({
    locale,
    heading: r.heading,
    intro: [`${r.next}: ${pick(d.recommendation)}`],
    stats: [
      { label: r.tasks, value: `${d.tasks.done}/${d.tasks.planned}` },
      { label: r.days, value: `${d.consistency.activeDays}/${d.consistency.studyDaysPlanned}` },
      { label: r.minutes, value: COPY[locale].minutes(minutes) },
      { label: r.vocab, value: String(d.vocab.reviewed) },
    ],
    lists: [
      { title: r.achievements, items: d.achievements.slice(0, 3).map(pick) },
      { title: r.attention, items: d.attention.slice(0, 3).map(pick) },
    ],
    cta: { label: r.open, href: `${input.siteUrl}${input.reportHref}` },
    siteUrl: input.siteUrl,
    unsubscribeUrl: input.unsubscribeUrl,
  });
  return { subject, html, text };
}
