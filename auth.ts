import bcrypt from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

type AppRole = "admin" | "user";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toAppRole(value: unknown): AppRole {
  return value === "admin" ? "admin" : "user";
}

async function findUserByEmailOrNik(identifier: string) {
  const cleanIdentifier = identifier.trim();

  if (!cleanIdentifier) {
    return null;
  }

  // Admin login pakai email
  if (isEmail(cleanIdentifier)) {
    return prisma.users.findUnique({
      where: {
        email: cleanIdentifier,
      },
    });
  }

  // User/warga login pakai NIK
  const keluarga = await prisma.keluarga.findUnique({
    where: {
      nik: cleanIdentifier,
    },
    include: {
      user: true,
    },
  });

  if (!keluarga?.user) {
    return null;
  }

  return keluarga.user;
}

export const authOptions: NextAuthOptions = {
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
          label: "Email atau NIK",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const identifier = String(credentials?.identifier || "").trim();
        const password = String(credentials?.password || "");

        if (!identifier || !password) {
          return null;
        }

        const user = await findUserByEmailOrNik(identifier);

        if (!user) {
          return null;
        }

        if (!user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          image: user.image,
          role: toAppRole(user.role),
          mustChangePassword: Boolean(user.must_change_password),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as {
          id: string;
          role: AppRole;
          mustChangePassword?: boolean;
        };

        token.id = appUser.id;
        token.role = toAppRole(appUser.role);
        token.mustChangePassword = Boolean(appUser.mustChangePassword);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.role = toAppRole(token.role);
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }

      return session;
    },
  },
};

export function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}