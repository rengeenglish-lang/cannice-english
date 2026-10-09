import { test, after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db";
import {
  BULK_MAX_LINES,
  assess,
  autopilotProblems,
  buildStudioBrief,
  costUsd,
  ctaTextOk,
  mentions,
  normalizePackageInput,
  packageSchema,
  parseBulkKeywords,
  pricingFromEnv,
  rankLinkCandidates,
  researchBlock,
  selectCompetitorTitles,
  selectLinks,
  selectRelevantQueries,
  candidatesBlock,
  repairMetadata,
  reserveUsd,
  systemPrompt,
  turkishSlug,
  userPrompt,
  type GeneratedPackage,
} from "../lib/seo/autopilot";
import { DEFAULT_BRAND, studioBriefSchema } from "../lib/seo/studio";
import { AUTOMATION_KEY, NonRetryableError } from "../lib/seo/automation";
import { DEFAULT_SEO_SETTINGS, SEO_SETTINGS_KEY } from "../lib/seo/settings";
import { ClaudeApiError, buildClaudeRequest, type ClaudeResult } from "../server/seo/claude";
import { renderCover } from "../server/seo/cover";
import { getArticleLinks } from "../server/services/seo/research.service";
import { generateArticleForKeyword } from "../server/services/seo/autopilot.service";
import { enqueueJob, planGenerationJobs, queueArticleGeneration, runDueJobs } from "../server/services/seo/jobs.service";
import { importSeoKeywords } from "../server/services/seo/keywords.service";
import { setAutomation } from "../server/services/seo/automation.service";

// ---------- fixtures ----------
const words = (tag: string, n: number) => Array.from({ length: n }, (_, i) => `${tag}${i}`).join(" ");
function section(title: string, tag: string) {
  return `## ${title}\n\n${words(tag + "a", 100)}\n\n${words(tag + "b", 100)}\n\n${words(tag + "c", 100)}`;
}
function goodPackage(keyword: string, over: Partial<GeneratedPackage["article"]> = {}): GeneratedPackage {
  return {
    brief: {
      reader: "YDS’ye hazırlanan, sınırlı zamanı olan aday.",
      problem: "Okuma sorularında zaman yetmiyor.",
      goal: "Soru tiplerini tanıyıp süreyi yönetmek.",
      secondaryKeywords: ["yds okuma stratejisi"],
      alternativeTitles: ["Okuma sorularında süre yönetimi"],
      outline: ["Soru tipleri", "Süre yönetimi", "Alıştırma"],
      questions: ["Okuma soruları nasıl çözülür?"],
      differentiation: "Kısa, uygulanabilir adımlar ve mini alıştırmalar.",
      verificationNotes: "Soru sayıları ve süreler için ÖSYM kılavuzunu kontrol edin.",
    },
    article: {
      title: `${keyword} İçin 5 Pratik Strateji`,
      excerpt: "Okuma sorularında zamanı yönetmenin ve soru tiplerini tanımanın kısa yolları.",
      seoTitle: `${keyword}: 5 Pratik Strateji`,
      seoDescription: `${keyword} için soru tiplerini tanımanın, süreyi yönetmenin ve bugün deneyebileceğiniz küçük alıştırmaların kısa rehberi.`,
      content: [section("Soru Tipleri", "x"), section("Süre Yönetimi", "y"), section(`${keyword} Alıştırması`, "z")].join("\n\n") + `\n\nBugün deneyin: ${keyword} için bir pasaj seçin.`,
      ...over,
    },
    links: [],
    cta: null,
  };
}
const reply = (pkg: unknown, inputTokens = 3000, outputTokens = 5000): ClaudeResult => ({ input: pkg, inputTokens, outputTokens, stopReason: "tool_use" });
const settings = (over: Record<string, unknown> = {}) => ({ revision: 0, settings: { ...DEFAULT_SEO_SETTINGS, provider: "ANTHROPIC", model: "claude-sonnet-5-5", monthlyBudgetUsd: 2, dailyArticleLimit: 5, weeklyArticleLimit: 20, ...over } });
const automation = (over: Record<string, unknown> = {}) => ({ revision: 0, state: { emergencyStop: false, autoSync: false, autoGenerate: true, autoPublish: true, ...over } });

// ---------- pure logic ----------
test("slugs keep Turkish letters readable and are always valid", () => {
  assert.equal(turkishSlug("IELTS Konuşma Sınavı: Nasıl Puanlanır?"), "ielts-konusma-sinavi-nasil-puanlanir");
  assert.equal(turkishSlug("İngilizce Çalışma Planı Ğ Ö Ü Ş"), "ingilizce-calisma-plani-g-o-u-s");
  assert.match(turkishSlug("???"), /^[a-z0-9-]{3,160}$/);
  assert.ok(turkishSlug("a".repeat(300)).length <= 100);
});

test("prices must be set and cost math is exact; reservations cover a full-size call", () => {
  assert.equal(pricingFromEnv({}), null);
  assert.equal(pricingFromEnv({ SEO_AI_INPUT_USD_PER_MTOK: "2", SEO_AI_OUTPUT_USD_PER_MTOK: "0" }), null);
  const p = pricingFromEnv({ SEO_AI_INPUT_USD_PER_MTOK: "2", SEO_AI_OUTPUT_USD_PER_MTOK: "10" })!;
  assert.equal(costUsd(1_000_000, 1_000_000, p), 12);
  assert.ok(reserveUsd(12_000, 7000, p) >= costUsd(5000, 7000, p));
});

test("the Claude request never forces a tool, and only transient API errors are retryable", () => {
  const body = buildClaudeRequest({ tool: { name: "t", description: "d", input_schema: {} }, system: "s", user: "u", model: "m", maxTokens: 10 });
  assert.deepEqual(body.tool_choice, { type: "auto" });
  assert.deepEqual([400, 401, 404].map((s) => new ClaudeApiError(s, "x").retryable), [false, false, false]);
  assert.deepEqual([408, 429, 500, 529].map((s) => new ClaudeApiError(s, "x").retryable), [true, true, true, true]);
});

test("model output is validated, metadata is repaired, and a clean article passes Netfener's own checklist", () => {
  const pkg = packageSchema.parse(goodPackage("YDS okuma soruları"));
  const long = repairMetadata({ ...pkg.article, seoTitle: "x".repeat(120), seoDescription: "Kısa cümle. ".repeat(40), excerpt: "e".repeat(400) });
  assert.ok(long.seoTitle.length <= 70 && long.seoDescription.length <= 170 && long.excerpt.length <= 300);
  assert.throws(() => packageSchema.parse({ brief: pkg.brief, article: { ...pkg.article, content: "kısa" } }));
  const brief = buildStudioBrief(pkg, { keyword: "YDS okuma soruları", languageCode: "tr-TR", market: "TR", intent: "EXAM_PREPARATION" }, pkg.article.title);
  assert.ok(studioBriefSchema.safeParse(brief).success);
  const a = assess({ ...pkg.article, slug: "yds-okuma-sorulari" }, brief, 85);
  assert.equal(a.ok, true, a.reasons.join("; "));
  assert.equal(a.score, 100);
});

test("a paid answer is not thrown away when the model returns nested parts as JSON strings", () => {
  const good = goodPackage("YDS okuma soruları");
  assert.ok(packageSchema.safeParse(normalizePackageInput(good)).success);
  const wrapped = { brief: JSON.stringify(good.brief), article: JSON.stringify(good.article) };
  assert.ok(packageSchema.safeParse(wrapped).success === false, "raw wrapped input is rejected by the strict schema");
  assert.ok(packageSchema.safeParse(normalizePackageInput(wrapped)).success);
  const lists = { ...good, brief: { ...good.brief, outline: JSON.stringify(good.brief.outline), questions: JSON.stringify(good.brief.questions) } };
  assert.ok(packageSchema.safeParse(normalizePackageInput(lists)).success);
  assert.ok(packageSchema.safeParse(normalizePackageInput(JSON.stringify(good))).success); // the whole answer as one string
  // article text that merely starts with a bracket is left alone
  const text = normalizePackageInput({ ...good, article: { ...good.article, content: `[not json] ${good.article.content}` } }) as { article: { content: string } };
  assert.ok(text.article.content.startsWith("[not json]"));
  assert.equal(normalizePackageInput("plain text"), "plain text");
});

test("link candidates are ranked by exam and words, and the model can only choose from what it was offered", () => {
  const items = [
    { id: "p1", sourceType: "PRODUCT", title: "YDS Okuma Soruları Kitabı", url: "/books/yds-okuma", examSlug: "yds", access: "PRODUCT" },
    { id: "p2", sourceType: "PRODUCT", title: "IELTS Konuşma Paketi", url: "/packages/ielts-konusma", examSlug: "ielts", access: "PRODUCT" },
    { id: "e1", sourceType: "EXAM", title: "YDS", url: "/exams/yds", examSlug: "yds", access: "PUBLIC" },
    { id: "r1", sourceType: "ROUTE", title: "Blog", url: "/blog", examSlug: null, access: "PUBLIC" },
    { id: "r2", sourceType: "ROUTE", title: "Sınav takvimi", url: "/tools/exam-calendar", examSlug: null, access: "PUBLIC" },
  ];
  const ranked = rankLinkCandidates(items, "YDS okuma soruları", "yds");
  assert.deepEqual(ranked.map((i) => i.id), ["p1", "e1"]); // the IELTS package, the generic blog index and the calendar are not relevant
  assert.equal(rankLinkCandidates(items, "yds okuma", null).some((i) => i.id === "r1"), false);
  assert.ok(candidatesBlock(ranked).includes("p1 | kitap/paket | YDS Okuma Soruları Kitabı"));
  assert.equal(candidatesBlock([]), "");
  const chosen = selectLinks(
    { links: [{ itemId: "p1", label: "YDS okuma kitabı" }, { itemId: "p1", label: "tekrar" }, { itemId: "made-up", label: "uydurma" }, { itemId: "e1", label: "YDS sayfası" }], cta: { itemId: "p1", text: "Okuma sorularını adım adım çalışmak için kitaba göz atın." } },
    ranked,
  );
  assert.deepEqual(chosen.links.map((l) => l.itemId), ["p1", "e1"]);
  assert.deepEqual(chosen.cta, { itemId: "p1", text: "Okuma sorularını adım adım çalışmak için kitaba göz atın." });
  assert.equal(selectLinks({ links: [], cta: { itemId: "r2", text: "Takvime bakın." } }, items).cta, null); // a plain page is not a call-to-action target
  assert.equal(selectLinks({ links: [], cta: { itemId: "p1", text: "Şimdi %50 indirimle alın" } }, ranked).cta, null);
  assert.deepEqual([ctaTextOk("Kitaba göz atın."), ctaTextOk("Başarı garantili"), ctaTextOk("299 TL")], [true, false, false]);
});

test("search data: only related real queries, de-duplicated and ordered, never the keyword itself; empty data adds nothing", () => {
  const rows = [
    { query: "yds okuma soruları", impressions: 900, clicks: 40, position: 8 },
    { query: "yds okuma soruları nasıl çözülür", impressions: 120, clicks: 4, position: 11.2 },
    { query: "YDS Okuma Sorulari Nasil Cozulur", impressions: 30, clicks: 0, position: 14 },
    { query: "yds okuma ipuçları", impressions: 300, clicks: 9, position: 9.5 },
    { query: "ielts speaking", impressions: 5000, clicks: 100, position: 3 },
    { query: "yds", impressions: 10, clicks: 0, position: 30 },
  ];
  const q = selectRelevantQueries(rows, "YDS okuma soruları");
  assert.deepEqual(q.map((r) => r.query), ["yds okuma ipuçları", "yds okuma soruları nasıl çözülür"]);
  assert.deepEqual(selectCompetitorTitles(["YDS Okuma Soruları Çözüm Teknikleri", "IELTS Writing", "YDS okuma soruları çözüm teknikleri"], "yds okuma soruları"), ["YDS Okuma Soruları Çözüm Teknikleri"]);
  const block = researchBlock({ queries: q, competitorTitles: ["Rakip başlık"], serp: [{ rank: 1, domain: "ornek.com", title: "Örnek sonuç" }] });
  for (const part of ["yds okuma ipuçları", "300 gösterim", "Rakip başlık", "1. ornek.com", "kopyalama"]) assert.ok(block.includes(part), part);
  assert.equal(researchBlock(null), "");
  assert.equal(researchBlock({ queries: [], competitorTitles: [], serp: [] }), "");
});

test("the branded cover renders as a 1200x630 PNG for Turkish titles", async () => {
  const png = await renderCover({ title: "İngilizce Okuma Sınavına Nasıl Hazırlanılır? Şu Ğ Ö Ü Ç ı İ", label: "YÖKDİL SAĞLIK" });
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
});

test("unattended-publishing checks: markup, links, phantom references, long headlines, missing headings and placeholders", () => {
  const base = { ...goodPackage("YDS okuma soruları").article, slug: "yds-okuma-sorulari" };
  const brief = buildStudioBrief(goodPackage("YDS okuma soruları"), { keyword: "YDS okuma soruları", languageCode: "tr-TR", market: "TR", intent: "EXAM_PREPARATION" }, base.title);
  const withLine = (line: string) => ({ ...base, content: `${base.content}\n\n${line}` });
  assert.match(autopilotProblems(withLine("Bu *önemli* bir nokta."))[0], /biçim/);
  assert.match(autopilotProblems(withLine("Detaylar için https://example.com adresine bakın."))[0], /biçim/);
  assert.equal(autopilotProblems(withLine("Örnek: If she had left earlier, she ___ the train.")).length, 0); // exam blanks are fine
  assert.match(autopilotProblems(withLine("Ayrıntıları başka bir yazımızda anlattık."))[0], /başka bir Netfener yazısına/);
  assert.match(autopilotProblems({ ...base, title: "Çok uzun bir başlık ".repeat(5) })[0], /Başlık çok uzun/);
  assert.match(autopilotProblems({ ...base, content: base.content.replaceAll("## ", "") })[0], /Bölüm başlığı yok/);
  assert.equal(assess(withLine("Bunu sonra TODO olarak bırakın."), brief, 85).ok, false); // critical placeholder check
  assert.equal(assess({ ...base, content: base.content.slice(0, 2500) }, brief, 85).ok, false); // too short for the word range
  assert.equal(autopilotProblems(base).length, 0);
});

test("prompts carry the rules that keep unattended articles safe", () => {
  const sys = systemPrompt(DEFAULT_BRAND, "YDS");
  for (const rule of ["UYDURMA", "garantisi", "## ", "KULLANMA"]) assert.ok(sys.includes(rule), rule);
  const usr = userPrompt({ keyword: "yds okuma", intent: "EXAM_PREPARATION", languageCode: "tr-TR" }, ["Mevcut başlık"]);
  assert.ok(usr.includes("35-60 karakter") && usr.includes("AYNEN") && usr.includes("- Mevcut başlık"));
});

test("bulk keyword parsing: defaults, aliases, exam matching, per-line errors and the line cap", () => {
  const exams = [{ id: "e1", code: "YOKDIL_SAGLIK", slug: "yokdil-saglik", name: "YÖKDİL Sağlık" }, { id: "e2", code: "IELTS", slug: "ielts", name: "IELTS" }];
  const { rows, errors } = parseBulkKeywords("# liste\n\nyds okuma | hazırlık | IELTS | benim notum burada\nyökdil sağlık kelimeleri | pratik | yokdil_saglik\nx\nbir kelime | uçuk | ielts\nbaşka kelime | bilgi | yok sınav\nvarsayılan kelime", exams);
  assert.deepEqual(rows.map((r) => [r.keyword, r.intent, r.examId]), [["yds okuma", "EXAM_PREPARATION", "e2"], ["yökdil sağlık kelimeleri", "PRACTICE", "e1"], ["varsayılan kelime", "INFORMATIONAL", null]]);
  assert.equal(rows[0].sourceNote, "benim notum burada");
  assert.deepEqual(errors.map((e) => e.line), [5, 6, 7]);
  const many = parseBulkKeywords(Array.from({ length: BULK_MAX_LINES + 4 }, (_, i) => `kelime numarası ${i}`).join("\n"), exams);
  assert.equal(many.rows.length, BULK_MAX_LINES);
  assert.equal(many.errors.length, 1);
  assert.equal(mentions("YDS Okuma Soruları", "okuma"), true);
});

// ---------- database ----------
const url = new URL(process.env.DATABASE_URL!);
if (!["localhost", "127.0.0.1"].includes(url.hostname) || !url.pathname.endsWith("_test")) throw new Error("Requires isolated local *_test database");
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.SEO_AI_INPUT_USD_PER_MTOK = "2";
process.env.SEO_AI_OUTPUT_USD_PER_MTOK = "10";
const stamp = randomUUID().slice(0, 8);
let admin: { id: string };
const saved: Record<string, string | null> = {};
const KEYS = [AUTOMATION_KEY, SEO_SETTINGS_KEY];
const put = (key: string, value: unknown) => db.appSetting.upsert({ where: { key }, create: { key, value: JSON.stringify(value) }, update: { value: JSON.stringify(value) } });
const keyword = (text: string, extra: Record<string, unknown> = {}) =>
  db.seoKeyword.create({ data: { keyword: text, normalized: text.toLocaleLowerCase("tr-TR"), languageCode: "tr-TR", market: "TR", intent: "EXAM_PREPARATION", sourceNote: "test", ...extra } });
const fake = (pkg: (kw: string) => unknown) => {
  const calls: number[] = [];
  const fn = async (_cfg: unknown, call: { user: string }) => {
    calls.push(1);
    const kw = /Ana anahtar kelime: (.+)/.exec(call.user)![1];
    return reply(pkg(kw));
  };
  return { fn: fn as never, calls };
};

before(async () => {
  for (const k of KEYS) saved[k] = (await db.appSetting.findUnique({ where: { key: k } }))?.value ?? null;
  admin = await db.user.create({ data: { name: "Autopilot admin", email: `ap-${stamp}@example.test`, role: "ADMIN" } });
});
after(async () => {
  for (const [key, value] of Object.entries(saved)) {
    if (value) await db.appSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
    else await db.appSetting.deleteMany({ where: { key } });
  }
  await db.seoJob.deleteMany({ where: { dedupeKey: { startsWith: "GENERATE_ARTICLE:" } } });
  await db.$disconnect();
});

test("publishes unattended only when every gate passes, settles the real cost, and leaves a clear audit trail", async () => {
  await put(SEO_SETTINGS_KEY, settings());
  await put(AUTOMATION_KEY, automation());
  const k = await keyword(`yds okuma soruları ${stamp}`);
  const ai = fake((kw) => goodPackage(kw));
  const result = await generateArticleForKeyword(k.id, { actorId: admin.id, call: ai.fn, ignoreLimits: true });
  assert.equal(result.status, "PUBLISHED", result.reasons.join("; "));
  assert.equal(ai.calls.length, 1);
  const draft = await db.seoArticleDraft.findUniqueOrThrow({ where: { keywordId: k.id }, include: { post: true } });
  assert.equal(draft.post.status, "PUBLISHED");
  assert.match(draft.post.slug, /^yds-okuma-sorulari-/);
  assert.equal(draft.briefReady, true);
  const usage = await db.seoAiUsage.findFirstOrThrow({ where: { provider: "ANTHROPIC", operation: "GENERATE_ARTICLE", status: "SETTLED" }, orderBy: { createdAt: "desc" } });
  assert.equal(Number(usage.actualUsd), 0.056); // 3000 in * $2/M + 5000 out * $10/M
  const actions = (await db.seoActivityLog.findMany({ where: { details: { path: ["draftId"], equals: draft.id } } })).map((a) => a.action);
  assert.ok(actions.includes("AUTOPILOT_GENERATED"));
  const log = await db.seoActivityLog.findMany({ where: { action: { in: ["DRAFT_AUTO_APPROVED", "ARTICLE_PUBLISHED"] } }, orderBy: { createdAt: "desc" }, take: 3 });
  assert.ok(log.some((l) => l.action === "DRAFT_AUTO_APPROVED") && log.some((l) => l.action === "ARTICLE_PUBLISHED"));
  // an existing draft is never overwritten
  const again = await generateArticleForKeyword(k.id, { actorId: admin.id, call: ai.fn, ignoreLimits: true });
  assert.equal(again.status, "SKIPPED");
  assert.equal(ai.calls.length, 1);
});

test("related pages and the call to action are saved, validated, shown to readers, and search data reaches the prompt", async () => {
  await put(SEO_SETTINGS_KEY, settings());
  await put(AUTOMATION_KEY, automation());
  const tag = randomUUID().slice(0, 6);
  const hadExam = await db.examType.findUnique({ where: { code: "PTE" } });
  const exam = hadExam ?? (await db.examType.create({ data: { code: "PTE", slug: `pte-${tag}`, name: "PTE Academic", active: true } }));
  const item = (sourceKey: string, data: Record<string, unknown>) =>
    db.seoContentItem.upsert({
      where: { sourceKey },
      update: { available: true, ...data },
      create: { sourceKey, internalLinks: [], contentHash: "test", scannedAt: new Date(), available: true, ...data } as never,
    });
  const examItem = await item(`EXAM:${exam.id}`, { sourceType: "EXAM", sourceId: exam.id, url: `/exams/${exam.slug}`, title: exam.name, examSlug: exam.slug, access: "PUBLIC", publication: "LIVE" });
  const routeItem = await item("ROUTE:/books", { sourceType: "ROUTE", sourceId: "/books", url: "/books", title: "Kitaplar", examSlug: null, access: "PUBLIC", publication: "LIVE" });
  // Keep unrelated inventory in the shared test database out of the candidate list, and restore it afterwards.
  const others = await db.seoContentItem.findMany({ where: { available: true, id: { notIn: [examItem.id, routeItem.id] } }, select: { id: true } });
  await db.seoContentItem.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { available: false } });
  const kw = await keyword(`kitaplar ${tag} okuma soruları`, { examId: exam.id });
  const period = { periodStart: new Date("2099-01-01"), periodEnd: new Date("2099-01-28"), kind: "QUERIES", source: "test", rowCount: 2 };
  const snap = await db.seoSearchSnapshot.create({ data: { ...period, rows: { create: [
    { query: `kitaplar ${tag} okuma ipuçları`, impressions: 321, clicks: 7, ctr: 0.02, position: 9.4 },
    { query: "tamamen alakasız sorgu", impressions: 9999, clicks: 1, ctr: 0, position: 2 },
  ] } } });
  const rival = await db.seoCompetitor.create({ data: { name: `Rakip ${tag}`, domain: `rakip-${tag}.example.test`, topics: { create: [{ title: `Kitaplar ${tag} okuma soruları rehberi`, normalized: `kitaplar ${tag} okuma soruları rehberi` }] } } });
  let prompt = "";
  try {
    const ai = async (_cfg: unknown, call: { user: string }) => {
      prompt = call.user;
      const pkg = goodPackage(/Ana anahtar kelime: (.+)/.exec(call.user)![1]);
      pkg.links = [{ itemId: examItem.id, label: "Sınav sayfası" }, { itemId: routeItem.id, label: "Kitap listesi" }, { itemId: "uydurma-kimlik", label: "Olmayan sayfa" }];
      pkg.cta = { itemId: examItem.id, text: "Sınav sayfasında hazırlık yolunu görebilirsiniz." };
      return reply(pkg);
    };
    const result = await generateArticleForKeyword(kw.id, { actorId: admin.id, call: ai as never, ignoreLimits: true });
    assert.equal(result.status, "PUBLISHED", result.reasons.join("; "));
    // the prompt offered real pages and real search data, and nothing irrelevant
    assert.ok(prompt.includes(`${examItem.id} | sınav sayfası`) && prompt.includes(`${routeItem.id} | sayfa | Kitaplar`));
    assert.ok(prompt.includes(`kitaplar ${tag} okuma ipuçları`) && prompt.includes("321 gösterim") && prompt.includes(`Kitaplar ${tag} okuma soruları rehberi`));
    assert.ok(!prompt.includes("tamamen alakasız sorgu"));
    // only offered pages were kept; the invented one was dropped
    const draft = await db.seoArticleDraft.findUniqueOrThrow({ where: { keywordId: kw.id }, include: { post: true } });
    assert.deepEqual((draft.approvedLinks as { itemId: string }[]).map((l) => l.itemId).sort(), [examItem.id, routeItem.id].sort());
    assert.equal((draft.brief as { ctaItemId: string }).ctaItemId, examItem.id);
    // readers get resolved, current destinations
    const shown = await getArticleLinks(draft.postId);
    assert.deepEqual(shown.links.map((l) => l.url).sort(), ["/books", `/exams/${exam.slug}`].sort());
    assert.deepEqual(shown.cta, { text: "Sınav sayfasında hazırlık yolunu görebilirsiniz.", title: exam.name, url: `/exams/${exam.slug}` });
    // a page that disappears stops being shown instead of leaving a dead link
    await db.seoContentItem.update({ where: { id: routeItem.id }, data: { available: false } });
    assert.deepEqual((await getArticleLinks(draft.postId)).links.map((l) => l.url), [`/exams/${exam.slug}`]);
  } finally {
    await db.seoCompetitor.delete({ where: { id: rival.id } });
    await db.seoSearchSnapshot.delete({ where: { id: snap.id } });
    await db.seoContentItem.update({ where: { id: routeItem.id }, data: { available: true } });
    await db.seoContentItem.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { available: true } });
    await db.seoContentItem.deleteMany({ where: { id: examItem.id } });
    if (!hadExam) await db.examType.delete({ where: { id: exam.id } });
  }
});

