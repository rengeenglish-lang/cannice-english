import Image from "next/image";
import Link from "next/link";
import { NETFENER_EBOOKS, ebookAction, type NetfenerEbook } from "@/lib/netfener-ebooks";

export function NetfenerEbooks({ books = NETFENER_EBOOKS, signedIn, canDownload }: {
  books?: readonly NetfenerEbook[];
  signedIn: boolean;
  canDownload: boolean;
}) {
  if (!books.length) return null;
  return (
    <section className="mt-10" aria-labelledby="netfener-ebooks-heading">
      <h2 id="netfener-ebooks-heading" className="section-title">Netfener çalışma kitapları</h2>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">Tam kitaplar, Çırak ve Uzman planlarının kaynak erişimine dahildir.</p>
      <ul className="mt-6 grid gap-6 lg:grid-cols-2">
        {books.map((book) => {
          const action = ebookAction(book, signedIn, canDownload);
          return (
            <li key={book.slug} className="panel flex flex-col gap-6 sm:flex-row">
              <Image src={book.cover} alt={`${book.title} kitap kapağı`} width={300} height={424}
                className="mx-auto h-auto w-44 self-start rounded-lg shadow-md sm:mx-0" />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <p className="eyebrow">PDF · {book.pages} sayfa</p>
                <h3 className="mt-3 text-xl font-bold">{book.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{book.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{book.description}</p>
                <div className="mt-auto pt-6">
                  {action.download ? <a className="primary-button" href={action.href} download={book.filename} aria-label={`${book.title} PDF indir`}>{action.label}</a>
                    : <Link className="primary-button" href={action.href}>{action.label}</Link>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
