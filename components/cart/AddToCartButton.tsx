"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart";

export function AddToCartButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => {
        await addToCartAction(productId);
        router.push("/cart");
      })}
      className="primary-button w-full sm:w-auto"
    >
      {pending ? "Ekleniyor…" : "Sepete Ekle"}
    </button>
  );
}
