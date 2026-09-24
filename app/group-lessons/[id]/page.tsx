import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import {
  getGroupSlot,
  nearestGroupSlots,
} from "@/server/services/group-availability.service";
import { lessonDate, lessonTime } from "@/lib/availability";
import { BookingForm } from "@/components/availability/BookingForm";
import { SlotCard } from "@/components/availability/SlotCard";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
import { purchaseSlotAction } from "@/app/actions/group-availability";
import { joinGroupAction, renewGroupAction } from "@/app/actions/live-lessons";
import { claimPerkAction } from "@/app/actions/plans";
import { availablePerkForCourse } from "@/server/services/plans.service";
import { enrollmentGrantsAccess } from "@/lib/diagnostics/access";
import { billingState, isMonthlyBilledCategory } from "@/lib/billing";
import { PLAN_PERK_LABELS } from "@/lib/plans";
import { formatTRY } from "@/lib/pricing";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { favoriteProductIds } from "@/server/services/favorites.service";
export const dynamic = "force-dynamic";
export default async function GroupLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [slot, user] = await Promise.all([getGroupSlot(id), getAuthContext()]);
  if (!slot) notFound();
  const a = slot.availability;
  const booking = user
    ? await db.groupLessonEnrollment.findUnique({
        where: { slotId_studentId: { slotId: id, studentId: user.id } },
      })
    : null;
  const enrolled = booking?.status === "ACTIVE";
  const access = user
    ? await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId: user.id, courseId: slot.courseId },
        },
      })
    : null;
  const entitled = enrollmentGrantsAccess(access);
  const locked = access?.status === "ACTIVE" && billingState(access.paidThrough) === "LOCKED";
  const perk = user && !entitled ? await availablePerkForCourse(user.id, slot.courseId) : null;
  const monthly = isMonthlyBilledCategory(slot.course.product.category);
  const isFavorite = (await favoriteProductIds(user?.id)).has(slot.course.productId);
  const alternatives = !a.canEnroll ? await nearestGroupSlots(id) : [];
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <AvailabilityRefresh />
      <Link href="/group-lessons" className="text-sm font-bold text-blue-700">
        ← Haftalık dersler
      </Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title !mt-0">
          {enrolled ? "Grup kaydın" : "Bu gruba katıl"}
        </h1>
        <FavoriteButton productId={slot.course.productId} initial={isFavorite} title={slot.course.product.title} variant="full" />
      </div>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <SlotCard slot={slot} />
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">
            {lessonDate(slot.startsAt)} · {lessonTime(slot.startsAt)}
          </h2>
          <p className="mt-2 text-slate-600">
            Türkiye saati ·{" "}
            {Math.round(
              (slot.endsAt.getTime() - slot.startsAt.getTime()) / 60000,
            )}{" "}
            dakika
          </p>
          <p className="mt-5 font-bold">
            {a.actual} / {a.capacity} gerçek kayıt · {a.remaining} gerçek yer
            kaldı
          </p>
          {a.simulated && (
            <p className="mt-3 text-sm text-slate-600">
              Karttaki doluluk demo amaçlıdır. Kaydın yukarıdaki gerçek
              kontenjana göre alınır.
            </p>
          )}
          {enrolled ? (
            <>
              <p className="mt-4 font-bold text-emerald-700">
                Bu derse kayıtlısın.
                {slot.cancelled ? " Ders iptal edildi." : ""}
              </p>
              <BookingForm id={id} booked />
            </>
          ) : !a.canEnroll ? (
            <div className="mt-5">
              <p role="status" className="font-bold text-rose-700">
                {a.status === "FULL"
                  ? "Üzgünüz, bu grup dolmuştur. Lütfen farklı bir ders saati seç."
                  : "Bu gruba şu anda kayıt alınmıyor. Aşağıdaki alternatifleri incele."}
              </p>
              {alternatives.length ? (
                <a href="#alternatives" className="ghost-button mt-3 inline-flex">
                  Diğer Saatleri Gör
                </a>
              ) : (
                <Link href="/group-lessons" className="ghost-button mt-3 inline-flex">
                  Diğer Saatleri Gör
                </Link>
              )}
            </div>
          ) : !user ? (
            <Link
              className="primary-button mt-5"
              href={`/sign-in?next=${encodeURIComponent(`/group-lessons/${id}`)}`}
            >
              Giriş yap ve gruba katıl
            </Link>
          ) : entitled ? (
            <BookingForm id={id} booked={false} />
          ) : locked ? (
            <>
              <p className="mt-4 text-sm leading-6">
                Bu grubun aylık ödemesi yapılmadığı için erişimin durduruldu. Ödemeni yaptığında bu derse hemen kaydolabilirsin.
              </p>
              <form action={renewGroupAction.bind(null, slot.courseId)}>
                <button className="primary-button mt-5">Devam etmek için öde</button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-6">
                {monthly
                  ? `Bu grup aylık ücretlidir: ${formatTRY(String(slot.course.product.salePrice))} / ay. Ödemen onaylandığında bu ders saati ve grubun sonraki haftalık dersleri Canlı Derslerim bölümüne otomatik eklenir. Her ay sonunda ödeme hatırlatması alırsın.`
                  : `Bu ders ${slot.course.product.title} paketine dahildir (${formatTRY(String(slot.course.product.salePrice))}). Ödemen onaylandığında ders Canlı Derslerim bölümüne otomatik eklenir.`}
              </p>
              {perk ? (
                <form action={claimPerkAction.bind(null, slot.courseId, id)}>
                  <button className="primary-button mt-5 w-full">Uzman planınla ücretsiz katıl</button>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">Kullanılacak hak: {PLAN_PERK_LABELS[perk]}</p>
                </form>
              ) : null}
              <form action={joinGroupAction.bind(null, id)}>
                <button className={`${perk ? "secondary-button" : "primary-button"} mt-5 w-full`}>Gruba Katıl</button>
              </form>
              <form action={purchaseSlotAction.bind(null, id)}>
                <button className="ghost-button mt-2 w-full">Grup programını incele</button>
              </form>
            </>
          )}
        </section>
      </div>
      {!a.canEnroll && (
        <section id="alternatives" className="mt-10 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-bold">En yakın uygun dersler</h2>
          {alternatives.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {alternatives.map((s) => (
                <SlotCard key={s.id} slot={s} />
              ))}
            </div>
          ) : (
            <Link href="/group-lessons" className="text-blue-700 underline">
              Haftalık takvimi incele
            </Link>
          )}
        </section>
      )}
    </main>
  );
}
