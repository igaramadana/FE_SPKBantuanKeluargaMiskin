"use client";

import type {
  JenisKriteria,
  Kriteria,
  KriteriaCreatePayload,
  KriteriaUpdatePayload,
} from "@/types/kriteria";
import {
  bikinKriteriaBaru,
  hapusKriteria,
  updateKriteria,
} from "@/services/kriteria.service";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Eye,
  Layers,
  Pencil,
  Plus,
  RefreshCcw,
  Scale,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Weight,
  X,
  XCircle,
} from "lucide-react";

type KriteriaClientProps = {
  data: Kriteria[];
  errorMessage?: string;
};

type ModalMode = "create" | "edit" | "detail" | "delete" | null;

type FormState = {
  kode: string;
  nama: string;
  jenis: JenisKriteria;
  bobot_ahp: string;
  urutan: string;
  aktif: boolean;
};

const emptyForm: FormState = {
  kode: "",
  nama: "",
  jenis: "benefit",
  bobot_ahp: "",
  urutan: "",
  aktif: true,
};

function formatAngka(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatBobot(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return "-";

  return parsed.toFixed(4);
}

function formatPersen(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return "-";

  return `${(parsed * 100).toFixed(2).replace(".", ",")}%`;
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

function JenisBadge({ jenis }: { jenis: JenisKriteria }) {
  const isBenefit = jenis === "benefit";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${
        isBenefit
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {jenis}
    </span>
  );
}

function StatusBadge({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
        aktif
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {aktif ? "Aktif" : "Nonaktif"}
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
          SPK
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

export function KriteriaClient({ data, errorMessage }: KriteriaClientProps) {
  const router = useRouter();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedKriteria, setSelectedKriteria] = useState<Kriteria | null>(
    null
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const urutanA = a.urutan ?? 9999;
      const urutanB = b.urutan ?? 9999;

      if (urutanA !== urutanB) return urutanA - urutanB;

      return a.kode.localeCompare(b.kode);
    });
  }, [data]);

  const stats = useMemo(() => {
    const total = data.length;
    const aktif = data.filter((item) => item.aktif).length;
    const nonaktif = data.filter((item) => !item.aktif).length;
    const benefit = data.filter((item) => item.jenis === "benefit").length;
    const cost = data.filter((item) => item.jenis === "cost").length;
    const totalBobotAktif = data
      .filter((item) => item.aktif)
      .reduce((total, item) => total + Number(item.bobot_ahp || 0), 0);

    return {
      total,
      aktif,
      nonaktif,
      benefit,
      cost,
      totalBobotAktif,
    };
  }, [data]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateModal() {
    setSelectedKriteria(null);
    setForm(emptyForm);
    setActionMessage("");
    setModalMode("create");
  }

  function openDetailModal(item: Kriteria) {
    setSelectedKriteria(item);
    setActionMessage("");
    setModalMode("detail");
  }

  function openEditModal(item: Kriteria) {
    setSelectedKriteria(item);
    setForm({
      kode: item.kode,
      nama: item.nama,
      jenis: item.jenis,
      bobot_ahp: item.bobot_ahp ? String(item.bobot_ahp) : "",
      urutan: item.urutan ? String(item.urutan) : "",
      aktif: item.aktif,
    });
    setActionMessage("");
    setModalMode("edit");
  }

  function openDeleteModal(item: Kriteria) {
    setSelectedKriteria(item);
    setActionMessage("");
    setModalMode("delete");
  }

  function closeModal() {
    if (isSubmitting) return;

    setModalMode(null);
    setSelectedKriteria(null);
    setForm(emptyForm);
    setActionMessage("");
  }

  function validateForm() {
    if (!form.kode.trim()) {
      return "Kode kriteria wajib diisi.";
    }

    if (!form.nama.trim()) {
      return "Nama kriteria wajib diisi.";
    }

    if (!["benefit", "cost"].includes(form.jenis)) {
      return "Jenis kriteria harus benefit atau cost.";
    }

    if (form.bobot_ahp.trim()) {
      const bobot = Number(form.bobot_ahp);

      if (!Number.isFinite(bobot)) {
        return "Bobot AHP harus berupa angka.";
      }

      if (bobot < 0 || bobot > 1) {
        return "Bobot AHP sebaiknya berada di antara 0 sampai 1.";
      }
    }

    if (form.urutan.trim()) {
      const urutan = Number(form.urutan);

      if (!Number.isInteger(urutan) || urutan < 1) {
        return "Urutan harus berupa angka bulat mulai dari 1.";
      }
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setActionMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setActionMessage("");

    try {
      const createPayload: KriteriaCreatePayload = {
        kode: form.kode.trim().toUpperCase(),
        nama: form.nama.trim(),
        jenis: form.jenis,
        aktif: form.aktif,
        urutan: form.urutan.trim() ? Number(form.urutan) : undefined,
      };

      if (modalMode === "create") {
        const created = await bikinKriteriaBaru(createPayload);

        if (form.bobot_ahp.trim()) {
          await updateKriteria(created.id, {
            bobot_ahp: form.bobot_ahp.trim(),
          });
        }
      }

      if (modalMode === "edit" && selectedKriteria) {
        const updatePayload: KriteriaUpdatePayload = {
          kode: form.kode.trim().toUpperCase(),
          nama: form.nama.trim(),
          jenis: form.jenis,
          aktif: form.aktif,
          urutan: form.urutan.trim() ? Number(form.urutan) : undefined,
          bobot_ahp: form.bobot_ahp.trim() ? form.bobot_ahp.trim() : null,
        };

        await updateKriteria(selectedKriteria.id, updatePayload);
      }

      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan kriteria."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(item: Kriteria) {
    setIsSubmitting(true);
    setActionMessage("");

    try {
      await updateKriteria(item.id, {
        aktif: !item.aktif,
      });

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status kriteria."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedKriteria) return;

    setIsSubmitting(true);
    setActionMessage("");

    try {
      await hapusKriteria(selectedKriteria.id);

      closeModal();
      router.refresh();
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Gagal menonaktifkan kriteria."
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
              <SlidersHorizontal className="h-4 w-4" />
              Kriteria & Bobot
            </div>

            <h1 className="mt-5 max-w-3xl [font-family:var(--font-oswald)] text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Atur Dasar Penilaian SPK
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Kelola kriteria, jenis benefit/cost, status aktif, urutan, dan
              bobot AHP yang menjadi dasar perhitungan ranking bantuan keluarga
              miskin.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Kriteria
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

          <div className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
            <p className="text-sm font-semibold text-emerald-100">
              Total Bobot Kriteria Aktif
            </p>

            <h2 className="mt-3 [font-family:var(--font-oswald)] text-5xl font-bold leading-tight">
              {formatBobot(stats.totalBobotAktif)}
            </h2>

            <p className="mt-2 text-sm text-emerald-100">
              Idealnya total bobot aktif mendekati 1.0000 atau 100%.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Aktif
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(stats.aktif)}
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  Nonaktif
                </p>
                <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                  {formatAngka(stats.nonaktif)}
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
            <p className="font-bold">Gagal memuat kriteria.</p>
            <p className="mt-1 leading-6">{errorMessage}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Kriteria"
          value={formatAngka(stats.total)}
          description="Jumlah seluruh kriteria yang tersimpan."
          icon={<Layers className="h-6 w-6" />}
        />

        <MetricCard
          title="Kriteria Aktif"
          value={formatAngka(stats.aktif)}
          description="Kriteria yang dipakai pada perhitungan SAW."
          icon={<BadgeCheck className="h-6 w-6" />}
        />

        <MetricCard
          title="Benefit / Cost"
          value={`${formatAngka(stats.benefit)} / ${formatAngka(stats.cost)}`}
          description="Perbandingan jenis kriteria benefit dan cost."
          icon={<Scale className="h-6 w-6" />}
        />

        <MetricCard
          title="Total Bobot Aktif"
          value={formatBobot(stats.totalBobotAktif)}
          description={`Setara ${formatPersen(stats.totalBobotAktif)} dari total bobot.`}
          icon={<Weight className="h-6 w-6" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.45fr]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
            Panduan Singkat
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Gunakan panduan ini supaya konfigurasi kriteria tidak salah.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-800">Benefit</p>
              <p className="mt-1 text-sm leading-6 text-emerald-700">
                Semakin besar nilai, semakin layak. Contoh: jumlah tanggungan.
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="font-bold text-amber-800">Cost</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                Semakin kecil nilai, semakin layak. Contoh: penghasilan.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-bold text-slate-900">Bobot AHP</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Menentukan seberapa besar pengaruh kriteria terhadap hasil
                akhir. Total bobot aktif sebaiknya 1.0000.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="[font-family:var(--font-oswald)] text-3xl font-semibold tracking-tight text-slate-950">
                Daftar Kriteria
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Data kriteria yang digunakan sebagai parameter penilaian SPK.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>

          {sortedData.length === 0 && !errorMessage ? (
            <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <Settings2 className="h-6 w-6" />
              </div>

              <h3 className="mt-4 [font-family:var(--font-oswald)] text-2xl font-semibold text-slate-950">
                Belum Ada Kriteria
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Tambahkan kriteria terlebih dahulu sebelum melakukan perhitungan
                SPK.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Kriteria
              </button>
            </div>
          ) : null}

          {sortedData.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-3 py-4">Kode</th>
                    <th className="px-3 py-4">Nama Kriteria</th>
                    <th className="px-3 py-4">Jenis</th>
                    <th className="px-3 py-4">Bobot</th>
                    <th className="px-3 py-4">Urutan</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sortedData.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-emerald-50/50"
                    >
                      <td className="px-3 py-4">
                        <span className="inline-flex rounded-lg bg-slate-950 px-3 py-1.5 [font-family:var(--font-oswald)] text-base font-bold text-white">
                          {item.kode}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-bold text-slate-900">{item.nama}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Dibuat: {formatTanggal(item.created_at)}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <JenisBadge jenis={item.jenis} />
                      </td>

                      <td className="px-3 py-4">
                        <p className="[font-family:var(--font-oswald)] text-xl font-bold text-slate-950">
                          {formatBobot(item.bobot_ahp)}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {formatPersen(item.bobot_ahp)}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-sm font-bold text-slate-600">
                        {item.urutan ?? "-"}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge aktif={item.aktif} />
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
                            onClick={() => handleToggleStatus(item)}
                            disabled={isSubmitting}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                              item.aktif
                                ? "border-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                                : "border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                            }`}
                            title={item.aktif ? "Nonaktifkan" : "Aktifkan"}
                          >
                            {item.aktif ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-600 hover:text-white"
                            title="Nonaktifkan"
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
        </div>
      </section>

      {modalMode === "create" || modalMode === "edit" ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            aria-label="Tutup modal"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-100 bg-white shadow-2xl">
            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {modalMode === "create" ? "Tambah Kriteria" : "Edit Kriteria"}
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  {modalMode === "create"
                    ? "Tambah Kriteria Baru"
                    : "Ubah Kriteria"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Atur parameter yang akan digunakan dalam perhitungan SPK.
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
                    Kode Kriteria
                  </span>
                  <input
                    value={form.kode}
                    onChange={(event) =>
                      updateForm("kode", event.target.value)
                    }
                    placeholder="Contoh: C1"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium uppercase outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Nama Kriteria
                  </span>
                  <input
                    value={form.nama}
                    onChange={(event) =>
                      updateForm("nama", event.target.value)
                    }
                    placeholder="Contoh: Penghasilan"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Jenis
                  </span>
                  <select
                    value={form.jenis}
                    onChange={(event) =>
                      updateForm("jenis", event.target.value as JenisKriteria)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="benefit">Benefit</option>
                    <option value="cost">Cost</option>
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    Benefit = semakin besar semakin baik. Cost = semakin kecil
                    semakin baik.
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Bobot AHP
                  </span>
                  <input
                    value={form.bobot_ahp}
                    onChange={(event) =>
                      updateForm("bobot_ahp", event.target.value)
                    }
                    placeholder="Contoh: 0.25"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                  <p className="text-xs leading-5 text-slate-400">
                    Masukkan angka 0 sampai 1. Contoh 0.25 berarti 25%.
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-slate-700">
                    Urutan
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.urutan}
                    onChange={(event) =>
                      updateForm("urutan", event.target.value)
                    }
                    placeholder="Contoh: 1"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(event) =>
                      updateForm("aktif", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Aktifkan kriteria
                  </span>
                </label>
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
                    ? "Simpan Kriteria"
                    : "Update Kriteria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {modalMode === "detail" && selectedKriteria ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Detail Kriteria
                </p>

                <h3 className="mt-2 [font-family:var(--font-oswald)] text-3xl font-semibold text-slate-950">
                  {selectedKriteria.nama}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Kode: {selectedKriteria.kode}
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

            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Jenis
                </p>
                <div className="mt-2">
                  <JenisBadge jenis={selectedKriteria.jenis} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Bobot AHP
                </p>
                <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                  {formatBobot(selectedKriteria.bobot_ahp)}
                </p>
                <p className="text-sm text-slate-500">
                  {formatPersen(selectedKriteria.bobot_ahp)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge aktif={selectedKriteria.aktif} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Sub Kriteria
                </p>

                {selectedKriteria.sub_kriteria &&
                selectedKriteria.sub_kriteria.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {selectedKriteria.sub_kriteria.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-slate-700">
                          {sub.nama}
                        </span>
                        <span className="font-bold text-emerald-700">
                          {sub.nilai}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Belum ada sub-kriteria.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {modalMode === "delete" && selectedKriteria ? (
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
                  Nonaktifkan Kriteria?
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Kriteria{" "}
                  <span className="font-bold text-slate-900">
                    {selectedKriteria.nama}
                  </span>{" "}
                  akan dinonaktifkan dan tidak dipakai pada perhitungan
                  berikutnya.
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
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Memproses..." : "Nonaktifkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}