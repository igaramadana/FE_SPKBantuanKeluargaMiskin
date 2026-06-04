"use client";

import type { ImportBatch } from "@/types/import-data";
import type { Keluarga } from "@/types/keluarga";
import type { Kriteria } from "@/types/kriteria";
import type { RiwayatSaw, SawResult } from "@/types/saw";
import {
  autoGeneratePenilaianDariImport,
  hitungSawDariDatabase,
  simpanPenilaianSaw,
} from "@/services/saw.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  History,
  Info,
  Loader2,
  PlayCircle,
  RefreshCcw,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Trophy,
  Users,
} from "lucide-react";

type ModeHitung = "threshold" | "kuota";

type SawCalculateClientProps = {
  keluarga: Keluarga[];
  kriteria: Kriteria[];
  hasilSaw: SawResult[];
  riwayatSaw: RiwayatSaw[];
  importBatches: ImportBatch[];
  errorMessage?: string;
  userName?: string;
};

type PenilaianState = Record<string, Record<string, string>>;

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatSkor(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0.0000";
  return parsed.toFixed(4);
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

function statusLabel(status?: string | null) {
  const map: Record<string, string> = {
    layak: "Layak",
    cadangan: "Cadangan",
    tidak_layak: "Tidak Layak",
  };

  return map[status || ""] || "-";
}

function StatusBadge({ status }: { status?: string | null }) {
  const styleMap: Record<string, string> = {
    layak: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cadangan: "border-amber-200 bg-amber-50 text-amber-700",
    tidak_layak: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
        styleMap[status || ""] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function JenisBadge({ jenis }: { jenis: string }) {
  const isBenefit = jenis === "benefit";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${
        isBenefit
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {jenis}
    </span>
  );
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

export function SawCalculateClient({
  keluarga,
  kriteria,
  hasilSaw,
  riwayatSaw,
  importBatches,
  errorMessage,
  userName,
}: SawCalculateClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");
  const [penilaian, setPenilaian] = useState<PenilaianState>({});
  const [namaPerhitungan, setNamaPerhitungan] =
    useState("Perhitungan AHP-SAW");
  const [mode, setMode] = useState<ModeHitung>("kuota");
  const [threshold, setThreshold] = useState("0.60");
  const [quota, setQuota] = useState("5");
  const [reserveQuota, setReserveQuota] = useState("2");
  const [selectedImportBatchId, setSelectedImportBatchId] = useState(
    importBatches[0]?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");

  const totalBobot = kriteria.reduce(
    (total, item) => total + Number(item.bobot_ahp || 0),
    0
  );

  const latestRiwayat = riwayatSaw[0];

  const kelurahanList = Array.from(
    new Set(
      keluarga
        .map((item) => item.kelurahan)
        .filter((item): item is string => Boolean(item))
    )
  ).sort();

  const filteredKeluarga = useMemo(() => {
    return keluarga
      .filter((item) => {
        const keyword = search.trim().toLowerCase();

        const matchSearch = keyword
          ? item.nama_kepala_keluarga.toLowerCase().includes(keyword) ||
            item.nik.toLowerCase().includes(keyword)
          : true;

        const matchKelurahan = kelurahanFilter
          ? item.kelurahan === kelurahanFilter
          : true;

        return matchSearch && matchKelurahan;
      })
      .slice(0, 25);
  }, [keluarga, search, kelurahanFilter]);

  const filledCount = useMemo(() => {
    let total = 0;

    Object.values(penilaian).forEach((row) => {
      Object.values(row).forEach((value) => {
        if (value.trim() !== "") total += 1;
      });
    });

    return total;
  }, [penilaian]);

  const latestHasilTop = [...hasilSaw]
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, 5);

  function setInfo(type: "success" | "error" | "info", text: string) {
    setMessageType(type);
    setMessage(text);
  }

  function updateNilai(
    keluargaId: string,
    kriteriaId: string,
    value: string
  ) {
    setPenilaian((current) => ({
      ...current,
      [keluargaId]: {
        ...(current[keluargaId] || {}),
        [kriteriaId]: value,
      },
    }));
  }

  function fillDefaultVisible() {
    const next: PenilaianState = { ...penilaian };

    filteredKeluarga.forEach((itemKeluarga) => {
      next[itemKeluarga.id] = {
        ...(next[itemKeluarga.id] || {}),
      };

      kriteria.forEach((itemKriteria) => {
        if (!next[itemKeluarga.id][itemKriteria.id]) {
          next[itemKeluarga.id][itemKriteria.id] = "1";
        }
      });
    });

    setPenilaian(next);
    setInfo(
      "info",
      "Nilai default 1 berhasil diisi untuk data yang sedang tampil. Silakan sesuaikan sebelum menyimpan."
    );
  }

  function resetPenilaian() {
    setPenilaian({});
    setMessage("");
    setMessageType("info");
  }

  async function handleAutoGeneratePenilaian() {
    if (!selectedImportBatchId) {
      setInfo("error", "Pilih batch import terlebih dahulu.");
      return;
    }

    if (kriteria.length === 0) {
      setInfo("error", "Belum ada kriteria aktif C1-C6.");
      return;
    }

    if (keluarga.length === 0) {
      setInfo("error", "Belum ada keluarga terverifikasi.");
      return;
    }

    setIsAutoGenerating(true);
    setMessage("");

    try {
      const result = await autoGeneratePenilaianDariImport({
        import_batch_id: selectedImportBatchId,
      });

      let extraMessage = "";

      if (result.errors && result.errors.length > 0) {
        extraMessage = ` Contoh error: ${result.errors
          .slice(0, 3)
          .join(" | ")}`;
      }

      setInfo(
        result.total_gagal > 0 ? "info" : "success",
        `${result.message} Diproses: ${formatAngka(
          result.total_diproses
        )}, berhasil: ${formatAngka(
          result.total_berhasil
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

  async function handleSavePenilaian() {
    if (kriteria.length === 0) {
      setInfo("error", "Belum ada kriteria aktif.");
      return;
    }

    const payload = Object.entries(penilaian).flatMap(
      ([keluargaId, nilaiByKriteria]) =>
        Object.entries(nilaiByKriteria)
          .filter(([, value]) => value.trim() !== "")
          .map(([kriteriaId, value]) => ({
            keluarga_id: keluargaId,
            kriteria_id: kriteriaId,
            sub_kriteria_id: null,
            nilai_awal: Number(value),
          }))
    );

    if (payload.length === 0) {
      setInfo("error", "Belum ada nilai penilaian yang diisi.");
      return;
    }

    const invalidItem = payload.find(
      (item) => !Number.isFinite(item.nilai_awal) || item.nilai_awal < 0
    );

    if (invalidItem) {
      setInfo(
        "error",
        "Nilai penilaian harus berupa angka dan tidak boleh negatif."
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const result = await simpanPenilaianSaw({
        data: payload,
      });

      setInfo(
        "success",
        `${result.message} Total nilai tersimpan: ${formatAngka(
          result.data.length
        )}.`
      );

      router.refresh();
    } catch (error) {
      setInfo(
        "error",
        error instanceof Error ? error.message : "Gagal menyimpan penilaian."
      );
    } finally {
      setIsSaving(false);
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

    if (mode === "threshold") {
      const parsedThreshold = Number(threshold);

      if (
        !Number.isFinite(parsedThreshold) ||
        parsedThreshold < 0 ||
        parsedThreshold > 1
      ) {
        setInfo("error", "Threshold harus berupa angka 0 sampai 1.");
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
        )}.`
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
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Calculator className="h-4 w-4" />
              Penilaian SAW
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Input Nilai & Hitung Ranking Bantuan
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Isi nilai setiap kriteria untuk keluarga terverifikasi, atau
              auto-generate nilai dari dataset testing yang sudah punya skor C1
              sampai C6.
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
                Auto Generate Nilai
              </button>

              <button
                type="button"
                onClick={handleSavePenilaian}
                disabled={isSaving || filledCount === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Manual
              </button>

              <Link
                href="/admin/hasil-spk"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Lihat Hasil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-emerald-100">
              Perhitungan Terakhir
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold leading-tight">
              {latestRiwayat?.nama_perhitungan || "Belum Ada"}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Data
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {latestRiwayat ? formatAngka(latestRiwayat.jumlah_data) : "0"}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Mode
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold uppercase">
                  {latestRiwayat?.mode_status || "-"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-emerald-100">
              {latestRiwayat
                ? formatTanggal(latestRiwayat.tanggal_hitung)
                : "Jalankan perhitungan pertama untuk membuat riwayat."}
            </p>
          </div>
        </div>
      </section>

      {errorMessage ? <InfoAlert type="error" message={errorMessage} /> : null}
      {message ? <InfoAlert type={messageType} message={message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Keluarga Terverifikasi"
          value={formatAngka(keluarga.length)}
          description="Data keluarga yang bisa masuk proses SAW."
          icon={<Users className="h-6 w-6" />}
        />

        <MetricCard
          title="Kriteria Aktif"
          value={formatAngka(kriteria.length)}
          description="Parameter penilaian yang sedang aktif."
          icon={<SlidersHorizontal className="h-6 w-6" />}
        />

        <MetricCard
          title="Total Bobot"
          value={formatBobot(totalBobot)}
          description={`Setara ${formatPersen(totalBobot)} dari bobot aktif.`}
          icon={<BarChart3 className="h-6 w-6" />}
        />

        <MetricCard
          title="Batch Import"
          value={formatAngka(importBatches.length)}
          description="Batch dataset yang bisa dipakai auto-generate."
          icon={<FileSpreadsheet className="h-6 w-6" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
                Konfigurasi Hitung
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Pilih metode penentuan status akhir hasil ranking.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
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
                Mode Penentuan Status
              </span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as ModeHitung)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="kuota">Kuota</option>
                <option value="threshold">Threshold</option>
              </select>
            </label>

            {mode === "threshold" ? (
              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-700">
                  Nilai Threshold
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
              {isCalculating ? "Menghitung..." : "Jalankan Perhitungan"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>

              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Auto Generate Penilaian
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ambil nilai skor C1-C6 dari raw import dataset testing.
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
                {isAutoGenerating ? "Generate..." : "Auto Generate Nilai"}
              </button>

              <p className="text-xs leading-5 text-slate-400">
                Pastikan data warga sudah terverifikasi dan kriteria aktif
                memakai kode C1 sampai C6.
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
                  Hal yang wajib dipenuhi sebelum menjalankan SAW.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800">
                  1. Keluarga harus terverifikasi
                </p>
                <p className="mt-1 text-emerald-700">
                  Hanya data dengan status terverifikasi yang masuk perhitungan.
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="font-bold text-amber-800">
                  2. Kriteria harus pakai kode C1-C6
                </p>
                <p className="mt-1 text-amber-700">
                  Auto generate membaca skor_C1 sampai skor_C6 dari raw import.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">
                  3. Total bobot ideal 1.0000
                </p>
                <p className="mt-1 text-slate-500">
                  Kalau bobot aktif belum 1.0000, hasil ranking kurang ideal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Input Nilai Manual
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Opsional. Dipakai kalau ingin input nilai manual tanpa batch import.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fillDefaultVisible}
              disabled={filteredKeluarga.length === 0 || kriteria.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Isi Default
            </button>

            <button
              type="button"
              onClick={resetPenilaian}
              disabled={filledCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSavePenilaian}
              disabled={isSaving || filledCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Nilai
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama kepala keluarga / NIK..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={kelurahanFilter}
            onChange={(event) => setKelurahanFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="">Semua Kelurahan</option>
            {kelurahanList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {kriteria.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <SlidersHorizontal className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Belum Ada Kriteria Aktif
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Aktifkan kriteria dan isi bobot terlebih dahulu.
            </p>

            <Link
              href="/admin/kriteria"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Buka Kriteria
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : keluarga.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Belum Ada Keluarga Terverifikasi
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Verifikasi data keluarga terlebih dahulu di menu Data Warga.
            </p>

            <Link
              href="/admin/keluarga"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Buka Data Warga
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-4">
                    Keluarga
                  </th>
                  {kriteria.map((item) => (
                    <th key={item.id} className="px-3 py-4">
                      <div className="min-w-[160px]">
                        <p>{item.kode}</p>
                        <p className="mt-1 normal-case tracking-normal text-slate-500">
                          {item.nama}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <JenisBadge jenis={item.jenis} />
                          <span className="text-[11px] font-bold text-slate-400">
                            {formatBobot(item.bobot_ahp)}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredKeluarga.map((itemKeluarga) => (
                  <tr
                    key={itemKeluarga.id}
                    className="transition hover:bg-emerald-50/50"
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-4">
                      <div className="min-w-[240px]">
                        <p className="font-bold text-slate-900">
                          {itemKeluarga.nama_kepala_keluarga}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {itemKeluarga.nik}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {itemKeluarga.kelurahan || "-"} •{" "}
                          {itemKeluarga.dusun || "-"}
                        </p>
                      </div>
                    </td>

                    {kriteria.map((itemKriteria) => (
                      <td key={itemKriteria.id} className="px-3 py-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            penilaian[itemKeluarga.id]?.[itemKriteria.id] || ""
                          }
                          onChange={(event) =>
                            updateNilai(
                              itemKeluarga.id,
                              itemKriteria.id,
                              event.target.value
                            )
                          }
                          placeholder="0"
                          className="h-11 w-28 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {filteredKeluarga.length === 0 ? (
                  <tr>
                    <td
                      colSpan={kriteria.length + 1}
                      className="px-3 py-10 text-center text-sm font-medium text-slate-500"
                    >
                      Tidak ada keluarga yang cocok dengan filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {keluarga.length > 25 ? (
          <p className="mt-3 text-xs font-medium text-slate-400">
            Tabel hanya menampilkan maksimal 25 data agar halaman tetap ringan.
            Gunakan pencarian/filter untuk memilih keluarga lain.
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Hasil Ranking Terbaru
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Lima ranking teratas dari hasil perhitungan terakhir.
              </p>
            </div>

            <Trophy className="h-6 w-6 text-emerald-700" />
          </div>

          {latestHasilTop.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Belum ada hasil perhitungan.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-3 py-4">Rank</th>
                    <th className="px-3 py-4">Nama</th>
                    <th className="px-3 py-4">Skor</th>
                    <th className="px-3 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {latestHasilTop.map((item) => (
                    <tr key={item.id || item.keluarga_id}>
                      <td className="px-3 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 [font-family:var(--font-oswald)] text-base font-bold text-white">
                          {item.ranking}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-bold text-slate-900">
                          {item.nama_kepala_keluarga}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.nik}
                        </p>
                      </td>

                      <td className="px-3 py-4 [font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                        {formatSkor(item.total_nilai)}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge
                          status={item.status_final || item.status_sistem}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Riwayat
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Perhitungan terakhir yang tersimpan.
              </p>
            </div>

            <History className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-6 space-y-3">
            {riwayatSaw.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  {item.metode}
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-xl font-semibold text-slate-950">
                  {item.nama_perhitungan}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                  <span>{formatAngka(item.jumlah_data)} data</span>
                  <span>•</span>
                  <span className="uppercase">{item.mode_status}</span>
                </div>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  {formatTanggal(item.tanggal_hitung)}
                </p>
              </div>
            ))}

            {riwayatSaw.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Belum ada riwayat perhitungan.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}