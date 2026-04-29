import { usageFlows } from "@/constants/about";
import { AboutSectionHeader } from "./AboutSectionHeader";

export function FlowSection() {
  return (
    <section id="alur" className="bg-[#F5F8F1] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <AboutSectionHeader
          title="Alur Singkat Penggunaan"
          description="Tahapan proses dalam sistem dibuat sederhana agar mudah dipahami dan diterapkan oleh pengguna."
        />

        <div className="mt-12 space-y-8">
          {usageFlows.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col gap-5 rounded-2xl border-2 border-[#1B5E20]/40 bg-white p-7 shadow-[0_4px_8px_rgba(0,0,0,0.18)] md:flex-row md:items-center"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20]/40 text-base font-bold text-[#1B5E20]">
                {index + 1}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#1B5E20]">
                  {item.title}
                </h3>

                <p className="mt-3 text-base leading-8 text-black">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}