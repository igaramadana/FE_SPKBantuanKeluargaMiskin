"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateKriteria } from "@/services/kriteria.service";

type KriteriaStatusActionProps = {
  kriteriaId: string;
  isActive: boolean;
};

export function KriteriaStatusAction({
  kriteriaId,
  isActive,
}: KriteriaStatusActionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await updateKriteria(kriteriaId, { aktif: !isActive });
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui status."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenConfirm = () => {
    setError("");
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isSubmitting) {
      return;
    }
    setIsConfirmOpen(false);
  };

  const actionLabel = isActive ? "Nonaktifkan" : "Aktifkan";
  const actionDescription = isActive
    ? "Kriteria ini akan berhenti dipakai pada perhitungan."
    : "Kriteria ini akan digunakan pada perhitungan.";

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleOpenConfirm}
        disabled={isSubmitting}
        className={`rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isActive
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses
          </span>
        ) : isActive ? (
          "Nonaktifkan"
        ) : (
          "Aktifkan"
        )}
      </button>

      {error ? (
        <span className="text-xs font-semibold text-red-600">
          {error}
        </span>
      ) : null}

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={handleCloseConfirm}
            role="presentation"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Konfirmasi Status
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {actionDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Tutup"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Apakah kamu yakin ingin {actionLabel.toLowerCase()} kriteria ini?
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={isSubmitting}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#1B5E20] hover:bg-[#164B1A]"
                }`}
              >
                {isSubmitting ? "Memproses..." : actionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
