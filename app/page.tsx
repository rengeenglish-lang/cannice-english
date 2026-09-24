import type { Metadata } from "next";
import { auth } from "@/auth";
import { MaterialsHome } from "@/components/marketing/MaterialsHome";
import {
  listHomepageProducts,
  listHomepageGroups,
  listTestimonials,
} from "@/server/services/catalog.service";

export const metadata: Metadata = {
  title: {
    absolute: "Netfener — IELTS, TOEFL, PTE, YDS ve YÖKDİL Hazırlık Platformu",
  },
  description:
    "IELTS, TOEFL, PTE, YDS ve YÖKDİL için konu anlatımları, deneme sınavları, seviye tespit, canlı grup dersleri ve çalışma materyalleri tek platformda.",
};

export default async function HomePage() {
  const [products, groups, featured, session] = await Promise.all([
    listHomepageProducts(),
    listHomepageGroups(),
    listTestimonials(true),
    auth(),
  ]);
  // Fall back to any published testimonials so the section still shows before an admin features some;
  // three fill exactly one row of the homepage grid.
  const testimonials = (featured.length ? featured : await listTestimonials()).slice(0, 3);
  return (
    <MaterialsHome
      products={products}
      groups={groups}
      testimonials={testimonials}
      isSignedIn={Boolean(session?.user)}
    />
  );
}
