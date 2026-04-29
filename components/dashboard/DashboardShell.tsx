import Link from "next/link";
import { DashboardHeader } from "./DashboardHeader";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  userName?: string | null;
  role: "admin" | "user";
  menu: {
    label: string;
    href: string;
  }[];
};

export function DashboardShell({
  children,
  title,
  description,
  userName,
  role,
  menu,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <DashboardHeader
        title={title}
        description={description}
        userName={userName}
        role={role}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F5F8F1] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B5E20] font-bold text-white">
              SPK
            </div>

            <div>
              <p className="font-semibold text-slate-950">SPK Bantuan</p>
              <p className="text-xs text-slate-500">AHP & SAW</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#F5F8F1] hover:text-[#1B5E20]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}