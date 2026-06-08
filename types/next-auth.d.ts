import type { DefaultSession } from "next-auth";

type AppRole = "admin" | "user";

declare module "next-auth" {
  interface User {
    id: string;
    role: AppRole;
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: AppRole;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    mustChangePassword?: boolean;
  }
}