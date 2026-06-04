import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminMenu } from "@/constants/admin-menu";
import { ambilSemuaKeluarga } from "@/services/keluarga.service";
import { ambilHasilSawTerbaru, ambilRiwayatSaw } from "@/services/saw.service";
import type { Keluarga } from "@/types/keluarga";
import type { SawResult, StatusKelayakan } from "@/types/saw";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  History,
  MapPinned,
  Search,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusAktif(item: SawResult) {
  return item.status_final || item.status_sistem;
}

function statusLabel(status?: StatusKelayakan | string | null) {
  const map: Record<string, string> = {
    layak: "Layak",
    cadangan: "Cadangan",
    tidak_layak: "Tidak Layak",
  };

  return map[status || ""] || "-";
}

function StatusBadge({ status }: { status?: StatusKelayakan | string | null }) {
  const classMap: Record<string, string> = {
    layak: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cadangan: "border-amber-200 bg-amber-50 text-amber-700",
    tidak_layak: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${
        classMap[status || ""] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const classMap: Record<string, string> = {
    terverifikasi: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    ditolak: "border-red-200 bg-red-50 text-red-700",
    perlu_perbaikan: "border-orange-200 bg-orange-50 text-orange-700",
  };

  const labelMap: Record<string, string> = {
    terverifikasi: "Terverifikasi",
    pending: "Pending",
    ditolak: "Ditolak",
    perlu_perbaikan: "Perlu Perbaikan",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
        classMap[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  accent = "emerald",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent?: "emerald" | "amber" | "red" | "slate";
}) {
  const accentMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accentMap[accent]}`}
        >
          {icon}
        </div>

        <div className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Live
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-slate-500">{title}</p>

      <h3 className="mt-2 [font-family:var(--font-oswald)] text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Database className="h-6 w-6" />
      </div>

      <h3 className="mt-4 [font-family:var(--font-oswald)] text-xl font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {href && action ? (
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          {action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
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

  const rejectedResult = [keluargaResult, hasilResult, riwayatResult].find(
    (item) => item.status === "rejected"
  );

  if (rejectedResult?.status === "rejected") {
    errorMessage =
      rejectedResult.reason instanceof Error
        ? rejectedResult.reason.message
        : "Sebagian data dashboard gagal dimuat.";
  }

  const sortedHasil = [...hasilSaw].sort((a, b) => a.ranking - b.ranking);

  const hasilFiltered = sortedHasil.filter((item) => {
    const matchKelurahan = kelurahanFilter
      ? item.kelurahan === kelurahanFilter
      : true;

    const matchStatus = statusFilter ? getStatusAktif(item) === statusFilter : true;

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

  const totalPerluPerbaikan = keluarga.filter(
    (item) => item.status_verifikasi === "perlu_perbaikan"
  ).length;

  const totalLayak = hasilSaw.filter(
    (item) => getStatusAktif(item) === "layak"
  ).length;

  const totalCadangan = hasilSaw.filter(
    (item) => getStatusAktif(item) === "cadangan"
  ).length;

  const totalTidakLayak = hasilSaw.filter(
    (item) => getStatusAktif(item) === "tidak_layak"
  ).length;

  const rataSkor =
    hasilSaw.length > 0
      ? hasilSaw.reduce((total, item) => total + Number(item.total_nilai || 0), 0) /
        hasilSaw.length
      : 0;

  const persenLayak =
    hasilSaw.length > 0 ? (totalLayak / hasilSaw.length) * 100 : 0;

  const persenTerverifikasi =
    totalKeluarga > 0 ? (totalTerverifikasi / totalKeluarga) * 100 : 0;

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
      const total = keluarga.filter((item) => item.kelurahan === kelurahan).length;
      const persen = totalKeluarga > 0 ? (total / totalKeluarga) * 100 : 0;

      return {
        kelurahan,
        total,
        persen,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const distribusiStatus = [
    {
      label: "Layak",
      total: totalLayak,
      percent: hasilSaw.length > 0 ? (totalLayak / hasilSaw.length) * 100 : 0,
      dotClass: "bg-emerald-600",
      barClass: "bg-emerald-600",
    },
    {
      label: "Cadangan",
      total: totalCadangan,
      percent: hasilSaw.length > 0 ? (totalCadangan / hasilSaw.length) * 100 : 0,
      dotClass: "bg-amber-500",
      barClass: "bg-amber-500",
    },
    {
      label: "Tidak Layak",
      total: totalTidakLayak,
      percent: hasilSaw.length > 0 ? (totalTidakLayak / hasilSaw.length) * 100 : 0,
      dotClass: "bg-red-500",
      barClass: "bg-red-500",
    },
  ];

  const verifikasiCards = [
    {
      label: "Terverifikasi",
      value: totalTerverifikasi,
      icon: <CheckCircle2 className="h-5 w-5" />,
      className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending",
      value: totalPending,
      icon: <Clock3 className="h-5 w-5" />,
      className: "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      label: "Ditolak",
      value: totalDitolak,
      icon: <XCircle className="h-5 w-5" />,
      className: "border-red-100 bg-red-50 text-red-700",
    },
    {
      label: "Perlu Perbaikan",
      value: totalPerluPerbaikan,
      icon: <AlertCircle className="h-5 w-5" />,
      className: "border-orange-100 bg-orange-50 text-orange-700",
    },
  ];

  const latestRiwayat = [...riwayatSaw].sort(
    (a, b) =>
      new Date(b.tanggal_hitung).getTime() - new Date(a.tanggal_hitung).getTime()
  )[0];

  return (
    <DashboardShell
      title="SIMBANTU"
      description="Sistem Informasi Manajemen Bantuan"
      userName={session?.user?.name || "Admin"}
      role="admin"
      menu={adminMenu}
      activeHref="/admin/dashboard"
    >
      <div className="space-y-6 [font-family:var(--font-geist)]">
        <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.5fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                <BarChart3 className="h-4 w-4" />
                Dashboard Admin
              </div>

              <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Monitoring Bantuan Keluarga Miskin
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Pantau data keluarga, status verifikasi, hasil perhitungan SAW,
                ranking kelayakan, dan estimasi distribusi bantuan dari satu
                halaman yang lebih rapi.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/keluarga"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Kelola Data Warga
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/admin/saw"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Hitung SAW
                  <TrendingUp className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
              <p className="text-sm font-semibold text-emerald-100">
                Perhitungan Terakhir
              </p>

              <h2 className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold leading-tight">
                {latestRiwayat?.nama_perhitungan || "Belum Ada Perhitungan"}
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                    Tanggal Hitung
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {latestRiwayat
                      ? formatTanggal(latestRiwayat.tanggal_hitung)
                      : "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                      Data
                    </p>
                    <p className="mt-1 [font-family:var(--font-oswald)] text-2xl font-bold">
                      {latestRiwayat ? formatAngka(latestRiwayat.jumlah_data) : "0"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                      Mode
                    </p>
                    <p className="mt-1 [font-family:var(--font-oswald)] text-2xl font-bold uppercase">
                      {latestRiwayat?.mode_status || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Sebagian data belum bisa dimuat.</p>
              <p className="mt-1 leading-6">{errorMessage}</p>
            </div>
          </div>
        ) : null}

        <form
          method="GET"
          className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Filter Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saring hasil ranking berdasarkan kelurahan dan status kelayakan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <MapPinned className="h-5 w-5 text-emerald-700" />
              <select
                name="kelurahan"
                defaultValue={kelurahanFilter}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="">Semua Kelurahan</option>
                {kelurahanList.map((kelurahan) => (
                  <option key={kelurahan} value={kelurahan}>
                    {kelurahan}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-[200px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter className="h-5 w-5 text-emerald-700" />
              <select
                name="status"
                defaultValue={statusFilter}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="">Semua Status</option>
                <option value="layak">Layak</option>
                <option value="cadangan">Cadangan</option>
                <option value="tidak_layak">Tidak Layak</option>
              </select>
            </label>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
              <Search className="h-4 w-4" />
              Terapkan
            </button>
          </div>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Warga Terdata"
            value={formatAngka(totalKeluarga)}
            description={`${formatAngka(totalTerverifikasi)} terverifikasi dari semua data keluarga.`}
            icon={<Users className="h-6 w-6" />}
          />

          <MetricCard
            title="Warga Layak Bantuan"
            value={formatAngka(totalLayak)}
            description="Jumlah warga yang berstatus layak dari hasil SAW terbaru."
            icon={<BadgeCheck className="h-6 w-6" />}
          />

          <MetricCard
            title="Rata-rata Skor SAW"
            value={formatSkor(rataSkor)}
            description="Rata-rata nilai akhir berdasarkan hasil ranking terbaru."
            icon={<TrendingUp className="h-6 w-6" />}
            accent="slate"
          />

          <MetricCard
            title="Estimasi Anggaran"
            value={formatRupiah(estimasiAnggaran)}
            description="Estimasi Rp 500.000 untuk setiap keluarga yang layak."
            icon={<Wallet className="h-6 w-6" />}
            accent="amber"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {verifikasiCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.className}`}
                >
                  {item.icon}
                </div>

                <p className="[font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                  {formatAngka(item.value)}
                </p>
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                {item.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Status verifikasi data keluarga.
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Analisis Kelayakan
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Distribusi status kelayakan dari hasil perhitungan SAW terbaru.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Layak
                </p>
                <p className="[font-family:var(--font-oswald)] text-3xl font-bold text-emerald-800">
                  {formatPersen(persenLayak)}
                </p>
              </div>
            </div>

            {hasilSaw.length > 0 ? (
              <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr] lg:items-center">
                <div className="relative mx-auto flex h-[260px] w-[260px] items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#059669 0 ${persenLayak}%, #e2e8f0 ${persenLayak}% 100%)`,
                    }}
                  />

                  <div className="absolute inset-[34px] rounded-full bg-white shadow-inner" />

                  <div className="relative z-10 text-center">
                    <p className="[font-family:var(--font-oswald)] text-5xl font-bold text-slate-950">
                      {formatPersen(persenLayak)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      Layak Bantuan
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatAngka(totalLayak)} dari {formatAngka(hasilSaw.length)} data
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {distribusiStatus.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3.5 w-3.5 rounded-full ${item.dotClass}`}
                          />
                          <p className="text-sm font-bold text-slate-700">
                            {item.label}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-slate-950">
                          {formatAngka(item.total)}
                        </p>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.barClass}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>

                      <p className="mt-1 text-right text-xs font-medium text-slate-400">
                        {formatPersen(item.percent)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState
                  title="Belum ada hasil SAW"
                  description="Jalankan perhitungan SAW terlebih dahulu agar grafik kelayakan dan ranking dapat ditampilkan."
                  href="/admin/saw"
                  action="Hitung SAW"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Sebaran Kelurahan
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Wilayah dengan jumlah data keluarga terbanyak.
                </p>
              </div>

              <MapPinned className="h-6 w-6 text-emerald-700" />
            </div>

            <div className="mt-7 space-y-5">
              {dataPerKelurahan.length > 0 ? (
                dataPerKelurahan.map((item) => (
                  <div key={item.kelurahan}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="truncate text-sm font-bold text-slate-700">
                        {item.kelurahan}
                      </p>

                      <p className="text-sm font-bold text-slate-950">
                        {formatAngka(item.total)}
                      </p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${item.persen}%` }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs font-medium text-slate-400">
                      {formatPersen(item.persen)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Belum ada data wilayah"
                  description="Data kelurahan akan muncul setelah data keluarga ditambahkan atau diimport."
                  href="/admin/import"
                  action="Import Dataset"
                />
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Progress Verifikasi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Persentase data keluarga yang sudah diverifikasi.
                </p>
              </div>

              <FileSpreadsheet className="h-6 w-6 text-emerald-700" />
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Data terverifikasi
                  </p>
                  <p className="mt-2 [font-family:var(--font-oswald)] text-5xl font-bold text-slate-950">
                    {formatPersen(persenTerverifikasi)}
                  </p>
                </div>

                <p className="text-sm font-bold text-emerald-700">
                  {formatAngka(totalTerverifikasi)} / {formatAngka(totalKeluarga)}
                </p>
              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${persenTerverifikasi}%` }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {keluarga.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {item.nama_kepala_keluarga}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {item.kelurahan || "-"} • {item.dusun || "-"}
                    </p>
                  </div>

                  <VerificationBadge status={item.status_verifikasi} />
                </div>
              ))}

              {keluarga.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Belum ada data keluarga.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                  Ranking SAW Terbaru
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Sepuluh data teratas berdasarkan nilai akhir perhitungan SAW.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/hasil-spk"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4" />
                  Lihat Report
                </Link>

                <Link
                  href="/admin/saw"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Trophy className="h-4 w-4" />
                  Hitung Ulang
                </Link>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {hasilFiltered.length > 0 ? (
                <table className="w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-3 py-4">Rank</th>
                      <th className="px-3 py-4">Nama Warga</th>
                      <th className="px-3 py-4">NIK</th>
                      <th className="px-3 py-4">Kelurahan</th>
                      <th className="px-3 py-4">Dusun</th>
                      <th className="px-3 py-4">Skor</th>
                      <th className="px-3 py-4">Status</th>
                      <th className="px-3 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {hasilFiltered.slice(0, 10).map((item) => (
                      <tr
                        key={item.id || item.keluarga_id}
                        className="transition hover:bg-emerald-50/50"
                      >
                        <td className="px-3 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 [font-family:var(--font-oswald)] text-base font-bold text-white">
                            {item.ranking}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <p className="font-bold text-slate-900">
                            {item.nama_kepala_keluarga}
                          </p>
                        </td>

                        <td className="px-3 py-4 text-sm font-medium text-slate-500">
                          {item.nik}
                        </td>

                        <td className="px-3 py-4 text-sm font-medium text-slate-500">
                          {item.kelurahan || "-"}
                        </td>

                        <td className="px-3 py-4 text-sm font-medium text-slate-500">
                          {item.dusun || "-"}
                        </td>

                        <td className="px-3 py-4">
                          <span className="[font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                            {formatSkor(item.total_nilai)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={getStatusAktif(item)} />
                        </td>

                        <td className="px-3 py-4 text-right">
                          <Link
                            href="/admin/hasil-spk"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            title="Lihat hasil"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="Belum ada ranking yang cocok"
                  description="Belum ada hasil SAW atau filter yang dipilih tidak memiliki data. Jalankan perhitungan SAW atau ubah filter dashboard."
                  href="/admin/saw"
                  action="Hitung SAW"
                />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Riwayat Perhitungan
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Aktivitas perhitungan SAW terakhir yang tersimpan di sistem.
              </p>
            </div>

            <History className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {riwayatSaw.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  {item.metode}
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
                  {item.nama_perhitungan}
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Jumlah Data</p>
                    <p className="mt-1 font-bold text-slate-800">
                      {formatAngka(item.jumlah_data)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Mode</p>
                    <p className="mt-1 font-bold uppercase text-slate-800">
                      {item.mode_status}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium text-slate-500">
                  {formatTanggal(item.tanggal_hitung)}
                </p>
              </div>
            ))}

            {riwayatSaw.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Belum ada riwayat"
                  description="Riwayat akan muncul setelah admin menjalankan perhitungan SAW dari database."
                  href="/admin/saw"
                  action="Mulai Perhitungan"
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}