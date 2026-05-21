"use client";

import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
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

    try {
      // Mengirimkan objek credentials yang bersih dan sinkron dengan authOptions
      const result = await signIn("credentials", {
        identifier: form.identifier.trim(),
        password: form.password,
        redirect: false, 
      });

      // Jika NextAuth mendeteksi kegagalan (kombinasi salah / data null)
      if (result?.error || !result?.ok) {
        setLoading(false);
        setError("NIK/username atau password salah.");
        return;
      }

      // Ambil data session terbaru yang sukses di-generate
      const session = await getSession();
      const role = session?.user?.role;

      // Navigasi keras (Hard Navigation) untuk merombak state middleware
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
        return;
      }

      if (role === "user") {
        window.location.href = "/user/dashboard";
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    }
  }

  return (
    <section className="flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-12 lg:px-14 xl:px-24">
      <div className="w-full max-w-[540px]">
        
        {/* Header Logo Aplikasi */}
        <div className="mb-14 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 p-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full text-[#1B5E20]">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider text-slate-700 uppercase leading-none">
              SPK BANTUAN
            </span>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              KELUARGA MISKIN
            </span>
          </div>
        </div>

        {/* Judul Form */}
        <h2 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Masuk ke Sistem
        </h2>

        {/* Form Input */}
        <form onSubmit={handleLogin} className="mt-12 space-y-7">
          <AuthInput
            label="Username"
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

          {/* Fitur Tambahan */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 group select-none">
              <input
                type="checkbox"
                checked={form.rememberMe}
                disabled={loading}
                onChange={(event) => updateForm("rememberMe", event.target.checked)}
                className="h-5 w-5 rounded border-2 border-slate-300 accent-[#1B5E20] transition group-hover:border-[#1B5E20]"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-black transition">
                Ingat saya
              </span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#5C9C63] transition hover:text-[#1B5E20] hover:underline"
            >
              Lupa Password?
            </Link>
          </div>

          {/* Informasi Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 animate-in fade-in zoom-in-95 duration-200">
              {error}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1B5E20] text-lg font-bold text-white shadow-md shadow-green-900/10 transition duration-200 hover:bg-[#144A18] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses...</span>
              </div>
            ) : (
              "Masuk"
            )}
          </button>

          {/* Pembatas ATAU */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold tracking-widest text-slate-400">ATAU</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Kembali ke Beranda Utama */}
          <p className="text-center text-sm font-medium text-slate-600">
            Kembali ke{" "}
            <Link href="/" className="font-bold text-[#5C9C63] transition hover:text-[#1B5E20] hover:underline">
              Beranda Utama
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}