import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { dayKey } from "@/lib/engagement";
import { EXAM_KIND_LABEL, NEXT_CALENDAR_YEAR, examStatus, splitCalendar, type CalendarExam } from "@/content/exam-calendar";

export const metadata: Metadata = {
  title: "ÖSYM Sınav Takvimi",
  description: "YDS, YÖKDİL ve e-YDS sınav, başvuru ve sonuç tarihleri tek takvimde.",
};

// The upcoming/past split depends on today's date, so the page is rebuilt once an hour.
export const revalidate = 3600;

const formatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" });
const fmt = (key?: string) => (key ? formatter.format(new Date(`${key}T00:00:00Z`)) : "—");

function applicationCell(e: CalendarExam) {
  if (!e.applicationStart && !e.applicationEnd) return "—";
  const range = e.applicationStart && e.applicationEnd ? `${fmt(e.applicationStart)} – ${fmt(e.applicationEnd)}` : fmt(e.applicationEnd ?? e.applicationStart);
  return e.lateApplication ? (
    <>
      {range}
      <span className="block text-xs text-[color:var(--muted)]">Geç başvuru: {fmt(e.lateApplication)}</span>
    </>
  ) : (
    range
  );
}

function CalendarTable({ exams, today, label }: { exams: CalendarExam[]; today: string; label: string }) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${label} — tabloyu yatay kaydırın`}>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Sınav</th>
            <th>Başvuru</th>
            <th>Sınav Tarihi</th>
            <th>Sonuç</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((e) => (
            <tr key={e.name}>
              <td className="font-bold text-[color:var(--foreground)]">
                {e.name}
                <span className="block text-xs font-normal text-[color:var(--muted)]">
                  {EXAM_KIND_LABEL[e.kind]}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </td>
              <td>{applicationCell(e)}</td>
              <td>{fmt(e.examDate)}</td>
              <td>{fmt(e.resultDate)}</td>
              <td>{examStatus(e, today)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExamCalendarPage() {
  const today = dayKey(new Date());
  const { upcoming, past } = splitCalendar(today);

  return (
    <main className="inner-page mx-auto w-full max-w-[1000px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">YDS, YÖKDİL ve e-YDS Takvimi</h1>
        <p className="mt-3 text-[color:var(--muted)]">Başvuru, sınav ve sonuç tarihleri tek tabloda. Kesin tarihler ve ücretler için her zaman ÖSYM duyurularını kontrol edin.</p>
      </PageHero>

      <section className="panel mt-8">
        <h2 className="text-xl font-bold">Yaklaşan sınavlar</h2>
        {upcoming.length ? <div className="mt-4"><CalendarTable exams={upcoming} today={today} label="Yaklaşan sınavlar" /></div> : <p className="mt-3 text-[color:var(--muted)]">Bu yılın takvimindeki sınavların hepsi tamamlandı.</p>}
        <p className="mt-4 rounded-lg border border-[color:var(--border)] p-3 text-sm">
          <strong>{NEXT_CALENDAR_YEAR} takvimi:</strong> ÖSYM, {NEXT_CALENDAR_YEAR} sınav takvimini genellikle Kasım ayında yayımlar. Yayımlandığında tarihleri buraya ekleyeceğiz.
        </p>
      </section>

      <section className="panel mt-6">
        <h2 className="text-xl font-bold">Hangi sınav size uygun?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li><strong>YDS</strong> — yılda iki kez kâğıt üzerinde yapılır. Akademik kadro, doçentlik, kamu yabancı dil tazminatı ve lisansüstü başvurularında kullanılır.</li>
          <li><strong>e-YDS</strong> — YDS ile aynı puan değerinde, bilgisayarda yapılır. Oturum sayısı fazladır ve sonuç genellikle aynı gün açıklanır; kontenjanlar hızlı dolabilir.</li>
          <li><strong>YÖKDİL</strong> — Fen, Sağlık ve Sosyal Bilimler alanlarında ayrı yapılır. Lisansüstü programlar ve akademik yükseltmeler için kullanılır.</li>
          <li><strong>IELTS / TOEFL iBT</strong> — ÖSYM sınavı değildir; yurt dışı başvuruları için tercih edilir. Yıl boyunca neredeyse her hafta oturum açılır, tarih ve merkezler için British Council / IDP (IELTS) ve ETS (TOEFL) sitelerine bakın.</li>
        </ul>
        <p className="mt-4 text-sm">
          Resmi duyurular:{" "}
          <a href="https://www.osym.gov.tr" target="_blank" rel="noopener noreferrer" className="font-semibold underline">osym.gov.tr</a>{" · "}
          Başvuru: <a href="https://ais.osym.gov.tr" target="_blank" rel="noopener noreferrer" className="font-semibold underline">ais.osym.gov.tr</a>
        </p>
      </section>

      {past.length ? (
        <details className="panel mt-6">
          <summary className="cursor-pointer text-xl font-bold">Geçmiş sınavlar ({past.length})</summary>
          <div className="mt-4"><CalendarTable exams={past} today={today} label="Geçmiş sınavlar" /></div>
        </details>
      ) : null}
    </main>
  );
}
