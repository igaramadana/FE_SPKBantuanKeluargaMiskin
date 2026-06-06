import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKriteria } from "@/services/kriteria.service";
import { AhpClient } from "@/components/admin/ahp/AhpClient";
import type { Kriteria } from "@/types/kriteria";

export default async function AdminAhpPage() {
  const session = await auth();

  let kriteria: Kriteria[] = [];
  let errorMessage = "";

  try {
    kriteria = await ambilSemuaKriteria();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat kriteria.";
  }

  const kriteriaAktif = kriteria.filter((item) => item.aktif);

  return (
    <DashboardShell
      title="AHP Bobot Kriteria"
      description="Hitung bobot kriteria menggunakan metode AHP sebelum menjalankan SAW."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/ahp"
    >
      <AhpClient kriteria={kriteriaAktif} errorMessage={errorMessage} />
    </DashboardShell>
  );
}