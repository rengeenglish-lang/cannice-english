import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "İngilizce Gramer" };

export default async function GrammarPage() {
  const category = await db.blogCategory.findUnique({ where: { slug: "ingilizce-gramer" } });
  const posts = category
    ? await db.blogPost.findMany({ where: { categoryId: category.id, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } })
    : [];

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">İngilizce Gramer</p>
      <h1 className="page-title">Gramer ve Konu Anlatımı</h1>
      <p className="page-copy">Sınav hazırlığınıza destek olacak gramer konularını ve kullanım örneklerini burada bulabilirsiniz.</p>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="panel flex flex-col gap-3 transition hover:-translate-y-1">
            <h2 className="text-lg font-extrabold leading-snug text-[color:var(--foreground)]">{post.title}</h2>
            <p className="text-sm leading-6 text-[color:var(--muted)]">{post.excerpt}</p>
            <span className="mt-auto text-sm font-bold text-[color:var(--accent-strong)]">Devamını Oku →</span>
          </Link>
        ))}
        {posts.length === 0 ? <p className="text-[color:var(--muted)]">Gramer konuları yakında eklenecek.</p> : null}
      </div>
    </main>
  );
}
