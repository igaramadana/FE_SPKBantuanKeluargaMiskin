import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  Users,
  BadgeCheck,
  Wallet,
  TrendingUp,
  Eye,
  Download,
  Filter,
  MapPinned,
} from "lucide-react";

const adminMenu = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    label: "Data Warga",
    href: "/admin/keluarga",
  },
  {
    label: "Kriteria & Bobot",
    href: "/admin/kriteria",
  },
  {
    label: "Penilaian SAW",
    href: "/admin/saw",
  },
  {
    label: "Bantuan",
    href: "/admin/bantuan",
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
    >
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Dashboard Bantuan Sosial
            </h1>

            <p className="mt-2 text-slate-500">
              Monitoring data warga, penilaian SAW, dan distribusi bantuan.
            </p>
          </div>

          {/* FILTER */}
          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">
              <MapPinned className="h-5 w-5 text-[#1B5E20]" />

              <select className="bg-transparent text-sm font-medium text-slate-700 outline-none">
                <option>Pilih Kecamatan</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">
              <Filter className="h-5 w-5 text-[#1B5E20]" />

              <select className="bg-transparent text-sm font-medium text-slate-700 outline-none">
                <option>Pilih Status</option>
              </select>
            </div>

          </div>

        </div>

        {/* STAT CARD */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* CARD 1 */}
          <div className="rounded-[28px] border border-green-100 bg-white p-7 shadow-sm">

            <div className="rounded-2xl bg-[#E8F5E9] p-4 w-fit">
              <Users className="h-7 w-7 text-[#1B5E20]" />
            </div>

            <h3 className="mt-6 text-sm font-medium text-slate-500">
              Total Warga Terdata
            </h3>

            <div className="mt-3 h-12 w-28 rounded-xl bg-slate-100" />

            <p className="mt-3 text-sm text-slate-400">
              Data seluruh warga
            </p>

          </div>

          {/* CARD 2 */}
          <div className="rounded-[28px] border border-green-100 bg-white p-7 shadow-sm">

            <div className="rounded-2xl bg-[#E8F5E9] p-4 w-fit">
              <BadgeCheck className="h-7 w-7 text-[#1B5E20]" />
            </div>

            <h3 className="mt-6 text-sm font-medium text-slate-500">
              Warga Layak Bantuan
            </h3>

            <div className="mt-3 h-12 w-24 rounded-xl bg-slate-100" />

            <p className="mt-3 text-sm text-slate-400">
              Hasil perhitungan SAW
            </p>

          </div>

          {/* CARD 3 */}
          <div className="rounded-[28px] border border-green-100 bg-white p-7 shadow-sm">

            <div className="rounded-2xl bg-[#E8F5E9] p-4 w-fit">
              <TrendingUp className="h-7 w-7 text-[#1B5E20]" />
            </div>

            <h3 className="mt-6 text-sm font-medium text-slate-500">
              Rata-rata Skor SAW
            </h3>

            <div className="mt-3 h-12 w-20 rounded-xl bg-slate-100" />

            <p className="mt-3 text-sm text-slate-400">
              Berdasarkan normalisasi
            </p>

          </div>

          {/* CARD 4 */}
          <div className="rounded-[28px] border border-green-100 bg-white p-7 shadow-sm">

            <div className="rounded-2xl bg-[#E8F5E9] p-4 w-fit">
              <Wallet className="h-7 w-7 text-[#1B5E20]" />
            </div>

            <h3 className="mt-6 text-sm font-medium text-slate-500">
              Anggaran Bantuan
            </h3>

            <div className="mt-3 h-12 w-32 rounded-xl bg-slate-100" />

            <p className="mt-3 text-sm text-slate-400">
              Total distribusi bantuan
            </p>

          </div>

        </div>

        {/* ANALISIS */}
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">

          {/* DONUT */}
          <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Analisis Kelayakan Warga
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Persentase kelayakan bantuan sosial
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-10 lg:flex-row">

              {/* DONUT */}
              <div className="relative flex h-[280px] w-[280px] items-center justify-center">

                <div className="absolute inset-0 rounded-full bg-slate-100" />

                <div className="absolute inset-[35px] rounded-full bg-white"></div>

                <div className="z-10 text-center">
                  <h3 className="text-4xl font-black text-slate-300">
                    --
                  </h3>

                  <p className="mt-2 text-lg text-slate-400">
                    Belum Ada Data
                  </p>
                </div>

              </div>

              {/* LEGEND */}
              <div className="w-full max-w-xs space-y-5">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between"
                  >

                    <div className="flex items-center gap-3">

                      <div className="h-4 w-4 rounded-full bg-slate-200" />

                      <div className="h-4 w-28 rounded bg-slate-100" />

                    </div>

                    <div className="h-4 w-10 rounded bg-slate-100" />

                  </div>
                ))}

              </div>

            </div>

          </div>

          {/* WILAYAH */}
          <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold text-slate-900">
              Data per Kecamatan
            </h2>

            <div className="mt-8 space-y-8">

              {[1, 2, 3, 4].map((item) => (
                <div key={item}>

                  <div className="mb-3 flex items-center justify-between">

                    <div className="h-4 w-36 rounded bg-slate-100" />

                    <div className="h-4 w-20 rounded bg-slate-100" />

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100" />

                </div>
              ))}

            </div>

          </div>

        </div>

        {/* TABLE */}
        <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Penilaian SAW Warga
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ranking hasil perhitungan kelayakan bantuan
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-2xl border border-green-200 px-5 py-3 text-sm font-semibold text-[#1B5E20] transition hover:bg-green-50">

              <Download className="h-4 w-4" />

              Export Report

            </button>

          </div>

          <div className="mt-8 overflow-x-auto">

            <table className="w-full border-separate border-spacing-y-4">

              <thead>
                <tr className="text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4">Rank</th>
                  <th className="px-4">Nama Warga</th>
                  <th className="px-4">Kecamatan</th>
                  <th className="px-4">Kelurahan</th>
                  <th className="px-4">Skor</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Aksi</th>
                </tr>
              </thead>

              <tbody>

                {[1, 2, 3, 4, 5].map((item) => (
                  <tr
                    key={item}
                    className="bg-[#F9FBF8]"
                  >

                    {[1, 2, 3, 4, 5, 6].map((col) => (
                      <td
                        key={col}
                        className="px-4 py-5"
                      >
                        <div className="h-4 w-full rounded bg-slate-100" />
                      </td>
                    ))}

                    <td className="rounded-r-2xl px-4 py-5">

                      <button className="rounded-xl p-2">
                        <Eye className="h-5 w-5 text-slate-300" />
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}