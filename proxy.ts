import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Defense-in-depth session gate for protected route trees, running before any page/layout code
 * (renamed from middleware.ts — the file convention Next.js 16 deprecated in favor of proxy.ts).
 * Role gating (TEACHER/ADMIN) stays in app/(dashboard)/admin/layout.tsx rather than moving here.
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
