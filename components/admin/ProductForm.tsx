"use client";

import { useActionState, useState } from "react";
import type { AdminFormState } from "@/app/actions/admin-testimonials";

const initialState: AdminFormState = { status: "idle" };

const CATEGORY_OPTIONS = [
  { value: "PREP_GROUP", label: "Hazırlık Grubu" },
  { value: "MOCK_CAMP", label: "Soru & Deneme Kampı" },
  { value: "STUDY_PACKAGE", label: "Çalışma Paketi" },
  { value: "TRANSLATION_SUPPORT", label: "Akademik Çeviri" },
  { value: "BOOK", label: "Kitap" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "—" },
  { value: "BEGINNER_TO_ADVANCED", label: "Sıfırdan İleriye" },
  { value: "INTERMEDIATE_ADVANCED", label: "Orta ve İleri Düzeyi" },
  { value: "JUNIOR", label: "Başlangıç" },
  { value: "SENIOR", label: "İleri Seviye" },
];

type Product = {
  slug: string; title: string; subtitle: string | null; category: string;
  examTypeId: string | null; level: string | null; posterImageUrl: string | null;
  badgeLabel: string | null; basePrice: unknown; salePrice: unknown;
  isPublished: boolean; isFeatured: boolean; displayOrder: number;
  shortDescription: string | null; description: string | null;
  course: { deliveryFormat: string; syllabusSummary: string | null } | null;
  book: { author: string; format: string; pageCount: number | null; isbn: string | null; digitalFileUrl: string | null } | null;
} | null;

export function ProductForm({
  exams,
  product,
  action,
}: {
  exams: { id: string; name: string }[];
  product: Product;
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [category, setCategory] = useState(product?.category ?? "PREP_GROUP");

  return (
    <form action={formAction} className="panel space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Başlık</label>
          <input id="title" name="title" required defaultValue={product?.title} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" required defaultValue={product?.slug} placeholder="ornek-paket-adi" className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="subtitle">Alt Başlık (opsiyonel)</label>
        <input id="subtitle" name="subtitle" defaultValue={product?.subtitle ?? ""} className="auth-input" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="category">Kategori</label>
          <select id="category" name="category" value={category} onChange={(event) => setCategory(event.target.value)} className="auth-input">
            {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="examTypeId">Sınav</label>
          <select id="examTypeId" name="examTypeId" defaultValue={product?.examTypeId ?? ""} className="auth-input">
            <option value="">—</option>
            {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="level">Seviye</label>
          <select id="level" name="level" defaultValue={product?.level ?? ""} className="auth-input">
            {LEVEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="basePrice">Liste Fiyatı (TL)</label>
          <input id="basePrice" name="basePrice" type="number" step="0.01" required defaultValue={product ? String(product.basePrice) : ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="salePrice">Satış Fiyatı (TL)</label>
          <input id="salePrice" name="salePrice" type="number" step="0.01" required defaultValue={product ? String(product.salePrice) : ""} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="badgeLabel">Rozet (opsiyonel)</label>
          <input id="badgeLabel" name="badgeLabel" defaultValue={product?.badgeLabel ?? "Özel İndirim 🔥"} className="auth-input" />
        </div>
        <div>
          <label className="label" htmlFor="displayOrder">Sıralama</label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={product?.displayOrder ?? 0} className="auth-input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="shortDescription">Kısa Açıklama</label>
        <input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} className="auth-input" />
      </div>
      <div>
        <label className="label" htmlFor="description">Detaylı Açıklama</label>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} className="auth-input" />
      </div>

      {category === "BOOK" ? (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[color:var(--border)] p-4 sm:grid-cols-2">
          <p className="col-span-full text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Kitap Bilgileri</p>
          <div>
            <label className="label" htmlFor="author">Yazar</label>
            <input id="author" name="author" defaultValue={product?.book?.author ?? "Cannice Hoca"} className="auth-input" />
          </div>
          <div>
            <label className="label" htmlFor="format">Format</label>
            <select id="format" name="format" defaultValue={product?.book?.format ?? "PDF"} className="auth-input">
              <option value="PDF">Dijital (PDF)</option>
              <option value="PRINT">Basılı</option>
              <option value="PRINT_AND_PDF">Basılı + Dijital</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pageCount">Sayfa Sayısı</label>
            <input id="pageCount" name="pageCount" type="number" defaultValue={product?.book?.pageCount ?? ""} className="auth-input" />
          </div>
          <div>
            <label className="label" htmlFor="isbn">ISBN (opsiyonel)</label>
            <input id="isbn" name="isbn" defaultValue={product?.book?.isbn ?? ""} className="auth-input" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[color:var(--border)] p-4 sm:grid-cols-2">
          <p className="col-span-full text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">Kurs Bilgileri</p>
          <div>
            <label className="label" htmlFor="deliveryFormat">Sunum Şekli</label>
            <select id="deliveryFormat" name="deliveryFormat" defaultValue={product?.course?.deliveryFormat ?? "HYBRID"} className="auth-input">
              <option value="HYBRID">Kayıtlı + Canlı Ders</option>
              <option value="RECORDED_ONLY">Sadece Kayıtlı</option>
              <option value="LIVE_ONLY">Sadece Canlı</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="syllabusSummary">Müfredat Özeti</label>
            <input id="syllabusSummary" name="syllabusSummary" defaultValue={product?.course?.syllabusSummary ?? ""} className="auth-input" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isPublished" defaultChecked={product?.isPublished ?? true} className="size-4" /> Yayında
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="size-4" /> Öne Çıkan
        </label>
      </div>
      {state.status === "error" ? <p className="text-sm font-semibold text-[color:var(--danger)]">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="primary-button">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  );
}
