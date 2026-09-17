import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getExamTypeBySlug } from "@/server/services/catalog.service";
import { createTopicAction } from "@/app/actions/admin-topics";
import { TopicForm } from "@/components/admin/TopicForm";

export const metadata: Metadata = { title: "Yeni Konu" };

type Props = { params: Promise<{ examSlug: string }> };

export default async function NewTopicPage({ params }: Props) {
  const { examSlug } = await params;
  const exam = await getExamTypeBySlug(examSlug);
  if (!exam) notFound();

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/konu-anlatim" className="hover:underline">Konu Anlatım</Link> ›{" "}
        <Link href={`/admin/konu-anlatim/${examSlug}`} className="hover:underline">{exam.name}</Link>
      </p>
      <h1 className="page-title">Yeni Konu Ekle</h1>
      <div className="mt-8 max-w-3xl">
        <TopicForm topic={null} action={createTopicAction.bind(null, examSlug, exam.id)} />
      </div>
    </div>
  );
}
