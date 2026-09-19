import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mic2 } from "lucide-react";
import { SPEAKING_EXAMS, type SpeakingExam } from "@/lib/speaking-practice";

export const metadata: Metadata = { title: "Konuşma Pratiği" };

export default function SpeakingPracticeIndexPage() {
  return (
    <div>
      <p className="eyebrow">Tarayıcı tabanlı · Ücretsiz</p>
      <h1 className="page-title">Konuşma pratiği</h1>
      <p className="page-copy">IELTS ve TOEFL konuşma görevlerini süreli olarak yanıtlayın, kaydınızı dinleyin ve anlık akıcılık göstergelerini görün.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {(Object.entries(SPEAKING_EXAMS) as [SpeakingExam, (typeof SPEAKING_EXAMS)[SpeakingExam]][]).map(([slug, exam]) => (
          <Link key={slug} href={`/dashboard/speaking-practice/${slug}`} className="dashboard-panel group block">
            <div className="relative z-10"><span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--accent)]"><Mic2 /></span><h2 className="mt-5 text-2xl font-extrabold">{exam.name}</h2><p className="mt-2 leading-7 text-[color:var(--muted)]">{exam.description}</p><span className="mt-6 inline-flex items-center gap-2 font-bold text-[color:var(--accent)]">Pratiğe başla <ArrowRight size={18} className="transition group-hover:translate-x-1" /></span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
