import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session.user.role === "user") {
    if (session.user.mustChangePassword) {
      redirect("/user/ubah-password");
    }

    redirect("/user/dashboard");
  }

  redirect("/login");
}