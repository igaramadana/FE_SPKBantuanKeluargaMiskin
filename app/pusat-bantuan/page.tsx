import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { HelpCenterHero } from "@/components/help-center/HelpCenterHero";
import { FaqSection } from "@/components/help-center/FaqSection";
import { PublicApplicationForm } from "@/components/help-center/PublicApplicationForm";
import { HelpContactSection } from "@/components/help-center/HelpContactSection";

export default function PusatBantuanPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavbar />
      <HelpCenterHero />
      <FaqSection />
      <PublicApplicationForm />
      <HelpContactSection />
      <Footer />
    </main>
  );
}
