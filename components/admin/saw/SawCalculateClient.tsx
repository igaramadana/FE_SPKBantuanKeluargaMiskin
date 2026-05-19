// components/admin/saw/SawCalculateClient.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { hitungSawDariDatabase } from "@/services/saw.service";
import { Loader2, PlayCircle } from "lucide-react";

type ModeHitung = "threshold" | "kuota";

export function SawCalculateClient() {
  const router = useRouter();

  const [namaPerhitungan, setNamaPerhitungan] = useState("Perhitungan AHP-SAW");
  const [mode, setMode] = useState<ModeHitung>("kuota");
  const [threshold, setThreshold] = useState("0.6");
  const [quota, setQuota] = useState("50");
  const [reserveQuota, setReserveQuota] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await hitungSawDariDatabase({
        nama_perhitungan: namaPerhitungan,
        mode,
        threshold: mode === "threshold" ? Number(threshold) : undefined,
        quota: mode === "kuota" ? Number(quota) : undefined,
        reserve_quota: mode === "kuota" ? Number(reserveQuota || 0) : 0,
      });

      setMessage(`${result.message} Total data: ${result.riwayat.jumlah_data}.`);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal menjalankan perhitungan SAW."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-black text-slate-900">
          Konfigurasi Perhitungan
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Pilih metode penentuan status akhir: berdasarkan threshold skor atau
          berdasarkan kuota penerima.
        </p>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Nama Perhitungan
            </label>
            <input
              value={namaPerhitungan}
              onChange={(event) => setNamaPerhitungan(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Mode Penentuan Status
            </label>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as ModeHitung)}
              className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
            >
              <option value="kuota">Kuota</option>
              <option value="threshold">Threshold</option>
            </select>
          </div>

          {mode === "threshold" ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Nilai Threshold
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Kuota Layak
                </label>
                <input
                  type="number"
                  min="1"
                  value={quota}
                  onChange={(event) => setQuota(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Kuota Cadangan
                </label>
                <input
                  type="number"
                  min="0"
                  value={reserveQuota}
                  onChange={(event) => setReserveQuota(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
                />
              </div>
            </div>
          )}

          {message ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1B5E20] px-5 text-sm font-bold text-white transition hover:bg-[#164B1A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            {isSubmitting ? "Menghitung..." : "Jalankan Perhitungan"}
          </button>
        </div>
      </form>

      <div className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">
          Catatan Penting
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
          <p>
            Perhitungan hanya mengambil keluarga dengan status{" "}
            <strong>terverifikasi</strong>.
          </p>

          <p>
            Semua keluarga wajib memiliki nilai untuk semua kriteria aktif.
            Kalau ada satu kriteria yang kosong, backend akan menolak proses
            perhitungan.
          </p>

          <p>
            Bobot AHP pada kriteria juga wajib sudah terisi. Kalau ada bobot
            kosong, isi dulu dari halaman Kriteria & Bobot.
          </p>

          <p>
            Mode <strong>kuota</strong> lebih cocok untuk bantuan dengan jumlah
            penerima terbatas. Mode <strong>threshold</strong> cocok kalau kamu
            punya batas skor minimal kelayakan.
          </p>
        </div>
      </div>
    </div>
  );
}