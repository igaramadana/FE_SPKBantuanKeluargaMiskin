import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KriteriaClient } from "@/components/admin/kriteria/KriteriaClient";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKriteria } from "@/services/kriteria.service";
import type { Kriteria } from "@/types/kriteria";

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

  return (
    <DashboardShell
      title="Kriteria & Bobot"
      description="Kelola kriteria penilaian, jenis benefit/cost, status aktif, urutan, dan bobot AHP."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/kriteria"
    >
      <KriteriaClient data={kriteria} errorMessage={errorMessage} />
    </DashboardShell>
  );
}