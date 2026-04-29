import Link from "next/link";
import { Search } from "lucide-react";

export function NikCheckSection() {
  return (
    <section className="relative z-10 -mt-16 px-5 md:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#F5F7F6] p-5 shadow-xl md:p-7">
        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-[#C7EABB] text-[#1B5E20] md:flex">
              <Search className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black">
                Cek Kelayakan
              </h2>
              <p className="mt-1 text-sm text-[#263238]">
                Masukkan NIK untuk cek data bantuan keluarga
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              placeholder="Masukkan NIK 16 digit"
              className="h-12 w-full rounded-xl border border-transparent bg-[#E0E0E0] px-4 pr-11 text-sm text-[#263238] outline-none transition placeholder:text-[#263238]/70 focus:border-[#1B5E20] focus:bg-white"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#263238]" />
          </div>

          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1B5E20] px-6 text-sm font-semibold text-white transition hover:bg-[#144A18]"
          >
            Cek Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}