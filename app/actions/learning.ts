"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { hasCourseAccess } from "@/server/services/access.service";
import { db } from "@/server/db";
import { toggleLessonProgress } from "@/server/services/learning.service";

export async function toggleLessonProgressAction(courseId: string, enrollmentId: string, recordedLessonId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== user.id || enrollment.courseId !== courseId || !(await hasCourseAccess(user.id, courseId))) redirect("/dashboard");

  const lesson = await db.recordedLesson.findUnique({ where: { id: recordedLessonId }, include: { module: true } });
  if (lesson?.module.courseId !== courseId) redirect("/dashboard");
  await toggleLessonProgress(enrollmentId, recordedLessonId);
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard");
}
