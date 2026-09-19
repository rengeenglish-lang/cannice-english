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
  const entitled =
    access?.status === "ACTIVE" &&
    (!access.expiresAt || access.expiresAt > new Date());
  const alternatives = !a.canEnroll ? await nearestGroupSlots(id) : [];
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <AvailabilityRefresh />
      <Link href="/group-lessons" className="text-sm font-bold text-blue-700">
        ← Haftalık dersler
      </Link>
      <h1 className="page-title mt-5">
        {enrolled ? "Grup kaydınız" : "Bu gruba katıl"}
      </h1>
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
              Karttaki doluluk demo amaçlıdır. Kaydınız yukarıdaki gerçek
              kontenjana göre alınır.
            </p>
          )}
          {enrolled ? (
            <>
              <p className="mt-4 font-bold text-emerald-700">
                Bu derse kayıtlısınız.
                {slot.cancelled ? " Ders iptal edildi." : ""}
              </p>
              <BookingForm id={id} booked />
            </>
          ) : !a.canEnroll ? (
            <p role="status" className="mt-5 font-bold text-rose-700">
              Bu gruba şu anda kayıt alınmıyor. Aşağıdaki alternatifleri
              inceleyin.
            </p>
          ) : !user ? (
            <Link
              className="primary-button mt-5"
              href={`/sign-in?next=${encodeURIComponent(`/group-lessons/${id}`)}`}
            >
              Giriş yap ve devam et
            </Link>
          ) : entitled ? (
            <BookingForm id={id} booked={false} />
          ) : (
            <>
              <p className="mt-4 text-sm leading-6">
                Bu ders için {slot.course.product.title} paketine aktif erişim
                gerekiyor. Satın aldıktan sonra çalışma alanınızdan seçtiğiniz
                derse dönebilirsiniz. Ödeme kontenjan ayırmaz; son adımda
                kaydınızı onaylayın.
              </p>
              <form action={purchaseSlotAction.bind(null, id)}>
                <button className="primary-button mt-5">
                  Paketi incele ve devam et
                </button>
              </form>
            </>
          )}
        </section>
      </div>
      {!a.canEnroll && (
        <section className="mt-10">
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
