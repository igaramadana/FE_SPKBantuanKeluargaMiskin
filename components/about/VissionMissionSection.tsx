import { visionMissionCards } from "@/constants/about";
import { AboutSectionHeader } from "./AboutSectionHeader";

export function VisionMissionSection() {
  return (
    <section className="bg-[#F5F8F1] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <AboutSectionHeader
          title="Visi & Misi"
          description="Komitmen kami adalah menghadirkan sistem yang modern, humanis, dan mampu mendukung keputusan sosial secara bertanggung jawab."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {visionMissionCards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border-2 border-[#1B5E20]/40 bg-white p-7 shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
            >
              <h3 className="text-xl font-semibold text-[#1B5E20]">
                {item.title}
              </h3>

              <p className="mt-4 whitespace-pre-line text-base leading-8 text-black">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}