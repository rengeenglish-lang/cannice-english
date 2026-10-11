import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/server/auth/context";
import { getExamInterests, suggestedInterest } from "@/server/services/exam-interests.service";
import { ExamInterestsForm } from "@/components/exam-interests/ExamInterestsForm";
import { dayKey } from "@/lib/engagement";

export const metadata: Metadata = { title: "Sınavlarım" };

export default async function MyExamsPage() {
  const user = await getAuthContext();
  if (!user) return null;
  const saved = await getExamInterests(user.id);
  // First visit: pre-tick the exam of the learner's goal or coaching plan.
  const suggestion = saved.length ? null : await suggestedInterest(user.id);
  const values = saved.length ? saved : suggestion ? [{ code: suggestion, examDate: null }] : [];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Sınavlarım</p>
        <h1 className="page-title">Hangi sınavlara hazırlanıyorsun?</h1>
        <p className="page-copy">
          Seçtiğin sınavların geri sayımı her sayfanın üstünde görünür. YDS ve YÖKDİL için ÖSYM takvimindeki en yakın sınav esas alınır;
          IELTS, TOEFL ve PTE için randevu aldığın tarihi ekle.
        </p>
      </div>
      <ExamInterestsForm values={values} today={dayKey(new Date())} />
      {user.role !== "STUDENT" ? (
        <p className="text-sm text-[color:var(--muted)]">Not: Personel hesaplarında içerik kısıtlaması ve geri sayım uygulanmaz.</p>
      ) : null}
      <p className="text-sm text-[color:var(--muted)]">
        Tüm tarihler için <Link href="/tools/exam-calendar" className="font-semibold underline">sınav takvimine</Link> göz at. Satın aldığın kurslar ve kitaplar seçimden bağımsız olarak her zaman açıktır.
      </p>
    </div>
  );
}
