import type { LucideIcon } from "lucide-react";

type AuthInputProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder: string;
  icon: LucideIcon;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function AuthInput({
  label,
  name,
  type = "text",
  value,
  placeholder,
  icon: Icon,
  disabled = false,
  onChange,
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-bold uppercase tracking-wide text-black md:text-base"
      >
        {label}
      </label>

      <div className="relative mt-4">
        <Icon className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[#B3B3B3]" />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-16 w-full rounded-2xl border-[3px] border-[#5C9C63] bg-white pl-16 pr-5 text-base font-semibold text-black outline-none transition placeholder:text-[#C7C7C7] focus:border-[#1B5E20] focus:ring-4 focus:ring-[#84B179]/20 disabled:cursor-not-allowed disabled:opacity-70 md:h-[74px] md:text-lg"
        />
      </div>
    </div>
  );
}