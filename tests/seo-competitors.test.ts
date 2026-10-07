import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import { findGaps, normalizeDomain, normalizeTopic, parseSerpLines, parseTopicLines, summarizeSerp, topicTokens } from "../lib/seo/competitors";
import { CompetitorError, addCompetitor, getCompetitorReport, importCompetitorTopics, removeCompetitor, saveSerpResults, setCompetitorActive, trackGapAsKeyword } from "../server/services/seo/competitors.service";

const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test"))
  throw new Error("Requires isolated local *_test database");
after(() => db.$disconnect());

test("domain, topic and SERP parsing validate rather than guess", () => {
  assert.equal(normalizeDomain("https://www.Example.com/path?x=1"), "example.com");
  assert.equal(normalizeDomain("example.com.tr"), "example.com.tr");
  for (const bad of ["", "localhost", "192.168.1.1", "not a domain", "http://", "javascript:alert(1)", "a".repeat(400)]) assert.equal(normalizeDomain(bad), null, bad);
  assert.equal(normalizeDomain("https://www.netfener.com", "netfener.com"), null); // own site is not a competitor
  const t = parseTopicLines(["IELTS speaking part 2 nasıl çalışılır | https://www.rival.com/ielts-speaking?utm=1", "ielts speaking part 2 nasil calisilir", "YDS kelime ezberleme teknikleri | https://evil.example/x", "ab", "TOEFL writing şablonları", "TOEFL writing şablonları"].join("\n"), "rival.com");
  assert.deepEqual(t.items.map((i) => i.title), ["IELTS speaking part 2 nasıl çalışılır", "ielts speaking part 2 nasil calisilir", "TOEFL writing şablonları"]);
  assert.equal(t.items[0].url, "https://www.rival.com/ielts-speaking".replace("www.", "www."));
  assert.equal(t.dropped, 3); // foreign url, too short, duplicate
  const s = parseSerpLines("Best IELTS tips | https://www.a.com/tips\nBroken | notaurl\nSecond | http://insecure.com/x\nThird result | https://b.org/page?z=1");
  assert.deepEqual(s.results.map((r) => [r.rank, r.domain]), [[1, "a.com"], [2, "b.org"]]);
  assert.equal(s.dropped, 2);
  assert.deepEqual([...topicTokens("The best YDS tips for you")].sort(), ["best", "tips", "yds"]);
  assert.equal(normalizeTopic("Tips YDS best"), normalizeTopic("best yds tips"));
});

test("gap detection is lexical, groups competitors and never claims demand", () => {
  const own = [{ title: "YDS okuma soruları çözüm stratejileri", url: "/blog/yds-okuma" }, { title: "IELTS speaking sınavı rehberi", url: "/blog/ielts-speaking" }];
  const topics = [
    { title: "YDS okuma soruları stratejileri", normalized: normalizeTopic("YDS okuma soruları stratejileri"), competitor: "Rival A" },
    { title: "TOEFL writing şablonları", normalized: normalizeTopic("TOEFL writing şablonları"), competitor: "Rival A" },
    { title: "toefl writing şablonları", normalized: normalizeTopic("toefl writing şablonları"), competitor: "Rival B" },
    { title: "PTE Academic kelime listesi", normalized: normalizeTopic("PTE Academic kelime listesi"), competitor: "Rival B" },
  ];
  const gaps = findGaps(topics, own, new Set([normalizeTopic("PTE Academic kelime listesi")]));
  assert.deepEqual(gaps.map((g) => g.title), ["TOEFL writing şablonları", "PTE Academic kelime listesi"]);
  assert.deepEqual(gaps[0].competitors, ["Rival A", "Rival B"]);
  assert.equal(gaps[1].tracked, true);
  assert.equal(findGaps(topics.slice(0, 1), own, new Set()).length, 0); // already covered
  assert.equal(findGaps(topics.slice(1, 2), [], new Set())[0].nearest, null);
  assert.equal(Object.keys(gaps[0]).includes("demand"), false);
});

test("SERP summary flags own site, configured competitors, generic platforms and candidates", () => {
  const rows = [
    { keyword: "k1", rank: 1, domain: "rival.com", title: "t" }, { keyword: "k2", rank: 3, domain: "rival.com", title: "t" },
    { keyword: "k1", rank: 2, domain: "netfener.com", title: "t" }, { keyword: "k1", rank: 3, domain: "youtube.com", title: "t" },
    { keyword: "k1", rank: 4, domain: "newcomer.org", title: "t" }, { keyword: "k2", rank: 2, domain: "newcomer.org", title: "t" },
  ];
  const sum = summarizeSerp(rows, new Set(["rival.com"]), "www.netfener.com");
  const kind = (d: string) => sum.find((x) => x.domain === d)!.kind;
  assert.deepEqual([kind("rival.com"), kind("netfener.com"), kind("youtube.com"), kind("newcomer.org")], ["COMPETITOR", "OWN", "GENERIC", "CANDIDATE"]);
  assert.equal(sum[0].keywords, 2);
  assert.equal(sum.find((x) => x.domain === "newcomer.org")!.averageRank, 3);
});

