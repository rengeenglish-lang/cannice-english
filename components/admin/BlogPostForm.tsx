"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string | null;
  seoDescription: string | null;
} | null;

export function BlogPostForm({
  categories,
  post,
  action,
}: {
  categories: { id: string; name: string }[];
  post: BlogPost;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel space-y-5">
      <div>
        <label className="label" htmlFor="title">Başlık</label>
        <input id="title" name="title" required defaultValue={post?.title} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="slug">Slug (URL)</label>
        <input id="slug" name="slug" required defaultValue={post?.slug} placeholder="ornek-yazi-basligi" className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="excerpt">Özet</label>
        <textarea id="excerpt" name="excerpt" required rows={2} defaultValue={post?.excerpt} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="content">İçerik</label>
        <textarea id="content" name="content" required rows={10} defaultValue={post?.content} className="auth-input" />
        <p className="mt-1 text-xs text-[color:var(--muted)]">Paragrafları boş satırla ayırın.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="categoryId">Kategori</label>
          <select id="categoryId" name="categoryId" defaultValue={post?.categoryId ?? ""} className="auth-input">
            <option value="">—</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tags">Etiketler (virgülle ayırın)</label>
          <input id="tags" name="tags" defaultValue={post?.tags.join(", ") ?? ""} className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="coverImageUrl">Kapak Görseli URL (opsiyonel)</label>
        <input id="coverImageUrl" name="coverImageUrl" defaultValue={post?.coverImageUrl ?? ""} className="auth-input" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="seoTitle">SEO Başlık (opsiyonel)</label>
          <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="seoDescription">SEO Açıklama (opsiyonel)</label>
          <input id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="status">Durum</label>
        <select id="status" name="status" defaultValue={post?.status ?? "DRAFT"} className="auth-input max-w-xs">
          <option value="DRAFT">Taslak</option>
          <option value="PUBLISHED">Yayında</option>
        </select>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
