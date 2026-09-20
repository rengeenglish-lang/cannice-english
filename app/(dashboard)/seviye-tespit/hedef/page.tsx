import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { GoalWizard } from "@/components/diagnostics/GoalWizard";
import { logEvent } from "@/lib/diagnostics/analytics";

export const metadata: Metadata = { title: "Hedefini Belirle" };

export default async function GoalPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const exams = await db.examType.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } });
  await logEvent("goal_started", user.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <p className="eyebrow">Hedefini Belirle</p>
        <h1 className="page-title">Hazırlandığın sınavı ve hedefini belirleyelim.</h1>
        <p className="page-copy mt-3">Bu bilgiler, sana özel çalışma planını oluşturmamız için kullanılır.</p>
      </div>
      <GoalWizard exams={exams.map((e) => ({ id: e.id, code: e.code, name: e.name }))} />
    </main>
  );
}
