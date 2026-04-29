import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";

const adminMenu = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    label: "Data Keluarga",
    href: "/admin/keluarga",
  },
  {
    label: "Data Kriteria",
    href: "/admin/kriteria",
  },
  {
    label: "Perhitungan AHP",
    href: "/admin/ahp",
  },
  {
    label: "Perhitungan SAW",
    href: "/admin/saw",
  },
  {
    label: "Import Data",
    href: "/admin/import",
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <DashboardShell
      title="Dashboard Admin"
      description="Kelola data keluarga, kriteria, dan hasil perhitungan SPK."
      userName={session?.user.name}
      role="admin"
      menu={adminMenu}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Keluarga"
          value="0"
          description="Jumlah data keluarga yang terdaftar."
        />

        <StatCard
          title="Keluarga Layak"
          value="0"
          description="Jumlah keluarga yang layak menerima bantuan."
        />

        <StatCard
          title="Tidak Layak"
          value="0"
          description="Jumlah keluarga yang belum memenuhi kelayakan."
        />

        <StatCard
          title="Pending Verifikasi"
          value="0"
          description="Data keluarga yang perlu dicek admin."
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Status Testing Login
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Kalau kamu bisa melihat halaman ini, berarti login admin dan
            middleware role sudah berjalan.
          </p>

          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
            Admin dashboard berhasil diakses.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Info Akun</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Nama</span>
              <span className="font-semibold text-slate-900">
                {session?.user.name}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-slate-900">
                {session?.user.email}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Role</span>
              <span className="font-semibold text-[#1B5E20]">
                {session?.user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}