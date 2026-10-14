import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/server/auth/context";
import { getOwnAttempt, savedAnswers, settleAttempt } from "@/server/services/online-deneme.service";
import { loadPaper } from "@/lib/online-denemeler/paper";
import { DenemeRunner } from "@/components/online-deneme/DenemeRunner";

export const metadata: Metadata = { title: "YDS Denemesi" };

export default async function DenemeSessionPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const user = await getAuthContext();
  if (!user) return null;

  const found = await getOwnAttempt(attemptId, user.id);
  if (!found) notFound();
  // Past the deadline the sitting is locked here, before anything is rendered.
  const attempt = await settleAttempt(found);
  const resultHref = `/dashboard/yds-denemeleri/sonuc/${attempt.id}`;
  if (attempt.status !== "IN_PROGRESS") redirect(resultHref);

  const [paper, answers] = await Promise.all([loadPaper(attempt.denemeNo), savedAnswers(attempt.id)]);
  if (!paper) notFound();

  return (
    <main className="px-4 pb-16 sm:px-6">
      <DenemeRunner
        attemptId={attempt.id}
        paper={paper}
        initialAnswers={answers}
        initialMode={attempt.mode}
        deadlineAt={attempt.deadlineAt.toISOString()}
        serverNow={new Date().toISOString()}
        resultHref={resultHref}
      />
    </main>
  );
}
