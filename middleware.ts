import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Defense-in-depth session gate for protected route trees, running before any page/layout code.
 * Cannot check role (Edge runtime has no Prisma) — role gating stays in app/(dashboard)/admin/layout.tsx.
 * This is what makes login redirect-back work everywhere, not just the one group-lessons flow that
 * had it before.
 */
export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/seviye-tespit/:path*"],
};
