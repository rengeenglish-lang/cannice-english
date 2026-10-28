"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FLAT_SHIPPING_TRY, formatTRY } from "@/lib/pricing";

export function PrintBookDialog({ title, signedIn, product, returnTo = "/dashboard/books" }: { title: string; signedIn: boolean; product?: { productId: string; price: string }; returnTo?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [paid, setPaid] = useState(false);
  return <>
    <button type="button" className="secondary-button" onClick={() => { setPaid(false); dialog.current?.showModal(); }}>Basılı kitap iste</button>
    <dialog ref={dialog} aria-label={`${title}: basılı kitap`} className="m-auto w-[calc(100%-32px)] max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-[color:var(--foreground)] shadow-2xl backdrop:bg-black/50" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold">{title} · Basılı kitap</h2><button type="button" aria-label="Pencereyi kapat" className="ghost-button" onClick={() => dialog.current?.close()}>✕</button></div>
      <p className="mt-4 text-sm leading-7">Ücretsiz e-kitap kampanyası online okuma ve PDF içindir. Ücretsiz indirmelere basılı kitap dahil değildir.</p>
      {!paid ? <button type="button" className="primary-button mt-5" onClick={() => setPaid(true)}>Ücretli basılı kitap almak istiyorum</button> : <div className="mt-5 space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-4">
        <p className="text-sm leading-7"><strong>Siparişe özel baskı:</strong> Kitabın ödeme onayından sonra sipariş üzerine basılır ve 2 hafta içinde adresine teslim edilir.</p>
        {product ? <><p className="font-semibold">{product.price} <span className="text-sm font-normal">+ {formatTRY(FLAT_SHIPPING_TRY)} kargo</span></p>{signedIn ? <AddToCartButton productId={product.productId} /> : <Link className="primary-button" href={`/register?next=${encodeURIComponent(returnTo)}`}>Sipariş için devam et</Link>}</> : <p className="text-sm">Bu kitabın basılı sürümü şu an satışa açık değil. Hazır olduğunda burada görebilirsin.</p>}
      </div>}
    </dialog>
  </>;
}
