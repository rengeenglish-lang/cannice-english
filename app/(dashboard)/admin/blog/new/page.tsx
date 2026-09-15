import type { Metadata } from "next";
import { listBlogCategories } from "@/server/services/admin-blog.service";
import { createBlogPostAction } from "@/app/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { QuickAddCategory } from "@/components/admin/QuickAddCategory";

export const metadata: Metadata = { title: "Yeni Yazı" };

export default async function NewBlogPostPage() {
  const categories = await listBlogCategories();
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Yeni Blog Yazısı</h1>
      <QuickAddCategory />
      <div className="mt-6 max-w-3xl">
        <BlogPostForm categories={categories} post={null} action={createBlogPostAction} />
      </div>
    </div>
  );
}
