"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import type { JenisKriteria, Kriteria } from "@/types/kriteria";
import { hapusKriteria, updateKriteria } from "@/services/kriteria.service";
import { KriteriaStatusAction } from "@/components/admin/KriteriaStatusAction";

type KriteriaRowActionsProps = {
  kriteria: Kriteria;
};

type KriteriaEditState = {
  kode: string;
  nama: string;
  jenis: JenisKriteria;
  aktif: boolean;
  urutan: string;
  bobot_ahp: string;
};

const formatBobot = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return parsed.toFixed(4);
};

export function KriteriaRowActions({ kriteria }: KriteriaRowActionsProps) {
  const router = useRouter();

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [formState, setFormState] = useState<KriteriaEditState>({
    kode: kriteria.kode,
    nama: kriteria.nama,
    jenis: kriteria.jenis,
    aktif: kriteria.aktif,
    urutan: kriteria.urutan?.toString() ?? "",
    bobot_ahp: kriteria.bobot_ahp?.toString() ?? "",
  });

  const handleOpenEdit = () => {
    setError("");
    setFormState({
      kode: kriteria.kode,
      nama: kriteria.nama,
      jenis: kriteria.jenis,
      aktif: kriteria.aktif,
      urutan: kriteria.urutan?.toString() ?? "",
      bobot_ahp: kriteria.bobot_ahp?.toString() ?? "",
    });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (isSubmitting) {
      return;
    }

    setIsEditOpen(false);
  };

  const handleOpenDelete = () => {
    setDeleteError("");
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteOpen(false);
  };

  const handleChange = (
    field: keyof KriteriaEditState,
    value: string | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.kode.trim() || !formState.nama.trim()) {
      setError("Kode dan nama kriteria wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      kode: formState.kode.trim(),
      nama: formState.nama.trim(),
      jenis: formState.jenis,
      aktif: formState.aktif,
      urutan: formState.urutan ? Number(formState.urutan) : undefined,
      bobot_ahp: formState.bobot_ahp.trim()
        ? formState.bobot_ahp.trim()
        : null,
    };

    try {
      await updateKriteria(kriteria.id, payload);
      router.refresh();
      setIsEditOpen(false);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui kriteria."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await hapusKriteria(kriteria.id);
      router.refresh();
      setIsDeleteOpen(false);
    } catch (deleteError) {
      setDeleteError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gagal menghapus kriteria."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const subKriteria = kriteria.sub_kriteria ?? [];

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDetailOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label="Lihat detail kriteria"
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleOpenEdit}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
          aria-label="Edit kriteria"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleOpenDelete}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 transition hover:bg-rose-100"
          aria-label="Hapus kriteria"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <KriteriaStatusAction
        kriteriaId={kriteria.id}
        isActive={kriteria.aktif}
      />

      {isDetailOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsDetailOpen(false)}
            role="presentation"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Detail Kriteria
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Informasi lengkap kriteria yang dipilih.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-sm text-slate-700">
              <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Kode: {kriteria.kode}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Jenis: {kriteria.jenis}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Bobot: {formatBobot(kriteria.bobot_ahp)}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Urutan: {kriteria.urutan ?? "-"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      kriteria.aktif
                        ? "bg-green-100 text-green-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {kriteria.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nama Kriteria
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {kriteria.nama}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status Penggunaan
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {kriteria.aktif
                      ? "Digunakan pada perhitungan"
                      : "Tidak dipakai sementara"}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Sub Kriteria
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Total {subKriteria.length} item
                    </p>
                  </div>
                </div>

                {subKriteria.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {subKriteria.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500">
                            {index + 1}
                          </span>

                          <span className="font-semibold text-slate-700">
                            {item.nama}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {item.nilai}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Belum ada sub kriteria.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={handleCloseDelete}
            role="presentation"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Hapus Kriteria
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tindakan ini akan menghapus kriteria beserta detailnya.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDelete}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Apakah kamu yakin ingin menghapus kriteria{" "}
              <span className="font-semibold text-slate-900">
                {kriteria.nama}
              </span>
              ?
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDelete}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={isDeleting}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={handleCloseEdit}
            role="presentation"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Kriteria
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui informasi kriteria sesuai kebutuhan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Kode Kriteria
                </label>
                <input
                  type="text"
                  value={formState.kode}
                  onChange={(event) =>
                    handleChange("kode", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[#1B5E20] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nama Kriteria
                </label>
                <input
                  type="text"
                  value={formState.nama}
                  onChange={(event) =>
                    handleChange("nama", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[#1B5E20] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Jenis Kriteria
                </label>
                <select
                  value={formState.jenis}
                  onChange={(event) =>
                    handleChange("jenis", event.target.value as JenisKriteria)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[#1B5E20] focus:outline-none"
                >
                  <option value="benefit">Benefit</option>
                  <option value="cost">Cost</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Urutan
                </label>
                <input
                  type="number"
                  value={formState.urutan}
                  onChange={(event) =>
                    handleChange("urutan", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[#1B5E20] focus:outline-none"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Bobot AHP
                </label>
                <input
                  type="number"
                  value={formState.bobot_ahp}
                  onChange={(event) =>
                    handleChange("bobot_ahp", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-[#1B5E20] focus:outline-none"
                  step="0.0001"
                  min={0}
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.aktif}
                  onChange={(event) =>
                    handleChange("aktif", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#1B5E20]"
                />
                Aktifkan kriteria
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#164B1A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}