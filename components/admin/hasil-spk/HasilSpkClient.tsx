"use client";

import type { RiwayatSaw, SawResult, StatusKelayakan } from "@/types/saw";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  History,
  Medal,
  Printer,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

type HasilSpkClientProps = {
  hasilSaw: SawResult[];
  riwayatSaw: RiwayatSaw[];
  errorMessage?: string;
};

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatSkor(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) return "0.0000";

  return parsed.toFixed(4);
}

function formatPersen(value: number) {
  if (!Number.isFinite(value)) return "0%";

  return `${value.toFixed(1).replace(".", ",")}%`;
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
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
        classMap[status || ""] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
        <Trophy className="h-5 w-5" />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500 text-white shadow-sm">
        <Medal className="h-5 w-5" />
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
        <Medal className="h-5 w-5" />
      </span>
    );
  }

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 [font-family:var(--font-oswald)] text-lg font-bold text-white">
      {rank}
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
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentMap[accent]}`}
        >
          {icon}
        </div>

        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Report
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p>

      <h3 className="mt-2 [font-family:var(--font-oswald)] text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
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
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <FileSpreadsheet className="h-6 w-6" />
      </div>

      <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
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

export function HasilSpkClient({
  hasilSaw,
  riwayatSaw,
  errorMessage,
}: HasilSpkClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");

  const sortedHasil = useMemo(() => {
    return [...hasilSaw].sort((a, b) => a.ranking - b.ranking);
  }, [hasilSaw]);

  const latestRiwayat = useMemo(() => {
    return [...riwayatSaw].sort(
      (a, b) =>
        new Date(b.tanggal_hitung).getTime() -
        new Date(a.tanggal_hitung).getTime()
    )[0];
  }, [riwayatSaw]);

  const kelurahanList = useMemo(() => {
    return Array.from(
      new Set(
        hasilSaw
          .map((item) => item.kelurahan)
          .filter((item): item is string => Boolean(item))
      )
    ).sort();
  }, [hasilSaw]);

  const filteredHasil = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sortedHasil.filter((item) => {
      const matchSearch = keyword
        ? item.nama_kepala_keluarga.toLowerCase().includes(keyword) ||
          item.nik.toLowerCase().includes(keyword)
        : true;

      const matchStatus = statusFilter
        ? getStatusAktif(item) === statusFilter
        : true;

      const matchKelurahan = kelurahanFilter
        ? item.kelurahan === kelurahanFilter
        : true;

      return matchSearch && matchStatus && matchKelurahan;
    });
  }, [sortedHasil, search, statusFilter, kelurahanFilter]);

  const totalData = hasilSaw.length;
  const totalLayak = hasilSaw.filter(
    (item) => getStatusAktif(item) === "layak"
  ).length;
  const totalCadangan = hasilSaw.filter(
    (item) => getStatusAktif(item) === "cadangan"
  ).length;
  const totalTidakLayak = hasilSaw.filter(
    (item) => getStatusAktif(item) === "tidak_layak"
  ).length;

  const persenLayak = totalData > 0 ? (totalLayak / totalData) * 100 : 0;
  const rataSkor =
    totalData > 0
      ? hasilSaw.reduce((total, item) => total + Number(item.total_nilai || 0), 0) /
        totalData
      : 0;

  const topRank = sortedHasil[0];

  const distribusiStatus = [
    {
      label: "Layak",
      total: totalLayak,
      percent: totalData > 0 ? (totalLayak / totalData) * 100 : 0,
      dotClass: "bg-emerald-600",
      barClass: "bg-emerald-600",
    },
    {
      label: "Cadangan",
      total: totalCadangan,
      percent: totalData > 0 ? (totalCadangan / totalData) * 100 : 0,
      dotClass: "bg-amber-500",
      barClass: "bg-amber-500",
    },
    {
      label: "Tidak Layak",
      total: totalTidakLayak,
      percent: totalData > 0 ? (totalTidakLayak / totalData) * 100 : 0,
      dotClass: "bg-red-500",
      barClass: "bg-red-500",
    },
  ];

  function resetFilter() {
    setSearch("");
    setStatusFilter("");
    setKelurahanFilter("");
  }

  function handlePrint() {
    window.print();
  }

  function escapeCsv(value: unknown) {
    const text = String(value ?? "");
    const escaped = text.replace(/"/g, '""');

    return `"${escaped}"`;
  }

  function handleExportCsv() {
    if (filteredHasil.length === 0) return;

    const headers = [
      "Ranking",
      "Nama Kepala Keluarga",
      "NIK",
      "Kelurahan",
      "Dusun",
      "Total Nilai",
      "Status Sistem",
      "Status Final",
      "Tanggal Hitung",
    ];

    const rows = filteredHasil.map((item) => [
      item.ranking,
      item.nama_kepala_keluarga,
      item.nik,
      item.kelurahan || "",
      item.dusun || "",
      formatSkor(item.total_nilai),
      statusLabel(item.status_sistem),
      statusLabel(item.status_final || item.status_sistem),
      item.tanggal_hitung ? formatTanggal(item.tanggal_hitung) : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `hasil-ranking-spk-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm print:border-none print:shadow-none">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 print:hidden">
              <Trophy className="h-4 w-4" />
              Hasil Ranking
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl print:mt-0">
              Report Hasil Ranking Bantuan
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Hasil akhir perhitungan SAW berupa ranking keluarga, skor akhir,
              dan status kelayakan bantuan.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredHasil.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Printer className="h-4 w-4" />
                Print Report
              </button>

              <Link
                href="/admin/saw"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Hitung Ulang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white sm:p-8 lg:border-l lg:border-t-0 print:hidden">
            <p className="text-sm font-semibold text-emerald-100">
              Perhitungan Terakhir
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold leading-tight">
              {latestRiwayat?.nama_perhitungan || "Belum Ada Perhitungan"}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Data
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {latestRiwayat ? formatAngka(latestRiwayat.jumlah_data) : "0"}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Mode
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold uppercase">
                  {latestRiwayat?.mode_status || "-"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-emerald-100">
              {latestRiwayat
                ? formatTanggal(latestRiwayat.tanggal_hitung)
                : "Jalankan perhitungan terlebih dahulu."}
            </p>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 print:hidden">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Gagal memuat hasil ranking.</p>
            <p className="mt-1 leading-6">{errorMessage}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        <MetricCard
          title="Total Data Ranking"
          value={formatAngka(totalData)}
          description="Jumlah keluarga yang masuk hasil perhitungan."
          icon={<Users className="h-6 w-6" />}
        />

        <MetricCard
          title="Layak Bantuan"
          value={formatAngka(totalLayak)}
          description={`${formatPersen(persenLayak)} dari total hasil ranking.`}
          icon={<BadgeCheck className="h-6 w-6" />}
        />

        <MetricCard
          title="Rata-rata Skor"
          value={formatSkor(rataSkor)}
          description="Rata-rata nilai akhir dari seluruh hasil ranking."
          icon={<BarChart3 className="h-6 w-6" />}
          accent="slate"
        />

        <MetricCard
          title="Ranking Pertama"
          value={topRank ? `#${topRank.ranking}` : "-"}
          description={topRank ? topRank.nama_kepala_keluarga : "Belum ada hasil ranking."}
          icon={<Trophy className="h-6 w-6" />}
          accent="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] print:hidden">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Distribusi Status
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ringkasan status kelayakan dari hasil ranking terbaru.
              </p>
            </div>

            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-7 space-y-5">
            {distribusiStatus.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-3.5 w-3.5 rounded-full ${item.dotClass}`} />
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

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Top 3 Prioritas
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Keluarga dengan nilai akhir tertinggi pada perhitungan terbaru.
              </p>
            </div>

            <Medal className="h-6 w-6 text-emerald-700" />
          </div>

          <div className="mt-6 space-y-3">
            {sortedHasil.slice(0, 3).map((item) => (
              <div
                key={item.id || item.keluarga_id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <RankBadge rank={item.ranking} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {item.nama_kepala_keluarga}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {item.kelurahan || "-"} • {item.dusun || "-"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="[font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                    {formatSkor(item.total_nilai)}
                  </p>
                  <StatusBadge status={getStatusAktif(item)} />
                </div>
              </div>
            ))}

            {sortedHasil.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Belum ada hasil ranking.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between print:hidden">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Tabel Hasil Ranking
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Filter dan cek detail hasil ranking penerima bantuan.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetFilter}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredHasil.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_240px_220px] print:hidden">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama kepala keluarga / NIK..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Filter className="h-5 w-5 text-emerald-700" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="layak">Layak</option>
              <option value="cadangan">Cadangan</option>
              <option value="tidak_layak">Tidak Layak</option>
            </select>
          </label>

          <select
            value={kelurahanFilter}
            onChange={(event) => setKelurahanFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="">Semua Kelurahan</option>
            {kelurahanList.map((kelurahan) => (
              <option key={kelurahan} value={kelurahan}>
                {kelurahan}
              </option>
            ))}
          </select>
        </div>

        {filteredHasil.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Belum Ada Hasil Ranking"
              description="Jalankan perhitungan SAW terlebih dahulu atau ubah filter yang sedang aktif."
              href="/admin/saw"
              action="Hitung SAW"
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 print:overflow-visible print:rounded-none print:border-slate-300">
            <table className="w-full min-w-[980px] border-collapse print:min-w-0">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400 print:border-slate-300 print:text-[10px] print:text-slate-700">
                  <th className="px-3 py-4">Rank</th>
                  <th className="px-3 py-4">Nama Warga</th>
                  <th className="px-3 py-4">NIK</th>
                  <th className="px-3 py-4">Kelurahan</th>
                  <th className="px-3 py-4">Dusun</th>
                  <th className="px-3 py-4">Skor</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 print:hidden">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {filteredHasil.map((item) => (
                  <tr
                    key={item.id || item.keluarga_id}
                    className="transition hover:bg-emerald-50/50"
                  >
                    <td className="px-3 py-4">
                      <RankBadge rank={item.ranking} />
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

                    <td className="px-3 py-4 print:hidden">
                      <Link
                        href="/admin/saw"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                        title="Lihat perhitungan"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredHasil.length > 0 ? (
          <p className="mt-3 text-xs font-medium text-slate-400 print:hidden">
            Menampilkan {formatAngka(filteredHasil.length)} dari{" "}
            {formatAngka(totalData)} hasil ranking.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Riwayat Perhitungan
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Perhitungan SAW yang pernah disimpan di sistem.
            </p>
          </div>

          <History className="h-6 w-6 text-emerald-700" />
        </div>

        {riwayatSaw.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Belum ada riwayat perhitungan.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {riwayatSaw.slice(0, 6).map((item) => (
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

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Clock3 className="h-4 w-4" />
                  {formatTanggal(item.tanggal_hitung)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}