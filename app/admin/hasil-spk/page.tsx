import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { HasilSpkClient } from "@/components/admin/hasil-spk/HasilSpkClient";
import { adminMenu } from "@/constants/admin-menu";
import {
  ambilHasilSawTerbaru,
  ambilRiwayatSaw,
} from "@/services/saw.service";
import type { RiwayatSaw, SawResult } from "@/types/saw";

export default async function AdminHasilSpkPage() {
  const session = await auth();

  let hasilSaw: SawResult[] = [];
  let riwayatSaw: RiwayatSaw[] = [];
  let errorMessage = "";

  const [hasilResult, riwayatResult] = await Promise.allSettled([
    ambilHasilSawTerbaru(),
    ambilRiwayatSaw(),
  ]);

  if (hasilResult.status === "fulfilled") {
    hasilSaw = hasilResult.value;
  }

  if (riwayatResult.status === "fulfilled") {
    riwayatSaw = riwayatResult.value;
  }

  const rejected = [hasilResult, riwayatResult].find(
    (item) => item.status === "rejected"
  );

  if (rejected?.status === "rejected") {
    errorMessage =
      rejected.reason instanceof Error
        ? rejected.reason.message
        : "Gagal memuat hasil ranking SPK.";
  }

  return (
    <DashboardShell
      title="Hasil Ranking"
      description="Lihat hasil akhir ranking kelayakan bantuan berdasarkan perhitungan SAW."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/hasil-spk"
    >
      <HasilSpkClient
        hasilSaw={hasilSaw}
        riwayatSaw={riwayatSaw}
        errorMessage={errorMessage}
      />
    </DashboardShell>
  );
}