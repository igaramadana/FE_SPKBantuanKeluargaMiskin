"use client";

import type {
  Keluarga,
  KeluargaCreatePayload,
  KeluargaUpdatePayload,
  StatusVerifikasi,
} from "@/types/keluarga";
import {
  hapusKeluarga,
  tambahKeluarga,
  updateKeluarga,
  verifikasiKeluarga,
} from "@/services/keluarga.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Edit3,
  FileSpreadsheet,
  Filter,
  MapPinned,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type KeluargaClientProps = {
  data: Keluarga[];
  search: string;
  status: string;
  kelurahan: string;
  dusun: string;
  kelurahanList: string[];
  dusunList: string[];
  errorMessage?: string;
};

type ModalMode = "create" | "edit" | null;

type FormState = {
  nama_kepala_keluarga: string;
  nik: string;
  alamat: string;
  kelurahan: string;
  dusun: string;
  jumlah_anggota: string;
  status_verifikasi: StatusVerifikasi;
  catatan_admin: string;
};

const emptyForm: FormState = {
  nama_kepala_keluarga: "",
  nik: "",
  alamat: "",
  kelurahan: "",
  dusun: "",
  jumlah_anggota: "",
  status_verifikasi: "pending",
  catatan_admin: "",
};

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pending",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
    perlu_perbaikan: "Perlu Perbaikan",
  };

  return labels[status] || status;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    terverifikasi: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ditolak: "border-red-200 bg-red-50 text-red-700",
    perlu_perbaikan: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
          {icon}
        </div>

        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Data
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

