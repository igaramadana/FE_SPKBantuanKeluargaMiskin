import Link from "next/link";
import { aboutValues } from "@/constants/about";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(90deg,#F5F8F1,#FFFFFF)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1fr_440px]">
        <div>
          <div className="inline-flex rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-semibold text-[#1B5E20]">
            Tentang Sistem
          </div>

          <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-tight text-[#1B5E20] md:text-5xl">
            SPK Bantuan Keluarga Miskin
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-black md:text-lg">
            Sistem Pendukung Keputusan untuk membantu proses seleksi penerima
            bantuan keluarga miskin secara lebih cepat, objektif, transparan,
            dan terukur berdasarkan kriteria yang telah ditentukan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#alasan"
              className="inline-flex justify-center rounded-lg bg-[#1B5E20] px-6 py-3 font-bold text-white transition hover:bg-[#144A18]"
            >
              Pelajari Lebih Lanjut
            </a>

            <a
              href="#keunggulan"
              className="inline-flex justify-center rounded-lg border-2 border-[#1B5E20] bg-white px-6 py-3 font-bold text-[#1B5E20] transition hover:bg-[#F5F8F1]"
            >
              Lihat Fitur
            </a>
          </div>
        </div>

        <div className="rounded-[28px] border-2 border-[#1B5E20]/15 bg-white p-7 shadow-[1px_4px_12px_rgba(0,0,0,0.18)]">
          <h2 className="text-xl font-bold text-[#1B5E20]">
            Nilai Utama Sistem
          </h2>

          <div className="mt-5 space-y-5">
            {aboutValues.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border-2 border-[#1B5E20]/40 p-5"
              >
                <h3 className="text-xl font-semibold text-[#1B5E20]">
                  {item.title}
                </h3>

                <p className="mt-2 text-base leading-7 text-black">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}