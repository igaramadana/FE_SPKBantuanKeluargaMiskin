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
  const [error, setError] = useState("");

  const handleToggle = async () => {
    const actionLabel = isActive ? "menonaktifkan" : "mengaktifkan";
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${actionLabel} kriteria ini?`
    );

    if (!confirmed) {
      return;
    }

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

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleToggle}
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
    </div>
  );
}
