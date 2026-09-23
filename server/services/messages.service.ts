import "server-only";
import { db } from "@/server/db";
import { createNotification } from "@/server/services/notifications.service";

export async function sendTeacherMessage(studentId: string, body: string, courseId: string | null) {
  if (courseId) {
    const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId: studentId, courseId } } });
    if (!enrollment) throw new Error("Bu gruba kayıtlı değilsiniz.");
  }
  const message = await db.teacherMessage.create({ data: { studentId, courseId, body } });
  // The group's instructors hear about it directly; with no instructor assigned, every admin does.
  const instructorIds = courseId
    ? (await db.liveSession.findMany({ where: { courseId, instructorId: { not: null } }, select: { instructorId: true }, distinct: ["instructorId"] })).map((s) => s.instructorId!)
    : [];
  const recipients = instructorIds.length
    ? instructorIds
    : (await db.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } })).map((u) => u.id);
  for (const id of recipients) {
    await createNotification(id, { title: "Yeni öğrenci mesajı", body: body.slice(0, 140), href: "/admin/mesajlar" });
  }
  return message;
}

export function listMessagesForStudent(studentId: string) {
  return db.teacherMessage.findMany({
    where: { studentId },
    include: { course: { include: { product: { select: { title: true } } } }, repliedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listMessagesForStaff() {
  return db.teacherMessage.findMany({
    include: {
      student: { select: { name: true, email: true } },
      course: { include: { product: { select: { title: true } } } },
      repliedBy: { select: { name: true } },
    },
    orderBy: [{ repliedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
    take: 200,
  });
}

export async function replyToTeacherMessage(messageId: string, staffId: string, reply: string) {
  const message = await db.teacherMessage.update({
    where: { id: messageId },
    data: { reply, repliedById: staffId, repliedAt: new Date() },
  });
  await createNotification(message.studentId, { title: "Öğretmenin mesajını yanıtladı", body: reply.slice(0, 140), href: "/dashboard/mesajlar" });
  return message;
}
