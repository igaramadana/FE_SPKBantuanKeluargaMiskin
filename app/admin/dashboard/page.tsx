// app/admin/dashboard/page.tsx
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import { ambilHasilSawTerbaru, ambilRiwayatSaw } from "@/services/saw.service";
import type { Keluarga } from "@/types/keluarga";
import type { SawResult, StatusKelayakan } from "@/types/saw";
import {
  Users,
  BadgeCheck,
  Wallet,
  TrendingUp,
  Eye,
  Download,
  Filter,
  MapPinned,
  Clock3,
  XCircle,
  AlertCircle,
  History,
} from "lucide-react";
import Link from "next/link";

type PageProps = {
  searchParams?: Promise<{
    kelurahan?: string;
    status?: string;
  }>;
};

type RiwayatSaw = {
  id: string;
  nama_perhitungan: string;
  metode: string;
  jumlah_data: number;
  consistency_ratio?: string | null;
  mode_status: string;
  threshold?: string | null;
  kuota?: number | null;
  tanggal_hitung: string;
};

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatPersen(value: number) {
  if (!Number.isFinite(value)) return "0%";

  return `${value.toFixed(1).replace(".", ",")}%`;
}

function formatSkor(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) return "0.0000";

  return numberValue.toFixed(4);
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status?: StatusKelayakan | string | null) {
  const labelMap: Record<string, string> = {
    layak: "Layak",
    cadangan: "Cadangan",
    tidak_layak: "Tidak Layak",
  };

  return labelMap[status || ""] || "-";
}

