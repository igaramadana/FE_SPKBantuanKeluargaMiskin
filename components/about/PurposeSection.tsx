import { purposeCards } from "@/constants/about";
import { AboutSectionHeader } from "./AboutSectionHeader";

export function PurposeSection() {
  return (
    <section id="alasan" className="bg-[#C7EABB] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <AboutSectionHeader
          title="Mengapa Website ini Dibuat?"
          description="Website ini hadir sebagai solusi digital untuk mendukung lembaga atau instansi dalam menentukan keluarga yang paling layak menerima bantuan berdasarkan data yang valid dan metode pengambilan keputusan yang sistematis."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {purposeCards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border-2 border-[#1B5E20]/40 bg-white p-7 shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
            >
              <h3 className="text-xl font-semibold text-[#1B5E20]">
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