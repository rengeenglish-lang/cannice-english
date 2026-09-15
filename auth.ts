import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/server/db";
import { verifyPassword } from "@/server/auth/password";
import { getAuthSecret, validateCanonicalUrl } from "@/server/env";

validateCanonicalUrl();

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const parsed = z.object({ email: z.email(), password: z.string().min(1).max(128) }).safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email.trim().toLowerCase() },
          select: { id: true, email: true, name: true, password: true, isActive: true },
        });
        if (!user?.password || !user.isActive || !(await verifyPassword(parsed.data.password, user.password))) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 60 * 60 },
  pages: { signIn: "/sign-in" },
  logger: {
    error(error) {
      if (error.name === "CredentialsSignin" || ("type" in error && error.type === "CredentialsSignin")) return;
      if (process.env.NODE_ENV === "development") console.error(error);
      else console.error(`[auth] ${error.name || "Authentication error"}`);
    },
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
