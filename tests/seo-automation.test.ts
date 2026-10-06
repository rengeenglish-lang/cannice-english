import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { backoffMs, inventoryDedupeKey, syncDedupeKey, syncWindows, weekKey, AUTOMATION_KEY } from "../lib/seo/automation";
import { budgetState, canReserve, monthKey } from "../lib/seo/budget";
import { cancelJob, enqueueJob, planRecurringJobs, retryJob, runDueJobs, listJobs } from "../server/services/seo/jobs.service";
import { isAutomationStopped, readAutomation, setAutomation } from "../server/services/seo/automation.service";
import { BudgetError, getBudgetReport, releaseAiUsage, reserveAiBudget, settleAiUsage } from "../server/services/seo/budget.service";
import { SEO_SETTINGS_KEY, DEFAULT_SEO_SETTINGS } from "../lib/seo/settings";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
let savedAuto: string | null = null;
let savedSettings: string | null = null;
before(async () => {
  savedAuto = (await db.appSetting.findUnique({ where: { key: AUTOMATION_KEY } }))?.value ?? null;
  savedSettings = (await db.appSetting.findUnique({ where: { key: SEO_SETTINGS_KEY } }))?.value ?? null;
  await db.seoJob.deleteMany({});
  await db.appSetting.deleteMany({ where: { key: AUTOMATION_KEY } });
});
after(async () => {
  await db.seoJob.deleteMany({});
  await db.seoAiUsage.deleteMany({});
  for (const [key, value] of [[AUTOMATION_KEY, savedAuto], [SEO_SETTINGS_KEY, savedSettings]] as const) {
    if (value) await db.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
    else await db.appSetting.deleteMany({ where: { key } });
  }
  await db.$disconnect();
});

test("scheduling helpers: backoff, Search Console windows and weekly keys", () => {
  assert.deepEqual([1, 2, 3, 4, 9].map(backoffMs), [300_000, 1_800_000, 10_800_000, 6 * 3_600_000, 6 * 3_600_000]);
  const w = syncWindows(new Date("2026-10-07T10:00:00Z"));
  assert.deepEqual(w[0], { start: "2026-09-07", end: "2026-10-04" });
  assert.deepEqual(w[1], { start: "2026-08-10", end: "2026-09-06" });
  assert.equal(weekKey(new Date("2026-10-07T10:00:00Z")), "2026-10-05"); // Monday
  assert.equal(weekKey(new Date("2026-10-11T23:59:00Z")), "2026-10-05");
  assert.equal(weekKey(new Date("2026-10-12T00:00:00Z")), "2026-10-12");
  assert.notEqual(inventoryDedupeKey(new Date("2026-10-07T10:00:00Z")), inventoryDedupeKey(new Date("2026-10-13T10:00:00Z")));
  assert.equal(syncDedupeKey("PAGES", w[0]), "SEARCH_SYNC:PAGES:2026-09-07:2026-10-04");
});

test("budget math never treats zero as unlimited and warns at 50/75/90/100%", () => {
  assert.equal(canReserve(budgetState(0, 0, 0), 0.01), false);
  assert.equal(canReserve(budgetState(10, 4, 3), 3), true);
  assert.equal(canReserve(budgetState(10, 4, 3), 3.01), false);
  assert.deepEqual([4, 5, 7.5, 9, 10].map((u) => budgetState(10, u, 0).warning), [0, 0.5, 0.75, 0.9, 1]);
  assert.equal(budgetState(0, 0, 0).warning, 0);
  assert.equal(monthKey(new Date("2026-10-31T23:00:00Z")), "2026-10");
});

