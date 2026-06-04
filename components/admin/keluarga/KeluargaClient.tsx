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
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Eye,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type KeluargaClientProps = {
  data: Keluarga[];
  errorMessage?: string;
};

type ModalMode = "create" | "edit" | "detail" | "delete" | "verify" | null;

type FormState = {
  nama_kepala_keluarga: string;
  nik: string;
  alamat: string;
  kelurahan: string;
  dusun: string;
  jumlah_anggota: string;
  status_verifikasi: StatusVerifikasi;
  catatan_admin: string;

  skor_c1: string;
  skor_c2: string;
  skor_c3: string;
  skor_c4: string;
  skor_c5: string;
  skor_c6: string;
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

  skor_c1: "",
  skor_c2: "",
  skor_c3: "",
  skor_c4: "",
  skor_c5: "",
  skor_c6: "",
};

const statusOptions: {
  value: StatusVerifikasi;
  label: string;
  description: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
    description: "Data baru masuk dan belum dicek admin.",
  },
  {
    value: "terverifikasi",
    label: "Terverifikasi",
    description: "Data valid dan bisa masuk perhitungan SAW.",
  },
  {
    value: "perlu_perbaikan",
    label: "Perlu Perbaikan",
    description: "Data perlu dilengkapi atau diperbaiki.",
  },
  {
    value: "ditolak",
    label: "Ditolak",
    description: "Data tidak valid atau tidak memenuhi syarat.",
  },
];

const skorFields: {
  key: keyof Pick<
    FormState,
    "skor_c1" | "skor_c2" | "skor_c3" | "skor_c4" | "skor_c5" | "skor_c6"
  >;
  kode: string;
  label: string;
  hint: string;
}[] = [
  {
    key: "skor_c1",
    kode: "C1",
    label: "Kondisi Rumah",
    hint: "Semakin tidak layak, skor makin tinggi.",
  },
  {
    key: "skor_c2",
    kode: "C2",
    label: "Jumlah Tanggungan",
    hint: "Semakin banyak tanggungan, skor makin tinggi.",
  },
  {
    key: "skor_c3",
    kode: "C3",
    label: "Pekerjaan Kepala Keluarga",
    hint: "Semakin rentan pekerjaan, skor makin tinggi.",
  },
  {
    key: "skor_c4",
    kode: "C4",
    label: "Kepemilikan Aset",
    hint: "Untuk cost, semakin mampu/aset besar nilainya makin tinggi.",
  },
  {
    key: "skor_c5",
    kode: "C5",
    label: "Fasilitas Dasar",
    hint: "Semakin buruk akses fasilitas, skor makin tinggi.",
  },
  {
    key: "skor_c6",
    kode: "C6",
    label: "Pendidikan Kepala Keluarga",
    hint: "Semakin rendah pendidikan, skor makin tinggi.",
  },
];

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: StatusVerifikasi) {
  const found = statusOptions.find((item) => item.value === status);

  return found?.label || status;
}

function StatusBadge({ status }: { status: StatusVerifikasi }) {
  const classMap: Record<StatusVerifikasi, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    terverifikasi: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ditolak: "border-red-200 bg-red-50 text-red-700",
    perlu_perbaikan: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${classMap[status]}`}
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
  accent = "emerald",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent?: "emerald" | "amber" | "red" | "slate";
}) {
  const accentMap = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    red: "border-red-100 bg-red-50 text-red-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentMap[accent]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">{title}</p>

      <h3 className="mt-2 [font-family:var(--font-oswald)] text-4xl font-bold tracking-tight text-slate-950">
        {value}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoAlert({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const icons = {
    success: <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />,
    error: <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />,
    info: <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${styles[type]}`}
    >
      {icons[type]}
      <p className="font-semibold leading-6">{message}</p>
    </div>
  );
}

