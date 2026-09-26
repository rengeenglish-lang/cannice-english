import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { NetfenerEbook } from "@/lib/netfener-ebooks";
import type { EbookOffer } from "@/server/services/ebooks.service";

export function EbookPurchase({ book, signedIn, offer }: { book: NetfenerEbook; signedIn: boolean; offer?: EbookOffer }) {
  if (signedIn && offer?.purchased) return <a className="primary-button" href={`/api/ebooks/${book.slug}`} download={book.filename}>Tam kitabı indir</a>;
  if (!offer) return <p className="text-sm text-[color:var(--muted)]">Satışa hazırlanıyor. İlk 3 sayfayı ücretsiz inceleyebilirsiniz.</p>;
  return <div className="space-y-3">
    <p className="text-xl font-bold">{offer.price}</p>
    {signedIn ? <AddToCartButton productId={offer.productId} /> : <Link className="primary-button" href={`/sign-in?next=${encodeURIComponent(`/kaynaklar/e-kitaplar/onizleme/${book.slug}`)}`}>Satın almak için giriş yap</Link>}
  </div>;
}
