import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthContext } from "@/server/auth/context";
import { getTopicBySlug, getCompletedLessonIdsForUser } from "@/server/services/topics.service";
import { TopicLearnDashboard } from "@/components/topics/TopicLearnDashboard";

type Props = { params: Promise<{ topicSlug: string }>; searchParams: Promise<{ exam?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug("yds", topicSlug);
  return { title: topic ? topic.name : "Konu Anlatım" };
}

export default async function TopicLearnPage({ params, searchParams }: Props) {
  const { topicSlug } = await params;
  const { exam } = await searchParams;
  const examSlug = exam ?? "yds";

  const topic = await getTopicBySlug(examSlug, topicSlug);
  if (!topic) notFound();

  const user = await getAuthContext();
  const completedLessonIds = user ? await getCompletedLessonIdsForUser(user.id, topic.id) : new Set<string>();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <TopicLearnDashboard
        topicSlug={topic.slug}
        topicName={topic.name}
        examName={topic.examType.name}
        examSlug={examSlug}
        lessons={topic.lessons}
        initialCompletedLessonIds={[...completedLessonIds]}
        isSignedIn={Boolean(user)}
      />
    </main>
  );
}
