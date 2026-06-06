"use client";

import {
  previewImportDataset,
  simpanRawImportDataset,
} from "@/services/import-data.service";
import type {
  ImportBatch,
  ImportPreview,
  SaveRawImportResponse,
} from "@/types/import-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  FileSpreadsheet,
  FileUp,
  History,
  Info,
  Loader2,
  RefreshCcw,
  Rows3,
  Save,
  Table2,
  UploadCloud,
  X,
} from "lucide-react";

type ImportDatasetClientProps = {
  initialBatches: ImportBatch[];
  initialErrorMessage?: string;
};

type StepKey = "upload" | "preview" | "save" | "done";

const requiredColumns = ["kelurahan", "dusun", "jml_anggota_keluarga"];

function toSafeNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

function formatAngka(value: number | string | null | undefined) {
  return new Intl.NumberFormat("id-ID").format(toSafeNumber(value));
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

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function StepItem({
  number,
  title,
  description,
  active,
  done,
}: {
  number: number;
  title: string;
  description: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : done
          ? "border-emerald-100 bg-white"
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
            done
              ? "bg-emerald-600 text-white"
              : active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {done ? <CheckCircle2 className="h-5 w-5" /> : number}
        </div>

        <div>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
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
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
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

export function ImportDatasetClient({
  initialBatches,
  initialErrorMessage,
}: ImportDatasetClientProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [savedImport, setSavedImport] =
    useState<SaveRawImportResponse | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>(initialBatches);
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState(initialErrorMessage || "");

  const columns = preview?.columns ?? [];

  const currentStep: StepKey = useMemo(() => {
    if (savedImport) return "done";
    if (preview) return "save";
    if (file) return "preview";
    return "upload";
  }, [file, preview, savedImport]);

  const totalImportedRows = batches.reduce(
    (total, item) => total + toSafeNumber(item.jumlah_baris),
    0
  );

  const totalValidRows = batches.reduce(
    (total, item) => total + toSafeNumber(item.jumlah_valid),
    0
  );

  const totalErrorRows = batches.reduce(
    (total, item) => total + toSafeNumber(item.jumlah_error),
    0
  );

  function setInfo(type: "success" | "error" | "info", text: string) {
    setMessageType(type);
    setMessage(text);
  }

  function resetImportState() {
    setFile(null);
    setPreview(null);
    setSavedImport(null);
    setMessage("");
    setMessageType("info");
  }

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const lowerName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      setInfo("error", "Format file tidak didukung. Gunakan CSV, XLS, atau XLSX.");
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setSavedImport(null);
    setInfo(
      "info",
      "File berhasil dipilih. Klik Preview Dataset untuk mengecek isi file."
    );
  }

  async function handlePreview() {
    if (!file) {
      setInfo("error", "Pilih file terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await previewImportDataset(file);

      setPreview(result);
      setSavedImport(null);

      if (result.missing_required_columns.length > 0) {
        setInfo(
          "error",
          `Preview berhasil, tapi kolom wajib kurang: ${result.missing_required_columns.join(
            ", "
          )}. Pastikan dataset punya kolom kelurahan, dusun, dan jml_anggota_keluarga.`
        );
      } else {
        setInfo(
          "success",
          "Preview dataset berhasil dimuat dan kolom wajib terdeteksi."
        );
      }
    } catch (error) {
      setInfo(
        "error",
        error instanceof Error ? error.message : "Gagal preview dataset."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveRaw() {
    if (!file) {
      setInfo("error", "Pilih file terlebih dahulu.");
      return;
    }

    if (!preview) {
      setInfo(
        "error",
        "Preview dataset terlebih dahulu sebelum menyimpan raw import."
      );
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await simpanRawImportDataset(file);

      setSavedImport(result);
      setBatches((current) => [result.batch, ...current]);
      setInfo(
        "success",
        "Raw dataset berhasil disimpan. Lanjutkan ke menu Auto Penilaian untuk generate Data Warga + Penilaian C1-C10."
      );
      router.refresh();
    } catch (error) {
      setInfo(
        "error",
        error instanceof Error ? error.message : "Gagal menyimpan raw import."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <UploadCloud className="h-4 w-4" />
              Import Dataset
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Import Dataset Kemiskinan
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Upload file CSV atau Excel, cek preview data, lalu simpan sebagai
              raw import. Proses generate Data Warga + Penilaian dilakukan di
              menu Auto Penilaian.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
                <FileUp className="h-4 w-4" />
                Pilih File
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>

              <button
                type="button"
                onClick={resetImportState}
                disabled={isLoading || (!file && !preview && !savedImport)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>

              <Link
                href="/admin/penilaian"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Auto Penilaian
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
            <p className="text-sm font-semibold text-emerald-100">
              Total Riwayat Import
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-5xl font-bold leading-tight">
              {formatAngka(batches.length)}
            </h2>

            <p className="mt-2 text-sm text-emerald-100">
              batch import tersimpan di sistem.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Total Baris
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(totalImportedRows)}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Valid
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(totalValidRows)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Batch Import"
          value={formatAngka(batches.length)}
          description="Jumlah batch import yang tersimpan."
          icon={<Database className="h-6 w-6" />}
        />

        <MetricCard
          title="Total Baris"
          value={formatAngka(totalImportedRows)}
          description="Total baris data dari semua batch."
          icon={<Rows3 className="h-6 w-6" />}
        />

        <MetricCard
          title="Data Valid"
          value={formatAngka(totalValidRows)}
          description="Jumlah baris yang lolos validasi."
          icon={<FileCheck2 className="h-6 w-6" />}
        />

        <MetricCard
          title="Data Error"
          value={formatAngka(totalErrorRows)}
          description="Jumlah baris bermasalah saat import."
          icon={<AlertCircle className="h-6 w-6" />}
        />
      </section>

      {message ? <InfoAlert type={messageType} message={message} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
            Alur Import
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Import hanya menyimpan data mentah. Generate penilaian dilakukan
            setelah batch import tersimpan.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <StepItem
              number={1}
              title="Upload File"
              description="Pilih file CSV, XLS, atau XLSX."
              active={currentStep === "upload"}
              done={Boolean(file)}
            />

            <StepItem
              number={2}
              title="Preview Dataset"
              description="Cek kolom dan contoh isi dataset."
              active={currentStep === "preview"}
              done={Boolean(preview)}
            />

            <StepItem
              number={3}
              title="Simpan Raw Import"
              description="Simpan data mentah ke database."
              active={currentStep === "save"}
              done={Boolean(savedImport)}
            />

            <StepItem
              number={4}
              title="Auto Penilaian"
              description="Generate Data Warga + nilai C1-C10 di menu Auto Penilaian."
              active={currentStep === "done"}
              done={currentStep === "done"}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>

              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  Upload File
                </h2>

                <p className="text-sm text-slate-500">
                  Format didukung: CSV, XLS, XLSX.
                </p>
              </div>
            </div>

            {file ? (
              <button
                type="button"
                onClick={resetImportState}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Ganti File
              </button>
            ) : null}
          </div>

          <label className="mt-6 flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-10 text-center transition hover:bg-emerald-50">
            <UploadCloud className="h-12 w-12 text-emerald-700" />

            <span className="mt-4 text-base font-bold text-slate-900">
              {file ? file.name : "Klik untuk memilih file dataset"}
            </span>

            <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {file
                ? `${formatFileSize(file.size)} • ${
                    file.type || "file dataset"
                  }`
                : "Upload file CSV atau Excel. Dataset akan dipreview terlebih dahulu sebelum disimpan ke database."}
            </span>

            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
            />
          </label>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={handlePreview}
              disabled={isLoading || !file}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Preview Dataset
            </button>

            <button
              type="button"
              onClick={handleSaveRaw}
              disabled={isLoading || !preview}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Simpan Raw
            </button>

            <Link
              href="/admin/penilaian"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                savedImport
                  ? "bg-slate-950 text-white hover:bg-emerald-700"
                  : "pointer-events-none bg-slate-200 text-slate-400"
              }`}
            >
              Auto Penilaian
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {savedImport ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Batch tersimpan: {savedImport.batch.nama_file}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Preview Dataset
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Preview ditampilkan full width agar tabel lebih lega dan mudah
              dibaca.
            </p>
          </div>

          {preview ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Total Baris
              </p>

              <p className="[font-family:var(--font-oswald)] text-3xl font-bold text-emerald-800">
                {formatAngka(preview.total_rows)}
              </p>
            </div>
          ) : null}
        </div>

        {!preview ? (
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Table2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Belum Ada Preview
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Pilih file dataset, lalu klik Preview Dataset untuk melihat kolom
              dan contoh data.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Nama File
                </p>

                <p className="mt-2 truncate text-sm font-bold text-slate-900">
                  {preview.filename}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Total Baris
                </p>

                <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                  {formatAngka(preview.total_rows)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Total Kolom
                </p>

                <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                  {formatAngka(columns.length)}
                </p>
              </div>
            </div>

            {preview.missing_required_columns.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                Kolom wajib belum cocok otomatis:{" "}
                {preview.missing_required_columns.join(", ")}.
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                Kolom wajib terdeteksi: {requiredColumns.join(", ")}.
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                Kolom Terdeteksi
              </h3>

              <div className="flex flex-wrap gap-2">
                {columns.map((column) => (
                  <span
                    key={column}
                    className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[920px] border-collapse">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {columns.map((column) => (
                      <th key={column} className="px-3 py-4">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {preview.preview.slice(0, 8).map((row, index) => (
                    <tr
                      key={index}
                      className="transition hover:bg-emerald-50/50"
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-[240px] px-3 py-4 text-xs font-medium text-slate-600"
                        >
                          <p className="truncate">
                            {String(row[column] ?? "-")}
                          </p>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Riwayat Import
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Daftar batch import dataset yang pernah disimpan.
            </p>
          </div>

          <History className="h-6 w-6 text-emerald-700" />
        </div>

        {batches.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Clock3 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Belum Ada Riwayat Import
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Riwayat akan muncul setelah dataset disimpan sebagai raw import.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-3 py-4">Nama File</th>
                  <th className="px-3 py-4">Jumlah Baris</th>
                  <th className="px-3 py-4">Valid</th>
                  <th className="px-3 py-4">Error</th>
                  <th className="px-3 py-4">Uploader</th>
                  <th className="px-3 py-4">Tanggal</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="transition hover:bg-emerald-50/50"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {batch.nama_file}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {batch.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 [font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                      {formatAngka(batch.jumlah_baris)}
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {formatAngka(batch.jumlah_valid)}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                        {formatAngka(batch.jumlah_error)}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-500">
                      {batch.uploaded_by || "-"}
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-500">
                      {formatTanggal(batch.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}