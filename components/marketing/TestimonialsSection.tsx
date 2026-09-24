import { EXAM_META } from "@/lib/exam-types";
import type { ExamCode } from "@/lib/generated/prisma/enums";

type TestimonialData = {
  id: string;
  studentName: string;
  resultSummary: string | null;
  quote: string;
  examType: { name: string; code: ExamCode } | null;
};

export function TestimonialsSection({ testimonials, className = "mt-20" }: { testimonials: TestimonialData[]; className?: string }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className={`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 ${className}`}>
      <p className="eyebrow">Katılımcı Görüşleri</p>
      <h2 className="section-title">Öğrencilerimiz ne diyor?</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => {
          const palette = testimonial.examType ? EXAM_META[testimonial.examType.code] : undefined;
          return (
            <figure key={testimonial.id} className="panel flex flex-col gap-4 border-t-4" style={{ borderTopColor: palette?.solid ?? "var(--brand)" }}>
              <blockquote className="text-sm leading-6 text-[color:var(--foreground)]">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-auto flex items-center justify-between gap-2 border-t border-[color:var(--border)] pt-4">
                <div>
                  <p className="text-sm font-extrabold text-[color:var(--foreground)]">{testimonial.studentName}</p>
                  {testimonial.examType ? <p className="text-xs font-bold" style={{ color: palette?.solid }}>{testimonial.examType.name} Öğrencisi</p> : null}
                </div>
                {testimonial.resultSummary ? (
                  <span className="exam-pill" style={{ backgroundColor: palette?.solid ?? "var(--brand)" }}>{testimonial.resultSummary}</span>
                ) : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
