import { PageHero } from "@/components/ui/PageHero";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/server/services/catalog.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return {
    title: post?.seoTitle ?? post?.title ?? "Yazı Bulunamadı",
    description: post?.seoDescription ?? post?.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <main className="inner-page mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      <PageHero>
        {post.category ? <p className="eyebrow">{post.category.name}</p> : null}
        <h1 className="page-title">{post.title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {post.author.name}
        </p>
      </PageHero>
      <div className="panel mt-8 space-y-4 text-base leading-7 text-slate-700">
        {post.content.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
