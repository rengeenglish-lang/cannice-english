import Link from "next/link";

type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: { name: string } | null;
};

export function BlogTeaser({ posts }: { posts: BlogPostData[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mx-auto mt-20 w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Blog</p>
          <h2 className="section-title">Sınav hazırlığına dair son yazılarımız</h2>
        </div>
        <Link href="/blog" className="secondary-button">Tüm Yazılar</Link>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="panel flex flex-col gap-3 transition hover:-translate-y-1">
            {post.category ? <span className="eyebrow">{post.category.name}</span> : null}
            <h3 className="text-lg font-extrabold leading-snug text-[color:var(--foreground)]">{post.title}</h3>
            <p className="text-sm leading-6 text-[color:var(--muted)]">{post.excerpt}</p>
            <span className="mt-auto text-sm font-bold text-[color:var(--accent-strong)]">Devamını Oku →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
