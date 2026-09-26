import "server-only";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { db } from "@/server/db";
import { getGroupSlot } from "@/server/services/group-availability.service";
import { getPlanAccess } from "@/server/services/plans.service";
import type { CartWithItems } from "@/server/services/cart.service";
import { enrollmentGrantsAccess } from "@/lib/diagnostics/access";
import { isMonthlyBilledCategory } from "@/lib/billing";
import { lessonDate, lessonTime } from "@/lib/availability";
import { DEFAULT_ACCESS_MONTHS, PLAN_NAMES, PLAN_RANK } from "@/lib/plans";

export type CartIssue = {
  itemId: string | null;
  /** "error" blocks checkout; "warning" and "info" are advice only. */
  level: "error" | "warning" | "info";
  message: string;
  action?: { href: string; label: string };
};

export type CartItemDetails = { typeLabel: string; href: string; notes: string[] };

const TYPE_LABEL: Record<string, string> = {
  PLAN: "Plan",
  PREP_GROUP: "Canlı Grup Dersi",
  MOCK_CAMP: "Soru & Deneme Kampı",
  STUDY_PACKAGE: "Çalışma Paketi",
  TRANSLATION_SUPPORT: "Akademik Çeviri",
};
const BOOK_FORMAT_LABEL: Record<string, string> = { PDF: "E-Kitap (PDF)", PRINT: "Basılı Kitap", PRINT_AND_PDF: "Basılı + E-Kitap" };

type User = { id: string; role: string } | null;

/**
 * Everything the cart page needs to know before the student pays: what each line is (type,
 * group day/time, plan length) and anything that would make the purchase a mistake — a product no
 * longer on sale, a group time that filled up, a plan below the one they already hold, or an
 * e-book they already own or get free with their plan. Errors here also block placeOrderAction.
 */
