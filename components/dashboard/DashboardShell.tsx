"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  BarChart3,
  HandHelping,
  Menu,
  X,
  LogOut,
  UploadCloud,
  Trophy,
  ChevronRight,
  ShieldCheck,
  UserRound,
  Search,
  Bell,
  Home,
  FileQuestion,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type DashboardShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  userName?: string | null;
  role: "admin" | "user";
  menu: {
    label: string;
    href: string;
  }[];
  activeHref?: string;
};

const menuIcons: Record<string, ReactNode> = {
  Dashboard: <LayoutDashboard className="h-5 w-5" />,
  "Data Warga": <Users className="h-5 w-5" />,
  "Import Dataset": <UploadCloud className="h-5 w-5" />,
  "Kriteria & Bobot": <SlidersHorizontal className="h-5 w-5" />,
  "Penilaian SAW": <BarChart3 className="h-5 w-5" />,
  "Hasil Ranking": <Trophy className="h-5 w-5" />,
  "Cek Status Bantuan": <FileQuestion className="h-5 w-5" />,
  Profil: <UserRound className="h-5 w-5" />,
  Bantuan: <HandHelping className="h-5 w-5" />,
};

function getInitial(name?: string | null) {
  if (!name) return "A";
  return name.trim().charAt(0).toUpperCase();
}

function getDashboardHref(role: "admin" | "user") {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}

export function DashboardShell({
  children,
  title,
  description,
  userName,
  role,
  menu,
  activeHref,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });

      router.refresh();
      window.location.href = "/login";
    } catch (error) {
      console.error("Gagal logout:", error);
      setIsLoggingOut(false);
    }
  }

  const activePath = activeHref || pathname;
  const dashboardHref = getDashboardHref(role);

  const activeMenu = menu.find((item) => {
    return (
      activePath === item.href ||
      (item.href !== "/admin/dashboard" &&
        item.href !== "/user/dashboard" &&
        pathname.startsWith(item.href))
    );
  });

  const breadcrumbTitle = activeMenu?.label || title;
  const isRootTitle = breadcrumbTitle === title;

  function SidebarContent({
    collapsed = false,
    mobile = false,
  }: {
    collapsed?: boolean;
    mobile?: boolean;
  }) {
    return (
      <aside
        className={`flex h-full flex-col border-r border-emerald-100 bg-white transition-all duration-300 ease-in-out ${collapsed ? "w-[92px]" : "w-[292px]"
          }`}
      >
        <div className={`px-5 py-6 ${collapsed ? "px-4" : ""}`}>
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-3"
              }`}
          >
            <Link
              href={dashboardHref}
              className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""
                }`}
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-0.5 shadow-sm">
                <Image
                  src="/logospkbansos.png"
                  alt="SIMBANTUAAAAAA"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {!collapsed ? (
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-950">
                    SIMBANTU
                  </h1>

                  <p className="text-xs font-medium text-slate-500">
                    Manajemen Bantuan
                  </p>
                </div>
              ) : null}
            </Link>

            {mobile ? (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>

        <nav className={`mt-6 flex-1 space-y-1 ${collapsed ? "px-3" : "px-4"}`}>
          {!collapsed ? (
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Menu
            </p>
          ) : null}

          {menu.map((item) => {
            const isActive =
              activePath === item.href ||
              (item.href !== "/admin/dashboard" &&
                item.href !== "/user/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`group flex items-center rounded-xl text-sm font-semibold transition-all ${collapsed
                    ? "h-12 justify-center px-0"
                    : "justify-between px-4 py-3"
                  } ${isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
              >
                <span
                  className={`flex items-center ${collapsed ? "justify-center" : "gap-3"
                    }`}
                >
                  <span
                    className={`transition ${isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-emerald-600"
                      }`}
                  >
                    {menuIcons[item.label] || <Home className="h-5 w-5" />}
                  </span>

                  {!collapsed ? item.label : null}
                </span>

                {!collapsed && isActive ? (
                  <ChevronRight className="h-4 w-4 text-white/80" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className={`${collapsed ? "p-3" : "p-4"}`}>
          {/* {!collapsed ? (
            <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Butuh bantuan?</p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Kelola data bantuan dengan rapi dan transparan melalui dashboard.
              </p>

              <Link
                href="/pusat-bantuan"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white"
              >
                <HandHelping className="h-4 w-4" />
                Pusat Bantuan
              </Link>
            </div>
          ) : null} */}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            type="button"
            title="Logout"
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${collapsed ? "h-12 px-0" : "px-4 py-3"
              }`}
          >
            <LogOut className="h-4 w-4" />

            {!collapsed ? (isLoggingOut ? "Mengeluarkan..." : "Logout") : null}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6FAF7]">
      <div
        className={`fixed inset-0 z-50 transition lg:hidden ${isMobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${isMobileSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        <div
          className={`relative h-full w-[292px] max-w-[85vw] transform transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <SidebarContent mobile />
        </div>
      </div>

      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out ${isDesktopSidebarOpen
            ? "lg:grid-cols-[292px_1fr]"
            : "lg:grid-cols-[92px_1fr]"
          }`}
      >
        <div className="sticky top-0 hidden h-screen lg:block">
          <SidebarContent collapsed={!isDesktopSidebarOpen} />
        </div>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/85 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsDesktopSidebarOpen((prev) => !prev)}
                  className="hidden h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-white text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 lg:inline-flex"
                >
                  {isDesktopSidebarOpen ? (
                    <PanelLeftClose className="h-5 w-5" />
                  ) : (
                    <PanelLeftOpen className="h-5 w-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <h2 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {title}
                  </h2>
                </div>
              </div>

              <div className="hidden min-w-[260px] max-w-md flex-1 xl:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Cari data warga..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* <button
                  type="button"
                  className="relative hidden h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </button> */}

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                    {getInitial(userName)}
                  </div>

                  <div className="hidden text-left md:block">
                    <p className="max-w-[150px] truncate text-sm font-bold text-slate-900">
                      {userName || "Admin"}
                    </p>

                    <p className="text-xs font-medium capitalize text-slate-500">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="bg  -white px-5 py-5 sm:px-6">
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <Home className="h-3.5 w-3.5" />
                    Beranda
                  </Link>

                  <ChevronRight className="h-4 w-4 text-slate-300" />

                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 font-semibold text-slate-700">
                    {breadcrumbTitle}
                  </span>
                </nav>

                {/* <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate [font-family:var(--font-oswald)] text-3xl font-bold leading-none tracking-tight text-slate-950 sm:text-4xl">
                      {title}
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-emerald-100 bg-white px-4 py-2 shadow-sm sm:self-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {role === "admin" ? "Administrator" : "Pengguna"}
                      </p>

                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName || "User"}
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}