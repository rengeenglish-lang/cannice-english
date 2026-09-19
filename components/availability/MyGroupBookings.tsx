import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { lessonDate, lessonTime } from "@/lib/availability";
export async function MyGroupBookings({ userId }: { userId: string }) {
  const selected = (await cookies()).get("selected-group-slot")?.value;
  const bookings = await db.groupLessonEnrollment.findMany({
    where: {
      studentId: userId,
      status: "ACTIVE",
      slot: { endsAt: { gte: new Date() } },
    },
    include: { slot: true },
    orderBy: { slot: { startsAt: "asc" } },
  });
  return (
    <section className="mb-6 space-y-3">
      {selected && /^[a-zA-Z0-9_-]+$/.test(selected) && (
        <Link
          href={`/group-lessons/${selected}`}
          className="block rounded-xl bg-blue-50 p-4 font-bold text-blue-800"
        >
          Seçtiğiniz grup dersine dönün ve kaydınızı tamamlayın →
        </Link>
      )}
      {!!bookings.length && (
        <>
          <h2 className="text-xl font-bold">Grup dersi rezervasyonlarım</h2>
          {bookings.map(({ slot }) => (
            <Link
              className="block rounded-xl border bg-white p-4"
              key={slot.id}
              href={`/group-lessons/${slot.id}`}
            >
              <span className="font-bold">
                {lessonDate(slot.startsAt)} · {lessonTime(slot.startsAt)}
              </span>{" "}
              — {slot.title}
              {slot.cancelled && (
                <span className="ml-2 font-bold text-red-700">
                  İptal edildi
                </span>
              )}
            </Link>
          ))}
        </>
      )}
    </section>
  );
}
