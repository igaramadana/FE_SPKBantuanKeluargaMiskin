import type { LucideIcon } from "lucide-react";

type HowItWorksCardProps = {
  index: number;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function HowItWorksCard({
  index,
  title,
  description,
  icon: Icon,
}: HowItWorksCardProps) {
  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C7EABB] text-[#1B5E20]">
        <Icon className="h-7 w-7" />
      </div>

      <span className="absolute right-5 top-5 text-5xl font-bold text-[#F3F5F2]">
        {index}
      </span>

      <h3 className="text-lg font-semibold text-black">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-[#555555]">{description}</p>
    </div>
  );
}