export function KeluargaClient({ data, errorMessage }: KeluargaClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedKeluarga, setSelectedKeluarga] = useState<Keluarga | null>(
    null
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");
  const [message, setMessage] = useState("");

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchSearch = keyword
        ? item.nama_kepala_keluarga.toLowerCase().includes(keyword) ||
          item.nik.toLowerCase().includes(keyword) ||
          String(item.alamat || "").toLowerCase().includes(keyword)
        : true;

      const matchStatus = statusFilter
        ? item.status_verifikasi === statusFilter
        : true;

      const matchKelurahan = kelurahanFilter
        ? item.kelurahan === kelurahanFilter
        : true;

      return matchSearch && matchStatus && matchKelurahan;
    });
  }, [data, search, statusFilter, kelurahanFilter]);

  const kelurahanList = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((item) => item.kelurahan)
          .filter((item): item is string => Boolean(item))
      )
    ).sort();
  }, [data]);

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

  function setInfo(type: "success" | "error" | "info", text: string) {
    setMessageType(type);
    setMessage(text);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateModal() {
    setSelectedKeluarga(null);
    setForm(emptyForm);
    setActionMessage("");
    setModalMode("create");
  }

  function openDetailModal(item: Keluarga) {
    setSelectedKeluarga(item);
    setActionMessage("");
    setModalMode("detail");
  }

  function openEditModal(item: Keluarga) {
    setSelectedKeluarga(item);
    setForm({
      nama_kepala_keluarga: item.nama_kepala_keluarga || "",
      nik: item.nik || "",
      alamat: item.alamat || "",
      kelurahan: item.kelurahan || "",
      dusun: item.dusun || "",
      jumlah_anggota: item.jumlah_anggota ? String(item.jumlah_anggota) : "",
      status_verifikasi: item.status_verifikasi,
      catatan_admin: item.catatan_admin || "",

      skor_c1: "",
      skor_c2: "",
      skor_c3: "",
      skor_c4: "",
      skor_c5: "",
      skor_c6: "",
    });
    setActionMessage("");
    setModalMode("edit");
  }

  function openDeleteModal(item: Keluarga) {
    setSelectedKeluarga(item);
    setActionMessage("");
    setModalMode("delete");
  }

  function openVerifyModal(item: Keluarga) {
    setSelectedKeluarga(item);
    setForm({
      ...emptyForm,
      nama_kepala_keluarga: item.nama_kepala_keluarga || "",
      nik: item.nik || "",
      status_verifikasi: item.status_verifikasi,
      catatan_admin: item.catatan_admin || "",
    });
    setActionMessage("");
    setModalMode("verify");
  }

  function closeModal() {
    if (isSubmitting) return;

    setModalMode(null);
    setSelectedKeluarga(null);
    setForm(emptyForm);
    setActionMessage("");
  }

  function validateMainForm() {
    if (!form.nama_kepala_keluarga.trim()) {
      return "Nama kepala keluarga wajib diisi.";
    }

    if (!form.nik.trim()) {
      return "NIK wajib diisi.";
    }

    if (form.nik.trim().length < 8) {
      return "NIK terlalu pendek.";
    }

    if (form.jumlah_anggota.trim()) {
      const jumlahAnggota = Number(form.jumlah_anggota);

      if (!Number.isInteger(jumlahAnggota) || jumlahAnggota < 1) {
        return "Jumlah anggota harus angka bulat minimal 1.";
      }
    }

    for (const item of skorFields) {
      const value = form[item.key];

      if (value.trim() === "") continue;

      const parsed = Number(value);

      if (!Number.isFinite(parsed) || parsed < 0) {
        return `Nilai ${item.kode} harus berupa angka dan tidak boleh negatif.`;
      }
    }

    return "";
  }

  function buildPenilaianPayload() {
    return skorFields
      .filter((item) => form[item.key].trim() !== "")
      .map((item) => ({
        kode_kriteria: item.kode,
        nilai_awal: Number(form[item.key]),
      }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateMainForm();

    if (validationMessage) {
      setActionMessage(validationMessage);
      return;
    }

    const jumlahAnggota = form.jumlah_anggota.trim()
      ? Number(form.jumlah_anggota)
      : undefined;

    const penilaianPayload = buildPenilaianPayload();

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
      penilaian: penilaianPayload.length > 0 ? penilaianPayload : undefined,
    };

    setIsSubmitting(true);
    setActionMessage("");

    try {
      if (modalMode === "create") {
        const result = await tambahKeluarga(payload);

        const totalPenilaian = result.penilaian?.length || 0;

        setInfo(
          "success",
          `Data keluarga berhasil ditambahkan. Penilaian tersimpan: ${formatAngka(
            totalPenilaian
          )}.`
        );
      }

      if (modalMode === "edit" && selectedKeluarga) {
        const updatePayload: KeluargaUpdatePayload = {
          ...payload,
          status_verifikasi: form.status_verifikasi,
          catatan_admin: form.catatan_admin.trim() || undefined,
          penilaian: penilaianPayload.length > 0 ? penilaianPayload : undefined,
        };

        const result = await updateKeluarga(selectedKeluarga.id, updatePayload);

        const totalPenilaian = result.penilaian?.length || 0;

        setInfo(
          "success",
          `Data keluarga berhasil diperbarui. Penilaian tersimpan/update: ${formatAngka(
            totalPenilaian
          )}.`
        );
      }

      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Gagal menyimpan data keluarga."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedKeluarga) return;

    setIsSubmitting(true);
    setActionMessage("");

    try {
      await hapusKeluarga(selectedKeluarga.id);

      setInfo("success", "Data keluarga berhasil dihapus.");
      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Gagal menghapus data keluarga."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedKeluarga) return;

    setIsSubmitting(true);
    setActionMessage("");

    try {
      await verifikasiKeluarga(selectedKeluarga.id, {
        status_verifikasi: form.status_verifikasi,
        catatan_admin: form.catatan_admin.trim() || undefined,
      });

      setInfo("success", "Status verifikasi berhasil diperbarui.");
      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status verifikasi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 [font-family:var(--font-geist)]">
      <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <Users className="h-4 w-4" />
              Data Warga
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Kelola Data Warga & Penilaian Manual
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Tambah, edit, verifikasi data warga, dan isi skor penilaian C1-C6
              secara manual untuk data yang tidak berasal dari import dataset.
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

              <button
                type="button"
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-emerald-100">
              Data Terverifikasi
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-5xl font-bold leading-tight">
              {formatAngka(stats.terverifikasi)}
            </h2>

            <p className="mt-2 text-sm text-emerald-100">
              dari {formatAngka(stats.total)} data warga.
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

      {errorMessage ? <InfoAlert type="error" message={errorMessage} /> : null}
      {message ? <InfoAlert type={messageType} message={message} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Warga"
          value={formatAngka(stats.total)}
          description="Jumlah seluruh data warga yang tersimpan."
          icon={<Users className="h-6 w-6" />}
        />

        <MetricCard
          title="Terverifikasi"
          value={formatAngka(stats.terverifikasi)}
          description="Data yang bisa masuk proses perhitungan SAW."
          icon={<BadgeCheck className="h-6 w-6" />}
        />

        <MetricCard
          title="Pending"
          value={formatAngka(stats.pending)}
          description="Data yang masih perlu dicek admin."
          icon={<Clock3 className="h-6 w-6" />}
          accent="amber"
        />

        <MetricCard
          title="Perlu Perbaikan"
          value={formatAngka(stats.perluPerbaikan)}
          description="Data yang perlu dilengkapi kembali."
          icon={<AlertCircle className="h-6 w-6" />}
          accent="red"
        />
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
              Daftar Warga
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Data warga hasil input manual maupun import dataset.
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

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_240px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, NIK, atau alamat..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="">Semua Status</option>
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={kelurahanFilter}
            onChange={(event) => setKelurahanFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
          >
            <option value="">Semua Kelurahan</option>
            {kelurahanList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {filteredData.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
              Data Tidak Ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Coba ubah filter pencarian atau tambahkan data warga baru.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[980px] border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-3 py-4">Nama</th>
                  <th className="px-3 py-4">NIK</th>
                  <th className="px-3 py-4">Alamat</th>
                  <th className="px-3 py-4">Kelurahan</th>
                  <th className="px-3 py-4">Dusun</th>
                  <th className="px-3 py-4">Anggota</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => (
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
                            Dibuat: {formatTanggal(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-sm font-semibold text-slate-600">
                      {item.nik}
                    </td>

                    <td className="max-w-[220px] px-3 py-4 text-sm font-medium text-slate-500">
                      <p className="truncate">{item.alamat || "-"}</p>
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-500">
                      {item.kelurahan || "-"}
                    </td>

                    <td className="px-3 py-4 text-sm font-medium text-slate-500">
                      {item.dusun || "-"}
                    </td>

                    <td className="px-3 py-4 [font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                      {item.jumlah_anggota || "-"}
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={item.status_verifikasi} />
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-950 hover:text-white"
                          title="Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openVerifyModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                          title="Verifikasi"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100 text-amber-700 transition hover:bg-amber-500 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-600 hover:text-white"
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
        )}

        <p className="mt-3 text-xs font-medium text-slate-400">
          Menampilkan {formatAngka(filteredData.length)} dari{" "}
          {formatAngka(data.length)} data warga.
        </p>
      </section>

      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            aria-label="Tutup modal"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-emerald-100 bg-white shadow-2xl">
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
                  Isi data warga dan skor C1-C6 jika ingin langsung masuk
                  penilaian SAW.
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
                    Nama Kepala Keluarga <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={form.nama_kepala_keluarga}
                    onChange={(event) =>
                      updateForm("nama_kepala_keluarga", event.target.value)
                    }
                    placeholder="Contoh: Budiono"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    NIK <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={form.nik}
                    onChange={(event) => updateForm("nik", event.target.value)}
                    placeholder="Contoh: 3507051105030001"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-700">
                    Alamat
                  </span>
                  <textarea
                    value={form.alamat}
                    onChange={(event) =>
                      updateForm("alamat", event.target.value)
                    }
                    placeholder="Contoh: Jl. Melati No. 10"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
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
                  <span className="text-sm font-bold text-slate-700">
                    Dusun
                  </span>
                  <input
                    value={form.dusun}
                    onChange={(event) => updateForm("dusun", event.target.value)}
                    placeholder="Contoh: Dusun Melati"
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
                    placeholder="Contoh: 5"
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
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    >
                      {statusOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
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
                      rows={3}
                      placeholder="Catatan opsional..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                ) : null}

                <div className="md:col-span-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                        Nilai Penilaian SPK
                      </p>

                      <h4 className="mt-2 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
                        Isi Skor C1 - C6
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Opsional. Kalau diisi, nilai ini langsung masuk ke tabel
                        penilaian dan siap dipakai saat hitung SAW.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {skorFields.map((item) => (
                        <label key={item.key} className="space-y-2">
                          <span className="text-sm font-bold text-slate-700">
                            {item.kode} {item.label}
                          </span>

                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form[item.key]}
                            onChange={(event) =>
                              updateForm(item.key, event.target.value)
                            }
                            placeholder="1 - 5"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                          />

                          <p className="text-xs leading-5 text-slate-400">
                            {item.hint}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
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
      )}

      {modalMode === "detail" && selectedKeluarga ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Detail Warga
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  {selectedKeluarga.nama_kepala_keluarga}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  NIK: {selectedKeluarga.nik}
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

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Alamat
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedKeluarga.alamat || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedKeluarga.status_verifikasi} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Kelurahan
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedKeluarga.kelurahan || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Dusun
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedKeluarga.dusun || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Jumlah Anggota
                </p>
                <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                  {selectedKeluarga.jumlah_anggota || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Tanggal Dibuat
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {formatTanggal(selectedKeluarga.created_at)}
                </p>
              </div>
            </div>

            {selectedKeluarga.catatan_admin ? (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Catatan Admin
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {selectedKeluarga.catatan_admin}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {modalMode === "verify" && selectedKeluarga ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
          />

          <form
            onSubmit={handleVerifySubmit}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Verifikasi Data
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  {selectedKeluarga.nama_kepala_keluarga}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ubah status validasi data warga.
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

            {actionMessage ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="font-semibold">{actionMessage}</p>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <label className="space-y-2 block">
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  {statusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-700">
                  Catatan Admin
                </span>

                <textarea
                  value={form.catatan_admin}
                  onChange={(event) =>
                    updateForm("catatan_admin", event.target.value)
                  }
                  rows={4}
                  placeholder="Catatan opsional..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Simpan
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {modalMode === "delete" && selectedKeluarga ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl">
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                <Trash2 className="h-8 w-8" />
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Konfirmasi
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  Hapus Data Warga?
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Data{" "}
                  <span className="font-bold text-slate-900">
                    {selectedKeluarga.nama_kepala_keluarga}
                  </span>{" "}
                  akan dihapus dari sistem.
                </p>
              </div>

              {actionMessage ? (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-semibold">{actionMessage}</p>
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}