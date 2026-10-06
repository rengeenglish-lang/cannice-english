import { test, after } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, randomUUID, createVerify } from "node:crypto";
import { db } from "../server/db";
import {
  comparablePrevious,
  expectedCtr,
  findDecay,
  findQuickWins,
  mergeRows,
  normalizePage,
  parsePerformanceCsv,
  periodSchema,
  recommendRefresh,
  type PerfRow,
} from "../lib/seo/performance";
import { GscError, fetchGscRows, readGscConfig, signServiceJwt } from "../lib/seo/gsc";
import {
  getPerformanceReport,
  importSearchCsv,
  listSnapshots,
  syncSearchConsole,
} from "../server/services/seo/performance.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());
const row = (o: Partial<PerfRow>): PerfRow => ({ page: "/blog/a", query: "", clicks: 10, impressions: 1000, ctr: 0.01, position: 8, ...o });

test("page normalization and CSV parsing validate rather than guess", () => {
  assert.equal(normalizePage("https://www.netfener.com/blog/x/?utm=1#h", "netfener.com"), "/blog/x");
  assert.equal(normalizePage("https://evil.example/blog/x", "netfener.com"), null);
  assert.equal(normalizePage("blog/x", "netfener.com"), null);
  assert.equal(normalizePage("https://netfener.com/", "netfener.com"), "/");
  const csv = [
    "En çok görüntülenen sayfalar,Tıklamalar,Gösterimler,TO,Konum",
    "https://netfener.com/blog/yds,\"1.250\",\"12.500\",\"10,0%\",\"8,2\"",
    "https://netfener.com/blog/yds/,5,50,10%,3", // duplicate after normalization
    "https://other.example/x,1,2,50%,1", // foreign host
    "https://netfener.com/blog/bad,9,5,10%,1", // clicks > impressions
    "https://netfener.com/exams/ydt,3,100,3.0%,12.5",
    "broken,line",
  ].join("\n");
  const { rows, dropped } = parsePerformanceCsv(csv, "PAGES", "netfener.com");
  assert.deepEqual(rows.map((r) => r.page), ["/blog/yds", "/exams/ydt"]);
  assert.equal(rows[0].impressions, 12500);
  assert.equal(rows[0].ctr, 0.1);
  assert.equal(rows[0].position, 8.2);
  assert.equal(dropped, 5); // header, duplicate, foreign, impossible, malformed
  const q = parsePerformanceCsv("Top queries;Clicks;Impressions;CTR;Position\nyds deneme;4;200;2%;9,5", "QUERIES", "netfener.com");
  assert.deepEqual(q.rows.map((r) => [r.query, r.page, r.position]), [["yds deneme", "", 9.5]]);
  assert.equal(periodSchema.safeParse({ start: "2026-09-01", end: "2026-08-01" }).success, false);
  assert.equal(periodSchema.safeParse({ start: "2026-01-01", end: "2026-09-01" }).success, false);
  assert.equal(periodSchema.safeParse({ start: "2026-09-01", end: "2026-09-28" }).success, true);
  assert.equal(periodSchema.safeParse({ start: "2999-01-01", end: "2999-01-10" }).success, false);
  assert.equal(mergeRows([row({ clicks: 2, impressions: 100, position: 4 }), row({ clicks: 8, impressions: 300, position: 8 })])[0].position, 7);
});

test("quick wins follow the documented examples and ignore thin data", () => {
  const brief = row({ position: 8.2, impressions: 12500, ctr: 0.011, clicks: 138 });
  const [win] = findQuickWins([brief]);
  assert.equal(win.action, "RE_TITLE");
  const page2 = findQuickWins([row({ position: 11.4, impressions: 400, ctr: 0.01 })]);
  assert.equal(page2[0].action, "EXPAND");
  assert.deepEqual(findQuickWins([row({ position: 8, impressions: 99, ctr: 0 })]), []); // too few impressions
  assert.deepEqual(findQuickWins([row({ position: 3, impressions: 5000, ctr: 0.001 })]), []); // outside 5–20
  assert.deepEqual(findQuickWins([row({ position: 8, impressions: 5000, ctr: 0.04 })]), []); // healthy CTR
  assert.ok(expectedCtr(1) > expectedCtr(10) && expectedCtr(10) > expectedCtr(18));
  const sorted = findQuickWins([row({ page: "/small", impressions: 200, ctr: 0.001 }), row({ page: "/big", impressions: 9000, ctr: 0.001 })]);
  assert.equal(sorted[0].page, "/big");
});

