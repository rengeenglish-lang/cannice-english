"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { toggleLessonProgress } from "@/server/services/learning.service";
import { syncCertificates } from "@/server/services/certificates.service";

export async function toggleLessonProgressAction(courseId: string, enrollmentId: string, recordedLessonId: string) {
  const user = await getAuthContext();
  if (!user) redirect("/sign-in");

  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== user.id) redirect("/dashboard");

  await toggleLessonProgress(enrollmentId, recordedLessonId);
  await syncCertificates(user.id).catch((e) => console.error("[certificates] sync failed", e));
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard");
}