function StatusBadge({ status }: { status?: StatusKelayakan | string | null }) {
  const styleMap: Record<string, string> = {
    layak: "border-green-100 bg-green-50 text-green-700",
    cadangan: "border-yellow-100 bg-yellow-50 text-yellow-700",
    tidak_layak: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        styleMap[status || ""] || "border-slate-100 bg-slate-50 text-slate-600"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-green-100 bg-white p-7 shadow-sm">
      <div className="w-fit rounded-2xl bg-[#E8F5E9] p-4">{icon}</div>

      <h3 className="mt-6 text-sm font-medium text-slate-500">{title}</h3>

      <p className="mt-3 text-4xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;

  const kelurahanFilter = params?.kelurahan ?? "";
  const statusFilter = params?.status ?? "";

  let keluarga: Keluarga[] = [];
  let hasilSaw: SawResult[] = [];
  let riwayatSaw: RiwayatSaw[] = [];
  let errorMessage = "";

  try {
    const [keluargaResult, hasilResult, riwayatResult] =
      await Promise.allSettled([
        ambilSemuaKeluarga(),
        ambilHasilSawTerbaru(),
        ambilRiwayatSaw(),
      ]);

    if (keluargaResult.status === "fulfilled") {
      keluarga = keluargaResult.value;
    }

    if (hasilResult.status === "fulfilled") {
      hasilSaw = hasilResult.value;
    }

    if (riwayatResult.status === "fulfilled") {
      riwayatSaw = riwayatResult.value;
    }

    const rejected = [keluargaResult, hasilResult, riwayatResult].find(
      (item) => item.status === "rejected"
    );

    if (rejected?.status === "rejected") {
      errorMessage =
        rejected.reason instanceof Error
          ? rejected.reason.message
          : "Sebagian data dashboard gagal dimuat.";
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Gagal memuat dashboard.";
  }

  const hasilFiltered = hasilSaw.filter((item) => {
    const matchKelurahan = kelurahanFilter
      ? item.kelurahan === kelurahanFilter
      : true;

    const statusAktif = item.status_final || item.status_sistem;

    const matchStatus = statusFilter ? statusAktif === statusFilter : true;

    return matchKelurahan && matchStatus;
  });

  const totalKeluarga = keluarga.length;
  const totalTerverifikasi = keluarga.filter(
    (item) => item.status_verifikasi === "terverifikasi"
  ).length;
  const totalPending = keluarga.filter(
    (item) => item.status_verifikasi === "pending"
  ).length;
  const totalDitolak = keluarga.filter(
    (item) => item.status_verifikasi === "ditolak"
  ).length;

  const totalLayak = hasilSaw.filter(
    (item) => (item.status_final || item.status_sistem) === "layak"
  ).length;

  const totalCadangan = hasilSaw.filter(
    (item) => (item.status_final || item.status_sistem) === "cadangan"
  ).length;

  const totalTidakLayak = hasilSaw.filter(
    (item) => (item.status_final || item.status_sistem) === "tidak_layak"
  ).length;

  const rataSkor =
    hasilSaw.length > 0
      ? hasilSaw.reduce((total, item) => total + Number(item.total_nilai || 0), 0) /
        hasilSaw.length
      : 0;

  const persenLayak =
    hasilSaw.length > 0 ? (totalLayak / hasilSaw.length) * 100 : 0;

  const estimasiAnggaran = totalLayak * 500_000;

  const kelurahanList = Array.from(
    new Set(
      keluarga
        .map((item) => item.kelurahan)
        .filter((item): item is string => Boolean(item))
    )
  ).sort();

  const dataPerKelurahan = kelurahanList
    .map((kelurahan) => {
      const jumlah = keluarga.filter((item) => item.kelurahan === kelurahan).length;
      const persen = totalKeluarga > 0 ? (jumlah / totalKeluarga) * 100 : 0;

      return {
        kelurahan,
        jumlah,
        persen,
      };
    })
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  const distribusiStatus = [
    {
      label: "Layak",
      total: totalLayak,
      percent: hasilSaw.length > 0 ? (totalLayak / hasilSaw.length) * 100 : 0,
      className: "bg-green-600",
    },
    {
      label: "Cadangan",
      total: totalCadangan,
      percent: hasilSaw.length > 0 ? (totalCadangan / hasilSaw.length) * 100 : 0,
      className: "bg-yellow-500",
    },
    {
      label: "Tidak Layak",
      total: totalTidakLayak,
      percent: hasilSaw.length > 0 ? (totalTidakLayak / hasilSaw.length) * 100 : 0,
      className: "bg-red-500",
    },
  ];

  const latestRiwayat = riwayatSaw[0];

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/dashboard"
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1B5E20]">
              <TrendingUp className="h-4 w-4" />
              Dashboard Admin
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Dashboard Bantuan Sosial
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitoring data keluarga, status verifikasi, hasil ranking SAW,
              dan ringkasan kelayakan penerima bantuan.
            </p>
          </div>

          <form className="flex flex-wrap items-center gap-3" method="GET">
            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">
              <MapPinned className="h-5 w-5 text-[#1B5E20]" />

              <select
                name="kelurahan"
                defaultValue={kelurahanFilter}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">Semua Kelurahan</option>
                {kelurahanList.map((kelurahan) => (
                  <option key={kelurahan} value={kelurahan}>
                    {kelurahan}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-white px-4 py-3 shadow-sm">
              <Filter className="h-5 w-5 text-[#1B5E20]" />

              <select
                name="status"
                defaultValue={statusFilter}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">Semua Status</option>
                <option value="layak">Layak</option>
                <option value="cadangan">Cadangan</option>
                <option value="tidak_layak">Tidak Layak</option>
              </select>
            </div>

            <button className="rounded-2xl bg-[#1B5E20] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#164B1A]">
              Terapkan
            </button>
          </form>
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-3xl border border-yellow-100 bg-yellow-50 p-5 text-sm text-yellow-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Sebagian data belum bisa dimuat.</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Warga Terdata"
            value={formatAngka(totalKeluarga)}
            description={`${formatAngka(totalTerverifikasi)} terverifikasi, ${formatAngka(
              totalPending
            )} pending`}
            icon={<Users className="h-7 w-7 text-[#1B5E20]" />}
          />

          <StatCard
            title="Warga Layak Bantuan"
            value={formatAngka(totalLayak)}
            description="Berdasarkan hasil SAW terbaru"
            icon={<BadgeCheck className="h-7 w-7 text-[#1B5E20]" />}
          />

          <StatCard
            title="Rata-rata Skor SAW"
            value={formatSkor(rataSkor)}
            description="Rata-rata nilai akhir ranking"
            icon={<TrendingUp className="h-7 w-7 text-[#1B5E20]" />}
          />

          <StatCard
            title="Estimasi Anggaran"
            value={`Rp ${formatAngka(estimasiAnggaran)}`}
            description="Estimasi Rp 500.000 per keluarga layak"
            icon={<Wallet className="h-7 w-7 text-[#1B5E20]" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <Clock3 className="h-7 w-7 text-yellow-600" />
            <p className="mt-5 text-sm text-slate-500">Menunggu Verifikasi</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {formatAngka(totalPending)}
            </h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <BadgeCheck className="h-7 w-7 text-green-600" />
            <p className="mt-5 text-sm text-slate-500">Terverifikasi</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {formatAngka(totalTerverifikasi)}
            </h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <XCircle className="h-7 w-7 text-red-600" />
            <p className="mt-5 text-sm text-slate-500">Ditolak</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {formatAngka(totalDitolak)}
            </h3>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-sm">
            <History className="h-7 w-7 text-[#1B5E20]" />
            <p className="mt-5 text-sm text-slate-500">Perhitungan Terakhir</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">
              {latestRiwayat ? latestRiwayat.nama_perhitungan : "Belum Ada"}
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              {latestRiwayat ? formatTanggal(latestRiwayat.tanggal_hitung) : "-"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Analisis Kelayakan Warga
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Persentase status hasil perhitungan SAW terbaru.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
              <div className="relative flex h-[280px] w-[280px] items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      hasilSaw.length > 0
                        ? `conic-gradient(#16a34a 0 ${persenLayak}%, #e5e7eb ${persenLayak}% 100%)`
                        : "#f1f5f9",
                  }}
                />

                <div className="absolute inset-[35px] rounded-full bg-white" />

                <div className="z-10 text-center">
                  <h3 className="text-4xl font-black text-slate-900">
                    {formatPersen(persenLayak)}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Layak Bantuan
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatAngka(totalLayak)} dari {formatAngka(hasilSaw.length)} data
                  </p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-5">
                {distribusiStatus.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full ${item.className}`} />
                        <span className="font-semibold text-slate-700">
                          {item.label}
                        </span>
                      </div>

                      <span className="font-bold text-slate-900">
                        {formatAngka(item.total)}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.className}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {formatPersen(item.percent)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Data per Kelurahan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sebaran data keluarga berdasarkan kelurahan.
            </p>

            <div className="mt-8 space-y-7">
              {dataPerKelurahan.length > 0 ? (
                dataPerKelurahan.map((item) => (
                  <div key={item.kelurahan}>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">
                        {item.kelurahan}
                      </p>

                      <p className="text-sm font-bold text-slate-900">
                        {formatAngka(item.jumlah)} data
                      </p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#1B5E20]"
                        style={{ width: `${item.persen}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {formatPersen(item.persen)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                  Belum ada data kelurahan.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-green-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Ranking SAW Warga
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ranking hasil perhitungan kelayakan bantuan terbaru.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/saw"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1B5E20] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#164B1A]"
              >
                <TrendingUp className="h-4 w-4" />
                Hitung SAW
              </Link>

              <Link
                href="/admin/hasil-spk"
                className="inline-flex items-center gap-2 rounded-2xl border border-green-200 px-5 py-3 text-sm font-semibold text-[#1B5E20] transition hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
                Lihat Report
              </Link>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4">Rank</th>
                  <th className="px-4">Nama Warga</th>
                  <th className="px-4">NIK</th>
                  <th className="px-4">Kelurahan</th>
                  <th className="px-4">Dusun</th>
                  <th className="px-4">Skor</th>
                  <th className="px-4">Status</th>
                  <th className="px-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {hasilFiltered.length > 0 ? (
                  hasilFiltered.slice(0, 10).map((item) => (
                    <tr key={item.id || item.keluarga_id} className="bg-[#F9FBF8]">
                      <td className="rounded-l-2xl px-4 py-5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F5E9] text-sm font-black text-[#1B5E20]">
                          {item.ranking}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-bold text-slate-900">
                          {item.nama_kepala_keluarga}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.nik}
                      </td>

                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.kelurahan || "-"}
                      </td>

                      <td className="px-4 py-5 text-sm text-slate-600">
                        {item.dusun || "-"}
                      </td>

                      <td className="px-4 py-5">
                        <span className="font-black text-slate-900">
                          {formatSkor(item.total_nilai)}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge status={item.status_final || item.status_sistem} />
                      </td>

                      <td className="rounded-r-2xl px-4 py-5">
                        <Link
                          href="/admin/hasil-spk"
                          className="inline-flex rounded-xl p-2 transition hover:bg-white"
                        >
                          <Eye className="h-5 w-5 text-[#1B5E20]" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="rounded-2xl bg-slate-50 px-4 py-12">
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">
                          Belum ada hasil SAW.
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Jalankan perhitungan di menu SAW terlebih dahulu.
                        </p>

                        <Link
                          href="/admin/saw"
                          className="mt-5 inline-flex rounded-2xl bg-[#1B5E20] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#164B1A]"
                        >
                          Hitung SAW Sekarang
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}