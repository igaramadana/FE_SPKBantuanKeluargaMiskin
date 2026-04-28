export type RoleUser = "admin" | "user";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: RoleUser;
};