"use client";

import { hitungAhp } from "@/services/ahp.service";
import type { AhpCalculateResponse } from "@/types/ahp";
import type { Kriteria } from "@/types/kriteria";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

type AhpClientProps = {
  kriteria: Kriteria[];
  errorMessage?: string;
};

const nilaiOptions = [
  { value: 1, label: "1 - Sama penting" },
  { value: 2, label: "2 - Di antara 1 dan 3" },
  { value: 3, label: "3 - Sedikit lebih penting" },
  { value: 4, label: "4 - Di antara 3 dan 5" },
  { value: 5, label: "5 - Lebih penting" },
  { value: 6, label: "6 - Di antara 5 dan 7" },
  { value: 7, label: "7 - Sangat penting" },
  { value: 8, label: "8 - Di antara 7 dan 9" },
  { value: 9, label: "9 - Mutlak lebih penting" },
];

function toSafeNumber(value?: number | string | null) {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

function formatNumber(value?: number | string | null) {
  return toSafeNumber(value).toFixed(4);
}

function formatPercent(value?: number | string | null) {
  return `${(toSafeNumber(value) * 100).toFixed(2)}%`;
}

function getNilaiLabel(value: string | number | undefined) {
  const parsed = Number(value ?? 1);
  const found = nilaiOptions.find((item) => item.value === parsed);

  return found?.label ?? `${parsed}`;
}

export function AhpClient({ kriteria, errorMessage }: AhpClientProps) {
  const router = useRouter();

  const pairs = useMemo(() => {
    const result: { a: Kriteria; b: Kriteria }[] = [];

    for (let i = 0; i < kriteria.length; i++) {
      for (let j = i + 1; j < kriteria.length; j++) {
        result.push({
          a: kriteria[i],
          b: kriteria[j],
        });
      }
    }

    return result;
  }, [kriteria]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    pairs.forEach((pair) => {
      initial[`${pair.a.id}_${pair.b.id}`] = "1";
    });

    return initial;
  });

  const [result, setResult] = useState<AhpCalculateResponse | null>(null);
  const [message, setMessage] = useState(errorMessage || "");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">(
    errorMessage ? "error" : "info"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBobotSekarang = kriteria.reduce(
    (total, item) => total + toSafeNumber(item.bobot_ahp),
    0
  );

  const isTotalBobotValid = Math.abs(totalBobotSekarang - 1) <= 0.01;

  const jumlahKriteriaDenganBobot = kriteria.filter(
    (item) => toSafeNumber(item.bobot_ahp) > 0
  ).length;

  const handleChange = (key: string, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCalculate = async (simpanBobot: boolean) => {
    setIsSubmitting(true);
    setMessage("");
    setResult(null);

    try {
      const payload = {
        simpan_bobot: simpanBobot,
        perbandingan: pairs.map((pair) => {
          const key = `${pair.a.id}_${pair.b.id}`;

          return {
            kriteria_1_id: pair.a.id,
            kriteria_2_id: pair.b.id,
            nilai: Number(values[key] || 1),
          };
        }),
      };

      const response = await hitungAhp(payload);

      setResult(response);
      setMessage(response.message);
      setMessageType(response.is_consistent ? "success" : "error");

      if (simpanBobot && response.is_consistent) {
        router.refresh();
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menghitung AHP."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (kriteria.length < 2) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
        Minimal butuh 2 kriteria aktif untuk menghitung AHP.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{message}</p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Bobot AHP Aktif Saat Ini
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ini adalah bobot yang sedang tersimpan di database dan akan
              dipakai saat perhitungan SAW.
            </p>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-right ${
              isTotalBobotValid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              Total Bobot
            </p>
            <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
              {formatNumber(totalBobotSekarang)}
            </p>
            <p className="mt-1 text-xs font-semibold">
              {isTotalBobotValid ? "Valid untuk SAW" : "Belum mendekati 1.0000"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Kriteria Aktif
            </p>
            <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              {kriteria.length}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Bobot Terisi
            </p>
            <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              {jumlahKriteriaDenganBobot}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Persentase Total
            </p>
            <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              {formatPercent(totalBobotSekarang)}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Kriteria</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Bobot</th>
                <th className="px-4 py-3">Persen</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {kriteria.map((item) => {
                const bobot = toSafeNumber(item.bobot_ahp);
                const hasBobot = bobot > 0;

                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      {item.kode}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {item.nama}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          item.jenis === "benefit"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.jenis}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {formatNumber(bobot)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatPercent(bobot)}
                    </td>

                    <td className="px-4 py-3">
                      {hasBobot ? (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Terisi
                        </span>
                      ) : (
                        <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                          Belum Ada Bobot
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isTotalBobotValid ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Total bobot saat ini belum mendekati 1.0000. Klik tombol{" "}
            <span className="font-black">Hitung & Simpan Bobot</span> setelah
            matrix AHP konsisten agar bobot bisa dipakai oleh SAW.
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Matrix Perbandingan Berpasangan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Isi nilai perbandingan antar kriteria. Bobot hanya bisa disimpan
              kalau CR ≤ 0.1.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCalculate(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              Preview Hitung
            </button>

            <button
              type="button"
              onClick={() => handleCalculate(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Hitung & Simpan Bobot
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">Kriteria A</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Kriteria B</th>
              </tr>
            </thead>

            <tbody>
              {pairs.map((pair) => {
                const key = `${pair.a.id}_${pair.b.id}`;

                return (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className="font-bold text-emerald-700">
                        {pair.a.kode}
                      </span>{" "}
                      - {pair.a.nama}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={values[key] || "1"}
                        onChange={(event) =>
                          handleChange(key, event.target.value)
                        }
                        className="w-full min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                      >
                        {nilaiOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className="font-bold text-emerald-700">
                        {pair.b.kode}
                      </span>{" "}
                      - {pair.b.nama}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Preview Nilai Perbandingan
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ini adalah daftar nilai perbandingan yang sedang dipilih dan akan
              dikirim ke proses hitung AHP.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-emerald-700">
            <p className="text-xs font-bold uppercase tracking-[0.12em]">
              Total Perbandingan
            </p>
            <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
              {pairs.length}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kriteria A</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Kriteria B</th>
              </tr>
            </thead>

            <tbody>
              {pairs.map((pair, index) => {
                const key = `${pair.a.id}_${pair.b.id}`;
                const selectedValue = values[key] || "1";

                return (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className="font-bold text-emerald-700">
                        {pair.a.kode}
                      </span>{" "}
                      - {pair.a.nama}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {getNilaiLabel(selectedValue)}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className="font-bold text-emerald-700">
                        {pair.b.kode}
                      </span>{" "}
                      - {pair.b.nama}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {result ? (
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
            Hasil AHP Terbaru
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ini adalah hasil perhitungan AHP dari matrix yang baru kamu input.
            Kalau kamu klik Preview Hitung, bobot database belum berubah. Kalau
            klik Hitung & Simpan Bobot, bobot akan disimpan ke database.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Lambda Max
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {formatNumber(result.lambda_max)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                CI
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {formatNumber(result.consistency_index)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                CR
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {formatNumber(result.consistency_ratio)}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                result.is_consistent
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em]">
                Status
              </p>
              <p className="mt-2 text-2xl font-bold">
                {result.is_consistent ? "Konsisten" : "Tidak Konsisten"}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Kriteria</th>
                  <th className="px-4 py-3">Bobot Baru</th>
                  <th className="px-4 py-3">Persen</th>
                </tr>
              </thead>

              <tbody>
                {result.weights.map((item) => (
                  <tr
                    key={item.kriteria_id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      {item.kode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatNumber(item.bobot)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatPercent(item.bobot)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!result.is_consistent ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Matrix AHP belum konsisten. Ubah beberapa nilai perbandingan,
              lalu hitung ulang sampai CR ≤ 0.1.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}