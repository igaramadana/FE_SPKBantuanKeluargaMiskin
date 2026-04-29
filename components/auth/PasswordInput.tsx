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
        className="block text-sm font-bold uppercase tracking-wide text-black md:text-base"
      >
        Password
      </label>

      <div className="relative mt-4">
        <LockKeyhole className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#B3B3B3]" />

        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={value}
          disabled={disabled}
          placeholder="Masukkan Password"
          onChange={(event) => onChange(event.target.value)}
          className="h-16 w-full rounded-2xl border-[3px] border-[#5C9C63] bg-white pl-16 pr-16 text-base font-semibold text-black outline-none transition placeholder:text-[#C7C7C7] focus:border-[#1B5E20] focus:ring-4 focus:ring-[#84B179]/20 disabled:cursor-not-allowed disabled:opacity-70 md:h-[74px] md:text-lg"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-[#B3B3B3] transition hover:text-[#1B5E20] disabled:cursor-not-allowed"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? (
            <EyeOff className="h-6 w-6" />
          ) : (
            <Eye className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
}