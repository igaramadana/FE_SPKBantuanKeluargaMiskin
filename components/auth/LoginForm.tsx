"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { UserRound } from "lucide-react";
import { useState } from "react";

import { AuthInput } from "./AuthInput";
import { PasswordInput } from "./PasswordInput";
import type { LoginFormState } from "@/types/auth-form";

const initialFormState: LoginFormState = {
  identifier: "",
  password: "",
  rememberMe: false,
};

export function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateForm<Key extends keyof LoginFormState>(
    key: Key,
    value: LoginFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.identifier.trim() || !form.password.trim()) {
      setError("NIK/username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      identifier: form.identifier,
      email: form.identifier,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("NIK/username atau password salah.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "admin") {
      router.replace("/admin/dashboard");
      router.refresh();
      return;
    }

    if (role === "user") {
      router.replace("/user/dashboard");
      router.refresh();
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <section className="flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-12 lg:px-14 xl:px-24">
      <div className="w-full max-w-[680px]">
        <div className="mb-14 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1B5E20] text-2xl font-bold text-white shadow-md">
            SPK
          </div>

          <div>
            <p className="text-2xl font-normal leading-tight text-black">
              SPK BANTUAN
            </p>
            <p className="text-2xl font-normal leading-tight text-black">
              KELUARGA MISKIN
            </p>
          </div>
        </div>

        <h2 className="text-5xl font-bold tracking-tight text-black md:text-6xl">
          Masuk ke Sistem
        </h2>

        <form onSubmit={handleLogin} className="mt-14 space-y-9">
          <AuthInput
            label="NIK / Username"
            name="identifier"
            value={form.identifier}
            disabled={loading}
            placeholder="Masukkan NIK atau Username"
            icon={UserRound}
            onChange={(value) => updateForm("identifier", value)}
          />

          <PasswordInput
            value={form.password}
            disabled={loading}
            onChange={(value) => updateForm("password", value)}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.rememberMe}
                disabled={loading}
                onChange={(event) => updateForm("rememberMe", event.target.checked)}
                className="h-6 w-6 rounded-lg border-[3px] border-[#5C9C63] accent-[#1B5E20]"
              />

              <span className="text-base font-semibold text-black">
                Ingat saya
              </span>
            </label>

            <Link
              href="/forgot-password"
              className="text-base font-semibold text-[#5C9C63] underline underline-offset-4"
            >
              Lupa Password?
            </Link>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-16 w-full rounded-2xl border-[3px] border-[#1B5E20] bg-[#1B5E20] text-2xl font-extrabold text-white transition hover:bg-[#144A18] disabled:cursor-not-allowed disabled:opacity-70 md:h-[74px]"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-lg font-bold text-black">ATAU</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-base font-semibold text-black md:text-lg">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#5C9C63] hover:underline">
              Daftar sebagai Masyarakat
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}