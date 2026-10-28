/** Minimal, isolated data for the marketing browser checks. Never runs against a live database. */
import { db } from "../server/db";
import { NETFENER_EBOOKS } from "../lib/netfener-ebooks";

const target = new URL(process.env.DATABASE_URL ?? "http://invalid");
if (process.env.CI !== "true" || !["127.0.0.1", "localhost"].includes(target.hostname) || !target.pathname.endsWith("_test")) {
  throw new Error("Marketing fixtures require CI and an isolated localhost *_test database.");
}

async function main() {
  const exam = await db.examType.create({ data: { code: "YDS", slug: "yds", name: "YDS", active: true } });
  for (const [index, book] of [NETFENER_EBOOKS[0], NETFENER_EBOOKS[5], NETFENER_EBOOKS[6]].entries()) {
    await db.product.create({ data: {
      slug: book.slug, title: book.title, category: "BOOK", examTypeId: exam.id,
      basePrice: 499, salePrice: 299, isPublished: true, isFeatured: true, displayOrder: index,
      shortDescription: book.description, book: { create: { author: "Netfener", pageCount: book.pages, format: "PDF" } },
    } });
  }
  const teacher = await db.user.create({ data: { name: "Test Eğitmeni", email: "marketing-teacher@example.test", role: "TEACHER" } });
  const startsAt = new Date(Date.now() + 86400000);
  const product = await db.product.create({ data: {
    slug: "marketing-test-group", title: "YDS Hazırlık Grubu", category: "PREP_GROUP", examTypeId: exam.id,
    basePrice: 11999, salePrice: 11999, isPublished: true, isFeatured: true,
    shortDescription: "YDS konu anlatımı ve sınav pratiği.",
    course: { create: { deliveryFormat: "LIVE_ONLY", syllabusSummary: "Kelime, gramer ve paragraf sorularıyla canlı hazırlık." } },
  }, include: { course: true } });
  await db.liveSession.create({ data: {
    courseId: product.course!.id, title: "YDS canlı ders", startsAt,
    endsAt: new Date(startsAt.getTime() + 3600000), availabilityEnabled: true, instructorId: teacher.id,
  } });
}
main().finally(() => db.$disconnect());
