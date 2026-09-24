import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Shuffle } from "lucide-react";
import { getAuthContext } from "@/server/auth/context";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getPlanAccess } from "@/server/services/plans.service";
import { db } from "@/server/db";
import { examFamilyForCode } from "@/lib/diagnostics/exam-family";
import { startPracticeAction } from "@/app/actions/diagnostic-attempt";
import { PRACTICE_SECTIONS, isPracticeSection, practiceSectionForTopic, type PracticeSectionKey } from "@/lib/practice-sections";
import { PLAN_NAMES, minimumTierFor } from "@/lib/plans";

export const metadata: Metadata = { title: "Pratik Bankası" };

/** Speaking/Writing practice already exists as its own tools — point there instead of an empty list. */
const EXTERNAL_PRACTICE: Partial<Record<PracticeSectionKey, { href: string; label: string; copy: string }>> = {
  speaking: {
    href: "/dashboard/speaking-practice",
    label: "Konuşma pratiğine git",
    copy: "IELTS ve TOEFL Speaking görevlerini sesli ve süreli olarak konuşma pratiği alanında çalışabilirsin.",
  },
};

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ bolum?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { bolum } = await searchParams;
  const [goal, access] = await Promise.all([getActiveGoal(user.id), getPlanAccess(user)]);

  if (!access.can("PRACTICE_QUESTIONS")) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <Lock size={32} className="mx-auto text-[color:var(--accent)]" aria-hidden="true" />
        <p className="eyebrow mt-4">Pratik Bankası</p>
        <h1 className="page-title">Pratik sorular {PLAN_NAMES[minimumTierFor("PRACTICE_QUESTIONS")]} ve Uzman planlarına dahildir.</h1>
        <p className="page-copy mt-4">
          Grammar, Reading, Listening, Speaking ve Writing başlıklarında konu konu pratik yapmak için planını yükselt.
        </p>
        <Link href="/dashboard/mock-exam#planlar" className="primary-button mx-auto mt-6 inline-flex">Planları İncele</Link>
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6">
        <p className="page-copy">Pratik yapabilmek için önce hazırlandığın sınavı ve hedefini belirlemelisin.</p>
        <Link href="/seviye-tespit/hedef" className="primary-button mx-auto mt-6 inline-flex">Hedef Belirle</Link>
      </main>
    );
  }

  const examFamily = examFamilyForCode(goal.examType.code);
  const topics = await db.diagnosticTopic.findMany({
    where: { isActive: true, examFamilies: { has: examFamily }, OR: [{ examTypeId: null }, { examTypeId: goal.examTypeId }] },
    include: { parent: { select: { slug: true } } },
    orderBy: { displayOrder: "asc" },
  });
  const parentIds = new Set(topics.map((t) => t.parentTopicId).filter(Boolean));
  // Only leaf topics are practisable — a parent like "Dil Bilgisi" has no questions of its own.
  const leaves = topics.filter((t) => !parentIds.has(t.id));
  const bySection = new Map<PracticeSectionKey, typeof leaves>();
  for (const topic of leaves) {
    const key = practiceSectionForTopic({ slug: topic.slug, parentSlug: topic.parent?.slug });
    bySection.set(key, [...(bySection.get(key) ?? []), topic]);
  }
  const firstWithTopics = PRACTICE_SECTIONS.find((s) => bySection.get(s.key)?.length)?.key ?? "grammar";
  const active: PracticeSectionKey = isPracticeSection(bolum) ? bolum : firstWithTopics;
  const section = PRACTICE_SECTIONS.find((s) => s.key === active)!;
  const sectionTopics = bySection.get(active) ?? [];
  const external = EXTERNAL_PRACTICE[active];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{goal.examType.name}</p>
      <h1 className="page-title">Pratik Bankası</h1>
      <p className="page-copy">Bir beceri seç, ardından çalışmak istediğin konuyu seçerek pratik yap.</p>

      <nav aria-label="Beceri" className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[color:var(--border)] bg-white p-2 shadow-sm sm:grid-cols-5">
        {PRACTICE_SECTIONS.map((s) => {
          const count = bySection.get(s.key)?.length ?? 0;
          return (
            <Link
              key={s.key}
              href={`/dashboard/practice?bolum=${s.key}`}
              aria-current={s.key === active ? "page" : undefined}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                s.key === active ? "bg-[color:var(--brand)] text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {s.label}
              <span className={`text-[11px] font-bold ${s.key === active ? "text-white/80" : "text-[color:var(--muted)]"}`}>{count ? `${count} konu` : "yakında"}</span>
            </Link>
          );
        })}
      </nav>

      <section className="mt-8" aria-labelledby="section-title">
        <h2 id="section-title" className="section-title !text-lg">{section.label}</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{section.description}</p>

        {sectionTopics.length ? (
          <>
            <form action={startPracticeAction.bind(null, null)} className="mt-5">
              <button type="submit" className="dashboard-panel flex w-full items-center gap-4 text-left transition hover:border-[color:var(--accent)]">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent-strong)]">
                  <Shuffle size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-bold text-[color:var(--foreground)]">Karma Sorular</span>
                  <span className="block text-xs text-[color:var(--muted)]">Sınavının tüm konularından karışık sorularla pratik yap</span>
                </span>
              </button>
            </form>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sectionTopics.map((topic) => (
                <form key={topic.id} action={startPracticeAction.bind(null, topic.id)}>
                  <button type="submit" className="dashboard-panel h-full w-full text-left transition hover:border-[color:var(--accent)]">
                    <span className="block font-bold text-[color:var(--foreground)]">{topic.name}</span>
                    {topic.description ? <span className="mt-1 block text-xs text-[color:var(--muted)]">{topic.description}</span> : null}
                  </button>
                </form>
              ))}
            </div>
          </>
        ) : (
          <div className="learning-empty mt-5">
            <p className="font-bold">{goal.examType.name} için {section.label} pratik soruları hazırlanıyor.</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[color:var(--muted)]">
              {external?.copy ?? "Bu bölüm eklendiğinde burada görünecek. Bu sırada diğer becerilerde pratik yapabilirsin."}
            </p>
            {external ? <Link href={external.href} className="primary-button mt-5">{external.label}</Link> : null}
          </div>
        )}
      </section>
    </main>
  );
}
