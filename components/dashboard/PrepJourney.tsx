import Link from "next/link";
import { Target, ClipboardCheck, Search, ListChecks, Rocket, ArrowRight, CheckCircle2 } from "lucide-react";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getTodayItem } from "@/server/services/study-roadmap.service";

const STEPS = [
  { title: "Hedefini Belirle", description: "Hazırlandığın sınavı, mevcut seviyeni ve hedef puanını belirle.", icon: Target },
  { title: "Seviye Tespiti", description: "Kısa bir sınavla eksiklerini tespit edelim.", icon: ClipboardCheck },
  { title: "Eksiklerini Gör", description: "Hangi konuda ne kadar geliştiğini net biçimde gör.", icon: Search },
  { title: "Kişisel Planını Oluştur", description: "Sana özel, öncelik sırasına göre bir çalışma planı oluşturulur.", icon: ListChecks },
  { title: "Çalışmaya Başla", description: "Ücretsiz ve premium kaynaklarla, canlı derslerle çalış.", icon: Rocket },
];

export async function PrepJourney({ userId }: { userId: string }) {
  const goal = await getActiveGoal(userId);

  if (!goal) {
    return (
      <section aria-labelledby="prep-journey-title" className="dashboard-panel">
        <h2 id="prep-journey-title" className="section-title !text-xl">Hazırlık yolunuz</h2>
        <p className="section-copy text-sm">Hedefinizi belirleyin, size özel hazırlık yolunuzu görün.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <Link
              key={step.title}
              href={i === 0 ? "/seviye-tespit/hedef" : "#"}
              aria-disabled={i !== 0}
              className={`focus-ring rounded-xl border p-5 transition ${i === 0 ? "border-[color:var(--border)] hover:border-[color:var(--accent)] hover:bg-[color:var(--brand-soft)]" : "cursor-default border-dashed border-[color:var(--border)] opacity-60"}`}
            >
              <span className="mb-4 flex items-center justify-between text-[color:var(--accent)]">
                <step.icon size={22} aria-hidden="true" />
                <span className="text-xs font-bold">0{i + 1}</span>
              </span>
              <h3 className="text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[color:var(--muted)]">{i === 0 ? step.description : "Önceki adım tamamlanınca açılır."}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  const completedDiagnostic = await db.diagnosticAttempt.findFirst({
    where: { userId, goalId: goal.id, kind: "FULL_DIAGNOSTIC", status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
  });

  if (!completedDiagnostic) {
    const inProgress = await db.diagnosticAttempt.findFirst({
      where: { userId, goalId: goal.id, kind: "FULL_DIAGNOSTIC", status: "IN_PROGRESS" },
    });
    return (
      <section aria-labelledby="prep-journey-title" className="dashboard-panel">
        <h2 id="prep-journey-title" className="section-title !text-xl">Hazırlık yolunuz</h2>
        <p className="section-copy flex items-center gap-2 text-sm text-[color:var(--success)]">
          <CheckCircle2 size={16} /> Hedef belirlendi: {goal.examType.name} · Hedef puan {goal.targetScoreRaw}
        </p>
        <div className="mt-5 rounded-xl border-2 border-[color:var(--brand)] bg-[color:var(--brand-soft)] p-5">
          <h3 className="text-sm font-bold">Şimdi seviye tespitini tamamla</h3>
          <p className="mt-2 text-xs leading-6 text-[color:var(--muted)]">Eksiklerini görebilmemiz için kısa bir sınavı tamamlaman gerekiyor.</p>
          <Link href="/seviye-tespit/basla" className="primary-button mt-4">
            {inProgress ? "Sınava Devam Et" : "Seviye Tespit Sınavını Başlat"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  const todayItem = await getTodayItem(userId, goal.id);

  return (
    <section aria-labelledby="prep-journey-title" className="dashboard-panel">
      <h2 id="prep-journey-title" className="section-title !text-xl">Hazırlık Durumun</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Hedefin</p>
          <p className="mt-1 text-lg font-extrabold">{goal.examType.name} · {goal.targetScoreRaw}</p>
          {goal.targetDate ? <p className="mt-1 text-xs text-[color:var(--muted)]">Hedef tarih: {goal.targetDate.toLocaleDateString("tr-TR")}</p> : null}
        </div>
        <div className="rounded-xl border border-[color:var(--border)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Son Seviye Tespiti</p>
          <p className="mt-1 text-lg font-extrabold">{completedDiagnostic.completedAt?.toLocaleDateString("tr-TR")}</p>
          <Link href={`/seviye-tespit/sonuc/${completedDiagnostic.id}`} className="mt-1 inline-block text-xs font-semibold text-[color:var(--accent-strong)] hover:underline">
            Sonuçları Gör
          </Link>
        </div>
      </div>
      {todayItem ? (
        <Link href="/dashboard/plan" className="ghost-button mt-4">Tüm Hazırlık Planını Gör <ArrowRight size={16} /></Link>
      ) : (
        <p className="mt-4 text-sm font-semibold text-[color:var(--success)]">Şu anda belirgin bir eksiğin yok — harika gidiyorsun!</p>
      )}
    </section>
  );
}
