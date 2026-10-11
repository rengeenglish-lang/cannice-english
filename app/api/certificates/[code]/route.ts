import { certificatePdf } from "@/server/services/certificates.service";

/** Public by design: anyone with the verification code may see the certificate it proves. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = await certificatePdf(code.toUpperCase());
  if (!result) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(result.pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${result.fileName}"`, "cache-control": "public, max-age=3600" },
  });
}
