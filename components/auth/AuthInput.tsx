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
        className="block text-sm font-bold uppercase tracking-widest text-black/60 md:text-xs"
      >
        {label}
      </label>

      <div className="relative mt-3">
        <Icon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B3B3B3] transition-colors peer-focus:text-[#1B5E20]" />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="peer h-[60px] w-full rounded-2xl border-2 border-[#5C9C63]/60 bg-white pl-14 pr-5 text-base font-medium text-black outline-none transition-all placeholder:text-[#C7C7C7] focus:border-[#1B5E20] focus:shadow-[0_0_0_4px_rgba(27,94,32,0.08)] disabled:cursor-not-allowed disabled:opacity-60 md:h-[66px] md:text-[15px]"
        />
      </div>
    </div>
  );
}