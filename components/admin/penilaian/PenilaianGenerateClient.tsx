"use client";

import { autoGeneratePenilaianDataset } from "@/services/import-data.service";
import type {
  AutoGeneratePenilaianResponse,
  ImportBatch,
} from "@/types/import-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  FileSpreadsheet,
  Loader2,
  Save,
} from "lucide-react";

type PenilaianGenerateClientProps = {
  importBatches: ImportBatch[];
  errorMessage?: string;
};

const scoreCodes = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"];

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

export function PenilaianGenerateClient({
  importBatches,
  errorMessage,
}: PenilaianGenerateClientProps) {
  const router = useRouter();

  const [selectedBatchId, setSelectedBatchId] = useState(
    importBatches[0]?.id || ""
  );
  const [result, setResult] = useState<AutoGeneratePenilaianResponse | null>(
    null
  );
  const [message, setMessage] = useState(errorMessage || "");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    errorMessage ? "error" : "info"
  );
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedBatch = importBatches.find(
    (batch) => batch.id === selectedBatchId
  );

  async function handleGenerate(previewOnly: boolean) {
    if (!selectedBatchId) {
      setMessage("Pilih batch import terlebih dahulu.");
      setMessageType("error");
      return;
    }

    if (previewOnly) {
      setIsPreviewing(true);
    } else {
      setIsSaving(true);
    }

    setMessage("");

    try {
      const response = await autoGeneratePenilaianDataset({
        import_batch_id: selectedBatchId,
        preview_only: previewOnly,
        limit_preview: 50,
      });

      setResult(response);

      if (response.total_gagal > 0) {
        setMessageType("error");
      } else {
        setMessageType("success");
      }

      setMessage(
        previewOnly
          ? `Preview berhasil. Data mentah: ${formatAngka(
              response.total_raw
            )}, group keluarga: ${formatAngka(response.total_grouped)}.`
          : `Generate selesai. Data Warga tersimpan: ${formatAngka(
              response.total_keluarga_berhasil
            )}, Penilaian C1-C10 tersimpan: ${formatAngka(
              response.total_penilaian_berhasil
            )}, gagal: ${formatAngka(response.total_gagal)}.`
      );

      if (!previewOnly) {
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal auto generate penilaian."
      );
      setMessageType("error");
    } finally {
      setIsPreviewing(false);
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{message}</p>
        </div>
      ) : null}

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Database className="h-4 w-4" />
              Auto Penilaian
            </div>

            <h2 className="mt-4 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              Generate Data Warga + Penilaian C1-C10
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Pilih batch hasil import, klik Preview Generate untuk mengecek
              hasil grouping dan nilai C1-C10, lalu simpan jika sudah sesuai.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/import"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Import Dataset
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/admin/keluarga"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              Data Warga
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Pilih Batch Import
            </label>

            <select
              value={selectedBatchId}
              onChange={(event) => {
                setSelectedBatchId(event.target.value);
                setResult(null);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {importBatches.length === 0 ? (
                <option value="">Belum ada batch import</option>
              ) : null}

              {importBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.nama_file} - {formatAngka(batch.jumlah_baris)} baris -{" "}
                  {formatTanggal(batch.created_at)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isPreviewing || isSaving || !selectedBatchId}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPreviewing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview Generate
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isPreviewing || isSaving || !selectedBatchId}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Data + Penilaian
            </button>
          </div>
        </div>

        {selectedBatch ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-center gap-2 font-bold">
              <FileSpreadsheet className="h-4 w-4" />
              Batch dipilih: {selectedBatch.nama_file}
            </div>
            <p className="mt-1 text-emerald-700/80">
              Total baris: {formatAngka(selectedBatch.jumlah_baris)}, valid:{" "}
              {formatAngka(selectedBatch.jumlah_valid)}, error:{" "}
              {formatAngka(selectedBatch.jumlah_error)}.
            </p>
          </div>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <Database className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Raw Valid
              </p>
              <h3 className="mt-1 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
                {formatAngka(result.total_raw)}
              </h3>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <Database className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Group Keluarga
              </p>
              <h3 className="mt-1 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
                {formatAngka(result.total_grouped)}
              </h3>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Data Warga Tersimpan
              </p>
              <h3 className="mt-1 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
                {formatAngka(result.total_keluarga_berhasil)}
              </h3>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Penilaian Tersimpan
              </p>
              <h3 className="mt-1 [font-family:var(--font-oswald)] text-4xl font-bold text-slate-950">
                {formatAngka(result.total_penilaian_berhasil)}
              </h3>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
                  Preview Nilai C1-C10
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ini adalah contoh hasil generate. Data yang disimpan akan
                  masuk ke Data Warga dengan status pending.
                </p>
              </div>

              {!result.preview_only ? (
                <Link
                  href="/admin/keluarga"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Verifikasi Data Warga
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Kelurahan</th>
                    <th className="px-4 py-3">Dusun</th>
                    <th className="px-4 py-3">Anggota</th>
                    {scoreCodes.map((kode) => (
                      <th key={kode} className="px-4 py-3">
                        {kode}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.preview.length === 0 ? (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-4 py-8 text-center text-sm font-semibold text-slate-400"
                      >
                        Tidak ada preview data.
                      </td>
                    </tr>
                  ) : (
                    result.preview.map((item) => (
                      <tr
                        key={item.kode_keluarga_import}
                        className="border-b border-slate-100"
                      >
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          {item.kode_keluarga_import}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.kelurahan || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.dusun || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.jumlah_anggota ?? "-"}
                        </td>
                        {scoreCodes.map((kode) => (
                          <td
                            key={kode}
                            className="px-4 py-3 font-semibold text-slate-700"
                          >
                            {item.scores?.[kode] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {result.errors.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-bold">Error Generate:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.errors.map((error, index) => (
                    <li key={`${error}-${index}`}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}