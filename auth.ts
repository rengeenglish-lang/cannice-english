import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "@/server/db";
import { verifyPassword } from "@/server/auth/password";
import { validateCanonicalUrl } from "@/server/env";
import { authConfig } from "@/auth.config";
import { isGoogleConfigured, resolveGoogleUser } from "@/server/auth/google";

validateCanonicalUrl();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id; // Netfener user id (set by the Google signIn callback below)
      return token;
    },
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;
      const resolved = await resolveGoogleUser({
        email: profile?.email,
        emailVerified: profile?.email_verified,
        name: profile?.name,
        image: typeof profile?.picture === "string" ? profile.picture : null,
      });
      if (!resolved.ok) return false;
      user.id = resolved.userId; // the session id must be the Netfener user id, never Google's subject
      return true;
    },
  },
  providers: [
    ...(isGoogleConfigured() ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })] : []),
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
  logger: {
    error(error) {
      if (error.name === "CredentialsSignin" || ("type" in error && error.type === "CredentialsSignin")) return;
      if (process.env.NODE_ENV === "development") console.error(error);
      else console.error(`[auth] ${error.name || "Authentication error"}`);
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
