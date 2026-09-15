"use client";

import { useActionState } from "react";
import { createBlogCategoryAction } from "@/app/actions/admin-blog";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

export function QuickAddCategory() {
  const [state, formAction, pending] = useActionState(createBlogCategoryAction, initialState);

  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-bold text-[color:var(--accent-strong)]">+ Yeni kategori ekle</summary>
      <form action={formAction} className="mt-2 flex flex-wrap gap-2">
        <input name="name" required placeholder="Kategori adı" className="auth-input mt-0 flex-1" />
        <input name="slug" required placeholder="kategori-slug" className="auth-input mt-0 flex-1" />
        <button type="submit" disabled={pending} className="ghost-button shrink-0">{pending ? "Ekleniyor…" : "Ekle"}</button>
      </form>
      {state.status === "error" ? <p className="mt-1 text-xs font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
    </details>
  );
}
