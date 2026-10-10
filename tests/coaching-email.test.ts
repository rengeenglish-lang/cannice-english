import { test } from "node:test";
import assert from "node:assert/strict";
import { decideEmails, renderReminderEmail, renderWeeklyReportEmail, unsubscribeToken, verifyUnsubscribeToken, type EmailPrefs } from "../lib/coaching/email";
import type { FollowUpCandidate } from "../lib/coaching/followups";

const prefs: EmailPrefs = { enabled: true, notifyEmail: true, frequency: "NORMAL", pausedUntil: null, quietStart: "22:00", quietEnd: "08:00", timezone: "Europe/Istanbul" };
// 16:00 UTC = 19:00 Istanbul, outside quiet hours.
const evening = new Date("2026-10-12T16:00:00Z");
const c = (kind: FollowUpCandidate["kind"], key: string = kind): FollowUpCandidate => ({ kind, dedupeKey: key, title: `title ${kind}`, href: "/dashboard/kocluk" });

test("email is opt-in and respects pause", () => {
  assert.deepEqual(decideEmails([c("MISSED")], { ...prefs, notifyEmail: false }, evening, 0), []);
  assert.deepEqual(decideEmails([c("MISSED")], { ...prefs, enabled: false }, evening, 0), []);
  assert.deepEqual(decideEmails([c("MISSED")], { ...prefs, pausedUntil: new Date("2026-10-20T00:00:00Z") }, evening, 0), []);
});

test("only email kinds are emailed, at most one non-essential a day, essential first", () => {
  const d = decideEmails([c("SESSION_TODAY"), c("VOCAB_DUE"), c("MISSED"), c("SESSION_SOON"), c("WEEKLY_REPORT", "report:1")], prefs, evening, 0);
  assert.deepEqual(d.map((x) => [x.action, x.candidate.kind]), [["SEND", "WEEKLY_REPORT"], ["SEND", "MISSED"]]);
  // One reminder already sent today: only essential ones remain.
  assert.deepEqual(decideEmails([c("MISSED"), c("MOCK_SCHEDULED")], prefs, evening, 1).map((x) => x.candidate.kind), ["MOCK_SCHEDULED"]);
});

test("quiet hours defer; LOW frequency keeps only essential emails", () => {
  const night = new Date("2026-10-12T20:30:00Z"); // 23:30 Istanbul
  assert.deepEqual(decideEmails([c("WEEKLY_REPORT")], prefs, night, 0).map((x) => x.action), ["DEFER"]);
  assert.deepEqual(decideEmails([c("MISSED"), c("WEEKLY_REPORT")], { ...prefs, frequency: "LOW" }, evening, 0).map((x) => x.candidate.kind), ["WEEKLY_REPORT"]);
});

test("unsubscribe tokens verify only for the user and secret they were made with", () => {
  const t = unsubscribeToken("user_123", "s".repeat(32));
  assert.equal(verifyUnsubscribeToken(t, "s".repeat(32)), "user_123");
  assert.equal(verifyUnsubscribeToken(t, "x".repeat(32)), null);
  const forged = `${Buffer.from("user_999").toString("base64url")}.${t.split(".")[1]}`;
  assert.equal(verifyUnsubscribeToken(forged, "s".repeat(32)), null);
  assert.equal(verifyUnsubscribeToken("garbage", "s".repeat(32)), null);
});

test("reminder emails escape text, list today's tasks and always carry the unsubscribe link", () => {
  const e = renderReminderEmail({
    locale: "tr",
    candidate: { kind: "SESSION_SOON", dedupeKey: "soon:x", title: "Çalışma saatin <yaklaşıyor> & hazır", href: "/dashboard/kocluk" },
    tasks: [{ title: "Konu anlatımı: Tense", minutes: 20 }],
    siteUrl: "https://netfener.com",
    unsubscribeUrl: "https://netfener.com/api/email/unsubscribe?t=abc",
  });
  assert.equal(e.subject, "Bugünkü çalışma planın seni bekliyor");
  assert.ok(e.html.includes("Çalışma saatin &lt;yaklaşıyor&gt; &amp; hazır"));
  assert.ok(!e.html.includes("<yaklaşıyor>"));
  assert.ok(e.html.includes("Konu anlatımı: Tense (20 dk)"));
  assert.ok(e.html.includes('href="https://netfener.com/dashboard/kocluk"'));
  assert.ok(e.html.includes("https://netfener.com/api/email/unsubscribe?t=abc"));
  assert.ok(e.text.includes("E-posta bildirimlerini kapat: https://netfener.com/api/email/unsubscribe?t=abc"));
});

test("the weekly report email shows the week's real numbers in the student's language", () => {
  const report = {
    tasks: { planned: 12, done: 9 },
    consistency: { activeDays: 5, studyDaysPlanned: 6 },
    time: { recordedMinutes: 140, selfMinutes: 40 },
    vocab: { reviewed: 85 },
    achievements: [{ tr: "Kelime tekrarlarını her gün yaptın.", en: "You reviewed vocabulary every day." }],
    attention: [],
    recommendation: { tr: "Çeviri sorularına ağırlık ver.", en: "Focus on translation questions." },
  };
  const tr = renderWeeklyReportEmail({ locale: "tr", report, reportHref: "/dashboard/kocluk/raporlar/r1", siteUrl: "https://netfener.com", unsubscribeUrl: "https://netfener.com/u" });
  assert.equal(tr.subject, "Haftalık raporun: 9/12 görev tamamlandı");
  for (const s of ["9/12", "5/6", "180 dk", "85", "Kelime tekrarlarını her gün yaptın.", "Gelecek hafta için önerimiz: Çeviri sorularına ağırlık ver.", "https://netfener.com/dashboard/kocluk/raporlar/r1"]) assert.ok(tr.html.includes(s), s);
  assert.ok(!tr.html.includes("Dikkat etmen gerekenler"), "empty sections are left out");
  const en = renderWeeklyReportEmail({ locale: "en", report: { ...report, tasks: { planned: 0, done: 0 } }, reportHref: "/r", siteUrl: "https://netfener.com", unsubscribeUrl: "https://netfener.com/u" });
  assert.equal(en.subject, "Your weekly progress report is ready");
  assert.ok(en.text.includes("Focus on translation questions."));
});
