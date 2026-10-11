import { getAuthContext } from "@/server/auth/context";
import { invoicePdfFor } from "@/server/services/invoices.service";

/** Invoice PDF, rebuilt from the stored snapshot: for the buyer and for staff. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getAuthContext();
  const result = viewer ? await invoicePdfFor(id, viewer) : null;
  if (!result) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(result.pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${result.fileName}"`,
      "cache-control": "private, no-store",
    },
  });
}
