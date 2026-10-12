import { NextResponse } from "next/server";
import { complete } from "@/lib/dictionary";

/** Autocomplete for Netfener Sözlük: headwords and Turkish terms starting with `q`. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  return NextResponse.json({ items: complete(q) }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
