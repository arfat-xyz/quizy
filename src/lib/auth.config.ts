// /lib/auth.config.ts
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      // On first login
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach token values into session
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as Role,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
