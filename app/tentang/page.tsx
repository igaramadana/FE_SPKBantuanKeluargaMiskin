import { AboutFooter } from "@/components/about/AboutFooter";
import { AboutHero } from "@/components/about/AboutHero";
import { AdvantageSection } from "@/components/about/AdvantageSection";
import { FlowSection } from "@/components/about/FlowSection";
import { PurposeSection } from "@/components/about/PurposeSection";
import { VisionMissionSection } from "@/components/about/VissionMissionSection";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavbar />
      <AboutHero />
      <PurposeSection />
      <VisionMissionSection />
      <AdvantageSection />
      <FlowSection />
      <AboutFooter />
    </main>
  );
}