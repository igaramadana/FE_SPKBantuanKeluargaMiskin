import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KeluargaClient } from "@/components/admin/keluarga/KeluargaClient";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import type { Keluarga, StatusVerifikasi } from "@/types/keluarga";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    status_verifikasi?: string;
    kelurahan?: string;
    dusun?: string;
  }>;
};

const statusVerifikasiOptions: StatusVerifikasi[] = [
  "pending",
  "terverifikasi",
  "ditolak",
  "perlu_perbaikan",
];

function isStatusVerifikasi(value: string): value is StatusVerifikasi {
  return statusVerifikasiOptions.includes(value as StatusVerifikasi);
}

export default async function AdminKeluargaPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  const search = params?.search ?? "";
  const rawStatus = params?.status_verifikasi ?? "";
  const status: StatusVerifikasi | "" = isStatusVerifikasi(rawStatus)
    ? rawStatus
    : "";

  const kelurahan = params?.kelurahan ?? "";
  const dusun = params?.dusun ?? "";

  let keluarga: Keluarga[] = [];
  let allKeluarga: Keluarga[] = [];
  let errorMessage = "";

  try {
    const [filteredData, rawData] = await Promise.all([
      ambilSemuaKeluarga({
        search,
        status_verifikasi: status,
        kelurahan,
        dusun,
      }),
      ambilSemuaKeluarga(),
    ]);

    keluarga = filteredData;
    allKeluarga = rawData;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat data keluarga.";
  }

  const kelurahanList = Array.from(
    new Set(
      allKeluarga
        .map((item) => item.kelurahan)
        .filter((item): item is string => Boolean(item))
    )
  ).sort();

  const dusunList = Array.from(
    new Set(
      allKeluarga
        .map((item) => item.dusun)
        .filter((item): item is string => Boolean(item))
    )
  ).sort();

  return (
    <DashboardShell
      title="Data Warga"
      description="Kelola data keluarga calon penerima bantuan sosial."
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/keluarga"
    >
      <KeluargaClient
        data={keluarga}
        search={search}
        status={status}
        kelurahan={kelurahan}
        dusun={dusun}
        kelurahanList={kelurahanList}
        dusunList={dusunList}
        errorMessage={errorMessage}
      />
    </DashboardShell>
  );
}