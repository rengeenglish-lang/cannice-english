import { z } from "zod";
import { findNetfenerEdition } from "@/lib/netfener-ebook-editions";
import { FLAT_SHIPPING_TRY } from "@/lib/pricing";

/** Everything the print partner needs on the parcel, and nothing we do not need to keep. */
export const shippingAddressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).optional(),
  district: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(10).optional(),
  note: z.string().trim().max(300).optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/** A product whose shipping status can be judged: our own editions, and the older print books. */
export type ShippableProduct = { slug: string; book?: { format: string } | null };

/** Whether this product is a physical thing that has to reach an address. */
export function isShippedProduct(product: ShippableProduct): boolean {
  const edition = findNetfenerEdition(product.slug);
  if (edition) return edition.edition === "print";
  return product.book?.format === "PRINT" || product.book?.format === "PRINT_AND_PDF";
}

/** The shipping line for a basket: one flat fee if anything in it ships, otherwise nothing. */
export function shippingTotalFor(products: ShippableProduct[]): number {
  return products.some(isShippedProduct) ? FLAT_SHIPPING_TRY : 0;
}

/** The address as one block of lines, for the admin screen and the printer's export. */
export function formatShippingAddress(address: ShippingAddress): string[] {
  return [
    address.name,
    address.phone,
    address.line1,
    address.line2,
    `${address.district} / ${address.city}${address.postalCode ? ` ${address.postalCode}` : ""}`,
    address.note,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

/** Reads an address back off an order, where it is stored as JSON. Invalid data reads as none. */
export function parseShippingAddress(value: unknown): ShippingAddress | null {
  const parsed = shippingAddressSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
