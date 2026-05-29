"use client"; // <-- Ditambahkan agar tombol Logout & interaksi klik berfungsi

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react"; // <-- Import fungsi signOut dari NextAuth
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  BarChart3,
  HandHelping,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  UploadCloud,
  Trophy,
} from "lucide-react";

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
  activeHref?: string;
};

const menuIcons: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="h-5 w-5" />,
  "Data Warga": <Users className="h-5 w-5" />,
  "Import Dataset": <UploadCloud className="h-5 w-5" />,
  "Kriteria & Bobot": <SlidersHorizontal className="h-5 w-5" />,
  "Penilaian SAW": <BarChart3 className="h-5 w-5" />,
  "Hasil Ranking": <Trophy className="h-5 w-5" />,
  Bantuan: <HandHelping className="h-5 w-5" />,
};

export function DashboardShell({
  children,
  userName,
  menu,
  activeHref,
}: DashboardShellProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fungsi untuk menangani proses keluar sistem
  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Hapus session token dari cookie browser
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });

      // 2. Bersihkan cache router Next.js
      router.refresh();

      // 3. Paksa navigasi ke halaman login dengan hard reload agar state bersih total
      window.location.href = "/login";
    } catch (error) {
      console.error("Gagal logout:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7F4]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">

        {/* SIDEBAR */}
        <aside className="flex flex-col border-r border-[#DCE8DA] bg-[#F2F8F2]">

          {/* LOGO */}
          <div className="border-b border-[#DCE8DA] px-7 py-6">
            <div className="flex items-center gap-4">
              {/* LOGO IMAGE */}
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                <Image
                  src="/logo-spkbansos.jpeg"
                  alt="SIMBANTU"
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div>
                <h1 className="text-3xl font-black leading-none tracking-tight text-[#14532D]">
                  SIMBANTU
                </h1>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sistem Informasi
                  <br />
                  Manajemen Bantuan
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="flex-1 px-5 py-8">
            <p className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>

            <nav className="space-y-2">
              {menu.map((item, index) => {
                const isActive = activeHref
                  ? activeHref === item.href
                  : index === 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold transition-all duration-300
                      ${
                        isActive
                          ? "bg-[#DDEEDF] text-[#166534] shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-[#166534]"
                      }
                    `}
                  >
                    <span>{menuIcons[item.label]}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* FOOTER */}
          <div className="border-t border-[#DCE8DA] p-5">
            {/* CARD */}
            <div className="rounded-3xl bg-gradient-to-br from-[#166534] to-[#2E7D32] p-5 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white/20">
                  <Image
                    src="/logo.png"
                    alt="SIMBANTU"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h3 className="font-bold">SIMBANTU</h3>
                  <p className="text-xs text-green-100">
                    Transparansi untuk Negeri
                  </p>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-5 space-y-2">
              {/* PENGATURAN */}
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-[#166534]">
                <Settings className="h-5 w-5" />
                Pengaturan
              </button>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Mengeluarkan..." : "Logout"}
              </button>
            </div>
          </div>

        </aside>

        {/* CONTENT */}
        <div className="flex flex-col">

          {/* TOPBAR */}
          <header className="sticky top-0 z-20 border-b border-[#DCE8DA] bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-8 py-5">
              
              {/* LEFT */}
              <div className="flex items-center gap-5">
                <button className="rounded-xl p-2 transition hover:bg-slate-100">
                  <Menu className="h-6 w-6 text-slate-700" />
                </button>

                {/* SEARCH */}
                <div className="relative w-full min-w-[420px]">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari data warga..."
                    className="w-full rounded-2xl border border-slate-200 bg-[#F8FAF7] py-4 pl-12 pr-4 text-sm outline-none transition focus:border-[#2E7D32] focus:bg-white"
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="ml-6 flex items-center gap-5">
                {/* NOTIFICATION */}
                <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-[#F5F7F4]">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#16A34A] text-[10px] font-bold text-white">
                    2
                  </span>
                </button>

                {/* PROFILE */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDEEDF] font-bold text-[#166534]">
                    {userName ? userName.charAt(0).toUpperCase() : "A"}
                  </div>

                  <div className="hidden text-left md:block">
                    <p className="text-sm font-bold text-slate-900">
                      {userName || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Administrator
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>

            </div>
          </header>

          {/* BODY */}
          <section className="flex-1 p-8">
            {children}
          </section>

        </div>

      </div>
    </main>
  );
}