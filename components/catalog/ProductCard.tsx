import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { CSSProperties } from "react";
import { DiscountBadge } from "@/components/catalog/DiscountBadge";
import { formatTRY } from "@/lib/pricing";
import { EXAM_META } from "@/lib/exam-types";
import type { ExamCode } from "@/lib/generated/prisma/enums";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER_TO_ADVANCED: "Başlangıçtan ileri seviyeye",
  INTERMEDIATE_ADVANCED: "Orta ve ileri seviye",
  JUNIOR: "Başlangıç",
  SENIOR: "İleri seviye",
};
type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  level: string | null;
  basePrice: unknown;
  salePrice: unknown;
  category?: string;
  examType: { name: string; code: ExamCode } | null;
};

export function ProductCard({ product, isFavorite = false }: { product: ProductCardData; isFavorite?: boolean }) {
  const palette = product.examType
    ? EXAM_META[product.examType.code]
    : undefined;
  // The heart sits beside (not inside) the card link — a button nested in <a> is invalid HTML.
  return (
    <div className="relative flex">
    <Link
      href={
        (product.category === "BOOK" ? "/books/" : "/packages/") + product.slug
      }
      className="poster-card group w-full"
      style={
        {
          "--catalog-color": palette?.solid ?? "var(--accent)",
        } as CSSProperties
      }
    >
      <div className="catalog-cover">
        <div className="catalog-cover-label">
          <span>NETFENER</span>
          <BookOpen size={22} aria-hidden="true" />
        </div>
        <h3 className="font-extrabold">{product.title}</h3>
        <p className="mt-auto text-sm font-bold text-[color:var(--accent-strong)]">
          {product.examType?.name ?? "İngilizce"}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        {product.level ? (
          <p className="text-xs font-semibold text-[color:var(--muted)]">
            {LEVEL_LABEL[product.level] ?? product.level}
          </p>
        ) : null}
        {product.subtitle ? (
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {product.subtitle}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <div>
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <del className="text-sm text-[color:var(--muted)]">
                {formatTRY(String(product.basePrice))}
              </del>
            ) : null}
            <p className="text-2xl font-extrabold text-[color:var(--brand)]">
              {formatTRY(String(product.salePrice))}
            </p>
            <p className="text-xs text-[color:var(--muted)]">KDV dahil</p>
          </div>
          <DiscountBadge
            basePrice={String(product.basePrice)}
            salePrice={String(product.salePrice)}
          />
        </div>
        <span className="primary-button w-full">
          İçeriği incele <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
    </Link>
    <div className="absolute right-3 top-3 z-10">
      <FavoriteButton productId={product.id} initial={isFavorite} title={product.title} />
    </div>
    </div>
  );
}