test("with automatic publishing off, or when a check fails, the article is saved for review and nothing goes live", async () => {
  await put(SEO_SETTINGS_KEY, settings());
  await put(AUTOMATION_KEY, automation({ autoPublish: false }));
  const off = await keyword(`yds dilbilgisi ${stamp}`);
  const r1 = await generateArticleForKeyword(off.id, { actorId: admin.id, call: fake((kw) => goodPackage(kw)).fn, ignoreLimits: true });
  assert.equal(r1.status, "NEEDS_REVIEW");
  const d1 = await db.seoArticleDraft.findUniqueOrThrow({ where: { keywordId: off.id }, include: { post: true } });
  assert.equal(d1.post.status, "DRAFT");
  assert.match(d1.scheduleError ?? "", /Otomatik yayın kapalı/);

  await put(AUTOMATION_KEY, automation());
  const bad = await keyword(`yds kelime bilgisi ${stamp}`);
  const r2 = await generateArticleForKeyword(bad.id, { actorId: admin.id, ignoreLimits: true, call: fake((kw) => goodPackage(kw, { content: `${goodPackage(kw).article.content}\n\nSonra TODO ekleyin.` })).fn });
  assert.equal(r2.status, "NEEDS_REVIEW");
  assert.ok(r2.reasons.some((r) => r.includes("Zorunlu kontrol")));
  assert.equal((await db.seoArticleDraft.findUniqueOrThrow({ where: { keywordId: bad.id }, include: { post: true } })).post.status, "DRAFT");
});

