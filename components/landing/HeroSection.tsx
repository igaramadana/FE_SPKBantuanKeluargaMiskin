import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";
import { landingHero } from "@/constants/landing";
import { HeroPreviewCard } from "./HeroPreviewCard";
import { LoginButtonLanding } from "@/components/auth/LoginButtonLanding"; // <-- Import di sini

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative min-h-[760px] overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-lp.png')" }}
    >
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(27,94,32,0.94)_0%,rgba(27,94,32,0.72)_32%,rgba(27,94,32,0.22)_72%,rgba(27,94,32,0.08)_100%)] opacity-70" />
      </div>

      <div className="absolute inset-0 opacity-25">
        <div className="h-full w-full bg-[radial-gradient(circle_at_78%_28%,#C7EABB_0,transparent_34%),radial-gradient(circle_at_12%_80%,#5C9C63_0,transparent_28%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center px-5 py-20 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-2xl pt-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(90deg,rgba(63,125,71,0.8),rgba(92,156,99,0.8))] px-5 py-3 text-sm font-medium text-white shadow-lg">
            <HandHeart className="h-5 w-5" />
            {landingHero.badge}
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Program Bantuan <br />
            Keluarga Miskin
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-white/90 md:text-xl">
            {landingHero.description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {/* SEBELUMNYA: <Link href="/login">...</Link> */}
            {/* SEKARANG: Menggunakan Tombol Pintar dengan Style Asli Anda */}
            <LoginButtonLanding
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#3F7D47,#5C9C63)] px-7 py-4 text-base font-semibold text-white shadow-lg transition hover:scale-[1.02]"
            >
              {landingHero.primaryAction}
              <ArrowRight className="h-5 w-5" />
            </LoginButtonLanding>

            <a
              href="#tentang"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {landingHero.secondaryAction}
            </a>
          </div>
        </div>

        <HeroPreviewCard />
      </div>
    </section>
  );
}