test("emergency stop: permissions, revision checks, cancels queued work and halts the runner", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Auto admin", email: `auto-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Auto teacher", email: `auto-t-${stamp}@example.test`, role: "TEACHER" } });
  try {
    await assert.rejects(() => setAutomation(teacher.id, { revision: 0, emergencyStop: true }));
    assert.equal(await isAutomationStopped(), false);
    await enqueueJob("INVENTORY_REFRESH", {}, `stop-test-${stamp}`);
    const stopped = await setAutomation(admin.id, { revision: 0, emergencyStop: true });
    assert.equal(stopped.state.emergencyStop, true);
    await assert.rejects(() => setAutomation(admin.id, { revision: 0, autoSync: true }), /başka bir sekmede/);
    assert.equal(await isAutomationStopped(), true);
    assert.equal((await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `stop-test-${stamp}` } })).status, "CANCELLED");
    assert.equal((await runDueJobs()).stopped, true);
    assert.equal((await planRecurringJobs()).planned, 0);
    assert.equal(await db.seoActivityLog.count({ where: { actorId: admin.id, action: "EMERGENCY_STOP" } }), 1);
    // Corrupted settings fail safe (stopped).
    await db.appSetting.update({ where: { key: AUTOMATION_KEY }, data: { value: "{broken" } });
    assert.equal(await isAutomationStopped(), true);
    await db.appSetting.update({ where: { key: AUTOMATION_KEY }, data: { value: JSON.stringify(stopped) } });
    const resumed = await setAutomation(admin.id, { revision: stopped.revision, emergencyStop: false });
    assert.equal(resumed.state.emergencyStop, false);
    assert.equal((await readAutomation()).revision, resumed.revision);
    // Cancelled jobs stay cancelled until an admin retries them.
    const job = await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `stop-test-${stamp}` } });
    await assert.rejects(() => retryJob(teacher.id, { id: job.id }));
    await retryJob(admin.id, { id: job.id });
    assert.equal((await db.seoJob.findUniqueOrThrow({ where: { id: job.id } })).status, "QUEUED");
    await cancelJob(admin.id, { id: job.id });
    await assert.rejects(() => cancelJob(admin.id, { id: job.id }), /Yalnızca sıradaki/);
    assert.ok((await listJobs(admin.id)).length >= 1);
    await assert.rejects(() => listJobs(teacher.id));
  } finally {
    await db.seoJob.deleteMany({});
    await db.appSetting.deleteMany({ where: { key: AUTOMATION_KEY } });
    await db.seoActivityLog.deleteMany({ where: { actorId: { in: [admin.id, teacher.id] } } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, teacher.id] } } });
  }
});

test("jobs are idempotent, retried with backoff, never double-run, and recover from stale locks", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Job admin", email: `job-${stamp}@example.test`, role: "ADMIN" } });
  try {
    await db.seoJob.deleteMany({});
    assert.equal(await enqueueJob("INVENTORY_REFRESH", {}, `inv-${stamp}`), true);
    assert.equal(await enqueueJob("INVENTORY_REFRESH", {}, `inv-${stamp}`), false);
    // Two runners racing for one due job: exactly one executes it.
    const [a, b] = await Promise.all([runDueJobs(new Date(), 5), runDueJobs(new Date(), 5)]);
    assert.equal(a.ran + b.ran, 1);
    const done = await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `inv-${stamp}` } });
    assert.equal(done.status, "SUCCEEDED");
    assert.equal(done.attempts, 1);
    assert.equal((await runDueJobs()).ran, 0); // finished jobs are not re-run

    // A failing job is retried with backoff, then parked as FAILED with its error and an audit trail.
    await enqueueJob("SEARCH_SYNC", { kind: "NOPE" }, `bad-${stamp}`);
    const base = new Date();
    const first = await runDueJobs(base);
    assert.equal(first.retried, 1);
    let bad = await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `bad-${stamp}` } });
    assert.equal(bad.status, "QUEUED");
    assert.equal(bad.attempts, 1);
    assert.ok(bad.runAt.getTime() >= base.getTime() + 299_000);
    assert.equal((await runDueJobs(new Date(base.getTime() + 60_000))).ran, 0); // backoff respected
    await runDueJobs(new Date(base.getTime() + 10 * 60_000));
    const last = await runDueJobs(new Date(base.getTime() + 24 * 3_600_000));
    assert.equal(last.failed, 1);
    bad = await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `bad-${stamp}` } });
    assert.equal(bad.status, "FAILED");
    assert.equal(bad.attempts, 3);
    assert.ok(bad.lastError);
    assert.equal(await db.seoActivityLog.count({ where: { action: "JOB_FAILED", actorId: null } }) >= 1, true);
    await retryJob(admin.id, { id: bad.id });
    assert.equal((await db.seoJob.findUniqueOrThrow({ where: { id: bad.id } })).attempts, 0);

    // A crashed runner's lock expires and the job is picked up again.
    await db.seoJob.deleteMany({});
    await enqueueJob("INVENTORY_REFRESH", {}, `stale-${stamp}`);
    await db.seoJob.update({ where: { dedupeKey: `stale-${stamp}` }, data: { status: "RUNNING", lockedAt: new Date(Date.now() - 3_600_000), attempts: 1 } });
    assert.equal((await runDueJobs()).succeeded, 1);
    // A fresh lock is respected.
    await enqueueJob("INVENTORY_REFRESH", {}, `fresh-${stamp}`);
    await db.seoJob.update({ where: { dedupeKey: `fresh-${stamp}` }, data: { status: "RUNNING", lockedAt: new Date() } });
    assert.equal((await runDueJobs()).ran, 0);
  } finally {
    await db.seoJob.deleteMany({});
    await db.seoActivityLog.deleteMany({ where: { OR: [{ actorId: admin.id }, { actorId: null, action: { in: ["JOB_FAILED", "JOB_RETRY_SCHEDULED", "INVENTORY_REFRESHED"] } }] } });
    await db.user.deleteMany({ where: { id: admin.id } });
  }
});

