import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { findNetfenerEbook } from "@/lib/netfener-ebooks";
import { getAuthContext } from "@/server/auth/context";
import { canReadEbookOnline } from "@/server/services/ebooks.service";
import { ebookPageCount } from "@/server/services/ebook-pages.service";
import { isEbookFreePromoActive } from "@/lib/netfener-ebook-promo";
import { ebookLibraryHref } from "@/lib/ebook-library";
import { FlipBook } from "@/components/reader/FlipBook";

export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = findNetfenerEbook((await params).slug);
  return {
    title: book ? `${book.title} — Online oku` : "Kitap bulunamadı",
    // A reader only its buyer can open has nothing to offer a crawler.
    robots: { index: false, follow: false },
  };
}

/** The online edition: the buyer reads the book here, page by page, and never receives the file. */
export default async function EbookReaderPage({ params }: Props) {
  const { slug } = await params;
  const book = findNetfenerEbook(slug);
  if (!book) notFound();

  const reader = `/kaynaklar/e-kitaplar/oku/${book.slug}`;
  const user = await getAuthContext();
  // Full books require a verified promotional account or an existing paid entitlement.
  if (!(await canReadEbookOnline(user?.id, book.slug))) {
    if (!user) redirect(isEbookFreePromoActive() ? `/register?next=${encodeURIComponent(ebookLibraryHref(book.slug))}` : `/sign-in?next=${encodeURIComponent(reader)}`);
    // Not entitled: the preview page is where the three editions are sold.
    redirect(`/dashboard/books?book=${book.slug}`);
  }

  // The PDF is the source of truth for how many pages there are, not the catalogue entry.
  const pageCount = await ebookPageCount(book.slug);
  return <FlipBook slug={book.slug} title={book.title} pageCount={pageCount} />;
}
