import type { Metadata } from "next";
import { listPublishedBlogPosts } from "@/server/services/catalog.service";
import { BlogTeaser } from "@/components/marketing/BlogTeaser";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts(30);
  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">E2 Blog</p>
      <h1 className="page-title">Sınav hazırlığı, motivasyon ve çalışma teknikleri</h1>
      <div className="mt-4">
        <BlogTeaser posts={posts} />
      </div>
    </main>
  );
}
