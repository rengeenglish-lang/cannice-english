import "server-only";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { db } from "@/server/db";
import { konuAnlatimHref } from "@/lib/konu-links";
import type { PlanAccess } from "@/server/services/plans.service";

export const RESOURCE_TYPES = [
  { slug: "e-kitaplar", label: "E-Kitaplar", description: "Kelime kitapları, soru bankaları ve çalışma kitapları — dijital olarak indir." },
  { slug: "konu-konu", label: "Konu Konu", description: "Her sınav konusu için konu anlatımı ve konuya özel çalışma kaynakları." },
  { slug: "pdf-denemeler", label: "PDF Denemeler", description: "Yazdırıp gerçek sınav koşullarında çözebileceğin PDF deneme setleri." },
  { slug: "kayitli-kaynaklar", label: "Kayıtlı Kaynaklar", description: "Satın aldığın, planına dahil olan ve derslerine eklediğin kaynaklar." },
] as const;
export type ResourceTypeSlug = (typeof RESOURCE_TYPES)[number]["slug"];

export const RESOURCE_EXAMS = [
  { slug: "ielts", label: "IELTS Kaynakları" },
  { slug: "toefl", label: "TOEFL Kaynakları" },
  { slug: "pte", label: "PTE Kaynakları" },
  { slug: "yds", label: "YDS Kaynakları" },
  { slug: "yokdil-fen-bilimleri", label: "YÖKDİL Fen Kaynakları" },
  { slug: "yokdil-sosyal-bilimler", label: "YÖKDİL Sosyal Kaynakları" },
  { slug: "yokdil-saglik-bilimleri", label: "YÖKDİL Sağlık Kaynakları" },
] as const;

export type ResourceItem = {
  id: string;
  title: string;
  description?: string | null;
  badge: string;
  href: string;
  cta: string;
  external?: boolean;
};

const DIGITAL_FORMATS = ["PDF", "PRINT_AND_PDF"] as const;
const isSafeUrl = (url: string) => /^(https?:\/\/|\/(?!\/))/.test(url);

function freeResourceItem(r: { id: string; title: string; description: string | null; fileUrl: string }): ResourceItem {
  return { id: `free-${r.id}`, title: r.title, description: r.description, badge: "ÜCRETSİZ", href: isSafeUrl(r.fileUrl) ? r.fileUrl : "#", cta: "Ücretsiz indir", external: true };
}

async function ownedBookIds(userId: string | null) {
  if (!userId) return new Set<string>();
  const items = await db.orderItem.findMany({ where: { order: { userId, status: "PAID" }, product: { category: "BOOK" } }, select: { productId: true } });
  return new Set(items.map((i) => i.productId));
}

