import { getAuthContext } from "@/server/auth/context";
import { listPrintOrders } from "@/server/services/orders.service";
import { isShippedProduct, parseShippingAddress } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = ["Sipariş", "Tarih", "Alıcı", "Telefon", "Adres", "Adres devamı", "İlçe", "İl", "Posta kodu", "Kargo notu", "Basılacak kitaplar", "E-posta"];

/** Excel only reads Turkish characters correctly when the file starts with this marker. */
const BOM = "\uFEFF";

/** Everything is quoted, so a comma or a line break inside an address cannot break the file. */
const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** The print partner's work list: paid orders with something to print, as a spreadsheet. */
export async function GET() {
  const user = await getAuthContext();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return Response.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const orders = await listPrintOrders();
  const rows = orders.map((order) => {
    const address = parseShippingAddress(order.shippingAddress);
    const books = order.items
      .filter((item) => isShippedProduct(item.product))
      .map((item) => `${item.titleSnapshot}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`)
      .join(" | ");
    return [
      order.id,
      order.createdAt.toISOString().slice(0, 10),
      address?.name ?? order.user?.name ?? order.guestName ?? "",
      address?.phone ?? order.guestPhone ?? "",
      address?.line1 ?? "",
      address?.line2 ?? "",
      address?.district ?? "",
      address?.city ?? "",
      address?.postalCode ?? "",
      address?.note ?? "",
      books,
      order.user?.email ?? order.guestEmail ?? "",
    ].map(cell).join(",");
  });

  const csv = BOM + `${COLUMNS.map(cell).join(",")}\n${rows.join("\n")}\n`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="netfener-baski-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