test("decay needs enough prior evidence and meaningful change", () => {
  const prev = [row({ page: "/a", clicks: 100, impressions: 5000, ctr: 0.02, position: 5 }), row({ page: "/tiny", clicks: 4, impressions: 80, ctr: 0.05, position: 5 }), row({ page: "/ok", clicks: 100, impressions: 5000, ctr: 0.02, position: 5 })];
  const cur = [row({ page: "/a", clicks: 40, impressions: 3000, ctr: 0.0133, position: 9 }), row({ page: "/tiny", clicks: 0, impressions: 10, ctr: 0, position: 30 }), row({ page: "/ok", clicks: 245, impressions: 4900, ctr: 0.05, position: 5.4 })];
  const decay = findDecay(cur, prev);
  assert.deepEqual(decay.map((d) => d.page), ["/a"]);
  assert.equal(decay[0].severity, "HIGH");
  assert.ok(decay[0].signals.length >= 3);
  const rec = recommendRefresh(cur, decay, new Map([["/ok", { wordCount: 120, internalLinkCount: 0 }]]));
  assert.ok(rec.find((r) => r.page === "/a")!.actions.includes("UPDATE"));
  assert.deepEqual(rec.find((r) => r.page === "/ok")!.actions.sort(), ["ADD_INTERNAL_LINKS", "EXPAND"]);
  assert.equal(rec.find((r) => r.page === "/tiny"), undefined);
  const d = (s: string, e: string) => ({ periodStart: new Date(s), periodEnd: new Date(e) });
  assert.equal(comparablePrevious(d("2026-09-01", "2026-09-28"), d("2026-08-04", "2026-08-31")), true);
  assert.equal(comparablePrevious(d("2026-09-01", "2026-09-28"), d("2026-08-01", "2026-08-31")), false);
  assert.equal(comparablePrevious(d("2026-09-01", "2026-09-28"), d("2026-08-03", "2026-08-30")), false);
});

test("Search Console client signs a verifiable JWT, pages results, refuses partial data and hides secrets", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const config = readGscConfig({ GSC_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: "svc@proj.iam.gserviceaccount.com", private_key: pem }), GSC_SITE_URL: "sc-domain:netfener.com" })!;
  assert.ok(config);
  assert.equal(readGscConfig({ GSC_SITE_URL: "sc-domain:netfener.com" }), null);
  assert.equal(readGscConfig({ GSC_SERVICE_ACCOUNT_JSON: "{bad", GSC_SITE_URL: "sc-domain:netfener.com" }), null);
  assert.equal(readGscConfig({ GSC_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: "a@b.co", private_key: pem }), GSC_SITE_URL: "http://insecure.example" }), null);
  const jwt = signServiceJwt(config, 1_800_000_000);
  const [h, c, s] = jwt.split(".");
  assert.equal(createVerify("RSA-SHA256").update(`${h}.${c}`).verify(publicKey, Buffer.from(s, "base64url")), true);
  assert.match(Buffer.from(c, "base64url").toString(), /webmasters\.readonly/);

  const calls: { url: string; body: string; headers: Record<string, string> }[] = [];
  const mk = (pages: number[]) => async (u: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    calls.push({ url: u, body: init.body, headers: init.headers });
    if (u.includes("oauth2")) return { ok: true, status: 200, json: async () => ({ access_token: "tok-1234567890" }) };
    const n = pages[calls.filter((x) => !x.url.includes("oauth2")).length - 1] ?? 0;
    return { ok: true, status: 200, json: async () => ({ rows: Array.from({ length: n }, (_, i) => ({ keys: [`https://netfener.com/blog/p${i}?x=1`], clicks: 1, impressions: 10, ctr: 0.1, position: 5 })) }) };
  };
  const out = await fetchGscRows(config, "PAGES", { start: "2026-09-01", end: "2026-09-28" }, "netfener.com", mk([5000, 20]));
  assert.equal(out.rows.length, 5020);
  const queries = calls.filter((x) => !x.url.includes("oauth2"));
  assert.equal(queries.length, 2);
  assert.equal(JSON.parse(queries[1].body).startRow, 5000);
  assert.equal(JSON.parse(queries[0].body).dataState, "final");
  assert.ok(queries[0].url.includes(encodeURIComponent("sc-domain:netfener.com")));
  calls.length = 0;
  await assert.rejects(() => fetchGscRows(config, "PAGES", { start: "2026-09-01", end: "2026-09-28" }, "netfener.com", mk([5000, 5000, 5000, 5000, 5000])), /kısmi/);
  const failing = async () => ({ ok: false, status: 403, json: async () => ({ error: { message: pem } }) });
  await assert.rejects(
    () => fetchGscRows(config, "PAGES", { start: "2026-09-01", end: "2026-09-28" }, "netfener.com", failing),
    (e: Error) => e instanceof GscError && !e.message.includes("PRIVATE") && /403/.test(e.message),
  );
});

