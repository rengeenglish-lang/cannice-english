import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  keywordSchema,
  normalizeKeyword,
  assessOpportunity,
} from "../lib/seo/keywords";
import { db } from "../server/db";
import {
  saveSeoKeyword,
  listSeoKeywords,
} from "../server/services/seo/keywords.service";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
)
  throw new Error("Requires isolated local test DB");
after(() => db.$disconnect());
test("keywords normalize Turkish and validate intent without inventing demand", () => {
  assert.equal(normalizeKeyword("  YDS  İNGİLİZCE "), "yds ingilizce");
  assert.equal(
    keywordSchema.safeParse({
      keyword: "YDS",
      languageCode: "bad_!",
      market: "TR",
      intent: "UNKNOWN",
      examId: null,
      sourceNote: "Manual research",
    }).success,
    false,
  );
  const result = assessOpportunity(
    {
      keyword: "YDS Reading",
      languageCode: "en",
      intent: "PRACTICE",
      examId: "e",
    },
    [{ id: "1", title: "YDS Reading", url: "/exams/yds", examSlug: "yds" }],
    "yds",
  );
  assert.equal(result.relevance, 100);
  assert.equal(result.duplicate, true);
  assert.equal(result.searchDemand, null);
  assert.equal(
    assessOpportunity(
      {
        keyword: "unrelated",
        languageCode: "en",
        intent: "UNKNOWN",
        examId: null,
      },
      [],
      null,
    ).relevance,
    0,
  );
});
test("keyword admin boundaries, deduplication, optimistic revisions and archive", async () => {
  const suffix = randomUUID();
  const admin = await db.user.create({
    data: {
      name: "SEO keyword test",
      email: `kw-${suffix}@example.test`,
      role: "ADMIN",
    },
  });
  const student = await db.user.create({
    data: { name: "SEO student test", email: `kw-st-${suffix}@example.test` },
  });
  const input = {
    keyword: `YDS ${suffix}`,
    languageCode: "tr-TR",
    market: "TR",
    intent: "EXAM_PREPARATION",
    examId: null,
    sourceNote: "Research supplied by editor",
  };
  let id: string | undefined;
  try {
    await assert.rejects(saveSeoKeyword(student.id, input), /yönetici/);
    await assert.rejects(listSeoKeywords(student.id), /yönetici/);
    await assert.rejects(
      saveSeoKeyword(admin.id, { ...input, examId: "missing" }),
      /etkin sınav/,
    );
    const created = await saveSeoKeyword(admin.id, input);
    id = created.id;
    await assert.rejects(
      saveSeoKeyword(admin.id, { ...input, keyword: `  ${input.keyword}  ` }),
      /zaten/,
    );
    const row = await db.seoKeyword.findUniqueOrThrow({ where: { id } });
    assert.equal(row.monthlySearches, null);
    const changed = await saveSeoKeyword(
      admin.id,
      { ...input, id, revision: 0, archived: true },
      true,
    );
    assert.equal(changed.revision, 1);
    await assert.rejects(
      saveSeoKeyword(
        admin.id,
        { ...input, id, revision: 0, archived: false },
        true,
      ),
      /başka bir/,
    );
    assert.equal((await listSeoKeywords(admin.id, { q: suffix })).count, 0);
    assert.equal(
      (await listSeoKeywords(admin.id, { q: suffix, archived: "true" })).count,
      1,
    );
    assert.equal(
      await db.seoActivityLog.count({
        where: { actorId: admin.id, action: "KEYWORD_SAVED" },
      }),
      2,
    );
    await db.user.update({
      where: { id: admin.id },
      data: { isActive: false },
    });
    await assert.rejects(saveSeoKeyword(admin.id, input), /yönetici/);
  } finally {
    if (id) await db.seoKeyword.delete({ where: { id } });
    await db.seoActivityLog.deleteMany({ where: { actorId: admin.id } });
    await db.user.deleteMany({ where: { id: { in: [admin.id, student.id] } } });
  }
});
