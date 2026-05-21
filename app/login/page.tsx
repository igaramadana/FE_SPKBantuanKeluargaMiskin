import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session?.user?.role === "user") {
    redirect("/user/dashboard");
  }

  return (
    <main className="min-h-screen bg-white lg:flex">
      <AuthBrandPanel />
      <LoginForm />
    </main>
  );
}