test("competitor workflow: permissions, limits, import, gaps, keyword tracking, SERP linking, removal", async () => {
  const stamp = randomUUID().slice(0, 8);
  const admin = await db.user.create({ data: { name: "Comp admin", email: `comp-${stamp}@example.test`, role: "ADMIN" } });
  const teacher = await db.user.create({ data: { name: "Comp teacher", email: `comp-t-${stamp}@example.test`, role: "TEACHER" } });
  const domain = `rival-${stamp}.com`;
  const keyword = await db.seoKeyword.create({ data: { keyword: `yds okuma ${stamp}`, normalized: `yds okuma ${stamp}`, languageCode: "tr-TR", market: "TR", intent: "INFORMATIONAL", sourceNote: "test note" } });
  try {
    await assert.rejects(() => addCompetitor(teacher.id, { name: "Rival", domain }));
    await assert.rejects(() => addCompetitor(admin.id, { name: "Self", domain: new URL(process.env.AUTH_URL!).hostname }), CompetitorError);
    await assert.rejects(() => addCompetitor(admin.id, { name: "Bad", domain: "not a domain" }), CompetitorError);
    // SERP recorded before the competitor exists is linked when the competitor is added later.
    await saveSerpResults(admin.id, { keywordId: keyword.id, text: `Top tips | https://www.${domain}/tips\nOther | https://unknown-${stamp}.org/x` });
    assert.equal((await db.seoSerpResult.findMany({ where: { keywordId: keyword.id, competitorId: null } })).length, 2);
    const { id } = await addCompetitor(admin.id, { name: `Rival ${stamp}`, domain: `https://www.${domain}/` });
    await assert.rejects(() => addCompetitor(admin.id, { name: "Dup", domain }), /zaten ekli/);
    assert.equal((await db.seoSerpResult.findMany({ where: { competitorId: id } })).length, 1);

    const imp = await importCompetitorTopics(admin.id, { competitorId: id, text: `Zamansız konu ${stamp} rehberi | https://${domain}/a\nyabancı | https://other.example/x\nZamansız konu ${stamp} rehberi` });
    assert.deepEqual(imp, { added: 1, dropped: 2 });
    await assert.rejects(() => importCompetitorTopics(admin.id, { competitorId: id, text: "x\ny" }), /Geçerli satır/);
    await assert.rejects(() => importCompetitorTopics(teacher.id, { competitorId: id, text: "Konu başlığı örnek" }));

    const report = await getCompetitorReport(admin.id);
    const gap = report.gaps.find((g) => g.title.includes(stamp))!;
    assert.ok(gap && gap.competitors.length === 1 && !gap.tracked);
    await assert.rejects(() => getCompetitorReport(teacher.id));
    assert.ok(report.serpSummary.some((d) => d.domain === domain && d.kind === "COMPETITOR"));

    await trackGapAsKeyword(admin.id, { title: gap.title });
    const tracked = await db.seoKeyword.findFirstOrThrow({ where: { keyword: gap.title } });
    assert.match(tracked.sourceNote, /Rakip boşluğu/);
    assert.equal(tracked.monthlySearches, null); // no invented demand
    assert.equal((await getCompetitorReport(admin.id)).gaps.find((g) => g.title.includes(stamp))!.tracked, true);
    await assert.rejects(() => trackGapAsKeyword(admin.id, { title: "Hiç rakipte olmayan konu" }), CompetitorError);

    await setCompetitorActive(admin.id, { id, active: false });
    assert.equal((await getCompetitorReport(admin.id)).gaps.some((g) => g.title.includes(stamp)), false); // inactive competitors are ignored
    await assert.rejects(() => removeCompetitor(admin.id, { id, confirmed: false }));
    await removeCompetitor(admin.id, { id, confirmed: true });
    assert.equal(await db.seoCompetitorTopic.count({ where: { competitorId: id } }), 0);
    assert.equal((await db.seoSerpResult.findMany({ where: { keywordId: keyword.id } })).every((r) => r.competitorId === null), true);
  } finally {
    await db.seoKeyword.deleteMany({ where: { OR: [{ id: keyword.id }, { sourceNote: { startsWith: "Rakip boşluğu" } }] } });
    await db.seoCompetitor.deleteMany({ where: { domain } });
    await db.seoActivityLog.deleteMany({ where: { actorId: { in: [admin.id, teacher.id] } } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, teacher.id] } } });
  }
});
