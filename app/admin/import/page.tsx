// app/admin/import/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ImportDatasetClient } from "@/components/admin/import/ImportDatasetClient";
import { UploadCloud } from "lucide-react";

export default async function AdminImportPage() {
  const session = await auth();

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/import"
    >
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
            <UploadCloud className="h-4 w-4" />
            Import Dataset
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Import Dataset Kemiskinan
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Upload file CSV/Excel, cek preview kolom, simpan raw data, lalu mapping
            kolom penting ke tabel keluarga.
          </p>
        </div>

        <ImportDatasetClient />
      </div>
    </DashboardShell>
  );
}