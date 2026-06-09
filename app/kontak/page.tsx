import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata = {
  title: "Kontak | SPK Bantuan Keluarga Miskin",
  description: "Hubungi kami untuk mendapatkan bantuan dan informasi.",
};

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavbar />

      <ContactSection />

      <Footer />
    </main>
  );
}