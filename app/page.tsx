import { Hero } from "@/components/marketing/Hero";
import { ExamPicker } from "@/components/marketing/ExamPicker";
import { PackageHighlights } from "@/components/marketing/PackageHighlights";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { BlogTeaser } from "@/components/marketing/BlogTeaser";
import { CallMeBackForm } from "@/components/marketing/CallMeBackForm";
import { listExamTypes, listProducts, listTestimonials, listPublishedBlogPosts } from "@/server/services/catalog.service";

export default async function HomePage() {
  const [exams, featuredProducts, testimonials, posts] = await Promise.all([
    listExamTypes(),
    listProducts({ featuredOnly: true }),
    listTestimonials(true),
    listPublishedBlogPosts(3),
  ]);

  return (
    <main className="pb-24">
      <Hero />
      <ExamPicker exams={exams} />
      <PackageHighlights products={featuredProducts} />
      <TestimonialsSection testimonials={testimonials} />
      <BlogTeaser posts={posts} />
      <CallMeBackForm />
    </main>
  );
}
