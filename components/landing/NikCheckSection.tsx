"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, LogIn, Search } from "lucide-react";
import { apiGet } from "@/lib/api";

type CekKelayakanResponse = {
  found: boolean;
  nama?: string | null;
  nik_masked?: string | null;
  status_verifikasi?: string | null;
  status_bantuan?: string | null;
  ranking?: number | null;
  tanggal_hitung?: string | null;
  message: string;
};

function formatLabel(value?: string | null) {
  if (!value) return "-";

  const map: Record<string, string> = {
    pending: "Menunggu Verifikasi",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
    perlu_perbaikan: "Perlu Perbaikan",
    belum_dihitung: "Belum Dihitung",
    layak: "Layak",
    cadangan: "Cadangan",
    tidak_layak: "Tidak Layak",
  };

  return map[value] || value.replace(/_/g, " ");
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "layak":
    case "terverifikasi":
      return "bg-[#C7EABB] text-[#1B5E20]";
    case "cadangan":
    case "pending":
    case "belum_dihitung":
      return "bg-yellow-100 text-yellow-700";
    case "perlu_perbaikan":
      return "bg-orange-100 text-orange-700";
    case "ditolak":
    case "tidak_layak":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getResultIcon(result: CekKelayakanResponse) {
  if (!result.found) {
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  }

  if (result.status_bantuan === "layak" || result.status_verifikasi === "terverifikasi") {
    return <CheckCircle2 className="h-5 w-5 text-[#1B5E20]" />;
  }

  return <Clock3 className="h-5 w-5 text-yellow-700" />;
}

export function NikCheckSection() {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CekKelayakanResponse | null>(null);

  async function handleCek(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanNik = nik.replace(/\D/g, "");

    setError("");
    setResult(null);

    if (cleanNik.length !== 16) {
      setError("NIK harus terdiri dari 16 digit angka.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiGet<CekKelayakanResponse>("/public/cek-kelayakan", {
        nik: cleanNik,
      });

      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengecek data bantuan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative z-10 -mt-16 px-5 md:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#F5F7F6] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:p-7">
        <form
          onSubmit={handleCek}
          className="grid gap-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center"
        >
          <div className="flex items-center gap-4">
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-[#C7EABB] text-[#1B5E20] md:flex">
              <Search className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black">Cek Kelayakan</h2>
              <p className="mt-1 text-sm text-[#263238]">
                Masukkan NIK untuk cek status bantuan keluarga
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              placeholder="Masukkan NIK 16 digit"
              className="h-12 w-full rounded-xl border border-transparent bg-[#E0E0E0] px-4 pr-11 text-sm tracking-wider text-[#263238] outline-none transition placeholder:text-[#263238]/70 focus:border-[#1B5E20] focus:bg-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#263238]">
              <Search size={20} />
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || nik.length !== 16}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1B5E20] px-6 text-sm font-semibold text-white transition hover:bg-[#144A18] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Cek Sekarang"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div
              className={`rounded-2xl border p-4 md:px-5 ${
                result.found
                  ? "border-[#1B5E20]/20 bg-[#C7EABB]/40"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="mt-0.5">{getResultIcon(result)}</div>
                <div>
                  <h3 className="text-sm font-bold text-black">
                    {result.found ? "Hasil Cek Data Bantuan" : "Data Tidak Ditemukan"}
                  </h3>
                  <p className="mt-1 text-sm text-[#263238]">{result.message}</p>
                </div>
              </div>

              {result.found && (
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex justify-between border-b border-black/5 py-1.5 md:col-span-2">
                    <span className="text-sm text-[#64748b]">Nama</span>
                    <strong className="text-sm text-black">{result.nama || "-"}</strong>
                  </div>

                  <div className="flex justify-between border-b border-black/5 py-1.5">
                    <span className="text-sm text-[#64748b]">NIK</span>
                    <strong className="text-sm text-black">{result.nik_masked || "-"}</strong>
                  </div>

                  <div className="flex justify-between border-b border-black/5 py-1.5">
                    <span className="text-sm text-[#64748b]">Verifikasi</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusClass(
                        result.status_verifikasi
                      )}`}
                    >
                      {formatLabel(result.status_verifikasi)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 py-1.5">
                    <span className="text-sm text-[#64748b]">Status Bantuan</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusClass(
                        result.status_bantuan
                      )}`}
                    >
                      {formatLabel(result.status_bantuan)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 py-1.5">
                    <span className="text-sm text-[#64748b]">Ranking</span>
                    <strong className="text-sm text-black">
                      {result.ranking ? `#${result.ranking}` : "-"}
                    </strong>
                  </div>
                </div>
              )}

              {result.found && (
                <a
                  href="/login"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1B5E20] ring-1 ring-[#1B5E20]/20 transition hover:bg-[#F5F7F6]"
                >
                  <LogIn className="h-4 w-4" />
                  Login untuk melihat detail
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
