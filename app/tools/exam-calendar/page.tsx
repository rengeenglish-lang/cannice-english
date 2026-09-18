import { PageHero } from "@/components/ui/PageHero";
import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "ÖSYM Sınav Takvimi" };

export default async function ExamCalendarPage() {
  const entries = await db.examCalendarEntry.findMany({
    include: { examType: true },
    orderBy: { examDate: "asc" },
  });
  const formatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

  return (
    <main className="inner-page mx-auto w-full max-w-[900px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        <p className="eyebrow">Faydalı Araçlar</p>
        <h1 className="page-title">Tüm ÖSYM Sınavları Tek Takvimde</h1>
      </PageHero>
      <div className="panel mt-8">
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Tabloyu yatay kaydırın"
        >
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Sınav</th>
                <th>Başvuru Bitiş</th>
                <th>Sınav Tarihi</th>
                <th>Sonuç</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-bold text-[color:var(--foreground)]">
                    {entry.examType.name}
                    {entry.title ? ` — ${entry.title}` : ""}
                  </td>
                  <td>
                    {entry.applicationDeadline
                      ? formatter.format(entry.applicationDeadline)
                      : "—"}
                  </td>
                  <td>{formatter.format(entry.examDate)}</td>
                  <td>
                    {entry.resultDate
                      ? formatter.format(entry.resultDate)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 ? (
          <p className="mt-4 text-slate-500">Takvim yakında eklenecek.</p>
        ) : null}
      </div>
    </main>
  );
}
