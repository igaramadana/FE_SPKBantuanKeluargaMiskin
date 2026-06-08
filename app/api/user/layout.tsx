import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  if (session.user.mustChangePassword) {
    redirect("/user/ubah-password");
  }

  return <>{children}</>;
}