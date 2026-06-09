"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Home,
  LockKeyhole,
  Menu,
  Medal,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";

type UserShellMenuHref =
  | "/user/dashboard"
  | "/user/profil"
  | "/user/hasil"
  | "/user/ubah-password";

type UserShellProps = {
  children: ReactNode;
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
  collapsed?: boolean;
};

const menuItems: SidebarItemProps[] = [
  { href: "/user/dashboard", label: "Dashboard", icon: Home },
  { href: "/user/profil", label: "Profil Saya", icon: UserRound },
  // { href: "/user/hasil", label: "Hasil Seleksi", icon: Medal },
  { href: "/user/ubah-password", label: "Ubah Password", icon: LockKeyhole },
];

function getInitial(name?: string | null) {
  if (!name) return "W";

  return name.trim().charAt(0).toUpperCase();
}

function SidebarItem({
  href,
  label,
  icon: Icon,
  active = false,
  collapsed = false,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group flex items-center rounded-xl text-sm font-semibold transition-all ${
        collapsed ? "h-12 justify-center px-0" : "px-4 py-3"
      } ${
        active
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      <span
        className={`transition ${collapsed ? "mr-0" : "mr-3"} ${
          active ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      {!collapsed ? <span>{label}</span> : null}

      {!collapsed && active ? (
        <ChevronRight className="ml-auto h-4 w-4 text-white/80" />
      ) : null}
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const activeMenu = menuItems.find((item) => item.href === activeHref);
  const breadcrumbTitle = activeMenu?.label || title;

  function SidebarContent({
    collapsed = false,
    mobile = false,
  }: {
    collapsed?: boolean;
    mobile?: boolean;
  }) {
    return (
      <aside
        className={`flex h-full flex-col border-r border-emerald-100 bg-white transition-all duration-300 ease-in-out ${
          collapsed ? "w-[92px]" : "w-[292px]"
        }`}
      >
        <div
          className={`flex h-20 items-center ${
            collapsed ? "justify-center px-4" : "justify-between px-5"
          }`}
        >
          <Link
            href="/user/dashboard"
            className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-0.5 shadow-sm">
              <Image
                src="/logospkbansos.png"
                alt="SIMBANTU"
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
                  Dashboard Warga
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

        <nav className={`mt-6 flex-1 space-y-1 ${collapsed ? "px-3" : "px-4"}`}>
          {!collapsed ? (
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Menu
            </p>
          ) : null}

          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={activeHref === item.href}
              collapsed={collapsed}
            />
          ))}

          <LogoutButton
            label={collapsed ? "" : "Keluar"}
            className={`mt-2 inline-flex w-full items-center gap-3 rounded-xl text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "h-12 justify-center px-0" : "px-4 py-3"
            }`}
            iconClassName="h-5 w-5 text-slate-400 transition group-hover:text-red-600"
          />
        </nav>

        <div className="p-4" />
      </aside>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6FAF7]">
      <div
        className={`fixed inset-0 z-50 transition lg:hidden ${
          isMobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`relative h-full w-[292px] max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent mobile />
        </div>
      </div>

      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out ${
          isDesktopSidebarOpen
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
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    SIMBANTU
                  </p>

                  <h2 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {title}
                  </h2>
                </div>
              </div>

              <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                  {getInitial(userName)}
                </div>

                <div className="hidden text-left md:block">
                  <p className="max-w-[150px] truncate text-sm font-bold text-slate-900">
                    {userName || "Warga"}
                  </p>

                  <p className="text-xs font-medium text-slate-500">
                    {userIdentifier || "Pengguna"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="px-5 py-5 sm:px-6">
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <Link
                    href="/user/dashboard"
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
              </div>
            </div>

            {description ? <p className="sr-only">{description}</p> : null}

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