test("no budget, wrong provider or a permanent API error stop immediately without spending or retrying", async () => {
  const k = await keyword(`yds okuma hızı ${stamp}`);
  const ai = fake((kw) => goodPackage(kw));
  await put(SEO_SETTINGS_KEY, settings({ monthlyBudgetUsd: 0 }));
  await assert.rejects(generateArticleForKeyword(k.id, { actorId: admin.id, call: ai.fn, ignoreLimits: true }), NonRetryableError);
  await put(SEO_SETTINGS_KEY, settings({ provider: "NONE", model: "" }));
  await assert.rejects(generateArticleForKeyword(k.id, { actorId: admin.id, call: ai.fn, ignoreLimits: true }), NonRetryableError);
  assert.equal(ai.calls.length, 0);

  await put(SEO_SETTINGS_KEY, settings());
  const spentBefore = await db.seoAiUsage.count({ where: { status: "RESERVED" } });
  const rejecting = async () => { throw new ClaudeApiError(400, "bad request"); };
  await assert.rejects(generateArticleForKeyword(k.id, { actorId: admin.id, call: rejecting as never, ignoreLimits: true }), NonRetryableError);
  assert.equal(await db.seoAiUsage.count({ where: { status: "RESERVED" } }), spentBefore, "failed call must release its reservation");
});

