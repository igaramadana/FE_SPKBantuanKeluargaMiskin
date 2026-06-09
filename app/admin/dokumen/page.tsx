"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiUpload } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const FILE_BASE = API_BASE.replace(/\/api\/?$/, "");

type Keluarga = {
  id: string;
  nama_kepala_keluarga: string;
  nik: string;
  status_verifikasi: string;
};

type Dokumen = {
  id: string;
  keluarga_id: string;
  jenis_dokumen: string;
  file_url: string;
  status_verifikasi: string;
  catatan?: string | null;
};

export default function DokumenPendukungPage() {
  const [keluarga, setKeluarga] = useState<Keluarga[]>([]);
  const [selectedKeluarga, setSelectedKeluarga] = useState("");
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [jenisDokumen, setJenisDokumen] = useState("KTP/KK");
  const [file, setFile] = useState<File | null>(null);

  async function loadKeluarga() {
    const result = await apiGet<Keluarga[]>("/keluarga");
    setKeluarga(Array.isArray(result) ? result : []);
  }

  async function loadDokumen(keluargaId: string) {
    if (!keluargaId) return setDokumen([]);
    const result = await apiGet<Dokumen[]>(`/dokumen/keluarga/${keluargaId}`);
    setDokumen(Array.isArray(result) ? result : []);
  }

  async function uploadDokumen() {
    if (!selectedKeluarga || !file) return alert("Pilih keluarga dan file dulu.");

    const formData = new FormData();
    formData.append("keluarga_id", selectedKeluarga);
    formData.append("jenis_dokumen", jenisDokumen);
    formData.append("file", file);

    await apiUpload("/dokumen/upload", formData);
    setFile(null);
    await loadDokumen(selectedKeluarga);
  }

  async function updateStatus(dokumenId: string, status: string) {
    await apiPatch(`/dokumen/${dokumenId}/verifikasi?status_verifikasi=${status}`, {});
    await loadDokumen(selectedKeluarga);
  }

  useEffect(() => {
    loadKeluarga();
  }, []);

  useEffect(() => {
    loadDokumen(selectedKeluarga);
  }, [selectedKeluarga]);

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-5">
        <h1 className="text-2xl font-bold">Dokumen Pendukung</h1>
        <p className="text-sm text-gray-500">Upload dan verifikasi dokumen keluarga seperti KTP/KK, SKTM, foto rumah, dan dokumen penghasilan.</p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <select value={selectedKeluarga} onChange={(e) => setSelectedKeluarga(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">Pilih keluarga</option>
            {keluarga.map((item) => (
              <option key={item.id} value={item.id}>{item.nama_kepala_keluarga} - {item.nik}</option>
            ))}
          </select>
          <select value={jenisDokumen} onChange={(e) => setJenisDokumen(e.target.value)} className="rounded-lg border px-3 py-2">
            <option>KTP/KK</option>
            <option>SKTM</option>
            <option>Foto Rumah</option>
            <option>Bukti Penghasilan</option>
            <option>Dokumen Lainnya</option>
          </select>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-lg border px-3 py-2" />
        </div>
        <button type="button" onClick={uploadDokumen} className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">Upload Dokumen</button>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Daftar Dokumen</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Jenis</th>
                <th className="p-3">File</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dokumen.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{item.jenis_dokumen}</td>
                  <td className="p-3"><a href={`${FILE_BASE}${item.file_url}`} target="_blank" className="text-green-700 underline">Lihat File</a></td>
                  <td className="p-3">{item.status_verifikasi}</td>
                  <td className="space-x-2 p-3">
                    <button onClick={() => updateStatus(item.id, "diterima")} className="rounded bg-green-600 px-3 py-1 text-white">Terima</button>
                    <button onClick={() => updateStatus(item.id, "ditolak")} className="rounded bg-red-600 px-3 py-1 text-white">Tolak</button>
                  </td>
                </tr>
              ))}
              {dokumen.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada dokumen.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
