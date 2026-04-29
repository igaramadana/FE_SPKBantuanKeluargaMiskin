import { LogoutButton } from "./LogoutButton";

type DashboardHeaderProps = {
  title: string;
  description: string;
  userName?: string | null;
  role: "admin" | "user";
};

export function DashboardHeader({
  title,
  description,
  userName,
  role,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-[#C7EABB] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
            {role}
          </div>

          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>

          <p className="mt-1 text-sm text-slate-500">
            {description} Halo,{" "}
            <span className="font-semibold text-slate-800">
              {userName || "User"}
            </span>
            .
          </p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}