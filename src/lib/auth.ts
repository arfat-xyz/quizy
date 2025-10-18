import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/lib/auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "@/data/account";
import { generateVerificationToken } from "@/lib/token";
import { sendEmailViaNodemailer } from "@/lib/mail";
import { generateVerificationEmail } from "@/lib/email-template-generator";
import { env } from "@/lib/envs";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/zod-schemas/auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  // session: { strategy: "jwt" },
  ...authConfig,
  pages: {
    signIn: "/auth/register",
  },
  providers: [
    ...authConfig.providers, // Spread the Google provider from config
    // Add Credentials provider here (it needs database access)
    Credentials({
      async authorize(credentials) {
        const validatedData = LoginSchema.safeParse(credentials);
        if (!validatedData.success) return null;

        const { email, password } = validatedData.data;

        const user = await db.user.findFirst({
          where: {
            email,
          },
        });

        if (!user?.id || !user.password || !user.email) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      if (!user.id) return false;

      const existingUser = await getUserById(user.id);
      if (!existingUser?.email) return false;

      if (!existingUser?.emailVerified) {
        const verificationToken = await generateVerificationToken(
          existingUser.email,
        );
        await sendEmailViaNodemailer({
          template: generateVerificationEmail(
            `${env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken.token}`,
          ),
          subject: "Verify your email",
          to: verificationToken.email,
        });
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      // Add role when user first signs in (user object exists on initial signin)
      if (user) {
        token.role = user.role; // Type assertion for initial signin
      }
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;

      return token;
    },
    async session({ token, session }) {
      const newSession = {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isOauth: token.isOauth as boolean,
          role: token.role as Role,
        },
      };
      return newSession;
    },
  },
});