test("snapshots import, replace, authorize and drive decay/quick-win reports", async () => {
  await db.seoSearchSnapshot.deleteMany({});
  const stamp = randomUUID();
  const admin = await db.user.create({ data: { name: "Perf admin", email: `perf-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Perf teacher", email: `perf-t-${stamp}@example.test`, role: "TEACHER" } });
  const SITE = new URL(process.env.AUTH_URL!).origin;
  const header = "Top pages,Clicks,Impressions,CTR,Position\n";
  const prev = header + `${SITE}/blog/yds-a,120,6000,2%,5\n${SITE}/exams/ydt,40,2000,2%,6`;
  const cur = header + `${SITE}/blog/yds-a,50,3500,1.4%,9\n${SITE}/exams/ydt,41,2100,2%,6\n${SITE}/blog/deep,6,1500,0.4%,12.5`;
  try {
    const p = { start: "2026-08-04", end: "2026-08-31" };
    const c = { start: "2026-09-01", end: "2026-09-28" };
    await assert.rejects(() => importSearchCsv(teacher.id, { kind: "PAGES", period: c, csv: cur }));
    await assert.rejects(() => importSearchCsv(admin.id, { kind: "PAGES", period: c, csv: "nothing valid in this text" }), /Geçerli satır/);
    await assert.rejects(() => importSearchCsv(admin.id, { kind: "PAGES", period: { start: "2026-09-28", end: "2026-09-01" }, csv: cur }));
    await assert.rejects(() => syncSearchConsole(admin.id, { kind: "PAGES", period: c }), /bağlı değil/);
    await assert.rejects(() => getPerformanceReport(teacher.id));
    assert.deepEqual((await getPerformanceReport(admin.id)).decay, []);
    await importSearchCsv(admin.id, { kind: "PAGES", period: p, csv: prev });
    const first = await importSearchCsv(admin.id, { kind: "PAGES", period: c, csv: cur });
    assert.equal(first.rows, 3);
    const again = await importSearchCsv(admin.id, { kind: "PAGES", period: c, csv: cur });
    assert.equal(again.replaced, true);
    assert.equal((await listSnapshots(admin.id)).length, 2);
    assert.equal(await db.seoSearchRow.count({ where: { snapshot: { periodEnd: new Date("2026-09-28") } } }), 3);
    const report = await getPerformanceReport(admin.id);
    assert.equal(report.decayAvailable, true);
    assert.deepEqual(report.decay.map((d) => d.page), ["/blog/yds-a"]);
    assert.ok(report.pageQuickWins.some((w) => w.page === "/blog/deep" && w.action === "EXPAND"));
    assert.ok(report.recommendations.some((r) => r.page === "/blog/yds-a" && r.actions.includes("UPDATE")));
    assert.equal(report.totals.clicks, 97);
    // Query data: untracked high-impression queries surface for keyword gap review.
    await importSearchCsv(admin.id, { kind: "QUERIES", period: c, csv: "Top queries,Clicks,Impressions,CTR,Position\nyds sınav tarihleri,3,900,0.3%,9" });
    assert.equal((await getPerformanceReport(admin.id)).untracked[0].query, "yds sınav tarihleri");
    assert.equal(await db.seoActivityLog.count({ where: { actorId: admin.id, action: "SEARCH_SNAPSHOT_SAVED" } }), 4);
  } finally {
    await db.seoSearchSnapshot.deleteMany({});
    await db.seoActivityLog.deleteMany({ where: { actorId: { in: [admin.id, teacher.id] } } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, teacher.id] } } });
  }
});
