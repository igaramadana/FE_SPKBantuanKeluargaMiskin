import { advantages } from "@/constants/about";
import { AboutSectionHeader } from "./AboutSectionHeader";

export function AdvantageSection() {
  return (
    <section id="keunggulan" className="bg-[#C7EABB] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <AboutSectionHeader
          title="Keunggulan Sistem"
          description="Dirancang dengan tampilan ramah pengguna dan alur kerja yang mendukung proses seleksi bantuan secara modern."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {advantages.map((item, index) => (
            <div
              key={item.title}
              className="rounded-2xl border-2 border-[#1B5E20]/40 bg-white p-7 shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/40 text-sm font-bold text-[#1B5E20]">
                {index + 1}
              </div>

              <h3 className="mt-5 text-xl font-semibold text-[#1B5E20]">
                {item.title}
              </h3>

              <p className="mt-4 text-base leading-8 text-black">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}