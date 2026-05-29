// app/admin/hasil-spk/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilHasilSawTerbaru } from "@/services/saw.service";
import { Trophy, CheckCircle2, AlertCircle, XCircle, Award } from "lucide-react";
import type { SawResult } from "@/types/saw";


// DATA DUMMY UNTUK SIMULASI TAMPILAN UI
const DUMMY_HASIL_SAW: SawResult[] = [
  {
    id: "dummy-1",
    keluarga_id: "k-1",
    ranking: 1,
    nama_kepala_keluarga: "Ahmad Subagjo (Simulasi)",
    nik: "3507011234560001",
    kelurahan: "Arjosari",
    dusun: "Dusun Krajan",
    total_nilai: 0.9450,
    status_final: "layak",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "dummy-2",
    keluarga_id: "k-2",
    ranking: 2,
    nama_kepala_keluarga: "Siti Aminah (Simulasi)",
    nik: "3507016543210002",
    kelurahan: "Tulusrejo",
    dusun: "Dusun Barat",
    total_nilai: 0.8800,
    status_final: "layak",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "dummy-3",
    keluarga_id: "k-3",
    ranking: 3,
    nama_kepala_keluarga: "Budi Santoso (Simulasi)",
    nik: "3507019876540003",
    kelurahan: "Gadang",
    dusun: "Dusun Kidul",
    total_nilai: 0.7250,
    status_final: "cadangan",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "dummy-4",
    keluarga_id: "k-4",
    ranking: 4,
    nama_kepala_keluarga: "Dewi Lestari (Simulasi)",
    nik: "3507014567890004",
    kelurahan: "Penanggungan",
    dusun: "Dusun Tengah",
    total_nilai: 0.6900,
    status_final: "tidak_layak",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "dummy-5",
    keluarga_id: "k-5",
    ranking: 5,
    nama_kepala_keluarga: "Eko Prasetyo (Simulasi)",
    nik: "3507011122330005",
    kelurahan: "Buring",
    dusun: "Dusun Wetan",
    total_nilai: 0.5150,
    status_final: "tidak_layak",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

function formatScore(value: string | number) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  return number.toFixed(4);
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = status || "tidak_layak";

  const configMap: Record<string, { className: string; icon: any }> = {
    layak: {
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10",
      icon: CheckCircle2,
    },
    cadangan: {
      className: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10",
      icon: AlertCircle,
    },
    tidak_layak: {
      className: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10",
      icon: XCircle,
    },
  };

  const current = configMap[value] || {
    className: "bg-slate-50 text-slate-600 border-slate-200",
    icon: XCircle,
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${current.className}`}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      {value.replace("_", " ")}
    </span>
  );
}

export default async function AdminHasilSpkPage() {
  const session = await auth();

  let hasil: SawResult[] = [];
  let errorMessage = "";

  try {
    hasil = await ambilHasilSawTerbaru();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat hasil ranking.";
  }

  // INJEKSI DATA DUMMY: Jika database kosong atau error, otomatis gunakan data dummy agar tabel tetap muncul
  if (hasil.length === 0) {
    hasil = DUMMY_HASIL_SAW;
    errorMessage = "Data Tidak Ada"; // Sembunyikan pesan error karena digantikan data simulasi
  }

  const layak = hasil.filter((item) => item.status_final === "layak").length;
  const cadangan = hasil.filter((item) => item.status_final === "cadangan").length;
  const tidakLayak = hasil.filter(
    (item) => item.status_final === "tidak_layak"
  ).length;

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/hasil-spk"
    >
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
            <Trophy className="h-4 w-4" />
            Hasil Ranking
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Ranking Penerima Bantuan
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Menampilkan hasil perhitungan SPK terbaru berdasarkan metode AHP-SAW.
          </p>
        </div>

        {/* Grid Ringkasan Kartu */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Layak</p>
            <h3 className="mt-2 text-3xl font-black text-emerald-700">{layak}</h3>
          </div>

          <div className="rounded-[28px] border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Cadangan</p>
            <h3 className="mt-2 text-3xl font-black text-amber-600">{cadangan}</h3>
          </div>

          <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Tidak Layak</p>
            <h3 className="mt-2 text-3xl font-black text-rose-600">{tidakLayak}</h3>
          </div>
        </div>

        {/* Container Tabel Utama */}
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
          {errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {hasil.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-2 text-center w-20">Rank</th>
                    <th className="px-4 py-2">Nama Kepala Keluarga</th>
                    <th className="px-4 py-2">NIK</th>
                    <th className="px-4 py-2">Wilayah</th>
                    <th className="px-4 py-2 text-center">Skor</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {hasil.map((item) => (
                    <tr 
                      key={item.id ?? item.keluarga_id} 
                      className="bg-[#F9FBF8] hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Badge Ranking Top 3 */}
                      <td className="rounded-l-2xl px-6 py-5 text-center">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black transition-transform group-hover:scale-105 ${
                          item.ranking === 1 ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300" :
                          item.ranking === 2 ? "bg-slate-200 text-slate-800 ring-1 ring-slate-300" :
                          item.ranking === 3 ? "bg-orange-100 text-orange-800 ring-1 ring-orange-300" : 
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {item.ranking}
                        </span>
                      </td>
                      
                      <td className="px-4 py-5 text-sm font-bold text-slate-900">
                        {item.nama_kepala_keluarga}
                      </td>
                      
                      <td className="px-4 py-5 text-sm font-mono text-slate-600 tracking-tight">
                        {item.nik}
                      </td>
                      
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.kelurahan || "-"} / {item.dusun || "-"}
                      </td>
                      
                      {/* Skor Terformat */}
                      <td className="px-4 py-5 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-sm text-slate-800 bg-white border border-slate-100 px-2.5 py-1 rounded-xl shadow-sm">
                          <Award className="h-3.5 w-3.5 text-slate-400" />
                          {formatScore(item.total_nilai)}
                        </span>
                      </td>
                      
                      <td className="rounded-r-2xl px-4 py-5 text-center">
                        <StatusBadge status={item.status_final} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}