import type { Metadata } from "next";
import { requireAdministrator } from "@/server/auth/context";
import { listCurriculaForAdmin } from "@/server/services/curriculum.service";
import { ACTIVITY_TYPES, ACTIVITY_LABELS, approvedProgrammePlans } from "@/lib/curriculum";
import { ImportCurriculumPlans } from "@/components/admin/ImportCurriculumPlans";

export const metadata: Metadata = { title: "250 Saatlik Programlar", robots: { index: false, follow: false } };
const hours = (minutes: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(minutes / 60);

export default async function CurriculaPage() {
  const actor = await requireAdministrator();
  const courses = await listCurriculaForAdmin(actor.id);
  return <div className="space-y-6">
    <header>
      <p className="eyebrow">Akademik programlar</p>
      <h1 className="page-title">250 saatlik hazırlık programları</h1>
      <p className="mt-3 text-[color:var(--muted)]">Canlı öğretim, uygulama, simülasyon, bağımsız çalışma ve değerlendirme birlikte hesaplanır. Ödeme dönemi program süresini değiştirmez.</p>
    </header>
    <section className="dashboard-panel p-5">
      <h2 className="text-lg font-bold">Onaylı planlar ve etkinlik envanteri</h2>
      <p className="mt-2">{approvedProgrammePlans.length} sınava özgü plan onaylandı. Modül bütçeleri 250 saattir; ders ve etkinlikler tanımlandıkça gerçek program toplamı hesaplanır.</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">Taslaklar satışa açılmaz. Eksik süre, kaynak veya simülasyon bağlantısı varsa yayın engellenir. Süreler otomatik değiştirilmez.</p>
      {courses.length < approvedProgrammePlans.length && <ImportCurriculumPlans />}
    </section>
    {courses.length === 0 ? <section className="dashboard-panel p-5">
      <h2 className="font-bold">Henüz içe aktarılmış program yok</h2>
      <p className="mt-2">Onaylı planları yukarıdaki düğmeyle ekleyin. Mevcut kurslar ve öğrenci ilerlemeleri korunur.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{approvedProgrammePlans.map((plan) => <li key={plan.key} className="rounded-xl border border-[color:var(--border)] p-3"><strong>{plan.name}</strong><p>{plan.modules.length} modül · 250 saat planlandı</p></li>)}</ul>
    </section> : courses.map((course) => <section key={course.id} className="dashboard-panel p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-bold">{course.product.title}</h2>
        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-bold">{course.curriculumPublishedAt ? "Yayımlandı" : "Taslak — satışa kapalı"}</span>
      </div>
      <p className="text-lg font-bold">Tanımlı etkinlikler: {hours(course.report.totalMinutes)} / 250 saat</p>
      <p>Onaylı modül planı: {hours(course.report.plannedMinutes)} saat</p>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ACTIVITY_TYPES.map((type) => <div key={type} className="rounded-xl border border-[color:var(--border)] p-3">
        <dt className="font-bold">{ACTIVITY_LABELS[type]}</dt>
        <dd>{hours(course.report.defined[type])} saat tanımlı / {hours(course.report.planned[type])} saat planlandı</dd>
      </div>)}</dl>
      <details className="rounded-xl border border-[color:var(--border)] p-4">
        <summary className="cursor-pointer font-bold focus-ring">Modüller ve kapsam</summary>
        <ol className="mt-4 space-y-4">{course.modules.map((module, index) => <li key={module.id}>
          <h3 className="font-bold">{index + 1}. {module.title}</h3>
          <p className="mt-1 text-sm">{module.description}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{hours(module.durationBudgets.reduce((sum, b) => sum + b.minutes, 0))} saat planlandı · {module.units.length} ünite · {module.lessons.length} ders</p>
        </li>)}</ol>
      </details>
      {course.report.issues.length > 0 && <details className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <summary className="cursor-pointer font-bold focus-ring">Yayın için tamamlanması gerekenler ({course.report.issues.length})</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{course.report.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
      </details>}
    </section>)}
  </div>;
}
