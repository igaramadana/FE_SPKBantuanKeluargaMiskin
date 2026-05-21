"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { landingBrand, landingNavigation } from "@/constants/landing";
import { cn } from "@/lib/cn";
import { LoginButtonLanding } from "@/components/auth/LoginButtonLanding"; // <-- Import di sini

export function LandingNavbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Glass Background */}
      <div className="absolute inset-0 border-b border-white/20 bg-white/70 backdrop-blur-xl" />

      <nav className="relative mx-auto flex h-[88px] max-w-7xl items-center justify-between px-5 md:px-8">

        {/* BRAND */}
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
            <Image
              src="/logo-spkbansos.jpeg"
              alt="Logo SPK Bansos"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>

          <div className="leading-tight">
            <p className="text-base font-semibold text-gray-900 md:text-lg">
              {landingBrand.title}
            </p>
            <p className="text-sm text-gray-600">
              {landingBrand.subtitle}
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-10 text-sm font-medium md:flex">

            <p className="text-base font-bold text-black md:text-lg">
              {landingBrand.title}
            </p>
            <p className="text-sm font-medium text-[#64748b]">{landingBrand.subtitle}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-10 text-sm font-medium text-[#1F2933] md:flex">

          {landingNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-gray-700 transition-all duration-300 hover:text-[#1B5E20]",
                  active && "text-[#1B5E20]"
                )}
              >
                {item.label}

                {/* Active Indicator */}
                <span
                  className={cn(
                    "absolute -bottom-3 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#3E5F44] transition-all duration-300",
                    active && "w-full"
                  )}
                />
                {active && (
                  <span className="absolute -bottom-3 left-0 h-[2px] w-full rounded-full bg-[#1B5E20]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="rounded-xl border border-[#1B5E20]/20 px-4 py-2 text-sm font-semibold text-[#1B5E20] transition hover:bg-[#F3F8F2]"
          {/* SEBELUMNYA: <Link href="/login">Login</Link> */}
          {/* SEKARANG: Menggunakan Tombol Pintar dengan Style Asli Anda */}
          <LoginButtonLanding 
            className="rounded-xl border border-[#1B5E20]/20 px-4 py-2 text-sm font-semibold text-[#1B5E20] transition hover:bg-[#F5F8F1]"
          >
            Login
          </LoginButtonLanding>
          <Link
            href="#cek-nik"
            className="hidden rounded-xl bg-[#1B5E20] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#144A18] sm:inline-flex"
          >
            Cek Bantuan
          </Link>
        </div>
      </nav>
    </header>
  );
}