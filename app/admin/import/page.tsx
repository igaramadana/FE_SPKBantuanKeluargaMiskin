import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ImportDatasetClient } from "@/components/admin/import/ImportDatasetClient";
import { ambilImportBatch } from "@/services/import-data.service";
import type { ImportBatch } from "@/types/import-data";

export default async function AdminImportPage() {
  const session = await auth();

  let batches: ImportBatch[] = [];
  let errorMessage = "";

  try {
    batches = await ambilImportBatch();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat riwayat import.";
  }

  return (
    <DashboardShell
      title="Import Dataset"
      description="Upload dataset CSV atau Excel, preview data, simpan raw import, lalu mapping ke data keluarga."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/import"
    >
      <ImportDatasetClient
        initialBatches={batches}
        initialErrorMessage={errorMessage}
      />
    </DashboardShell>
  );
}