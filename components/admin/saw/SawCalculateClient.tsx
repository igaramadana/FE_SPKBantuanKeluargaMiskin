"use client";

import type { ImportBatch } from "@/types/import-data";
import type { Keluarga } from "@/types/keluarga";
import type { Kriteria } from "@/types/kriteria";
import { autoGeneratePenilaianDataset } from "@/services/import-data.service";
import { hitungSawDariDatabase } from "@/services/saw.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Info,
  Loader2,
  PlayCircle,
  Settings2,
  SlidersHorizontal,
  Users,
} from "lucide-react";

type ModeHitung = "threshold" | "kuota";

type SawCalculateClientProps = {
  keluarga: Keluarga[];
  kriteria: Kriteria[];
  importBatches: ImportBatch[];
  errorMessage?: string;
  userName?: string;
};

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatBobot(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toFixed(4);
}

function formatPersen(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "-";
  return `${(parsed * 100).toFixed(2).replace(".", ",")}%`;
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p>

      <h3 className="mt-2 [font-family:var(--font-oswald)] text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoAlert({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const icons = {
    success: <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />,
    error: <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />,
    info: <Info className="mt-0.5 h-5 w-5 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[type]}`}
    >
      {icons[type]}
      <p className="font-semibold leading-6">{message}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  active,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl [font-family:var(--font-oswald)] text-xl font-bold ${
          active ? "bg-emerald-600 text-white" : "bg-white text-slate-500"
        }`}
      >
        {number}
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function SawCalculateClient({
  keluarga,
  kriteria,
  importBatches,
  errorMessage,
}: SawCalculateClientProps) {
  const router = useRouter();

  const [namaPerhitungan, setNamaPerhitungan] =
    useState("Perhitungan AHP-SAW");
  const [mode, setMode] = useState<ModeHitung>("kuota");
  const [threshold, setThreshold] = useState("0.60");
  const [quota, setQuota] = useState("5");
  const [reserveQuota, setReserveQuota] = useState("2");
  const [selectedImportBatchId, setSelectedImportBatchId] = useState(
    importBatches[0]?.id || ""
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");

  const totalBobot = kriteria.reduce(
    (total, item) => total + Number(item.bobot_ahp || 0),
    0
  );

  const totalBobotValid = totalBobot > 0.999 && totalBobot < 1.001;

  function setInfo(type: "success" | "error" | "info", text: string) {
    setMessageType(type);
    setMessage(text);
  }

  async function handleAutoGeneratePenilaian() {
    if (!selectedImportBatchId) {
      setInfo("error", "Pilih batch import terlebih dahulu.");
      return;
    }

    if (kriteria.length === 0) {
      setInfo("error", "Belum ada kriteria aktif C1-C10.");
      return;
    }

    setIsAutoGenerating(true);
    setMessage("");

    try {
      const result = await autoGeneratePenilaianDataset({
        import_batch_id: selectedImportBatchId,
        preview_only: false,
        limit_preview: 50,
      });

      let extraMessage = "";

      if (result.errors && result.errors.length > 0) {
        extraMessage = ` Contoh error: ${result.errors
          .slice(0, 3)
          .join(" | ")}`;
      }

      setInfo(
        result.total_gagal > 0 ? "info" : "success",
        `${result.message} Data warga tersimpan: ${formatAngka(
          result.total_keluarga_berhasil
        )}, penilaian C1-C10 tersimpan: ${formatAngka(
          result.total_penilaian_berhasil
        )}, gagal: ${formatAngka(result.total_gagal)}.${extraMessage}`
      );

      router.refresh();
    } catch (error) {
      setInfo(
        "error",
        error instanceof Error
          ? error.message
          : "Gagal auto generate penilaian dari batch import."
      );
    } finally {
      setIsAutoGenerating(false);
    }
  }

  async function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!namaPerhitungan.trim()) {
      setInfo("error", "Nama perhitungan wajib diisi.");
      return;
    }

    if (kriteria.length === 0) {
      setInfo("error", "Belum ada kriteria aktif.");
      return;
    }

    if (keluarga.length === 0) {
      setInfo("error", "Belum ada keluarga terverifikasi.");
      return;
    }

    if (!totalBobotValid) {
      setInfo(
        "error",
        "Total bobot belum valid. Hitung dan simpan bobot AHP terlebih dahulu sampai total bobot mendekati 1.0000."
      );
      return;
    }

    if (mode === "threshold") {
      const parsedThreshold = Number(threshold);

      if (
        !Number.isFinite(parsedThreshold) ||
        parsedThreshold < 0 ||
        parsedThreshold > 1
      ) {
        setInfo("error", "Nilai minimal layak harus berupa angka 0 sampai 1.");
        return;
      }
    }

    if (mode === "kuota") {
      const parsedQuota = Number(quota);
      const parsedReserve = Number(reserveQuota || 0);

      if (!Number.isInteger(parsedQuota) || parsedQuota < 1) {
        setInfo("error", "Kuota layak harus angka bulat minimal 1.");
        return;
      }

      if (!Number.isInteger(parsedReserve) || parsedReserve < 0) {
        setInfo("error", "Kuota cadangan harus angka bulat minimal 0.");
        return;
      }
    }

    setIsCalculating(true);
    setMessage("");

    try {
      const result = await hitungSawDariDatabase({
        nama_perhitungan: namaPerhitungan.trim(),
        mode,
        threshold: mode === "threshold" ? Number(threshold) : undefined,
        quota: mode === "kuota" ? Number(quota) : undefined,
        reserve_quota: mode === "kuota" ? Number(reserveQuota || 0) : 0,
      });

      setInfo(
        "success",
        `${result.message} Total data dihitung: ${formatAngka(
          result.riwayat.jumlah_data
        )}. Buka menu Hasil SPK untuk melihat ranking penerima bantuan.`
      );

      router.refresh();
    } catch (error) {
      setInfo(
        "error",
        error instanceof Error
          ? error.message
          : "Gagal menjalankan perhitungan SAW."
      );
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Calculator className="h-4 w-4" />
              Penilaian SAW
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Generate Nilai & Jalankan Perhitungan Bantuan
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Menu ini sekarang dibuat lebih sederhana. Nilai C1-C10 tidak
              diinput manual di sini, karena nilai sudah berasal dari tambah data
              warga atau auto-generate dataset SIMNANGKIS.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAutoGeneratePenilaian}
                disabled={isAutoGenerating || !selectedImportBatchId}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAutoGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Auto Generate C1-C10
              </button>

              <Link
                href="/admin/hasil-spk"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Buka Hasil SPK
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-emerald-100">
              Alur yang benar
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold leading-tight">
              Data Warga → Bobot AHP → Hitung SAW
            </h2>

            <div className="mt-6 space-y-3 text-sm leading-6 text-emerald-50">
              <p className="rounded-xl bg-white/10 p-4 backdrop-blur">
                1. Tambah data warga/manual atau import dataset.
              </p>
              <p className="rounded-xl bg-white/10 p-4 backdrop-blur">
                2. Pastikan bobot AHP sudah valid dan totalnya 1.0000.
              </p>
              <p className="rounded-xl bg-white/10 p-4 backdrop-blur">
                3. Jalankan SAW, lalu lihat hasilnya di menu Hasil SPK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? <InfoAlert type="error" message={errorMessage} /> : null}
      {message ? <InfoAlert type={messageType} message={message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Keluarga Terverifikasi"
          value={formatAngka(keluarga.length)}
          description="Data warga yang bisa masuk proses SAW."
          icon={<Users className="h-6 w-6" />}
        />

        <MetricCard
          title="Kriteria Aktif"
          value={formatAngka(kriteria.length)}
          description="Kriteria penilaian C1 sampai C10."
          icon={<SlidersHorizontal className="h-6 w-6" />}
        />

        <MetricCard
          title="Total Bobot AHP"
          value={formatBobot(totalBobot)}
          description={
            totalBobotValid
              ? `Valid, setara ${formatPersen(totalBobot)}.`
              : `Belum ideal. Saat ini ${formatPersen(totalBobot)}.`
          }
          icon={<BarChart3 className="h-6 w-6" />}
        />

        <MetricCard
          title="Batch Import"
          value={formatAngka(importBatches.length)}
          description="Dataset yang bisa dipakai auto-generate nilai."
          icon={<FileSpreadsheet className="h-6 w-6" />}
        />
      </section>

      {!totalBobotValid ? (
        <InfoAlert
          type="info"
          message="Total bobot AHP belum mendekati 1.0000. Sebaiknya hitung dan simpan bobot AHP terlebih dahulu sebelum menjalankan SAW."
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>

              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Auto Generate C1-C10
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Dipakai setelah import dataset. Sistem akan membaca raw import,
                  membuat data warga, lalu mengisi nilai C1-C10 memakai mapping
                  SIMNANGKIS.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  Batch Import
                </span>

                <select
                  value={selectedImportBatchId}
                  onChange={(event) =>
                    setSelectedImportBatchId(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Pilih batch import</option>
                  {importBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.nama_file} - {formatTanggal(batch.created_at)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleAutoGeneratePenilaian}
                disabled={isAutoGenerating || !selectedImportBatchId}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAutoGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {isAutoGenerating ? "Generate..." : "Generate Nilai C1-C10"}
              </button>

              <p className="text-xs leading-5 text-slate-400">
                Kalau data warga sudah ditambah manual lewat menu Data Warga,
                tombol ini tidak wajib dipakai.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Info className="h-6 w-6" />
              </div>

              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Catatan Penting
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Supaya hasil SAW tidak kosong atau salah ranking.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800">
                  1. Nilai C1-C10 berasal dari Data Warga
                </p>
                <p className="mt-1 text-emerald-700">
                  Input manual nilai tidak ada lagi di menu ini. Tambah/edit
                  nilainya lewat menu Data Warga.
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="font-bold text-amber-800">
                  2. Bobot AHP harus sudah disimpan
                </p>
                <p className="mt-1 text-amber-700">
                  Total bobot ideal adalah 1.0000 agar normalisasi dan nilai
                  terbobot SAW benar.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">
                  3. Ranking ada di menu Hasil SPK
                </p>
                <p className="mt-1 text-slate-500">
                  Menu ini hanya untuk generate nilai dan menjalankan hitung SAW.
                  Hasil akhir dipisah agar halaman tidak terlalu ramai.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCalculate}
          className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
              <Settings2 className="h-6 w-6" />
            </div>

            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Jalankan Perhitungan SAW
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Setelah nilai C1-C10 dan bobot AHP siap, jalankan perhitungan
                untuk membuat ranking penerima bantuan.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">
                Nama Perhitungan
              </span>
              <input
                value={namaPerhitungan}
                onChange={(event) => setNamaPerhitungan(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-700">
                Cara Menentukan Status
              </span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as ModeHitung)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="kuota">Berdasarkan kuota penerima</option>
                <option value="threshold">Berdasarkan nilai minimal</option>
              </select>
            </label>

            {mode === "threshold" ? (
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  Nilai Minimal Layak
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
                <p className="text-xs leading-5 text-slate-400">
                  Contoh: 0.60 berarti keluarga dengan skor akhir minimal 0.60
                  akan berstatus layak.
                </p>
              </label>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Kuota Layak
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={quota}
                    onChange={(event) => setQuota(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Kuota Cadangan
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={reserveQuota}
                    onChange={(event) => setReserveQuota(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isCalculating}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              {isCalculating ? "Menghitung..." : "Jalankan SAW"}
            </button>

            <Link
              href="/admin/hasil-spk"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              Lihat Hasil SPK
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StepCard
          number="1"
          title="Siapkan data warga"
          description="Tambah manual di Data Warga atau import dataset lalu auto-generate nilai C1-C10."
          active
        />
        <StepCard
          number="2"
          title="Simpan bobot AHP"
          description="Pastikan total bobot AHP sudah valid agar perhitungan SAW tidak bias."
          active={totalBobotValid}
        />
        <StepCard
          number="3"
          title="Hitung dan lihat hasil"
          description="Jalankan SAW di halaman ini, lalu buka menu Hasil SPK untuk ranking akhir."
          active={keluarga.length > 0 && kriteria.length > 0 && totalBobotValid}
        />
      </section>
    </div>
  );
}
