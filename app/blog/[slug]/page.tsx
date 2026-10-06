import { PageHero } from "@/components/ui/PageHero";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getBlogPostBySlug,
  getBlogRedirectSlug,
} from "@/server/services/catalog.service";
import { getSiteUrl } from "@/server/env";
import { articlePath, buildArticleJsonLd, jsonLdScript } from "@/lib/seo/publishing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") return { title: "Yazı Bulunamadı", robots: { index: false, follow: false } };
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const url = articlePath(post.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: { card: post.coverImageUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") {
    const current = post ? null : await getBlogRedirectSlug(slug);
    if (current) permanentRedirect(articlePath(current));
    notFound();
  }
  const jsonLd = buildArticleJsonLd({
    siteUrl: getSiteUrl(),
    slug: post.slug,
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    imageUrl: post.coverImageUrl,
    authorName: post.author.name,
    publishedAt: post.publishedAt,
    modifiedAt: post.updatedAt,
    languageCode: "tr",
  });

  return (
    <main className="inner-page mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
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
