import Link from "next/link";
import {
  GROUP_EXAM_FILTERS,
  groupExamFilter,
  matchesGroupExam,
  weekRange,
} from "@/lib/availability";
import { listGroupSlots } from "@/server/services/group-availability.service";
import { WeekView } from "@/components/availability/WeekView";
import { AvailabilityRefresh } from "@/components/availability/AvailabilityRefresh";
import { PageHero } from "@/components/ui/PageHero";
export const dynamic = "force-dynamic";
export const metadata = { title: "Haftalık Grup Dersleri" };
export default async function GroupLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; exam?: string }>;
}) {
  const { week, exam: requestedExam } = await searchParams;
  const exam = groupExamFilter(requestedExam);
  const { start, end } = weekRange(week);
  const slots = (await listGroupSlots(start, end)).filter((slot) =>
    matchesGroupExam(slot.course.product, exam),
  );
  const labels = {
    yds: "YDS",
    yokdil: "YÖKDİL",
    toefl: "TOEFL",
    ielts: "IELTS",
    pte: "PTE",
  };
  return (
    <main className="inner-page mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <AvailabilityRefresh />
      <PageHero>
        <p className="eyebrow">Birlikte öğrenelim</p>
        <h1 className="page-title">Haftalık grup dersleri</h1>
        <p className="page-copy">
          Programına uygun saati seç, kontenjanı kontrol et ve yerini ayır.
        </p>
      </PageHero>
      <nav
        aria-label="Sınav türü"
        className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_35px_rgba(12,46,30,.07)] sm:grid-cols-5"
      >
        {GROUP_EXAM_FILTERS.map((value) => (
          <Link
            key={value}
            href={`/group-lessons?exam=${value}${week ? `&week=${encodeURIComponent(week)}` : ""}`}
            aria-current={exam === value ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold transition ${
              exam === value
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {labels[value]}
          </Link>
        ))}
      </nav>
      <WeekView week={week} slots={slots} exam={exam} />
    </main>
  );
}
