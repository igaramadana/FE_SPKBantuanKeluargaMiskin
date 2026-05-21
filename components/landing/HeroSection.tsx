import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";
import { landingHero } from "@/constants/landing";
import { HeroPreviewCard } from "./HeroPreviewCard";

export function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-[820px] overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('/images/desa.jpg')",
        }}
      />

      {/* Main Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B5E20]/95 via-[#1B5E20]/75 to-transparent" />

      {/* Soft Light Effect */}
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_80%_30%,#C7EABB_0,transparent_45%),radial-gradient(circle_at_20%_80%,#4CAF50_0,transparent_35%)]" />
      </div>

      {/* Blur Glow Behind Card */}
      <div className="absolute right-[-150px] top-[120px] h-[520px] w-[520px] rounded-full bg-[#9FE3A2]/30 blur-[120px]" />

      {/* Content */}
      <div className="relative mx-auto grid min-h-[820px] max-w-7xl items-center px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT */}
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-xl">
            <HandHeart className="h-5 w-5" />
            {landingHero.badge}
          </div>

          {/* Title */}
          <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Program Bantuan
            <span className="block bg-gradient-to-r from-white to-[#D8F3DC] bg-clip-text text-transparent">
              Keluarga Miskin
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/90 md:text-xl">
            {landingHero.description}
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3F7D47] to-[#5C9C63] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl"
            >
              {landingHero.primaryAction}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>

          </div>
        </div>

        {/* RIGHT */}
        <div className="mt-14 flex justify-center lg:mt-0 lg:justify-end">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 scale-110 rounded-3xl bg-[#A5D6A7]/40 blur-3xl" />

            {/* Card */}
            <div className="relative animate-[float_6s_ease-in-out_infinite]">
              <HeroPreviewCard />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}