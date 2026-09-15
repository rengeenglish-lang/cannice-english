import Link from "next/link";
import type { Metadata } from "next";
import { listBlogPostsForAdmin } from "@/server/services/admin-blog.service";
import { deleteBlogPostAction } from "@/app/actions/admin-blog";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await listBlogPostsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Yönetim</p>
          <h1 className="page-title">Blog Yazıları</h1>
        </div>
        <Link href="/admin/blog/new" className="primary-button">Yeni Yazı</Link>
      </div>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Başlık</th><th>Kategori</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="max-w-sm font-bold text-[color:var(--foreground)]">{post.title}</td>
                <td>{post.category?.name ?? "—"}</td>
                <td>{post.status === "PUBLISHED" ? "Yayında" : "Taslak"}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/blog/${post.id}`} className="ghost-button">Düzenle</Link>
                  <form action={async () => { "use server"; await deleteBlogPostAction(post.id); }} className="inline">
                    <button type="submit" className="ghost-button text-[color:var(--danger)]">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {posts.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Henüz yazı eklenmedi.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
