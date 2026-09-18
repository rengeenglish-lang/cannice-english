import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CalendarDays,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { formatTRY } from "@/lib/pricing";
import { LiveCalendar, type CalendarSession } from "./LiveCalendar";

export type LearningCourse = {
  id: string;
  title: string;
  total: number;
  completed: number;
  percent: number;
  nextLesson: { id: string; title: string } | null;
};
type Order = { id: string; title: string; total: string; status: string };
const STATUS: Record<string, string> = {
  PENDING: "Beklemede",
  AWAITING_PAYMENT: "Ödeme bekleniyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  CANCELLED: "İptal edildi",
  REFUNDED: "İade edildi",
};
export function LearningDashboard({
  name,
  courses,
  orders,
  sessions,
  today,
}: {
  name: string;
  courses: LearningCourse[];
  orders: Order[];
  sessions: CalendarSession[];
  today: string;
}) {
  const resume =
    courses.find((c) => c.completed > 0 && c.nextLesson) ??
    courses.find((c) => c.nextLesson);
  const completed = courses.reduce((n, c) => n + c.completed, 0);
  return (
    <div className="space-y-7">
      <header className="learning-welcome">
        <div>
          <p className="eyebrow">SİZİN ÖĞRENME YOLCULUĞUNUZ</p>
          <h1 className="page-title">Merhaba, {name.split(" ")[0]}.</h1>
          <p className="mt-4 text-sm leading-7 text-blue-100">
            {resume
              ? "Küçük adımlar, düzenli ilerleme. Çalışmanıza kaldığınız yerden devam edin."
              : "Çalışma alanınıza hoş geldiniz. Konuları keşfedin, hedefinize uygun bir başlangıç yapın."}
          </p>
        </div>
        <Link
          href={
            resume
              ? "/dashboard/courses/" +
                resume.id +
                "#lesson-" +
                resume.nextLesson!.id
              : "/konu-anlatim"
          }
          className="primary-button shrink-0"
        >
          {resume ? "Çalışmaya devam et" : "Öğrenmeye başla"}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: courses.length, label: "Aktif kurs", icon: BookOpen },
          { value: completed, label: "Tamamlanan ders", icon: CheckCircle2 },
          {
            value: sessions.length,
            label: "Yaklaşan canlı ders",
            icon: CalendarDays,
          },
        ].map(({ value, label, icon: Icon }) => (
          <div key={label} className="learning-stat">
            <div className="learning-icon">
              <Icon size={23} aria-hidden="true" />
            </div>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <section aria-labelledby="start-title" className="dashboard-panel">
        <h2 id="start-title" className="section-title !text-xl">
          Hazırlık yolunuz
        </h2>
        <p className="section-copy text-sm">
          İhtiyacınız olan adımı seçin; çalışma düzeninizi siz belirleyin.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              href: "/tools/score-calculator",
              title: "Hedefinizi belirleyin",
              description: "Sınav puanı hesaplama aracını kullanın.",
              icon: Calculator,
            },
            {
              href: "/konu-anlatim",
              title: "Öğrenin ve uygulayın",
              description: "Konu anlatımları ve örnek sorularla çalışın.",
              icon: BookOpen,
            },
            {
              href: "/dashboard#live-sessions",
              title: "Derslerinizi planlayın",
              description: "Kayıtlı olduğunuz grupların takvimini görün.",
              icon: CalendarDays,
            },
          ].map((step, i) => (
            <Link
              key={step.href}
              href={step.href}
              className="focus-ring rounded-xl border border-[color:var(--border)] p-5 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--brand-soft)]"
            >
              <span className="mb-4 flex items-center justify-between text-[color:var(--accent)]">
                <step.icon size={22} aria-hidden="true" />
                <span className="text-xs font-bold">0{i + 1}</span>
              </span>
              <h3 className="text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[color:var(--muted)]">
                {step.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section
        id="courses"
        aria-labelledby="courses-title"
        className="scroll-mt-28"
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">DERSLERİNİZ</p>
            <h2 id="courses-title" className="section-title">
              Bir sonraki adımınız
            </h2>
          </div>
          <Link href="/packages" className="ghost-button text-sm">
            Kaynakları keşfet{" "}
            <ArrowUpRight size={17} className="ml-2" aria-hidden="true" />
          </Link>
        </div>
        {courses.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-card-header">
                  <div className="mb-4 flex items-center justify-between text-[color:var(--accent-strong)]">
                    <BookOpen size={24} aria-hidden="true" />
                    <span className="text-xs font-bold">
                      {course.percent === 100 && course.total
                        ? "Tamamlandı"
                        : "Aktif kurs"}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold">{course.title}</h3>
                </div>
                <div className="course-card-body">
                  <div>
                    <div className="mb-2 flex justify-between gap-3 text-xs text-[color:var(--muted)]">
                      <span>
                        {course.completed} / {course.total} ders tamamlandı
                      </span>
                      <strong>%{course.percent}</strong>
                    </div>
                    <progress
                      className="learning-progress"
                      value={course.completed}
                      max={course.total || 1}
                      aria-label={course.title + " ilerlemesi"}
                    />
                  </div>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">
                    {course.nextLesson
                      ? "Sıradaki: " + course.nextLesson.title
                      : course.total
                        ? "Tüm dersler tamamlandı. İstediğiniz zaman tekrar edebilirsiniz."
                        : "Ders içeriği ve canlı program için kursunuzu açın."}
                  </p>
                  <Link
                    href={
                      "/dashboard/courses/" +
                      course.id +
                      (course.nextLesson
                        ? "#lesson-" + course.nextLesson.id
                        : "")
                    }
                    className="primary-button mt-auto"
                  >
                    {course.nextLesson ? "Derse devam et" : "Kursu aç"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="learning-empty">
            <BookOpen
              size={32}
              className="mx-auto mb-4 text-[color:var(--accent)]"
              aria-hidden="true"
            />
            <h3 className="font-bold">İlk adımınızla başlayalım.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[color:var(--muted)]">
              Henüz aktif bir kursunuz yok. Satın aldığınız dersler, ödemeniz
              onaylandıktan sonra burada görünür. Bu sırada konu anlatımlarını
              inceleyebilirsiniz.
            </p>
            <Link href="/konu-anlatim" className="primary-button mt-5">
              Konu anlatımlarına git
            </Link>
          </div>
        )}
      </section>
      <section
        id="live-sessions"
        className="scroll-mt-28"
        aria-label="Canlı ders takvimi"
      >
        <LiveCalendar sessions={sessions} today={today} />
      </section>
      <section
        id="orders"
        className="dashboard-panel scroll-mt-28"
        aria-labelledby="orders-title"
      >
        <p className="eyebrow">HESABINIZ</p>
        <h2 id="orders-title" className="section-title !text-xl">
          Siparişlerim
        </h2>
        {orders.length ? (
          <ul className="mt-5 divide-y divide-[color:var(--border)]">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{order.title}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {STATUS[order.status] ?? "Beklemede"}
                  </p>
                </div>
                <strong className="text-sm">{formatTRY(order.total)}</strong>
                <Link
                  href={"/orders/" + order.id + "/receipt"}
                  className="ghost-button text-xs"
                >
                  Siparişi görüntüle
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Henüz bir siparişiniz yok. Seçtiğiniz materyallerin ve derslerin
            sipariş durumu burada görünür.
          </p>
        )}
      </section>
    </div>
  );
}
