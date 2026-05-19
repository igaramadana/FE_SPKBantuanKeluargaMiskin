// app/admin/keluarga/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import { Users, BadgeCheck, Clock3, XCircle } from "lucide-react";
import Link from "next/link";
import type { Keluarga } from "@/types/keluarga";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    status_verifikasi?: string;
  }>;
};

function BadgeStatus({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    terverifikasi: "bg-green-50 text-green-700 border-green-100",
    ditolak: "bg-red-50 text-red-700 border-red-100",
    perlu_perbaikan: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        styleMap[status] || "bg-slate-50 text-slate-600 border-slate-100"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default async function AdminKeluargaPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  const search = params?.search ?? "";
  const status = params?.status_verifikasi ?? "";

  let keluarga: Keluarga[] = [];
  let errorMessage = "";

  try {
    keluarga = await ambilSemuaKeluarga({
      search,
      status_verifikasi: status as never,
    });
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat data keluarga.";
  }

  const total = keluarga.length;
  const pending = keluarga.filter((item) => item.status_verifikasi === "pending").length;
  const terverifikasi = keluarga.filter(
    (item) => item.status_verifikasi === "terverifikasi"
  ).length;
  const ditolak = keluarga.filter((item) => item.status_verifikasi === "ditolak").length;

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/keluarga"
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
              <Users className="h-4 w-4" />
              Data Warga
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Data Keluarga Calon Penerima
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Kelola data keluarga, status verifikasi, dan kesiapan data sebelum
              masuk ke proses penilaian SAW.
            </p>
          </div>

          <Link
            href="/admin/import"
            className="inline-flex items-center justify-center rounded-2xl bg-[#1B5E20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#164B1A]"
          >
            Import Dataset
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <Users className="h-7 w-7 text-[#1B5E20]" />
            <p className="mt-5 text-sm text-slate-500">Total Data</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{total}</h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <Clock3 className="h-7 w-7 text-yellow-600" />
            <p className="mt-5 text-sm text-slate-500">Menunggu Verifikasi</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{pending}</h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <BadgeCheck className="h-7 w-7 text-green-600" />
            <p className="mt-5 text-sm text-slate-500">Terverifikasi</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {terverifikasi}
            </h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <XCircle className="h-7 w-7 text-red-600" />
            <p className="mt-5 text-sm text-slate-500">Ditolak</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{ditolak}</h3>
          </div>
        </div>

        <div className="rounded-[32px] border border-green-100 bg-white p-6 shadow-sm">
          <form className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              name="search"
              defaultValue={search}
              placeholder="Cari nama kepala keluarga / NIK..."
              className="min-h-12 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
            />

            <select
              name="status_verifikasi"
              defaultValue={status}
              className="min-h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#1B5E20]"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="ditolak">Ditolak</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
            </select>

            <button className="min-h-12 rounded-2xl bg-[#1B5E20] px-5 text-sm font-bold text-white transition hover:bg-[#164B1A]">
              Filter
            </button>
          </form>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {!errorMessage && keluarga.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Belum ada data keluarga
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Import dataset terlebih dahulu atau tambah data keluarga secara manual.
              </p>
            </div>
          ) : null}

          {keluarga.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2">Nama Kepala Keluarga</th>
                    <th className="px-4 py-2">NIK</th>
                    <th className="px-4 py-2">Kelurahan</th>
                    <th className="px-4 py-2">Dusun</th>
                    <th className="px-4 py-2">Anggota</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {keluarga.map((item) => (
                    <tr key={item.id} className="bg-[#F9FBF8]">
                      <td className="rounded-l-2xl px-4 py-5 text-sm font-bold text-slate-900">
                        {item.nama_kepala_keluarga}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.nik}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.kelurahan || "-"}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.dusun || "-"}
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.jumlah_anggota || "-"}
                      </td>
                      <td className="rounded-r-2xl px-4 py-5 text-sm">
                        <BadgeStatus status={item.status_verifikasi} />
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