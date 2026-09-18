import type { Metadata } from "next";
import { MaterialsHome } from "@/components/marketing/MaterialsHome";
import {
  listExamTypes,
  listHomepageProducts,
} from "@/server/services/catalog.service";

export const metadata: Metadata = {
  title: {
    absolute: "Cannice English — İngilizce Sınav Hazırlık Materyalleri",
  },
  description:
    "İngilizce sınav hazırlığı için konu anlatımlarını keşfedin, çalışma paketleri ve kitapları karşılaştırın. Önce örnek alıştırmayı deneyin, sonra kaynağınızı seçin.",
};

export default async function HomePage() {
  const [exams, products] = await Promise.all([
    listExamTypes(),
    listHomepageProducts(),
  ]);
  return <MaterialsHome exams={exams} products={products} />;
}
