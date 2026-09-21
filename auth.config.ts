import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/server/env";

/**
 * Minimal subset of the NextAuth config — no Credentials provider (which needs Prisma/scrypt).
 * Shared by the full `auth.ts` (API routes/Server Components) and `proxy.ts` (the lean per-request
 * session check), so both read the same session cookie the same way.
 */
export const authConfig = {
  secret: getAuthSecret(),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 60 * 60 },
  pages: { signIn: "/sign-in" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
