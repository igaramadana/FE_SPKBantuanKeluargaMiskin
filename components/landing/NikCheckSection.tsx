"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export function NikCheckSection() {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCek = (e: React.FormEvent) => {
    e.preventDefault();
    if (nik.length < 16) return;

    setLoading(true);
    // Simulasi pengecekan data
    setTimeout(() => {
      // Dummy data sesuai format hasil yang kamu inginkan
      const dummyData = {
        nama: "Budi Santoso",
        skor: "0.874",
        status: "Layak",
      };
      setResult(dummyData);
      setLoading(false);
    }, 1000);
  };

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
    <section className="relative z-10 -mt-16 px-5 md:px-8">
      {/* nik-card */}
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#F5F7F6] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:p-7">
        
        {/* nik-inner */}
        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
          
          {/* nik-info */}
          <div className="flex items-center gap-4">
            {/* nik-icon */}
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-[#C7EABB] text-[#1B5E20] md:flex">
              <Search className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">Cek Kelayakan</h2>
              <p className="mt-1 text-sm text-[#263238]">
                Masukkan NIK untuk cek data bantuan keluarga
              </p>
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
          {/* nik-input-wrap */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              placeholder="Masukkan NIK 16 digit"
              className="h-12 w-full rounded-xl border border-transparent bg-[#E0E0E0] px-4 pr-11 text-sm text-[#263238] outline-none transition placeholder:text-[#263238]/70 focus:border-[#1B5E20] focus:bg-white tracking-wider"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#263238]">
              <Search size={20} />
            </span>
          </div>

          <button
            onClick={handleCek}
            disabled={loading || nik.length < 16}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1B5E20] px-6 text-sm font-semibold text-white transition hover:bg-[#144A18] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Cek Sekarang"}
          </button>
        </div>

        {/* nik-result - Hanya muncul jika ada result */}
        {result && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="rounded-2xl border border-[#1B5E20]/20 bg-[#C7EABB]/40 p-4 md:px-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between border-b border-black/5 py-1.5">
                  <span className="text-sm text-[#64748b]">Nama</span>
                  <strong className="text-sm text-black">{result.nama}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-sm text-[#64748b]">Status</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    result.status === "Layak" 
                    ? "bg-[#C7EABB] text-[#1B5E20]" 
                    : "bg-red-50 text-red-600"
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}