test("the planner honours the daily limit and order, the runner never calls Claude while stopped and fails permanent errors at once", async () => {
  await put(SEO_SETTINGS_KEY, settings({ dailyArticleLimit: 2, weeklyArticleLimit: 10 }));
  await put(AUTOMATION_KEY, automation({ autoPublish: false }));
  await db.seoJob.deleteMany({ where: { dedupeKey: { startsWith: "GENERATE_ARTICLE:" } } });
  await db.seoActivityLog.deleteMany({ where: { action: "AUTOPILOT_GENERATED" } });
  const tag = randomUUID().slice(0, 6);
  const ks = [await keyword(`a1 ${tag} sıra bir`), await keyword(`a2 ${tag} sıra iki`), await keyword(`a3 ${tag} sıra üç`)];
  // Keep unrelated keywords in the shared test database out of the picture, and restore them afterwards.
  const others = await db.seoKeyword.findMany({ where: { archived: false, articleDraft: null, id: { notIn: ks.map((k) => k.id) } }, select: { id: true } });
  await db.seoKeyword.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { archived: true } });
  const revision = async () => JSON.parse((await db.appSetting.findUniqueOrThrow({ where: { key: AUTOMATION_KEY } })).value).revision as number;
  try {
    assert.equal(await planGenerationJobs(), 2); // daily limit 2 even though 3 keywords wait
    const queued = await db.seoJob.findMany({ where: { type: "GENERATE_ARTICLE" }, orderBy: { createdAt: "asc" } });
    assert.deepEqual(queued.map((j) => (j.payload as { keywordId: string }).keywordId), [ks[0].id, ks[1].id]); // oldest first
    assert.equal(await planGenerationJobs(), 0); // already queued: no duplicates, no extras

    await setAutomation(admin.id, { revision: await revision(), emergencyStop: true }); // also cancels queued work
    assert.equal((await runDueJobs(new Date(), 5)).stopped, true);
    await setAutomation(admin.id, { revision: await revision(), emergencyStop: false });

    assert.deepEqual(await queueArticleGeneration(admin.id, ks[2].id), { created: true });
    assert.deepEqual(await queueArticleGeneration(admin.id, ks[2].id), { created: false });
    await assert.rejects(queueArticleGeneration(admin.id, "does-not-exist"), /mevcut/);

    // With no budget the queued job must fail on its first attempt: a permanent error is never retried.
    await put(SEO_SETTINGS_KEY, settings({ monthlyBudgetUsd: 0 }));
    await runDueJobs(new Date(), 5);
    const job = await db.seoJob.findUniqueOrThrow({ where: { dedupeKey: `GENERATE_ARTICLE:${ks[2].id}` } });
    assert.equal(job.status, "FAILED");
    assert.equal(job.attempts, 1);
    assert.match(job.lastError ?? "", /bütçe/i);
  } finally {
    await db.seoKeyword.updateMany({ where: { id: { in: [...others.map((o) => o.id)] } }, data: { archived: false } });
    await db.seoKeyword.updateMany({ where: { id: { in: ks.map((k) => k.id) } }, data: { archived: true } });
  }
});

