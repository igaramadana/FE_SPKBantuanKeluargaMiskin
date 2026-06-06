import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilImportBatch } from "@/services/import-data.service";
import { PenilaianGenerateClient } from "@/components/admin/penilaian/PenilaianGenerateClient";
import type { ImportBatch } from "@/types/import-data";

export default async function AdminPenilaianPage() {
  const session = await auth();

  let batches: ImportBatch[] = [];
  let errorMessage = "";

  try {
    batches = await ambilImportBatch();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat batch import.";
  }

  return (
    <DashboardShell
      title="Auto Generate Penilaian"
      description="Generate data keluarga sementara dan nilai C1-C10 dari dataset import."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/penilaian"
    >
      <PenilaianGenerateClient
        importBatches={batches}
        errorMessage={errorMessage}
      />
    </DashboardShell>
  );
}