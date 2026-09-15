import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/server/services/catalog.service";
import { formatTRY } from "@/lib/pricing";
import { DiscountBadge } from "@/components/catalog/DiscountBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { LiveSessionSchedule } from "@/components/course/LiveSessionSchedule";
import { EXAM_META } from "@/lib/exam-types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.title ?? "Paket Bulunamadı" };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const palette = product.examType ? EXAM_META[product.examType.code] : undefined;

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {product.examType ? (
            <p className="exam-pill w-fit" style={{ backgroundColor: palette?.solid }}>{product.examType.name}</p>
          ) : null}
          <h1 className="page-title">{product.title}</h1>
          {product.subtitle ? <p className="page-copy">{product.subtitle}</p> : null}
          {product.description ? <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">{product.description}</p> : null}

          {product.course ? (
            <div className="mt-10 space-y-6">
              {product.course.liveSessions.length > 0 ? <LiveSessionSchedule sessions={product.course.liveSessions} /> : null}
              <div>
                <p className="eyebrow mb-4">Ders İçeriği</p>
                <ModuleAccordion modules={product.course.modules} />
              </div>
            </div>
          ) : null}
        </div>

        <aside className="panel h-fit border-t-4 lg:sticky lg:top-24" style={{ borderTopColor: palette?.solid ?? "var(--brand)" }}>
          {product.badgeLabel ? <span className="discount-badge mb-3 inline-flex bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">{product.badgeLabel}</span> : null}
          <div className="flex items-end gap-3">
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <p className="text-base text-[color:var(--muted)] line-through">{formatTRY(String(product.basePrice))}</p>
            ) : null}
            <DiscountBadge basePrice={String(product.basePrice)} salePrice={String(product.salePrice)} />
          </div>
          <p className="text-3xl font-extrabold text-[color:var(--foreground)]">{formatTRY(String(product.salePrice))}</p>
          <p className="text-xs text-[color:var(--muted)]">KDV Dahildir</p>
          <div className="mt-5">
            <AddToCartButton productId={product.id} />
          </div>
          {product.course ? (
            <ul className="mt-6 space-y-2 border-t border-[color:var(--border)] pt-5 text-sm text-[color:var(--muted)]">
              <li>✓ {product.course.deliveryFormat === "HYBRID" ? "Kayıtlı ders + canlı ders" : product.course.deliveryFormat === "LIVE_ONLY" ? "Sadece canlı ders" : "Sadece kayıtlı ders"}</li>
              <li>✓ Kendi hızınızda çalışma imkânı</li>
              <li>✓ Sınav formatında denemeler</li>
            </ul>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
