import Link from "next/link";
import { db } from "@/server/db";
import { addDays, localDate, DEFAULT_CAPACITY } from "@/lib/availability";
import { AdminSlotForm } from "@/components/availability/AdminSlotForm";
export default async function NewGroupSlotPage() {
  const [courses, teachers] = await Promise.all([
    db.course.findMany({ include: { product: true } }),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "TEACHER"] }, isActive: true },
      select: { id: true, name: true },
    }),
  ]);
  return (
    <>
      <Link href="/admin/group-availability" className="text-blue-700">
        ← Grup uygunluğu
      </Link>
      <h1 className="page-title my-6">Ders ekle</h1>
      {courses.length ? (
        <AdminSlotForm
          slot={{
            title: "Grup dersi",
            courseId: courses[0].id,
            date: localDate(addDays(new Date(), 1)),
            time: "18:00",
            duration: 60,
            capacity: DEFAULT_CAPACITY,
            useDisplayedOccupancy: false,
            enrollmentOpen: true,
          }}
          courses={courses.map((c) => ({ id: c.id, title: c.product.title }))}
          teachers={teachers}
        />
      ) : (
        <p>Önce Ürünler bölümünden bir ders paketi oluşturun.</p>
      )}
    </>
  );
}