export async function inspectCart(cart: CartWithItems, user: User) {
  const issues: CartIssue[] = [];
  const details = new Map<string, CartItemDetails>();
  const access = await getPlanAccess(user);

  const courseIds = cart.items.map((i) => i.product.course?.id).filter((id): id is string => Boolean(id));
  const bookIds = cart.items.filter((i) => i.product.category === "BOOK").map((i) => i.productId);
  const [enrollments, ownedBooks] = await Promise.all([
    user && courseIds.length ? db.enrollment.findMany({ where: { userId: user.id, courseId: { in: courseIds } } }) : [],
    user && bookIds.length
      ? db.orderItem.findMany({ where: { productId: { in: bookIds }, order: { userId: user.id, status: "PAID" } }, select: { productId: true } })
      : [],
  ]);
  const ownedBookIds = new Set(ownedBooks.map((o) => o.productId));

  for (const item of cart.items) {
    const p = item.product;
    const notes: string[] = [];
    const href = p.category === "BOOK" ? `/books/${p.slug}` : p.category === "PLAN" ? "/planlar" : `/packages/${p.slug}`;
    let typeLabel = TYPE_LABEL[p.category] ?? "Ürün";
    if (p.examType) notes.push(p.examType.name);

    if (findNetfenerEbook(p.slug) && Number(p.salePrice) <= 0) {
      issues.push({ itemId: item.id, level: "error", message: `“${p.title}” henüz satışa açılmadı. Önizlemesini E-Kitaplar sayfasından inceleyebilirsiniz.` });
    }
    if (!p.isPublished) {
      issues.push({ itemId: item.id, level: "error", message: `“${p.title}” artık satışta değil. Devam etmek için sepetten kaldırın.` });
    }

    if (!user && (p.category === "PLAN" || p.category === "PREP_GROUP" || findNetfenerEbook(p.slug))) {
      issues.push({
        itemId: item.id,
        level: "error",
        message: `“${p.title}” hesabınıza tanımlanacağı için ödeme öncesinde giriş yapmanız gerekiyor. Sepetiniz giriş yaptıktan sonra korunur.`,
        action: { href: "/sign-in?next=%2Fcart", label: "Giriş yap" },
      });
    }

    if (p.category === "PLAN" && p.planTier) {
      const months = p.accessMonths ?? DEFAULT_ACCESS_MONTHS[p.planTier];
      notes.push(`${months} aylık erişim`, "Tek seferlik ödeme · otomatik yenilenmez");
      const current = access.plan?.tier;
      if (current && PLAN_RANK[current] > PLAN_RANK[p.planTier]) {
        issues.push({ itemId: item.id, level: "error", message: `Zaten daha üst bir planın (${PLAN_NAMES[current]}) var; ${PLAN_NAMES[p.planTier]} planı sana yeni bir özellik kazandırmaz. Sepetten kaldırabilirsin.` });
      } else if (current === p.planTier) {
        issues.push({ itemId: item.id, level: "info", message: `${PLAN_NAMES[current]} planın zaten aktif; bu ödeme süreni mevcut bitiş tarihinden itibaren ${months} ay uzatır.` });
      }
    }

    if (p.category === "BOOK") {
      typeLabel = BOOK_FORMAT_LABEL[p.book?.format ?? "PDF"] ?? "Kitap";
      const digitalOnly = p.book?.format === "PDF";
      if (digitalOnly && ownedBookIds.has(p.id)) {
        issues.push({ itemId: item.id, level: "error", message: `“${p.title}” e-kitabını daha önce satın aldın; Derslerim sayfasından indirebilirsin.`, action: { href: "/dashboard/lessons", label: "Derslerime git" } });
      } else if (!findNetfenerEbook(p.slug) && access.can("FREE_MATERIALS") && p.book?.digitalFileUrl) {
        issues.push(
          digitalOnly
            ? { itemId: item.id, level: "warning", message: `“${p.title}” planına dahil — satın almadan ücretsiz indirebilirsin.`, action: { href, label: "Ücretsiz indir" } }
            : { itemId: item.id, level: "info", message: `“${p.title}” kitabının dijital sürümü planına dahil; bu ödeme basılı kopya içindir.` },
        );
      }
    }

    if (p.course) {
      const enrollment = enrollments.find((e) => e.courseId === p.course!.id);
      const hasAccess = enrollmentGrantsAccess(enrollment);
      if (isMonthlyBilledCategory(p.category)) {
        notes.push("Aylık ödenir · her ay sonunda hatırlatma alırsın");
        if (item.groupSlotId) {
          const slot = await getGroupSlot(item.groupSlotId);
          if (slot && slot.courseId === p.course.id) {
            notes.push(`Seçilen ders: ${lessonDate(slot.startsAt)} · ${lessonTime(slot.startsAt)} ve grubun sonraki haftalık dersleri`);
            if (!slot.availability.canEnroll || slot.startsAt <= new Date()) {
              issues.push({
                itemId: item.id,
                level: "error",
                message: `Seçtiğin ders saati (${lessonDate(slot.startsAt)} · ${lessonTime(slot.startsAt)}) artık müsait değil. Lütfen başka bir saat seç.`,
                action: { href: "/group-lessons", label: "Başka saat seç" },
              });
            }
          } else {
            issues.push({ itemId: item.id, level: "error", message: `“${p.title}” için seçtiğin ders saati artık mevcut değil. Lütfen yeni bir saat seç.`, action: { href: "/group-lessons", label: "Başka saat seç" } });
          }
        } else {
          notes.push("Ders saatini ödeme sonrasında grup takviminden seçebilirsin");
        }
        if (hasAccess) {
          issues.push({ itemId: item.id, level: "info", message: `“${p.title}” grubuna zaten kayıtlısın; bu ödeme üyeliğini bir ay daha uzatır.` });
        }
      } else if (hasAccess) {
        issues.push({ itemId: item.id, level: "error", message: `“${p.title}” paketine zaten erişimin var; tekrar satın almana gerek yok.`, action: { href: `/dashboard/courses/${p.course.id}`, label: "Pakete git" } });
      }
    }

    details.set(item.id, { typeLabel, href, notes });
  }

  return { issues, details, blocking: issues.some((i) => i.level === "error") };
}
