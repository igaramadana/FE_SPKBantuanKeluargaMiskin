"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { bikinKriteriaBaru } from "@/services/kriteria.service";
import type { JenisKriteria } from "@/types/kriteria";

type KriteriaFormState = {
  kode: string;
  nama: string;
  jenis: JenisKriteria;
  aktif: boolean;
  urutan: string;
};

const defaultFormState: KriteriaFormState = {
  kode: "",
  nama: "",
  jenis: "benefit",
  aktif: true,
  urutan: "",
};

export function KriteriaCreateButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<KriteriaFormState>(
    defaultFormState
  );

  const handleOpen = () => {
    setError("");
    setFormState(defaultFormState);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChange = (
    field: keyof KriteriaFormState,
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
    };

    try {
      await bikinKriteriaBaru(payload);
      router.refresh();
      setIsOpen(false);
      setFormState(defaultFormState);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Gagal menambahkan kriteria baru."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#1B5E20] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#164B1A]"
      >
        <Plus className="h-4 w-4" />
        Tambah Kriteria
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={handleClose}
            role="presentation"
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Tambah Kriteria
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Isi data kriteria baru untuk perhitungan SPK.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
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
                  placeholder="Contoh: C1"
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
                  placeholder="Contoh: Penghasilan"
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
                  placeholder="Contoh: 1"
                  min={1}
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
                  onClick={handleClose}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
    </>
  );
}
