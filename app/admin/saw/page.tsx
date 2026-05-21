// app/admin/saw/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { SawCalculateClient } from "@/components/admin/saw/SawCalculateClient";
import { Calculator } from "lucide-react";

export default async function AdminSawPage() {
  const session = await auth();

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/saw"
    >
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
            <Calculator className="h-4 w-4" />
            Penilaian SAW
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Hitung Ranking Bantuan
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Jalankan perhitungan SAW dari data keluarga yang sudah terverifikasi
            dan sudah memiliki nilai pada semua kriteria aktif.
          </p>
        </div>

        <SawCalculateClient />
      </div>
    </DashboardShell>
  );
}