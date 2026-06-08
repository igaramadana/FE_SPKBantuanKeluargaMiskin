import Link from "next/link";
import {
  Home,
  LockKeyhole,
  Medal,
  UserRound,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";

type UserShellMenuHref =
  | "/user/dashboard"
  | "/user/profil"
  | "/user/hasil"
  | "/user/ubah-password";

type UserShellProps = {
  children: React.ReactNode;
  activeHref: UserShellMenuHref;
  title: string;
  description?: string;
  userName?: string | null;
  userIdentifier?: string | null;
};

type SidebarItemProps = {
  href: UserShellMenuHref;
  label: string;
  icon: typeof Home;
  active?: boolean;
};

function SidebarItem({
  href,
  label,
  icon: Icon,
  active = false,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
        active
          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-100"
          : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-5 w-5 transition",
          active ? "text-white" : "text-slate-400 group-hover:text-emerald-700",
        ].join(" ")}
      />
      {label}
    </Link>
  );
}

function MobileMenuItem({
  href,
  label,
  active,
}: {
  href: UserShellMenuHref;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-lg border px-3 py-2 text-xs font-bold transition",
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function UserShell({
  children,
  activeHref,
  title,
  description,
  userName,
  userIdentifier,
}: UserShellProps) {
  const menuItems: SidebarItemProps[] = [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/user/profil",
      label: "Profil Saya",
      icon: UserRound,
    },
    {
      href: "/user/hasil",
      label: "Hasil Seleksi",
      icon: Medal,
    },
    {
      href: "/user/ubah-password",
      label: "Ubah Password",
      icon: LockKeyhole,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 [font-family:var(--font-geist)]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  SPK
                </p>
                <h1 className="text-lg font-bold text-slate-950">
                  Panel Warga
                </h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={activeHref === item.href}
              />
            ))}

            <LogoutButton />
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Akun Login
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {userName || "Warga"}
              </p>

              <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                {userIdentifier || "-"}
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 md:pl-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Dashboard Warga
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {title}
                </h2>

                {description ? (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 md:hidden">
                <MobileMenuItem
                  href="/user/dashboard"
                  label="Dashboard"
                  active={activeHref === "/user/dashboard"}
                />

                <MobileMenuItem
                  href="/user/profil"
                  label="Profil"
                  active={activeHref === "/user/profil"}
                />

                <MobileMenuItem
                  href="/user/hasil"
                  label="Hasil"
                  active={activeHref === "/user/hasil"}
                />

                <MobileMenuItem
                  href="/user/ubah-password"
                  label="Password"
                  active={activeHref === "/user/ubah-password"}
                />

                <LogoutButton
                  label="Keluar"
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  iconClassName="hidden"
                />
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}