export async function listResources(type: ResourceTypeSlug, examSlug: string, user: { id: string } | null, access: PlanAccess): Promise<ResourceItem[]> {
  const exam = await db.examType.findUnique({ where: { slug: examSlug } });
  if (!exam) return [];
  const freeMaterials = access.can("FREE_MATERIALS");
  const owned = await ownedBookIds(user?.id ?? null);

  const bookItem = (b: { id: string; slug: string; title: string; shortDescription: string | null; book: { digitalFileUrl: string | null; format: string } | null }): ResourceItem => {
    if (findNetfenerEbook(b.slug)) {
      const purchased = owned.has(b.id);
      return { id: b.id, title: b.title, description: b.shortDescription, badge: purchased ? "SATIN ALINDI" : "E-KİTAP", href: purchased ? `/api/ebooks/${b.slug}` : `/kaynaklar/e-kitaplar/onizleme/${b.slug}`, cta: purchased ? "Tam kitabı indir" : "İlk 3 sayfayı incele", external: purchased };
    }
    const canDownload = Boolean(b.book?.digitalFileUrl) && (owned.has(b.id) || freeMaterials);
    if (canDownload) {
      return { id: b.id, title: b.title, description: b.shortDescription, badge: owned.has(b.id) ? "SATIN ALINDI" : "PLANINA DAHİL", href: b.book!.digitalFileUrl!, cta: "İndir", external: true };
    }
    return { id: b.id, title: b.title, description: b.shortDescription, badge: "E-KİTAP", href: `/books/${b.slug}`, cta: owned.has(b.id) ? "Görüntüle" : "İncele ve satın al" };
  };

  if (type === "e-kitaplar") {
    const [books, free] = await Promise.all([
      db.product.findMany({ where: { category: "BOOK", isPublished: true, examTypeId: exam.id, book: { format: { in: [...DIGITAL_FORMATS] } } }, include: { book: true }, orderBy: { displayOrder: "asc" } }),
      db.freeResource.findMany({ where: { examTypeId: exam.id, OR: [{ kind: "E_BOOK" }, { kind: null }] }, orderBy: { createdAt: "desc" } }),
    ]);
    return [...books.filter((book) => !findNetfenerEbook(book.slug)).map(bookItem), ...free.map(freeResourceItem)];
  }

  if (type === "konu-konu") {
    const [topics, free] = await Promise.all([
      db.examTopic.findMany({ where: { examTypeId: exam.id }, include: { _count: { select: { lessons: true } } }, orderBy: { displayOrder: "asc" } }),
      db.freeResource.findMany({ where: { examTypeId: exam.id, kind: "TOPIC" }, orderBy: { createdAt: "desc" } }),
    ]);
    const konu = access.can("KONU_ANLATIMI");
    return [
      ...topics.map((t, i) => ({
        id: t.id,
        title: t.name,
        description: `${t._count.lessons} ders${t.questionCount ? ` · sınavda ~${t.questionCount} soru` : ""}`,
        badge: konu ? "PLANINA DAHİL" : i === 0 ? "ÜCRETSİZ ÖNİZLEME" : "PLAN GEREKLİ",
        href: konuAnlatimHref(exam.slug, t.slug),
        cta: "Konuyu aç",
      })),
      ...free.map(freeResourceItem),
    ];
  }

  if (type === "pdf-denemeler") {
    const [free, books] = await Promise.all([
      db.freeResource.findMany({ where: { examTypeId: exam.id, kind: "PDF_MOCK" }, orderBy: { createdAt: "desc" } }),
      db.product.findMany({ where: { category: "BOOK", isPublished: true, examTypeId: exam.id, title: { contains: "Deneme", mode: "insensitive" } }, include: { book: true } }),
    ]);
    return [
      ...free.map(freeResourceItem),
      ...books.map(bookItem),
      { id: "online-deneme", title: `${exam.name} online deneme sınavları`, description: "Gerçek sınav süresiyle, otomatik puanlanan online denemeler.", badge: "ONLINE", href: "/dashboard/mock-exam", cta: "Denemelere git" },
    ];
  }

  // kayitli-kaynaklar — what this student already has for the exam.
  if (!user) return [];
  const [books, saved] = await Promise.all([
    db.product.findMany({ where: { category: "BOOK", examTypeId: exam.id, ...(freeMaterials ? { OR: [{ id: { in: [...owned] } }, { isPublished: true, book: { digitalFileUrl: { not: null } } }] } : { id: { in: [...owned] } }) }, include: { book: true } }),
    db.savedExamTopic.findMany({ where: { userId: user.id, topic: { examTypeId: exam.id } }, include: { topic: true } }),
  ]);
  return [
    ...books.filter((book) => !findNetfenerEbook(book.slug) || owned.has(book.id)).map(bookItem),
    ...saved.map((s) => ({ id: s.id, title: s.topic.name, description: "Derslerine eklediğin konu anlatımı", badge: "DERSLERİMDE", href: konuAnlatimHref(exam.slug, s.topic.slug), cta: "Konuyu aç" })),
  ];
}

