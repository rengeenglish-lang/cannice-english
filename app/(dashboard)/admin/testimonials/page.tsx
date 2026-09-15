import Link from "next/link";
import type { Metadata } from "next";
import { listTestimonialsForAdmin } from "@/server/services/admin-testimonials.service";
import { deleteTestimonialAction } from "@/app/actions/admin-testimonials";

export const metadata: Metadata = { title: "Katılımcı Görüşleri" };

export default async function AdminTestimonialsPage() {
  const testimonials = await listTestimonialsForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Yönetim</p>
          <h1 className="page-title">Katılımcı Görüşleri</h1>
        </div>
        <Link href="/admin/testimonials/new" className="primary-button">Yeni Görüş Ekle</Link>
      </div>
      <div className="dashboard-panel mt-8 overflow-x-auto">
        <table className="dashboard-table">
          <thead>
            <tr><th>Öğrenci</th><th>Sınav</th><th>Sonuç</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id}>
                <td className="max-w-xs font-bold text-[color:var(--foreground)]">{testimonial.studentName}</td>
                <td>{testimonial.examType?.name ?? "—"}</td>
                <td>{testimonial.resultSummary ?? "—"}</td>
                <td>{testimonial.isPublished ? "Yayında" : "Taslak"}{testimonial.isFeatured ? " · Öne Çıkan" : ""}</td>
                <td className="whitespace-nowrap">
                  <Link href={`/admin/testimonials/${testimonial.id}`} className="ghost-button">Düzenle</Link>
                  <form action={async () => { "use server"; await deleteTestimonialAction(testimonial.id); }} className="inline">
                    <button type="submit" className="ghost-button text-[color:var(--danger)]">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Henüz görüş eklenmedi.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
