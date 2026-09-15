import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";
import { createTestimonialAction } from "@/app/actions/admin-testimonials";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const metadata: Metadata = { title: "Yeni Görüş" };

export default async function NewTestimonialPage() {
  const exams = await listExamTypes();
  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Yeni Görüş Ekle</h1>
      <div className="mt-8 max-w-2xl">
        <TestimonialForm exams={exams} testimonial={null} action={createTestimonialAction} />
      </div>
    </div>
  );
}
