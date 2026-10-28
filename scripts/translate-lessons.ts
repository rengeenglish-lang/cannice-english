/**
 * Background batch: fills `contentBodyEn` for every Konu Anlatımı lesson that has Turkish content
 * but no English yet. Runs piece by piece, saves each lesson as soon as it's done, and skips lessons
 * already translated, so it's safe to stop and re-run.
 *
 *   npm run translate:lessons
 *
 * Needs DATABASE_URL (from .env). Only the lessons listed by the query are touched.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { translateLessonBody, sleep } from "../lib/google-translate";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const lessons = await db.topicLesson.findMany({
    where: { contentBody: { not: null }, contentBodyEn: null },
    select: { id: true, title: true, topic: { select: { name: true } } },
    orderBy: [{ topic: { displayOrder: "asc" } }, { position: "asc" }],
  });
  console.log(`${lessons.length} ders çevrilecek.`);

  let done = 0;
  const failed: string[] = [];
  for (const [index, lesson] of lessons.entries()) {
    const label = `[${index + 1}/${lessons.length}] ${lesson.topic.name} › ${lesson.title}`;
    try {
      const current = await db.topicLesson.findUnique({ where: { id: lesson.id }, select: { contentBody: true } });
      if (!current?.contentBody) continue;
      const english = await translateLessonBody(current.contentBody);
      await db.topicLesson.update({ where: { id: lesson.id }, data: { contentBodyEn: english } });
      done++;
      console.log(`${label} — tamam`);
    } catch (error) {
      failed.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`${label} — HATA: ${failed[failed.length - 1]}`);
      // Give the endpoint a longer break after a failure before the next lesson.
      await sleep(5000);
    }
  }

  console.log(`\nBitti. Çevrilen: ${done}, hata: ${failed.length}.`);
  if (failed.length) {
    console.log("Hatalı dersler (tekrar çalıştırınca yeniden denenir):");
    for (const line of failed) console.log(` - ${line}`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
