import Link from "next/link";
import { Search } from "lucide-react";

export function NikCheckSection() {
  return (
    <section className="relative z-20 -mt-24 px-5 md:px-8">

      <div className="relative mx-auto max-w-5xl">

        {/* Glow Background */}
        <div className="absolute inset-0 rounded-3xl bg-[#A5D6A7]/30 blur-3xl" />

        {/* Card */}
        <div className="relative rounded-3xl border border-white/40 bg-white/80 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.15)] backdrop-blur-xl md:p-8">

          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr_auto] md:items-center">

            {/* LEFT INFO */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 text-[#1B5E20] shadow-inner">
                <Search className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Cek Kelayakan Bantuan
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan NIK untuk mengetahui status bantuan sosial
                </p>
              </div>
            </div>

            {/* INPUT */}
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={16}
                placeholder="Masukkan NIK 16 digit"
                className="
                h-12 w-full rounded-xl border border-gray-200
                bg-white px-4 pr-11 text-sm text-gray-700 outline-none
                transition-all duration-300
                placeholder:text-gray-400
                focus:border-[#1B5E20]
                focus:ring-4 focus:ring-green-100
                focus:shadow-md
              "
              />

              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* BUTTON */}
            <Link
              href="/login"
              className="
              inline-flex h-12 items-center justify-center gap-2
              rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32]
              px-7 text-sm font-semibold text-white
              shadow-lg transition-all duration-300
              hover:scale-[1.04]
              hover:shadow-2xl
            "
            >
              Cek Sekarang
            </Link>

          </div>
        </div>

      </div>
    </section>
  );
}