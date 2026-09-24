import Link from "next/link";
import { ArrowRight, Mic2, Timer, Volume2 } from "lucide-react";
import type { SpeakingExam } from "@/lib/speaking-practice";

export function SpeakingPracticePromo({ exam }: { exam: SpeakingExam }) {
  const name = exam === "ielts" ? "IELTS" : "TOEFL";
  return <section className="mt-10 overflow-hidden rounded-[1.6rem] bg-[color:var(--brand)] p-6 text-white sm:p-8"><div className="grid items-center gap-7 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-200">Ücretsiz konuşma aracı</p><h2 className="mt-2 text-3xl font-extrabold">{name} Speaking pratiği yapın</h2><p className="mt-3 max-w-2xl leading-7 text-blue-100">Gerçek görev tipleriyle süreli konuş, yanıtını dinle ve kelime hızı ile dolgu sözcüklerini anında gör.</p><div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-blue-100"><span className="flex items-center gap-2"><Mic2 size={17} /> Tarayıcıdan kayıt</span><span className="flex items-center gap-2"><Volume2 size={17} /> Sesli sorular</span><span className="flex items-center gap-2"><Timer size={17} /> Sınav süreleri</span></div></div><Link href={`/dashboard/speaking-practice/${exam}`} className="primary-button bg-white text-[color:var(--brand)] hover:bg-blue-50">Pratiğe başla <ArrowRight size={18} /></Link></div></section>;
}
