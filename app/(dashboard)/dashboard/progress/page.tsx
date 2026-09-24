import Link from "next/link";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { db } from "@/server/db";
import { getActiveGoal } from "@/server/services/diagnostic-goals.service";
import { getRoadmap, getTodayItem } from "@/server/services/study-roadmap.service";
import { getAttemptHistory, getLevelTestHistory, getSkillBreakdown } from "@/server/services/diagnostic-results.service";
import { ProgressDonut } from "@/components/progress/ProgressDonut";
import { PRACTICE_SECTIONS } from "@/lib/practice-sections";
import { getPurchasedMaterials } from "@/server/services/learning.service";
import { getPlanAccess } from "@/server/services/plans.service";
import { listVisits } from "@/server/services/visits.service";
import { SeverityBadge } from "@/components/diagnostics/SeverityBadge";
import { konuAnlatimHref } from "@/lib/konu-links";
import { PLAN_NAMES } from "@/lib/plans";
import { getStudyGoalFailureReports } from "@/server/services/study-goals.service";
import { PERIOD_LABEL } from "@/lib/study-goal-periods";

export const metadata: Metadata = { title: "İlerleme Raporu" };

const SECTIONS = [
  { key: "genel", label: "Genel İlerleme" },
  { key: "konular", label: "Tamamlanan Konular" },
  { key: "odevler", label: "Tamamlanan Ödevler" },
  { key: "seviye", label: "Çözülen Seviye Tespit Sınavları" },
  { key: "denemeler", label: "Çözülen Denemeler" },
  { key: "pratik", label: "Çözülen Pratik Sorular" },
  { key: "okunan", label: "Okunan Konu Anlatımları" },
  { key: "materyaller", label: "Alınan Ek Materyaller" },
  { key: "ziyaret", label: "Site Ziyaret Sıklığı" },
  { key: "hedefler", label: "Kaçırılan Hedefler" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

const dateTR = (d: Date | null | undefined) => (d ? d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—");

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm text-[color:var(--muted)]">{children}</p>;
}

export default async function ProgressReportPage({ searchParams }: { searchParams: Promise<{ bolum?: string }> }) {
  const user = await getAuthContext();
  if (!user) return null;
  const { bolum } = await searchParams;
  const active: SectionKey = SECTIONS.some((s) => s.key === bolum) ? (bolum as SectionKey) : "genel";

  const [goal, history, levelTests, lessonProgress, submissions, materials, access, failedGoals] = await Promise.all([
    getActiveGoal(user.id),
    getAttemptHistory(user.id),
    getLevelTestHistory(user.id),
    db.topicLessonProgress.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      include: { topicLesson: { include: { topic: { include: { examType: true, lessons: { select: { id: true } } } } } } },
      orderBy: { completedAt: "desc" },
    }),
    db.practiceSubmission.findMany({
      where: { enrollment: { userId: user.id } },
      include: { enrollment: { include: { course: { include: { product: { select: { title: true } } } } } } },
      orderBy: { submittedAt: "desc" },
    }),
    getPurchasedMaterials(user.id),
    getPlanAccess(user),
    getStudyGoalFailureReports(user.id),
  ]);

  const mocks = history.filter((a) => a.kind === "MOCK_EXAM");
  const practice = history.filter((a) => a.kind === "PRACTICE" || a.kind === "MASTERY_CHECK");
  const reviewedSubmissions = submissions.filter((s) => s.status === "REVIEWED");

  // A Konu Anlatımı topic counts as completed once every one of its lessons is marked done.
  const doneLessonIds = new Set(lessonProgress.map((p) => p.topicLessonId));
  const topicMap = new Map<string, { name: string; examName: string; examSlug: string; slug: string; completedAt: Date | null; total: number; done: number }>();
  for (const p of lessonProgress) {
    const t = p.topicLesson.topic;
    const entry = topicMap.get(t.id) ?? { name: t.name, examName: t.examType.name, examSlug: t.examType.slug, slug: t.slug, completedAt: p.completedAt, total: t.lessons.length, done: t.lessons.filter((l) => doneLessonIds.has(l.id)).length };
    topicMap.set(t.id, entry);
  }
  const completedKonu = [...topicMap.values()].filter((t) => t.total > 0 && t.done === t.total);
  const roadmap = goal ? await getRoadmap(user.id, goal.id) : [];
  const completedRoadmap = roadmap.filter((r) => r.status === "COMPLETED");

  const includedBooks = access.can("FREE_MATERIALS")
    ? await db.product.findMany({ where: { category: "BOOK", isPublished: true, book: { digitalFileUrl: { not: null } } }, include: { examType: true, book: true } })
    : [];

  const counts: Record<SectionKey, number | null> = {
    genel: null,
    konular: completedKonu.length + completedRoadmap.length,
    odevler: reviewedSubmissions.length,
    seviye: levelTests.length,
    denemeler: mocks.length,
    pratik: practice.length,
    okunan: lessonProgress.length,
    materyaller: materials.length + includedBooks.length,
    ziyaret: null,
    hedefler: failedGoals.length,
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="eyebrow">{goal?.examType.name ?? "Tüm çalışmaların"}</p>
      <h1 className="page-title">İlerleme Raporu</h1>

      <nav aria-label="Rapor bölümleri" className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/dashboard/progress?bolum=${s.key}`}
            aria-current={s.key === active ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              s.key === active ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-strong)] bg-white text-slate-600 hover:border-[color:var(--brand)]"
            }`}
          >
            {s.label}
            {counts[s.key] !== null ? <span className="ml-1.5 opacity-75">({counts[s.key]})</span> : null}
          </Link>
        ))}
      </nav>

      <section className="dashboard-panel mt-6" aria-labelledby="report-section">
        <h2 id="report-section" className="section-title !text-lg">{SECTIONS.find((s) => s.key === active)!.label}</h2>
        {active === "genel" ? <GeneralSection userId={user.id} goal={goal} roadmap={roadmap} planLabel={access.plan ? `${PLAN_NAMES[access.plan.tier]} · ${dateTR(access.plan.expiresAt)} tarihine kadar` : "Aktif plan yok"} counts={counts} /> : null}

        {active === "konular" ? (
          completedKonu.length + completedRoadmap.length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {completedKonu.map((t) => (
                <li key={`${t.examSlug}-${t.slug}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{t.name}</strong> <span className="text-[color:var(--muted)]">· {t.examName} konu anlatımı</span></span>
                  <Link href={konuAnlatimHref(t.examSlug, t.slug)} className="ghost-button text-xs">Tekrar et</Link>
                </li>
              ))}
              {completedRoadmap.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{r.topic.name}</strong> <span className="text-[color:var(--muted)]">· hazırlık planı konusu</span></span>
                  <span className="text-xs text-[color:var(--muted)]">{dateTR(r.completedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Henüz tamamladığın bir konu yok. Bir konunun tüm derslerini bitirdiğinde veya hazırlık planındaki bir konunun kontrol testini geçtiğinde burada görünür.</Empty>
          )
        ) : null}

        {active === "odevler" ? (
          submissions.length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {submissions.map((s) => (
                <li key={s.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{s.title}</strong>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${s.status === "REVIEWED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                      {s.status === "REVIEWED" ? `Değerlendirildi${s.score !== null ? ` · ${String(s.score)} puan` : ""}` : "Değerlendirme bekliyor"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{s.enrollment.course.product.title} · Teslim: {dateTR(s.submittedAt)}{s.reviewedAt ? ` · Değerlendirme: ${dateTR(s.reviewedAt)}` : ""}</p>
                  {s.teacherFeedback ? <p className="mt-2 rounded-xl bg-[color:var(--brand-soft)] p-3">{s.teacherFeedback}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Henüz teslim ettiğin bir ödev yok. Ödevler, kayıtlı olduğun kursların sayfalarından teslim edilir.</Empty>
          )
        ) : null}

        {active === "seviye" ? (
          levelTests.length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {levelTests.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{a.examName}</strong> <span className="text-[color:var(--muted)]">· {dateTR(a.completedAt)} · {a.correct}/{a.total} doğru</span></span>
                  <span className="flex items-center gap-3">
                    <strong className="text-[color:var(--accent-strong)]">{a.cefr ? `${a.cefr} · ` : ""}%{a.percentage}</strong>
                    <Link href={`/dashboard/sonuc/${a.id}`} className="ghost-button text-xs">Görüntüle</Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Henüz seviye tespit sınavı çözmedin. <Link href="/seviye-tespit/yeni" className="font-bold underline">Yeni test başlat</Link></Empty>
          )
        ) : null}

        {active === "denemeler" || active === "pratik" ? (
          (active === "denemeler" ? mocks : practice).length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {(active === "denemeler" ? mocks : practice).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <strong>
                      {a.kind === "MOCK_EXAM" ? `Deneme ${a.mockSetNumber ?? ""}` : a.kind === "MASTERY_CHECK" ? "Konu Kontrolü" : "Pratik"}
                      {a.topicName ? ` · ${a.topicName}` : a.kind === "PRACTICE" ? " · Karma" : ""}
                    </strong>{" "}
                    <span className="text-[color:var(--muted)]">· {a.examName} · {dateTR(a.completedAt)} · {a.correct}/{a.total} doğru</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <strong className="text-[color:var(--accent-strong)]">%{a.percentage}</strong>
                    <Link href={`/dashboard/sonuc/${a.id}`} className="ghost-button text-xs">Görüntüle</Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{active === "denemeler" ? "Henüz deneme sınavı çözmedin." : "Henüz pratik soru çözmedin."}</Empty>
          )
        ) : null}

        {active === "okunan" ? (
          lessonProgress.length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {lessonProgress.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <strong>{p.topicLesson.title}</strong>{" "}
                    <span className="text-[color:var(--muted)]">· {p.topicLesson.topic.examType.name} · {p.topicLesson.topic.name}</span>
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">{dateTR(p.completedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Henüz tamamlandı olarak işaretlediğin bir konu anlatımı yok.</Empty>
          )
        ) : null}

        {active === "materyaller" ? (
          materials.length || includedBooks.length ? (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {materials.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{m.titleSnapshot}</strong> <span className="text-[color:var(--muted)]">· satın alındı {dateTR(m.order.createdAt)}</span></span>
                  {m.product.book?.digitalFileUrl ? (
                    <a href={m.product.book.digitalFileUrl} target="_blank" rel="noopener noreferrer" className="ghost-button text-xs">İndir</a>
                  ) : (
                    <Link href={`/books/${m.product.slug}`} className="ghost-button text-xs">Görüntüle</Link>
                  )}
                </li>
              ))}
              {includedBooks.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span><strong>{b.title}</strong> <span className="text-[color:var(--muted)]">· {b.examType?.name ?? "Genel"} · planına dahil e-kitap</span></span>
                  <a href={b.book!.digitalFileUrl!} target="_blank" rel="noopener noreferrer" className="ghost-button text-xs">İndir</a>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Henüz aldığın bir ek materyal yok. <Link href="/kaynaklar" className="font-bold underline">Kaynaklara göz at</Link></Empty>
          )
        ) : null}

        {active === "ziyaret" ? <VisitSection userId={user.id} /> : null}

        {active === "hedefler" ? (
          <div className="mt-4">
            <p className="text-sm text-[color:var(--muted)]">
              Süresi dolmuş ve sebebini belirttiğin çalışma hedefleri. Tüm hedeflerini <Link href="/dashboard/hedeflerim" className="font-bold underline">Hedef Geçmişim</Link> sayfasından yönetebilirsin.
            </p>
            {failedGoals.length ? (
              <ul className="mt-4 divide-y divide-[color:var(--border)]">
                {failedGoals.map((g) => (
                  <li key={g.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{PERIOD_LABEL[g.period]} hedef</strong>
                      <span className="text-xs text-[color:var(--muted)]">{dateTR(g.periodStart)} – {dateTR(g.periodEnd)}</span>
                    </div>
                    <p className="mt-1 text-[color:var(--muted)]">{g.items.map((it) => (it.kind === "TOPIC" ? it.examTopic?.name : it.kind === "PRACTICE" ? `${it.quantity} pratik seti` : it.kind === "MOCK_EXAM" ? `${it.quantity} deneme` : it.label)).filter(Boolean).join(", ")}</p>
                    <p className="mt-2 rounded-xl bg-rose-50 p-3 text-rose-800"><strong>Sebep:</strong> {g.failureReason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Henüz sebebini belirttiğin kaçırılan bir hedef yok.</Empty>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

async function GeneralSection({
  userId,
  goal,
  roadmap,
  planLabel,
  counts,
}: {
  userId: string;
  goal: Awaited<ReturnType<typeof getActiveGoal>>;
  roadmap: Awaited<ReturnType<typeof getRoadmap>>;
  planLabel: string;
  counts: Record<SectionKey, number | null>;
}) {
  const [responses, todayItem, breakdown] = await Promise.all([
    db.diagnosticResponse.findMany({ where: { attempt: { userId } }, select: { isCorrect: true } }),
    goal ? getTodayItem(userId, goal.id) : null,
    getSkillBreakdown(userId),
  ]);
  const totalAnswered = responses.length;
  const totalCorrect = responses.filter((r) => r.isCorrect === true).length;
  const overallAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const completed = roadmap.filter((r) => r.status === "COMPLETED").length;
  const overallProgress = roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0;
  const weakTopics = roadmap.filter((item) => item.status !== "COMPLETED");

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-[color:var(--muted)]">Planın: <strong className="text-[color:var(--foreground)]">{planLabel}</strong></p>
      <ProgressDonut sections={PRACTICE_SECTIONS.map((s) => ({ key: s.key, label: s.label, counts: breakdown[s.key] }))} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: goal ? `%${overallProgress}` : "—", label: "Hazırlık Planı İlerlemesi" },
          { value: totalAnswered, label: "Çözülen Soru" },
          { value: `%${overallAccuracy}`, label: "Ortalama Doğruluk" },
          { value: counts.okunan ?? 0, label: "Okunan Konu Anlatımı" },
          { value: counts.seviye ?? 0, label: "Seviye Tespit" },
          { value: counts.denemeler ?? 0, label: "Deneme" },
          { value: counts.pratik ?? 0, label: "Pratik Seti" },
          { value: counts.odevler ?? 0, label: "Değerlendirilen Ödev" },
        ].map((stat) => (
          <div key={stat.label} className="learning-stat">
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
      {!goal ? (
        <p className="text-sm">
          Kişisel hazırlık planını görmek için <Link href="/seviye-tespit/hedef" className="font-bold underline">hedefini belirle</Link>.
        </p>
      ) : null}
      {todayItem ? (
        <div className="rounded-2xl border-2 border-[color:var(--brand)] p-5">
          <p className="eyebrow">Önerilen Sıradaki Adım</p>
          <p className="mt-1 text-xl font-extrabold">{todayItem.topic.name}</p>
          <Link href="/dashboard/plan" className="primary-button mt-4">Devam Et</Link>
        </div>
      ) : null}
      {weakTopics.length ? (
        <div>
          <p className="font-bold">Geliştirilmesi Gereken Konular</p>
          <ul className="mt-2 divide-y divide-[color:var(--border)]">
            {weakTopics.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm font-bold">{item.topic.name}</span>
                <SeverityBadge severity={item.severityAtCreation} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

async function VisitSection({ userId }: { userId: string }) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 180);
  const visits = await listVisits(userId, since);
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const byDay = new Map(visits.map((v) => [dayKey(v.day), v.pageViews]));

  // Last 30 days, oldest → newest, in Istanbul calendar days.
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
  const today = new Date(`${todayKey}T00:00:00Z`);
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (29 - i));
    return { key: dayKey(d), date: d, views: byDay.get(dayKey(d)) ?? 0 };
  });
  const activeDays30 = last30.filter((d) => d.views > 0).length;
  const max = Math.max(1, ...last30.map((d) => d.views));

  const months = new Map<string, typeof visits>();
  for (const v of visits) {
    const key = v.day.toISOString().slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), v]);
  }

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="learning-stat"><div><strong>{activeDays30}</strong><span>Son 30 günde aktif gün</span></div></div>
        <div className="learning-stat"><div><strong>{visits.length}</strong><span>Son 6 ayda aktif gün</span></div></div>
        <div className="learning-stat"><div><strong>{visits.reduce((n, v) => n + v.pageViews, 0)}</strong><span>Son 6 ayda sayfa görüntüleme</span></div></div>
      </div>
      <div>
        <p className="text-sm font-bold">Son 30 gün</p>
        <div className="mt-3 flex h-28 items-end gap-1" role="img" aria-label={`Son 30 günde ${activeDays30} gün siteyi ziyaret ettin`}>
          {last30.map((d) => (
            <div
              key={d.key}
              title={`${d.date.toLocaleDateString("tr-TR", { timeZone: "UTC", day: "numeric", month: "long" })}: ${d.views} sayfa`}
              className={`flex-1 rounded-t ${d.views ? "bg-[color:var(--accent)]" : "bg-slate-100"}`}
              style={{ height: `${d.views ? Math.max(12, (d.views / max) * 100) : 6}%` }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-bold">Tarihe göre ziyaretler</p>
        {months.size === 0 ? <Empty>Henüz kayıtlı ziyaret yok.</Empty> : null}
        {[...months.entries()].map(([month, rows], i) => (
          <details key={month} open={i === 0} className="rounded-xl border border-[color:var(--border)] p-3">
            <summary className="cursor-pointer text-sm font-bold">
              {new Date(`${month}-01T00:00:00Z`).toLocaleDateString("tr-TR", { timeZone: "UTC", month: "long", year: "numeric" })} · {rows.length} gün
            </summary>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {rows.map((v) => (
                <li key={v.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{v.day.toLocaleDateString("tr-TR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" })}</span>
                  <span className="font-bold">{v.pageViews} sayfa</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
