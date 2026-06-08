"use client";

import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

type UbahPasswordClientProps = {
  userName: string;
  mustChangePassword: boolean;
};

export function UbahPasswordClient({
  userName,
  mustChangePassword,
}: UbahPasswordClientProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!oldPassword) {
      setErrorMessage("Password lama wajib diisi.");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/ubah-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah password.");
      }

      setMessage("Password berhasil diubah. Kamu akan diarahkan login ulang.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        signOut({
          callbackUrl: "/login",
        });
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengubah password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Keamanan Akun
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-950">
            Password Akun
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Halo, <b>{userName}</b>. Ubah password agar akun kamu lebih aman.
          </p>
        </div>
      </div>

      {mustChangePassword ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Kamu masih menggunakan password awal. Password awal sama dengan NIK.
          Silakan ubah password terlebih dahulu sebelum masuk dashboard.
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordInput
          label="Password Lama"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOldPassword}
          onToggleShow={() => setShowOldPassword((current) => !current)}
        />

        <PasswordInput
          label="Password Baru"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          onToggleShow={() => setShowNewPassword((current) => !current)}
        />

        <PasswordInput
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword((current) => !current)}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Simpan Password Baru
        </button>
      </form>
    </section>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
};

function PasswordInput({
  label,
  value,
  show,
  onChange,
  onToggleShow,
}: PasswordInputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
        <LockKeyhole className="h-5 w-5 text-slate-400" />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={show ? "text" : "password"}
          placeholder={label}
          className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={onToggleShow}
          className="text-slate-400 transition hover:text-slate-700"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}