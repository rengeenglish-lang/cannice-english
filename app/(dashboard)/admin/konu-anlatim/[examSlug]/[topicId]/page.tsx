import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopicForEdit } from "@/server/services/admin-topics.service";
import { updateTopicAction } from "@/app/actions/admin-topics";
import { TopicForm } from "@/components/admin/TopicForm";
import { TopicLessonManager } from "@/components/admin/TopicLessonManager";

type Props = { params: Promise<{ examSlug: string; topicId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicId } = await params;
  const topic = await getTopicForEdit(topicId);
  return { title: topic ? topic.name : "Konuyu Düzenle" };
}

export default async function EditTopicPage({ params }: Props) {
  const { examSlug, topicId } = await params;
  const topic = await getTopicForEdit(topicId);
  if (!topic || topic.examType.slug !== examSlug) notFound();

  return (
    <div>
      <p className="eyebrow">
        <Link href="/admin/konu-anlatim" className="hover:underline">Konu Anlatım</Link> ›{" "}
        <Link href={`/admin/konu-anlatim/${examSlug}`} className="hover:underline">{topic.examType.name}</Link>
      </p>
      <h1 className="page-title">{topic.name}</h1>
      <div className="mt-8 max-w-3xl">
        <TopicForm topic={topic} action={updateTopicAction.bind(null, examSlug, topicId)} />
        <TopicLessonManager examSlug={examSlug} topicId={topicId} lessons={topic.lessons} />
      </div>
    </div>
  );
}
