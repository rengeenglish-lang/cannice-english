import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopicForEdit } from "@/server/services/admin-diagnostic-topics.service";
import { updateDiagnosticTopicAction } from "@/app/actions/admin-diagnostic-topics";
import { DiagnosticTopicForm } from "@/components/admin/DiagnosticTopicForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopicForEdit(id);
  return { title: topic ? topic.name : "Konuyu Düzenle" };
}

export default async function EditDiagnosticTopicPage({ params }: Props) {
  const { id } = await params;
  const topic = await getTopicForEdit(id);
  if (!topic) notFound();

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/diagnostik/konular" className="hover:underline">Seviye Tespit Konuları</Link> › {topic.name}
      </p>
      <h1 className="page-title">{topic.name}</h1>
      <div className="mt-8 max-w-2xl">
        <DiagnosticTopicForm topic={topic} action={updateDiagnosticTopicAction.bind(null, id)} />
      </div>
    </div>
  );
}
