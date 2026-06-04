import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { SawCalculateClient } from "@/components/admin/saw/SawCalculateClient";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import { ambilSemuaKriteria } from "@/services/kriteria.service";
import {
  ambilHasilSawTerbaru,
  ambilRiwayatSaw,
} from "@/services/saw.service";
import type { Keluarga } from "@/types/keluarga";
import type { Kriteria } from "@/types/kriteria";
import type { RiwayatSaw, SawResult } from "@/types/saw";

export default async function AdminSawPage() {
  const session = await auth();

  let keluarga: Keluarga[] = [];
  let kriteria: Kriteria[] = [];
  let hasilSaw: SawResult[] = [];
  let riwayatSaw: RiwayatSaw[] = [];
  let errorMessage = "";

  const [keluargaResult, kriteriaResult, hasilResult, riwayatResult] =
    await Promise.allSettled([
      ambilSemuaKeluarga({
        status_verifikasi: "terverifikasi",
      }),
      ambilSemuaKriteria(),
      ambilHasilSawTerbaru(),
      ambilRiwayatSaw(),
    ]);

  if (keluargaResult.status === "fulfilled") {
    keluarga = keluargaResult.value;
  }

  if (kriteriaResult.status === "fulfilled") {
    kriteria = kriteriaResult.value;
  }

  if (hasilResult.status === "fulfilled") {
    hasilSaw = hasilResult.value;
  }

  if (riwayatResult.status === "fulfilled") {
    riwayatSaw = riwayatResult.value;
  }

  const rejected = [
    keluargaResult,
    kriteriaResult,
    hasilResult,
    riwayatResult,
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
      description="Input nilai kriteria, simpan penilaian, lalu jalankan perhitungan ranking bantuan."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/saw"
    >
      <SawCalculateClient
        keluarga={keluarga}
        kriteria={kriteriaAktif}
        hasilSaw={hasilSaw}
        riwayatSaw={riwayatSaw}
        errorMessage={errorMessage}
        userName={session?.user?.name || "Admin"}
      />
    </DashboardShell>
  );
}