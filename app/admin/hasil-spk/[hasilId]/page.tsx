"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";

type DetailPenilaian = {
  id: string;
  kode: string;
  nama_kriteria: string;
  jenis: string;
  bobot_ahp: number;
  nilai_awal: number;
  nilai_normalisasi: number;
  nilai_terbobot: number;
  nama_sub_kriteria?: string | null;
};

type DetailHasilResponse = {
  hasil: {
    id: string;
    nama_kepala_keluarga: string;
    nik: string;
    alamat?: string | null;
    kelurahan?: string | null;
    dusun?: string | null;
    total_nilai: number;
    ranking: number;
    status_sistem: string;
    status_final?: string | null;
    alasan_override?: string | null;
  };
  detail_penilaian: DetailPenilaian[];
  penjelasan: {
    rumus: string;
    status: string;
  };
};

export default function DetailHasilSpkPage({ params }: { params: { hasilId: string } }) {
  const [data, setData] = useState<DetailHasilResponse | null>(null);
  const [statusFinal, setStatusFinal] = useState("layak");
  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const result = await apiGet<DetailHasilResponse>(`/saw/hasil/${params.hasilId}/detail`);
      setData(result);
      setStatusFinal(result.hasil.status_final || result.hasil.status_sistem);
      setAlasan(result.hasil.alasan_override || "");
    } finally {
      setLoading(false);
    }
  }

  async function submitOverride() {
    if (alasan.trim().length < 5) {
      alert("Alasan override minimal 5 karakter.");
      return;
    }

    await apiPatch(`/saw/hasil/${params.hasilId}/override`, {
      status_final: statusFinal,
      alasan_override: alasan,
      override_by: null,
    });

    await loadData();
    alert("Status final berhasil dioverride.");
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="p-6">Memuat detail hasil...</div>;
  if (!data) return <div className="p-6">Data tidak ditemukan.</div>;

  const hasil = data.hasil;

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Detail Hasil SPK</h1>
        <p className="mt-1 text-sm text-gray-500">
          Menjelaskan nilai akhir, ranking, status sistem, dan detail nilai per kriteria.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Nama Kepala Keluarga</p>
          <p className="font-semibold">{hasil.nama_kepala_keluarga}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Ranking</p>
          <p className="text-2xl font-bold">#{hasil.ranking}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total Nilai</p>
          <p className="text-2xl font-bold">{Number(hasil.total_nilai).toFixed(6)}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Detail Perhitungan</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Kode</th>
                <th className="p-3">Kriteria</th>
                <th className="p-3">Jenis</th>
                <th className="p-3">Bobot AHP</th>
                <th className="p-3">Nilai Awal</th>
                <th className="p-3">Normalisasi</th>
                <th className="p-3">Terbobot</th>
              </tr>
            </thead>
            <tbody>
              {data.detail_penilaian.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 font-semibold">{item.kode}</td>
                  <td className="p-3">{item.nama_kriteria}</td>
                  <td className="p-3">{item.jenis}</td>
                  <td className="p-3">{Number(item.bobot_ahp || 0).toFixed(6)}</td>
                  <td className="p-3">{Number(item.nilai_awal || 0).toFixed(4)}</td>
                  <td className="p-3">{Number(item.nilai_normalisasi || 0).toFixed(6)}</td>
                  <td className="p-3">{Number(item.nilai_terbobot || 0).toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-900">
          <p>{data.penjelasan.rumus}</p>
          <p>{data.penjelasan.status}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Override Status Final</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Status Sistem</label>
            <input value={hasil.status_sistem} disabled className="w-full rounded-lg border bg-gray-100 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status Final</label>
            <select value={statusFinal} onChange={(e) => setStatusFinal(e.target.value)} className="w-full rounded-lg border px-3 py-2">
              <option value="layak">Layak</option>
              <option value="cadangan">Cadangan</option>
              <option value="tidak_layak">Tidak Layak</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Alasan Override</label>
          <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} className="min-h-28 w-full rounded-lg border px-3 py-2" placeholder="Contoh: Berdasarkan survei lapangan, kondisi rumah sangat tidak layak..." />
        </div>
        <button type="button" onClick={submitOverride} className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">
          Simpan Override
        </button>
      </section>
    </main>
  );
}
