import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SawCalculateClient } from "@/components/admin/saw/SawCalculateClient";
import { adminMenu } from "@/constants/admin-menu";
import { ambilImportBatch } from "@/services/import-data.service";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import { ambilSemuaKriteria } from "@/services/kriteria.service";
import type { ImportBatch } from "@/types/import-data";
import type { Keluarga } from "@/types/keluarga";
import type { Kriteria } from "@/types/kriteria";

export default async function AdminSawPage() {
  const session = await auth();

  let keluarga: Keluarga[] = [];
  let kriteria: Kriteria[] = [];
  let importBatches: ImportBatch[] = [];
  let errorMessage = "";

  const [keluargaResult, kriteriaResult, importBatchResult] = await Promise.allSettled([
    ambilSemuaKeluarga({
      status_verifikasi: "terverifikasi",
    }),
    ambilSemuaKriteria(),
    ambilImportBatch(),
  ]);

  if (keluargaResult.status === "fulfilled") {
    keluarga = keluargaResult.value;
  }

  if (kriteriaResult.status === "fulfilled") {
    kriteria = kriteriaResult.value;
  }


  if (importBatchResult.status === "fulfilled") {
    importBatches = importBatchResult.value;
  }

  const rejected = [
    keluargaResult,
    kriteriaResult,
    importBatchResult,
  ].find((item) => item.status === "rejected");

  if (rejected?.status === "rejected") {
    errorMessage =
      rejected.reason instanceof Error
        ? rejected.reason.message
        : "Sebagian data SAW gagal dimuat.";
  }

  const kriteriaAktif = kriteria
    .filter((item) => item.aktif)
    .sort((a, b) => {
      const urutanA = a.urutan ?? 9999;
      const urutanB = b.urutan ?? 9999;

      if (urutanA !== urutanB) return urutanA - urutanB;

      return a.kode.localeCompare(b.kode);
    });

  return (
    <DashboardShell
      title="Penilaian SAW"
      description="Generate nilai C1-C10 dari dataset atau Data Warga, lalu jalankan perhitungan SAW."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/saw"
    >
      <SawCalculateClient
        keluarga={keluarga}
        kriteria={kriteriaAktif}
        importBatches={importBatches}
        errorMessage={errorMessage}
        userName={session?.user?.name || "Admin"}
      />
    </DashboardShell>
  );
}