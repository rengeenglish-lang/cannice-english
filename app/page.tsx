import type { Metadata } from "next";
import { MaterialsHome } from "@/components/marketing/MaterialsHome";
import {
  listExamTypes,
  listHomepageProducts,
  listHomepageGroups,
} from "@/server/services/catalog.service";

export const metadata: Metadata = {
  title: {
    absolute: "Cannice English — IELTS, TOEFL, YDS ve YÖKDİL Hazırlık Platformu",
  },
  description:
    "IELTS, TOEFL, YDS ve YÖKDİL için konu anlatımları, deneme sınavları, seviye tespit, canlı grup dersleri ve çalışma materyalleri tek platformda.",
};

export default async function HomePage() {
  const [exams, products, groups] = await Promise.all([
    listExamTypes(),
    listHomepageProducts(),
    listHomepageGroups(),
  ]);
  return <MaterialsHome exams={exams} products={products} groups={groups} />;
}
