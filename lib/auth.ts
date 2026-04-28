import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const skemaLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const hasilParse = skemaLogin.safeParse(credentials);

        if (!hasilParse.success) {
          return null;
        }

        const { email, password } = hasilParse.data;

        const user = await prisma.users.findUnique({
          where: { email },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const passwordCocok = await bcrypt.compare(password, user.password_hash);

        if (!passwordCocok) {
          return null;
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }

      return session;
    },
  },
});