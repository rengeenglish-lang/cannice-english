import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listExamTypes } from "@/server/services/catalog.service";
import { getTestimonial } from "@/server/services/admin-testimonials.service";
import { updateTestimonialAction } from "@/app/actions/admin-testimonials";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const metadata: Metadata = { title: "Görüşü Düzenle" };

type Props = { params: Promise<{ id: string }> };

export default async function EditTestimonialPage({ params }: Props) {
  const { id } = await params;
  const [exams, testimonial] = await Promise.all([listExamTypes(), getTestimonial(id)]);
  if (!testimonial) notFound();

  return (
    <div>
      <p className="eyebrow">Yönetim</p>
      <h1 className="page-title">Görüşü Düzenle</h1>
      <div className="mt-8 max-w-2xl">
        <TestimonialForm exams={exams} testimonial={testimonial} action={updateTestimonialAction.bind(null, id)} />
      </div>
    </div>
  );
}
