import Link from "next/link";
import { landingBrand, landingNavigation } from "@/constants/landing";
import { cn } from "@/lib/cn";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white shadow-sm">
      <nav className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B5E20] text-lg font-bold text-white shadow-md">
            {landingBrand.shortName}
          </div>

          <div className="leading-tight">
            <p className="text-base font-semibold text-black md:text-lg">
              {landingBrand.title}
            </p>
            <p className="text-sm text-[#263238]">{landingBrand.subtitle}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-10 text-sm font-medium text-black md:flex">
          {landingNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "relative transition hover:text-[#1B5E20]",
                item.active && "text-[#1B5E20]"
              )}
            >
              {item.label}

              {item.active && (
                <span className="absolute -bottom-3 left-0 h-[2px] w-full rounded-full bg-[#3E5F44]" />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-[#1B5E20]/20 px-4 py-2 text-sm font-semibold text-[#1B5E20] transition hover:bg-[#F5F8F1]"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="hidden rounded-xl bg-[#1B5E20] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#144A18] sm:inline-flex"
          >
            Cek Bantuan
          </Link>
        </div>
      </nav>
    </header>
  );
}