import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { isSpeakingExam, SPEAKING_EXAMS } from "@/lib/speaking-practice";

type Props = { params: Promise<{ exam: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam } = await params;
  return { title: isSpeakingExam(exam) ? `${SPEAKING_EXAMS[exam].name} Pratiği` : "Konuşma Pratiği" };
}

export default async function SpeakingPracticePage({ params }: Props) {
  const { exam } = await params;
  if (!isSpeakingExam(exam)) notFound();
  return <div><Link href="/dashboard/speaking-practice" className="ghost-button mb-4 -ml-4"><ArrowLeft size={18} /> Sınav seçimine dön</Link><SpeakingPractice exam={exam} /></div>;
}
