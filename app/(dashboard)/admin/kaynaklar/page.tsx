import type { Metadata } from "next";
import { requireStaff } from "@/server/auth/context";
import { db } from "@/server/db";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { deleteResourceAction } from "@/app/actions/admin-resources";

export const metadata: Metadata = { title: "Kaynaklar" };

const KIND_LABEL: Record<string, string> = { E_BOOK: "E-Kitaplar", TOPIC: "Konu Konu", PDF_MOCK: "PDF Denemeler" };

export default async function AdminResourcesPage() {
  await requireStaff();
  const [exams, resources] = await Promise.all([
    db.examType.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
    db.freeResource.findMany({ include: { examType: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="eyebrow">Yönetim</p>
        <h1 className="page-title">Kaynaklar</h1>
        <p className="page-copy">
          Ücretsiz PDF ve dosyaları Kaynaklar sayfasındaki E-Kitaplar, Konu Konu ve PDF Denemeler bölümlerine ekleyin. Satışa sunulan e-kitaplar Ürünler bölümünden (Kitap kategorisi) yönetilir.
        </p>
      </div>
      <ResourceForm exams={exams.map((e) => ({ id: e.id, name: e.name }))} />
      <ul className="divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-white">
        {resources.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-bold">{r.title}</p>
              <p className="text-xs text-[color:var(--muted)]">{r.examType?.name ?? "Genel"} · {r.kind ? KIND_LABEL[r.kind] : "E-Kitaplar (varsayılan)"} · {r.fileUrl}</p>
            </div>
            <form action={deleteResourceAction.bind(null, r.id)}>
              <button type="submit" className="ghost-button text-xs text-red-700">Sil</button>
            </form>
          </li>
        ))}
        {resources.length === 0 ? <li className="p-4 text-sm text-[color:var(--muted)]">Henüz kaynak yok.</li> : null}
      </ul>
    </div>
  );
}
