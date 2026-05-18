import { CtaSection } from "@/components/landing/CtaSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { NikCheckSection } from "@/components/landing/NikCheckSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1F2933]">
      <LandingNavbar />
      
      {/* Hero Section biasanya punya bg sedikit berbeda atau putih bersih */}
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <HeroSection />
      </div>

      {/* Komponen Cek NIK melayang di atas batas Hero & Fitur */}
      <NikCheckSection />

      <div id="fitur" className="py-20">
        <FeatureSection />
      </div>

      <div className="bg-[#F8FAFC]">
        <HowItWorksSection />
      </div>

      <CtaSection />
      <Footer />
    </main>
  );
}