test("a pasted batch is planned in the order it was written", async () => {
  await put(SEO_SETTINGS_KEY, settings({ dailyArticleLimit: 3, weeklyArticleLimit: 10 }));
  await put(AUTOMATION_KEY, automation({ autoPublish: false }));
  await db.seoJob.deleteMany({ where: { dedupeKey: { startsWith: "GENERATE_ARTICLE:" } } });
  await db.seoActivityLog.deleteMany({ where: { action: "AUTOPILOT_GENERATED" } });
  const tag = randomUUID().slice(0, 6);
  const names = [`sıra ${tag} birinci kelime`, `sıra ${tag} ikinci kelime`, `sıra ${tag} üçüncü kelime`, `sıra ${tag} dördüncü kelime`];
  const others = await db.seoKeyword.findMany({ where: { archived: false, articleDraft: null }, select: { id: true } });
  await db.seoKeyword.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { archived: true } });
  try {
    await importSeoKeywords(admin.id, names.join("\n"));
    assert.equal(await planGenerationJobs(), 3);
    const jobs = await db.seoJob.findMany({ where: { type: "GENERATE_ARTICLE" }, orderBy: { createdAt: "asc" } });
    const planned = await db.seoKeyword.findMany({ where: { id: { in: jobs.map((j) => (j.payload as { keywordId: string }).keywordId) } } });
    assert.deepEqual(planned.map((k) => k.keyword).sort(), names.slice(0, 3).sort()); // the first three written, never the fourth
  } finally {
    await db.seoKeyword.updateMany({ where: { id: { in: others.map((o) => o.id) } }, data: { archived: false } });
    await db.seoKeyword.updateMany({ where: { keyword: { in: names } }, data: { archived: true } });
    await db.seoJob.deleteMany({ where: { dedupeKey: { startsWith: "GENERATE_ARTICLE:" } } });
  }
});

test("pasting a keyword list creates rows, maps exams, skips duplicates and reports bad lines", async () => {
  const exam = await db.examType.findFirst({ where: { active: true } });
  const tag = randomUUID().slice(0, 6);
  const a = `toplu kelime ${tag} bir`;
  const input = [`${a} | hazırlık | ${exam?.code ?? ""} | ilk not burada`, `toplu kelime ${tag} iki`, a, "x", `toplu kelime ${tag} üç | uçuk amaç`].join("\n");
  const result = await importSeoKeywords(admin.id, input);
  assert.equal(result.created, 2);
  assert.deepEqual(result.skipped.map((s) => s.line), [3, 4, 5]);
  const row = await db.seoKeyword.findFirstOrThrow({ where: { keyword: a } });
  assert.equal(row.intent, "EXAM_PREPARATION");
  assert.equal(row.languageCode, "tr-TR");
  if (exam) assert.equal(row.examId, exam.id);
  await assert.rejects(importSeoKeywords("not-a-user", "x kelime"), /yönetici/);
});
