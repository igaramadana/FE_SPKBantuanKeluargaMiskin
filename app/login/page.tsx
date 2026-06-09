"use client";

import { Suspense, type FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, UserRound } from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Email atau NIK wajib diisi.");
      return;
    }

    if (!password) {
      setErrorMessage("Password wajib diisi.");
      return;
    }

    setIsLoading(true);

    const result = await signIn("credentials", {
      identifier: identifier.trim(),
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setErrorMessage("Login gagal. Email/NIK atau password salah.");
      return;
    }

    router.push(callbackUrl || "/dashboard-redirect");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 [font-family:var(--font-geist)]">
      <section className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            SPK Bantuan Keluarga Miskin
          </p>

          <h1 className="mt-3 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
            Masuk Akun
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Admin masuk menggunakan email. Warga masuk menggunakan NIK.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-700">
              Email Admin / NIK Warga
            </span>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
              <UserRound className="h-5 w-5 text-slate-400" />

              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="admin@spk.local atau NIK"
                className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-700">Password</span>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
              <Lock className="h-5 w-5 text-slate-400" />

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">
            Untuk warga, password awal sama dengan NIK. Setelah berhasil login,
            segera ubah password.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Masuk
          </button>
        </form>
      </section>
    </main>
  );
}

function LoginPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 [font-family:var(--font-geist)]">
      <section className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            SPK Bantuan Keluarga Miskin
          </p>

          <h1 className="mt-3 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
            Memuat Login...
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Menyiapkan halaman masuk akun.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}