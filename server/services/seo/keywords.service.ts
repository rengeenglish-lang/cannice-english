import "server-only";
import { db } from "@/server/db";
import {
  keywordSchema,
  updateKeywordSchema,
  normalizeKeyword,
  assessOpportunity,
} from "@/lib/seo/keywords";
import { requireSeoAdmin, lockSeoWrites, checkSeoRateLimit } from "./access";
import { readSeoSettings } from "./settings.service";
import { parseBulkKeywords } from "@/lib/seo/autopilot";
import { z } from "zod";
export async function saveSeoKeyword(
  actorId: string,
  raw: unknown,
  update = false,
) {
  await requireSeoAdmin(actorId);
  const edit = update ? updateKeywordSchema.parse(raw) : null;
  const input = edit ?? keywordSchema.parse(raw);
  return db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "KEYWORD_SAVED");
    if (
      input.examId &&
      !(await tx.examType.findFirst({
        where: { id: input.examId, active: true },
        select: { id: true },
      }))
    )
      throw new Error("Yalnızca mevcut etkin sınav seçilebilir.");
    const normalized = normalizeKeyword(input.keyword, input.languageCode);
    const collision = await tx.seoKeyword.findUnique({
      where: {
        normalized_languageCode_market: {
          normalized,
          languageCode: input.languageCode,
          market: input.market,
        },
      },
    });
    const id = edit?.id;
    if (collision && collision.id !== id)
      throw new Error(
        "Bu anahtar kelime aynı dil ve pazar için zaten kayıtlı.",
      );
    const data = {
      keyword: input.keyword,
      normalized,
      languageCode: input.languageCode,
      market: input.market,
      intent: input.intent,
      examId: input.examId,
      sourceNote: input.sourceNote,
    };
    let result;
    if (edit) {
      const saved = await tx.seoKeyword.updateMany({
        where: { id: edit.id, revision: edit.revision },
        data: { ...data, archived: edit.archived, revision: { increment: 1 } },
      });
      if (saved.count !== 1)
        throw new Error("Kayıt başka bir sekmede değişti. Sayfayı yenileyin.");
      result = { id: edit.id, revision: edit.revision + 1 };
    } else {
      result = await tx.seoKeyword.create({ data });
    }
    await tx.seoActivityLog.create({
      data: {
        actorId,
        action: "KEYWORD_SAVED",
        details: { id: result.id, revision: result.revision },
      },
    });
    return { id: result.id, revision: result.revision };
  });
}
export async function listSeoKeywords(
  actorId: string,
  query: { q?: string; page?: string; archived?: string } = {},
) {
  await requireSeoAdmin(actorId);
  const q = (query.q || "").trim().slice(0, 100),
    page = Math.max(
      1,
      Math.min(10000, Number.parseInt(query.page || "1") || 1),
    );
  const where = {
    archived: query.archived === "true",
    ...(q ? { keyword: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [items, count, exams] = await Promise.all([
    db.seoKeyword.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * 30,
      take: 30,
    }),
    db.seoKeyword.count({ where }),
    db.examType.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);
  // Bound catalogue payload and disclose its size; no student or payment records.
  const inventory = await db.seoContentItem.findMany({
    where: { available: true, publication: "PUBLISHED" },
    select: { id: true, title: true, url: true, examSlug: true },
    orderBy: { sourceKey: "asc" },
    take: 2001,
  });
  const truncated = inventory.length > 2000;
  return {
    items: items.map((item) => ({
      ...item,
      assessment: assessOpportunity(
        item,
        inventory.slice(0, 2000),
        exams.find((e) => e.id === item.examId)?.slug || null,
      ),
    })),
    count,
    page,
    q,
    exams,
    truncated,
  };
}

/**
 * Paste-in import: `anahtar kelime | amaç | sınav | not` per line. Every line is validated like the single-keyword form;
 * duplicates and bad lines are skipped and reported by line number, never silently dropped.
 */
export async function importSeoKeywords(actorId: string, raw: unknown) {
  await requireSeoAdmin(actorId);
  const text = z.string().max(30000).parse(raw);
  const [{ settings }, exams] = await Promise.all([
    readSeoSettings(),
    db.examType.findMany({ where: { active: true }, select: { id: true, code: true, slug: true, name: true } }),
  ]);
  const { rows, errors } = parseBulkKeywords(text, exams);
  const skipped = [...errors];
  let created = 0;
  await db.$transaction(async (tx) => {
    await requireSeoAdmin(actorId, tx);
    await lockSeoWrites(tx);
    await checkSeoRateLimit(tx, actorId, "KEYWORDS_IMPORTED");
    for (const row of rows) {
      const parsed = keywordSchema.safeParse({
        keyword: row.keyword,
        languageCode: settings.languageCode,
        market: settings.targetMarkets[0],
        intent: row.intent,
        examId: row.examId,
        sourceNote: row.sourceNote,
      });
      if (!parsed.success) {
        skipped.push({ line: row.line, message: parsed.error.issues[0]?.message ?? "Geçersiz satır" });
        continue;
      }
      const normalized = normalizeKeyword(parsed.data.keyword, parsed.data.languageCode);
      const exists = await tx.seoKeyword.findUnique({
        where: { normalized_languageCode_market: { normalized, languageCode: parsed.data.languageCode, market: parsed.data.market } },
        select: { id: true },
      });
      if (exists) {
        skipped.push({ line: row.line, message: "Bu anahtar kelime zaten kayıtlı" });
        continue;
      }
      // Explicit, strictly increasing timestamps keep the pasted list order (a transaction otherwise gives every row the same createdAt).
      const at = new Date(Date.now() + created);
      await tx.seoKeyword.create({ data: { ...parsed.data, normalized, createdAt: at } });
      created += 1;
    }
    await tx.seoActivityLog.create({ data: { actorId, action: "KEYWORDS_IMPORTED", details: { created, skipped: skipped.length } } });
  });
  return { created, skipped: skipped.sort((a, b) => a.line - b.line) };
}
