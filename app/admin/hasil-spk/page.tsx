// app/admin/hasil-spk/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilHasilSawTerbaru } from "@/services/saw.service";
import { Trophy } from "lucide-react";
import type { SawResult } from "@/types/saw";

function formatScore(value: string | number) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  return number.toFixed(4);
}

function StatusBadge({ status }: { status?: string | null }) {
  const value = status || "tidak_layak";

  const styleMap: Record<string, string> = {
    layak: "bg-green-50 text-green-700 border-green-100",
    cadangan: "bg-yellow-50 text-yellow-700 border-yellow-100",
    tidak_layak: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        styleMap[value] || "bg-slate-50 text-slate-600 border-slate-100"
      }`}
    >
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

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Layak</p>
            <h3 className="mt-2 text-3xl font-black text-green-700">{layak}</h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Cadangan</p>
            <h3 className="mt-2 text-3xl font-black text-yellow-600">
              {cadangan}
            </h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Tidak Layak</p>
            <h3 className="mt-2 text-3xl font-black text-red-600">
              {tidakLayak}
            </h3>
          </div>
        </div>

        <div className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm">
          {errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {!errorMessage && hasil.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Belum ada hasil perhitungan
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Jalankan perhitungan dari halaman Penilaian SAW terlebih dahulu.
              </p>
            </div>
          ) : null}

          {hasil.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Nama Kepala Keluarga</th>
                    <th className="px-4 py-2">NIK</th>
                    <th className="px-4 py-2">Wilayah</th>
                    <th className="px-4 py-2">Skor</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {hasil.map((item) => (
                    <tr key={item.id ?? item.keluarga_id} className="bg-[#F9FBF8]">
                      <td className="rounded-l-2xl px-4 py-5 text-sm font-black text-slate-900">
                        #{item.ranking}
                      </td>
                      <td className="px-4 py-5 text-sm font-bold text-slate-900">
                        {item.nama_kepala_keluarga}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.nik}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.kelurahan || "-"} / {item.dusun || "-"}
                      </td>
                      <td className="px-4 py-5 text-sm font-bold text-slate-900">
                        {formatScore(item.total_nilai)}
                      </td>
                      <td className="rounded-r-2xl px-4 py-5 text-sm">
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