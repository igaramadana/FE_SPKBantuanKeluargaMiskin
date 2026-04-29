import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";

const userMenu = [
  {
    label: "Dashboard",
    href: "/user/dashboard",
  },
  {
    label: "Cek Status Bantuan",
    href: "/user/status",
  },
  {
    label: "Profil",
    href: "/user/profil",
  },
];

export default async function UserDashboardPage() {
  const session = await auth();

  return (
    <DashboardShell
      title="Dashboard User"
      description="Lihat informasi status data dan kelayakan bantuan keluarga."
      userName={session?.user.name}
      role="user"
      menu={userMenu}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Status Data"
          value="Pending"
          description="Status data keluarga kamu dalam sistem."
        />

        <StatCard
          title="Status Bantuan"
          value="Belum Ada"
          description="Hasil kelayakan akan muncul setelah admin menghitung."
        />

        <StatCard
          title="Ranking"
          value="-"
          description="Ranking akan tampil setelah perhitungan SAW."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Status Testing Login
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Kalau kamu bisa melihat halaman ini, berarti login user dan middleware
          role sudah berjalan.
        </p>

        <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
          User dashboard berhasil diakses.
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
    </DashboardShell>
  );
}