import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listBlogCategories, getBlogPost } from "@/server/services/admin-blog.service";
import { updateBlogPostAction } from "@/app/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { QuickAddCategory } from "@/components/admin/QuickAddCategory";

export const metadata: Metadata = { title: "Yazıyı Düzenle" };

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [categories, post] = await Promise.all([listBlogCategories(), getBlogPost(id)]);
  if (!post) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Yazıyı Düzenle</h1>
      <QuickAddCategory />
      <div className="mt-6 max-w-3xl">
        <BlogPostForm categories={categories} post={post} action={updateBlogPostAction.bind(null, id)} />
      </div>
    </div>
  );
}
