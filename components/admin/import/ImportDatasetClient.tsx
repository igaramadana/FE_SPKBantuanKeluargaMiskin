// components/admin/import/ImportDatasetClient.tsx
"use client";

import { useState } from "react";
import {
  mappingImportKeKeluarga,
  previewImportDataset,
  simpanRawImportDataset,
} from "@/services/import-data.service";
import type { ImportPreview, SaveRawImportResponse } from "@/types/import-data";
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";

export function ImportDatasetClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [savedImport, setSavedImport] = useState<SaveRawImportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const columns = preview?.columns ?? [];

  async function handlePreview() {
    if (!file) {
      setMessage("Pilih file terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await previewImportDataset(file);
      setPreview(result);
      setSavedImport(null);
      setMessage("Preview dataset berhasil dimuat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal preview dataset.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveRaw() {
    if (!file) {
      setMessage("Pilih file terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await simpanRawImportDataset(file);
      setSavedImport(result);
      setMessage("Raw dataset berhasil disimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan raw import.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMapping() {
    if (!savedImport) {
      setMessage("Simpan raw import terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await mappingImportKeKeluarga({
        import_batch_id: savedImport.batch.id,
        kolom_kelurahan: "kelurahan",
        kolom_dusun: "dusun",
        kolom_jumlah_anggota: "jml_anggota_keluarga",
      });

      setMessage(
        `Mapping selesai. Berhasil: ${result.total_berhasil}, gagal: ${result.total_gagal}.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mapping ke keluarga.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <div className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#E8F5E9] p-3">
            <FileSpreadsheet className="h-6 w-6 text-[#1B5E20]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Upload File
            </h2>
            <p className="text-sm text-slate-500">
              Format yang didukung: CSV, XLS, XLSX.
            </p>
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-100 bg-[#F9FBF8] px-6 py-10 text-center transition hover:bg-green-50">
          <UploadCloud className="h-10 w-10 text-[#1B5E20]" />
          <span className="mt-4 text-sm font-bold text-slate-900">
            {file ? file.name : "Klik untuk memilih file"}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            Dataset akan dicek sebelum disimpan.
          </span>

          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
              setPreview(null);
              setSavedImport(null);
              setMessage("");
            }}
          />
        </label>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isLoading || !file}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1B5E20] px-5 text-sm font-bold text-white transition hover:bg-[#164B1A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Preview Dataset
          </button>

          <button
            type="button"
            onClick={handleSaveRaw}
            disabled={isLoading || !preview}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-green-100 px-5 text-sm font-bold text-[#1B5E20] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Simpan Raw Import
          </button>

          <button
            type="button"
            onClick={handleMapping}
            disabled={isLoading || !savedImport}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mapping ke Data Keluarga
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </div>
        ) : null}

        {savedImport ? (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Batch tersimpan: {savedImport.batch.nama_file}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Preview Dataset</h2>

        {!preview ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
            Belum ada preview. Pilih file lalu klik Preview Dataset.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#F9FBF8] p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Nama File
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {preview.filename}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F9FBF8] p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Total Baris
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {preview.total_rows}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F9FBF8] p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Total Kolom
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {columns.length}
                </p>
              </div>
            </div>

            {preview.missing_required_columns.length > 0 ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                Kolom wajib kurang: {preview.missing_required_columns.join(", ")}
              </div>
            ) : (
              <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
                Kolom wajib tersedia: kelurahan, dusun, jml_anggota_keluarga.
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
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    {columns.slice(0, 6).map((column) => (
                      <th key={column} className="px-3 py-2">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {preview.preview.slice(0, 5).map((row, index) => (
                    <tr key={index} className="bg-[#F9FBF8]">
                      {columns.slice(0, 6).map((column, columnIndex) => (
                        <td
                          key={column}
                          className={`px-3 py-4 text-xs text-slate-600 ${
                            columnIndex === 0 ? "rounded-l-2xl" : ""
                          } ${
                            columnIndex === 5 ? "rounded-r-2xl" : ""
                          }`}
                        >
                          {String(row[column] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400">
              Tabel preview hanya menampilkan 6 kolom pertama dan 5 baris pertama
              agar UI tetap ringan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}