test("recurring planning needs autoSync, plans Search Console only when connected, and is idempotent", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Plan admin", email: `plan-${stamp}@example.test`, role: "ADMIN" } });
  try {
    await db.seoJob.deleteMany({});
    assert.equal((await planRecurringJobs()).planned, 0); // off by default
    await setAutomation(admin.id, { revision: (await readAutomation()).revision, autoSync: true });
    const now = new Date("2026-10-07T10:00:00Z");
    const plan = await planRecurringJobs(now);
    assert.equal(plan.planned, 1); // GSC not configured here -> only the inventory refresh
    assert.equal((await planRecurringJobs(now)).planned, 0);
    assert.equal((await planRecurringJobs(new Date("2026-10-09T10:00:00Z"))).planned, 0); // same week
    assert.equal((await planRecurringJobs(new Date("2026-10-13T10:00:00Z"))).planned, 1); // next week
    assert.deepEqual([...new Set((await db.seoJob.findMany()).map((j) => j.type))], ["INVENTORY_REFRESH"]);
  } finally {
    await db.seoJob.deleteMany({});
    await db.appSetting.deleteMany({ where: { key: AUTOMATION_KEY } });
    await db.seoActivityLog.deleteMany({ where: { actorId: admin.id } });
    await db.user.deleteMany({ where: { id: admin.id } });
  }
});

test("AI budget ledger: reservations serialize, cap zero blocks, releases free budget, settlements use actuals", async () => {
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Budget admin", email: `bud-${stamp}@example.test`, role: "ADMIN" } });
  const setCap = (cap: number) => {
    const value = JSON.stringify({ revision: 1, settings: { ...DEFAULT_SEO_SETTINGS, monthlyBudgetUsd: cap } });
    return db.appSetting.upsert({ where: { key: SEO_SETTINGS_KEY }, create: { key: SEO_SETTINGS_KEY, value }, update: { value } });
  };
  const req = (usd: number) => ({ provider: "TEST", model: "m", operation: "generate", estimatedUsd: usd });
  try {
    await db.seoAiUsage.deleteMany({});
    await setCap(0);
    await assert.rejects(() => reserveAiBudget(req(0.01)), BudgetError);
    await setCap(10);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => reserveAiBudget(req(3))));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 3); // 3 x $3 fits under $10, the rest are refused
    assert.equal(await db.seoAiUsage.count(), 3);
    const rows = await db.seoAiUsage.findMany();
    await releaseAiUsage(rows[0].id);
    const again = await reserveAiBudget(req(3));
    assert.equal(again.warning, 0.9);
    await settleAiUsage(rows[1].id, { usd: 1, inputTokens: 100, outputTokens: 200 });
    const report = await getBudgetReport(admin.id);
    assert.equal(Math.round(report.state.spent * 100), 100);
    assert.equal(Math.round(report.state.reserved * 100), 600);
    assert.equal(report.state.warning, 0.5);
    await assert.rejects(() => settleAiUsage(rows[1].id, { usd: 1 }), BudgetError); // cannot settle twice
    await db.user.update({ where: { id: admin.id }, data: { role: "TEACHER" } });
    await assert.rejects(() => getBudgetReport(admin.id));
  } finally {
    await db.seoAiUsage.deleteMany({});
    await db.user.deleteMany({ where: { id: admin.id } });
  }
});
