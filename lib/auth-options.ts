import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const skemaLogin = z.object({
  identifier: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "NIK / Username",
          type: "text",
        },
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = skemaLogin.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const identifier = parsed.data.identifier || parsed.data.email;
        const password = parsed.data.password;

        if (!identifier) {
          return null;
        }

        const user = await prisma.users.findFirst({
          where: {
            OR: [
              {
                email: identifier,
              },
              {
                nama: identifier,
              },
              {
                keluarga_akun: {
                  some: {
                    nik: identifier,
                  },
                },
              },
            ],
          },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const passwordCocok = await bcrypt.compare(
          password,
          user.password_hash
        );

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
};