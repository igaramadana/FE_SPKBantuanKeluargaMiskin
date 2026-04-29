import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <div className="group rounded-xl bg-[#F3F5F2] p-7 text-center shadow-[0_4px_10px_rgba(132,177,121,0.65)] transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(132,177,121,0.55)]">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#1B5E20] shadow-sm transition group-hover:bg-[#C7EABB]">
        <Icon className="h-11 w-11" />
      </div>

      <h3 className="mt-7 text-xl font-medium text-black">{title}</h3>

      <p className="mt-4 text-base leading-7 text-black/80">{description}</p>
    </div>
  );
}