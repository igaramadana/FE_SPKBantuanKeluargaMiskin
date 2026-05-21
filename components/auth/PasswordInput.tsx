"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function PasswordInput({
  value,
  disabled = false,
  onChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor="password"
        className="block text-sm font-bold uppercase tracking-widest text-black/60 md:text-xs"
      >
        Password
      </label>

      <div className="relative mt-3">
        <LockKeyhole className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B3B3B3]" />

        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={value}
          disabled={disabled}
          placeholder="Masukkan Password"
          onChange={(event) => onChange(event.target.value)}
          className="h-[60px] w-full rounded-2xl border-2 border-[#5C9C63]/60 bg-white pl-14 pr-14 text-base font-medium text-black outline-none transition-all placeholder:text-[#C7C7C7] focus:border-[#1B5E20] focus:shadow-[0_0_0_4px_rgba(27,94,32,0.08)] disabled:cursor-not-allowed disabled:opacity-60 md:h-[66px] md:text-[15px]"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#B3B3B3] transition hover:text-[#1B5E20] disabled:cursor-not-allowed"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}