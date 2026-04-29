import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white lg:flex">
      <AuthBrandPanel />
      <LoginForm />
    </main>
  );
}