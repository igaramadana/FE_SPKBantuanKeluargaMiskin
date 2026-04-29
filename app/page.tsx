import { CtaSection } from "@/components/landing/CtaSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { NikCheckSection } from "@/components/landing/NikCheckSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-[#1F2933]">
      <LandingNavbar />
      <HeroSection />
      <NikCheckSection />
      <FeatureSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </main>
  );
}