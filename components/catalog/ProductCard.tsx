import Link from "next/link";
import { DiscountBadge } from "@/components/catalog/DiscountBadge";
import { ScoreRing } from "@/components/catalog/ScoreRing";
import { formatTRY } from "@/lib/pricing";
import { EXAM_META } from "@/lib/exam-types";
import type { ExamCode } from "@/lib/generated/prisma/enums";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER_TO_ADVANCED: "Sıfırdan İleriye",
  INTERMEDIATE_ADVANCED: "Orta ve İleri Düzeyi",
  JUNIOR: "Başlangıç",
  SENIOR: "İleri Seviye",
};

type ProductCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  level: string | null;
  basePrice: unknown;
  salePrice: unknown;
  examType: { name: string; code: ExamCode } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const palette = product.examType ? EXAM_META[product.examType.code] : undefined;
  const from = palette?.from ?? "#182449";
  const to = palette?.to ?? "#0e1730";

  return (
    <Link href={`/packages/${product.slug}`} className="poster-card group">
      <div className="poster-art" style={{ backgroundImage: `linear-gradient(155deg, ${from}, ${to})` }}>
        <ScoreRing percent={72} className="pointer-events-none absolute -right-3 -top-3 size-32 opacity-90 transition duration-300 group-hover:scale-110 group-hover:opacity-100" />
        <div className="relative z-10 flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            {product.badgeLabel ? <span className="discount-badge" style={{ color: to }}>{product.badgeLabel}</span> : <span />}
          </div>
          {product.level ? <span className="level-tag w-fit">{LEVEL_LABEL[product.level] ?? product.level}</span> : null}
          <h3 className="text-2xl font-extrabold leading-tight tracking-[-.01em] text-balance">{product.title}</h3>
          {product.subtitle ? <p className="text-sm font-medium text-white/80">{product.subtitle}</p> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {product.examType ? (
          <span className="exam-pill w-fit" style={{ backgroundColor: palette?.solid }}>{product.examType.name}</span>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            {Number(product.basePrice) > Number(product.salePrice) ? (
              <p className="text-sm text-[color:var(--muted)] line-through">{formatTRY(String(product.basePrice))}</p>
            ) : null}
            <p className="text-xl font-extrabold text-[color:var(--foreground)]">{formatTRY(String(product.salePrice))}</p>
          </div>
          <DiscountBadge basePrice={String(product.basePrice)} salePrice={String(product.salePrice)} />
        </div>
        <span className="primary-button mt-1 w-full justify-center">İçeriği İncele</span>
      </div>
    </Link>
  );
}