export function KeluargaClient({
  data,
  search,
  status,
  kelurahan,
  dusun,
  kelurahanList,
  dusunList,
  errorMessage,
}: KeluargaClientProps) {
  const router = useRouter();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedData, setSelectedData] = useState<Keluarga | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Keluarga | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const stats = useMemo(() => {
    const total = data.length;

    const pending = data.filter(
      (item) => item.status_verifikasi === "pending"
    ).length;

    const terverifikasi = data.filter(
      (item) => item.status_verifikasi === "terverifikasi"
    ).length;

    const ditolak = data.filter(
      (item) => item.status_verifikasi === "ditolak"
    ).length;

    const perluPerbaikan = data.filter(
      (item) => item.status_verifikasi === "perlu_perbaikan"
    ).length;

    return {
      total,
      pending,
      terverifikasi,
      ditolak,
      perluPerbaikan,
    };
  }, [data]);

  function openCreateModal() {
    setSelectedData(null);
    setForm(emptyForm);
    setActionMessage("");
    setModalMode("create");
  }

  function openEditModal(item: Keluarga) {
    setSelectedData(item);
    setForm({
      nama_kepala_keluarga: item.nama_kepala_keluarga || "",
      nik: item.nik || "",
      alamat: item.alamat || "",
      kelurahan: item.kelurahan || "",
      dusun: item.dusun || "",
      jumlah_anggota: item.jumlah_anggota ? String(item.jumlah_anggota) : "",
      status_verifikasi: item.status_verifikasi,
      catatan_admin: item.catatan_admin || "",
    });
    setActionMessage("");
    setModalMode("edit");
  }

  function closeModal() {
    if (isSubmitting) return;

    setModalMode(null);
    setSelectedData(null);
    setForm(emptyForm);
    setActionMessage("");
  }

  function openDeleteModal(item: Keluarga) {
    setDeleteTarget(item);
    setActionMessage("");
  }

  function closeDeleteModal() {
    if (isSubmitting) return;

    setDeleteTarget(null);
    setActionMessage("");
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    if (!form.nama_kepala_keluarga.trim()) {
      setActionMessage("Nama kepala keluarga wajib diisi.");
      return;
    }

    if (!form.nik.trim()) {
      setActionMessage("NIK wajib diisi.");
      return;
    }

    if (form.nik.trim().length < 8) {
      setActionMessage("NIK terlalu pendek.");
      return;
    }

    setIsSubmitting(true);

    try {
      const jumlahAnggota = form.jumlah_anggota
        ? Number(form.jumlah_anggota)
        : undefined;

      const payload: KeluargaCreatePayload = {
        nama_kepala_keluarga: form.nama_kepala_keluarga.trim(),
        nik: form.nik.trim(),
        alamat: form.alamat.trim() || undefined,
        kelurahan: form.kelurahan.trim() || undefined,
        dusun: form.dusun.trim() || undefined,
        jumlah_anggota:
          jumlahAnggota && Number.isFinite(jumlahAnggota)
            ? jumlahAnggota
            : undefined,
      };

      if (modalMode === "create") {
        await tambahKeluarga(payload);
      }

      if (modalMode === "edit" && selectedData) {
        const updatePayload: KeluargaUpdatePayload = {
          ...payload,
          status_verifikasi: form.status_verifikasi,
          catatan_admin: form.catatan_admin.trim() || undefined,
        };

        await updateKeluarga(selectedData.id, updatePayload);
      }

      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data keluarga."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    setActionMessage("");

    try {
      await hapusKeluarga(deleteTarget.id);

      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Gagal menghapus data."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuickVerify(
    item: Keluarga,
    nextStatus: StatusVerifikasi
  ) {
    setIsSubmitting(true);

    try {
      await verifikasiKeluarga(item.id, {
        status_verifikasi: nextStatus,
      });

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status verifikasi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Users className="h-4 w-4" />
              Data Warga
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Kelola Data Keluarga Calon Penerima
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Tambahkan, ubah, hapus, dan verifikasi data keluarga sebelum masuk
              ke proses penilaian AHP dan SAW.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Data
              </button>

              <Link
                href="/admin/import"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <UploadCloud className="h-4 w-4" />
                Import Dataset
              </Link>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
            <p className="text-sm font-semibold text-emerald-100">
              Ringkasan Verifikasi
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-5xl font-bold leading-tight">
              {formatAngka(stats.terverifikasi)}
            </h2>

            <p className="mt-2 text-sm text-emerald-100">
              data sudah terverifikasi dari total {formatAngka(stats.total)} data
              warga yang tampil.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Pending
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(stats.pending)}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Ditolak
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(stats.ditolak)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Gagal memuat data warga.</p>
            <p className="mt-1 leading-6">{errorMessage}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Data"
          value={formatAngka(stats.total)}
          description="Jumlah data keluarga sesuai filter aktif."
          icon={<Users className="h-6 w-6" />}
        />

        <MetricCard
          title="Terverifikasi"
          value={formatAngka(stats.terverifikasi)}
          description="Data siap masuk proses penilaian SAW."
          icon={<BadgeCheck className="h-6 w-6" />}
        />

        <MetricCard
          title="Pending"
          value={formatAngka(stats.pending)}
          description="Data masih menunggu pengecekan admin."
          icon={<RefreshCcw className="h-6 w-6" />}
        />

        <MetricCard
          title="Perlu Perbaikan"
          value={formatAngka(stats.perluPerbaikan)}
          description="Data perlu dilengkapi atau dikoreksi."
          icon={<AlertCircle className="h-6 w-6" />}
        />
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <form
          method="GET"
          className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_auto]"
        >
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Cari nama kepala keluarga / NIK..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Filter className="h-5 w-5 text-emerald-700" />
            <select
              name="status_verifikasi"
              defaultValue={status}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="ditolak">Ditolak</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <MapPinned className="h-5 w-5 text-emerald-700" />
            <select
              name="kelurahan"
              defaultValue={kelurahan}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="">Semua Kelurahan</option>
              {kelurahanList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
            <select
              name="dusun"
              defaultValue={dusun}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="">Semua Dusun</option>
              {dusunList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
            <Search className="h-4 w-4" />
            Filter
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Daftar Data Warga
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Data keluarga calon penerima bantuan yang tersimpan di sistem.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Data
          </button>
        </div>

        {data.length === 0 && !errorMessage ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Belum Ada Data Warga
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Tambahkan data secara manual atau import dataset agar data keluarga
              bisa diproses ke tahap penilaian.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Manual
              </button>

              <Link
                href="/admin/import"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <UploadCloud className="h-4 w-4" />
                Import Dataset
              </Link>
            </div>
          </div>
        ) : null}

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-3 py-4">Warga</th>
                  <th className="px-3 py-4">NIK</th>
                  <th className="px-3 py-4">Alamat</th>
                  <th className="px-3 py-4">Kelurahan</th>
                  <th className="px-3 py-4">Dusun</th>
                  <th className="px-3 py-4">Anggota</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Dibuat</th>
                  <th className="px-3 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="transition hover:bg-emerald-50/50">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {item.nama_kepala_keluarga}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {item.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-600">
                      {item.nik}
                    </td>

                    <td className="max-w-[240px] px-3 py-4 text-sm font-medium text-slate-500">
                      <p className="truncate">{item.alamat || "-"}</p>
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-600">
                      {item.kelurahan || "-"}
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-600">
                      {item.dusun || "-"}
                    </td>

                    <td className="px-3 py-4">
                      <span className="[font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                        {item.jumlah_anggota || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={item.status_verifikasi} />
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-500">
                      {formatTanggal(item.created_at)}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {item.status_verifikasi !== "terverifikasi" ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleQuickVerify(item, "terverifikasi")
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                            title="Verifikasi"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : null}

                        {item.status_verifikasi !== "ditolak" ? (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleQuickVerify(item, "ditolak")}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                            title="Tolak"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-950 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => openDeleteModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {modalMode ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            aria-label="Tutup modal"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-emerald-100 bg-white shadow-2xl">
            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {modalMode === "create" ? "Tambah Data" : "Edit Data"}
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  {modalMode === "create"
                    ? "Tambah Data Warga"
                    : "Ubah Data Warga"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi data keluarga calon penerima bantuan.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-950 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {actionMessage ? (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-semibold">{actionMessage}</p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Nama Kepala Keluarga
                  </span>
                  <input
                    value={form.nama_kepala_keluarga}
                    onChange={(event) =>
                      updateForm("nama_kepala_keluarga", event.target.value)
                    }
                    placeholder="Contoh: Budi Santoso"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">NIK</span>
                  <input
                    value={form.nik}
                    onChange={(event) => updateForm("nik", event.target.value)}
                    placeholder="Masukkan NIK"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Alamat
                  </span>
                  <textarea
                    value={form.alamat}
                    onChange={(event) => updateForm("alamat", event.target.value)}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Kelurahan
                  </span>
                  <input
                    value={form.kelurahan}
                    onChange={(event) =>
                      updateForm("kelurahan", event.target.value)
                    }
                    placeholder="Contoh: Kedungdoro"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">Dusun</span>
                  <input
                    value={form.dusun}
                    onChange={(event) => updateForm("dusun", event.target.value)}
                    placeholder="Contoh: Dusun 01"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Jumlah Anggota
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.jumlah_anggota}
                    onChange={(event) =>
                      updateForm("jumlah_anggota", event.target.value)
                    }
                    placeholder="Contoh: 4"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                {modalMode === "edit" ? (
                  <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">
                      Status Verifikasi
                    </span>
                    <select
                      value={form.status_verifikasi}
                      onChange={(event) =>
                        updateForm(
                          "status_verifikasi",
                          event.target.value as StatusVerifikasi
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="terverifikasi">Terverifikasi</option>
                      <option value="ditolak">Ditolak</option>
                      <option value="perlu_perbaikan">Perlu Perbaikan</option>
                    </select>
                  </label>
                ) : null}

                {modalMode === "edit" ? (
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Catatan Admin
                    </span>
                    <textarea
                      value={form.catatan_admin}
                      onChange={(event) =>
                        updateForm("catatan_admin", event.target.value)
                      }
                      placeholder="Catatan verifikasi atau alasan penolakan"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                ) : null}
              </div>

              <div className="sticky bottom-0 z-20 -mx-6 mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : modalMode === "create"
                    ? "Simpan Data"
                    : "Update Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            aria-label="Tutup modal hapus"
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl">
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                <Trash2 className="h-8 w-8" />
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Konfirmasi Hapus
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  Hapus Data Warga?
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Data warga atas nama{" "}
                  <span className="font-bold text-slate-900">
                    {deleteTarget.nama_kepala_keluarga}
                  </span>{" "}
                  dengan NIK{" "}
                  <span className="font-bold text-slate-900">
                    {deleteTarget.nik}
                  </span>{" "}
                  akan dihapus permanen dari sistem.
                </p>
              </div>

              {actionMessage ? (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-semibold">{actionMessage}</p>
                </div>
              ) : null}

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {deleteTarget.nama_kepala_keluarga}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {deleteTarget.kelurahan || "-"} •{" "}
                      {deleteTarget.dusun || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Menghapus..." : "Hapus Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}