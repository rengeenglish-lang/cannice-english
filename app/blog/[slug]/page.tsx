import { PageHero } from "@/components/ui/PageHero";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getBlogPostBySlug,
  getBlogRedirectSlug,
} from "@/server/services/catalog.service";
import Link from "next/link";
import { ArticleSignupCta, ArticleViewBeacon } from "@/components/blog/ArticleTracking";
import { getArticleLinks } from "@/server/services/seo/research.service";
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
      images: [post.coverImageUrl ?? `${url}/cover`],
    },
    twitter: { card: "summary_large_image", title, description },
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
  const coverSrc = post.coverImageUrl ?? `${articlePath(post.slug)}/cover`;
  const { links, cta } = await getArticleLinks(post.id);
  const jsonLd = buildArticleJsonLd({
    siteUrl: getSiteUrl(),
    slug: post.slug,
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    imageUrl: coverSrc,
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coverSrc} alt={post.title} width={1200} height={630} className="mt-8 w-full rounded-2xl" />
      <div className="panel mt-8 space-y-4 text-base leading-7 text-slate-700">
        {post.content.split("\n\n").map((block, index) => {
          const lines = block.trim().split("\n");
          // Optional light structure: "## Heading" lines and "- item" lists. Plain paragraphs render as before.
          if (lines[0].startsWith("## ")) {
            const rest = lines.slice(1).join("\n").trim();
            return (
              <div key={index} className="space-y-4">
                <h2 className="pt-4 text-2xl font-bold text-slate-900">{lines[0].slice(3)}</h2>
                {rest ? <p>{rest}</p> : null}
              </div>
            );
          }
          if (lines.every((line) => line.startsWith("- ")))
            return (
              <ul key={index} className="list-disc space-y-1 pl-6">
                {lines.map((line, i) => (
                  <li key={i}>{line.slice(2)}</li>
                ))}
              </ul>
            );
          return <p key={index}>{block}</p>;
        })}
      </div>
      {cta ? (
        <aside className="panel mt-8 space-y-3" aria-label="Önerilen sayfa">
          <p className="text-base leading-7 text-slate-700">{cta.text}</p>
          <Link className="primary-button" href={cta.url}>
            {cta.title}
          </Link>
        </aside>
      ) : null}
      {links.length ? (
        <nav className="panel mt-8 space-y-2" aria-label="İlgili sayfalar">
          <h2 className="text-lg font-bold text-slate-900">İlgili sayfalar</h2>
          <ul className="list-disc space-y-1 pl-6">
            {links.map((l) => (
              <li key={l.url}>
                <Link className="underline" href={l.url}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <ArticleSignupCta slug={post.slug} />
      <ArticleViewBeacon slug={post.slug} />
    </main>
  );
}
