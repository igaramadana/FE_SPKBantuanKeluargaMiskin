import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KriteriaStatusAction } from "@/components/admin/KriteriaStatusAction";
import { ambilSemuaKriteria } from "@/services/kriteria.service";
import type { Kriteria } from "@/types/kriteria";
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Layers,
  Scale,
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

const formatBobot = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return parsed.toFixed(4);
};

export default async function AdminKriteriaPage() {
  const session = await auth();

  let kriteria: Kriteria[] = [];
  let errorMessage = "";

  try {
    kriteria = await ambilSemuaKriteria();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat data kriteria.";
  }

  const totalKriteria = kriteria.length;
  const aktifKriteria = kriteria.filter((item) => item.aktif).length;
  const benefitKriteria = kriteria.filter(
    (item) => item.jenis === "benefit"
  ).length;
  const costKriteria = kriteria.filter((item) => item.jenis === "cost").length;

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/kriteria"
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
              <SlidersHorizontal className="h-4 w-4" />
              Manajemen Kriteria
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Kriteria & Bobot AHP
            </h1>

            <p className="mt-2 text-slate-500">
              Atur daftar kriteria, jenis, dan bobot perhitungan SPK.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5E9]">
              <Layers className="h-6 w-6 text-[#1B5E20]" />
            </div>

            <h3 className="mt-5 text-sm font-medium text-slate-500">
              Total Kriteria
            </h3>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {totalKriteria}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Termasuk aktif dan nonaktif
            </p>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5E9]">
              <CheckCircle2 className="h-6 w-6 text-[#1B5E20]" />
            </div>

            <h3 className="mt-5 text-sm font-medium text-slate-500">
              Kriteria Aktif
            </h3>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {aktifKriteria}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Digunakan pada perhitungan
            </p>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5E9]">
              <Scale className="h-6 w-6 text-[#1B5E20]" />
            </div>

            <h3 className="mt-5 text-sm font-medium text-slate-500">
              Benefit vs Cost
            </h3>

            <p className="mt-3 text-2xl font-black text-slate-900">
              {benefitKriteria} / {costKriteria}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Benefit dibanding Cost
            </p>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F5E9]">
              <XCircle className="h-6 w-6 text-[#1B5E20]" />
            </div>

            <h3 className="mt-5 text-sm font-medium text-slate-500">
              Nonaktif
            </h3>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {Math.max(totalKriteria - aktifKriteria, 0)}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Tidak dipakai sementara
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Daftar Kriteria
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informasi jenis dan bobot AHP yang digunakan pada perhitungan.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-[#F6FBF6] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
              <span className="h-2 w-2 rounded-full bg-[#1B5E20]" />
              Total {totalKriteria} kriteria terdata
            </div>
          </div>

          {kriteria.length === 0 && !errorMessage ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Belum ada data kriteria. Tambahkan kriteria baru untuk memulai.
            </div>
          ) : null}

          {kriteria.length > 0 ? (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4">Kode</th>
                    <th className="px-4">Nama Kriteria</th>
                    <th className="px-4">Jenis</th>
                    <th className="px-4">Bobot AHP</th>
                    <th className="px-4">Urutan</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {kriteria.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-[#F9FBF8]"
                    >
                      <td className="rounded-l-2xl px-4 py-5 text-sm font-semibold text-slate-900">
                        {item.kode}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-700">
                        {item.nama}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-700">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                          {item.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-sm font-semibold text-slate-900">
                        {formatBobot(item.bobot_ahp)}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-700">
                        {item.urutan ?? "-"}
                      </td>
                      <td className="px-4 py-5 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.aktif
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="rounded-r-2xl px-4 py-5 text-sm">
                        <KriteriaStatusAction
                          kriteriaId={item.id}
                          isActive={item.aktif}
                        />
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
