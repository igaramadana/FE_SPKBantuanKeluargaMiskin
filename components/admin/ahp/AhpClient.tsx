"use client";

import { hitungAhp } from "@/services/ahp.service";
import type { AhpCalculateResponse } from "@/types/ahp";
import type { Kriteria } from "@/types/kriteria";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  RefreshCcw,
  Save,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AhpClientProps = {
  kriteria: Kriteria[];
  errorMessage?: string;
};

type PairItem = {
  a: Kriteria;
  b: Kriteria;
};

type ComparisonOption = {
  value: number;
  shortLabel: string;
  title: string;
  description: string;
  side: "left" | "middle" | "right";
};

const comparisonOptions: ComparisonOption[] = [
  {
    value: 9,
    shortLabel: "Kiri mutlak lebih penting",
    title: "Kriteria kiri mutlak lebih penting",
    description: "Pilih jika kriteria kiri benar-benar menjadi faktor utama.",
    side: "left",
  },
  {
    value: 7,
    shortLabel: "Kiri sangat lebih penting",
    title: "Kriteria kiri sangat lebih penting",
    description: "Pilih jika kriteria kiri jelas jauh lebih berpengaruh.",
    side: "left",
  },
  {
    value: 5,
    shortLabel: "Kiri lebih penting",
    title: "Kriteria kiri lebih penting",
    description: "Pilih jika kriteria kiri lebih diprioritaskan.",
    side: "left",
  },
  {
    value: 3,
    shortLabel: "Kiri sedikit lebih penting",
    title: "Kriteria kiri sedikit lebih penting",
    description: "Pilih jika kriteria kiri agak lebih penting.",
    side: "left",
  },
  {
    value: 1,
    shortLabel: "Sama penting",
    title: "Keduanya sama penting",
    description: "Pilih jika dua kriteria ini punya pengaruh yang seimbang.",
    side: "middle",
  },
  {
    value: 1 / 3,
    shortLabel: "Kanan sedikit lebih penting",
    title: "Kriteria kanan sedikit lebih penting",
    description: "Pilih jika kriteria kanan agak lebih penting.",
    side: "right",
  },
  {
    value: 1 / 5,
    shortLabel: "Kanan lebih penting",
    title: "Kriteria kanan lebih penting",
    description: "Pilih jika kriteria kanan lebih diprioritaskan.",
    side: "right",
  },
  {
    value: 1 / 7,
    shortLabel: "Kanan sangat lebih penting",
    title: "Kriteria kanan sangat lebih penting",
    description: "Pilih jika kriteria kanan jelas jauh lebih berpengaruh.",
    side: "right",
  },
  {
    value: 1 / 9,
    shortLabel: "Kanan mutlak lebih penting",
    title: "Kriteria kanan mutlak lebih penting",
    description: "Pilih jika kriteria kanan benar-benar menjadi faktor utama.",
    side: "right",
  },
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

function isSameComparisonValue(a: string | number | undefined, b: number) {
  return Math.abs(Number(a ?? 1) - b) < 0.000001;
}

function getComparisonLabel(value: string | number | undefined) {
  const found = comparisonOptions.find((item) =>
    isSameComparisonValue(value, item.value)
  );

  return found?.shortLabel ?? "Sama penting";
}

function getComparisonSide(value: string | number | undefined) {
  const found = comparisonOptions.find((item) =>
    isSameComparisonValue(value, item.value)
  );

  return found?.side ?? "middle";
}

function getJenisLabel(jenis: string) {
  return jenis === "benefit" ? "Benefit" : "Cost";
}

function getJenisDescription(jenis: string) {
  return jenis === "benefit"
    ? "Nilai besar semakin baik/semakin layak."
    : "Nilai kecil semakin baik/semakin layak.";
}

export function AhpClient({ kriteria, errorMessage }: AhpClientProps) {
  const router = useRouter();

  const pairs = useMemo<PairItem[]>(() => {
    const result: PairItem[] = [];

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

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [result, setResult] = useState<AhpCalculateResponse | null>(null);
  const [message, setMessage] = useState(errorMessage || "");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">(
    errorMessage ? "error" : "info"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedMatrix, setShowAdvancedMatrix] = useState(false);

  const totalBobotSekarang = kriteria.reduce(
    (total, item) => total + toSafeNumber(item.bobot_ahp),
    0
  );

  const isTotalBobotValid = Math.abs(totalBobotSekarang - 1) <= 0.01;

  const jumlahKriteriaDenganBobot = kriteria.filter(
    (item) => toSafeNumber(item.bobot_ahp) > 0
  ).length;

  const activePair = pairs[activePairIndex];
  const activePairKey = activePair
    ? `${activePair.a.id}_${activePair.b.id}`
    : "";
  const answeredPairs = Object.values(values).filter(
    (value) => value && Number(value) !== 1
  ).length;
  const progressPercent = pairs.length
    ? ((activePairIndex + 1) / pairs.length) * 100
    : 0;

  const handleChange = (key: string, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setResult(null);
  };

  const handleReset = () => {
    const resetValues: Record<string, string> = {};

    pairs.forEach((pair) => {
      resetValues[`${pair.a.id}_${pair.b.id}`] = "1";
    });

    setValues(resetValues);
    setActivePairIndex(0);
    setResult(null);
    setMessage("Semua perbandingan dikembalikan menjadi sama penting.");
    setMessageType("info");
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

      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Menu Bobot AHP
            </div>

            <h1 className="mt-4 [font-family:var(--font-oswald)] text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
              Tentukan prioritas kriteria dengan cara membandingkan 2 kriteria
              sekaligus.
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              AHP dipakai untuk mencari bobot kriteria. Kamu tidak perlu isi
              rumus manual. Cukup jawab pertanyaan sederhana: dari dua kriteria
              yang muncul, mana yang lebih penting untuk menentukan keluarga
              miskin yang layak menerima bantuan?
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  Langkah 1
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  Bandingkan kriteria
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pilih kiri, kanan, atau sama penting.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  Langkah 2
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  Preview hasil
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Cek apakah jawaban sudah konsisten.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  Langkah 3
                </p>
                <p className="mt-2 font-bold text-slate-900">
                  Simpan bobot
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Bobot valid akan dipakai saat SAW.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-100 bg-emerald-700 p-6 text-white lg:border-l lg:border-t-0 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100">
              Status Bobot Sekarang
            </p>
            <p className="mt-3 [font-family:var(--font-oswald)] text-5xl font-bold">
              {formatNumber(totalBobotSekarang)}
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-50">
              {isTotalBobotValid
                ? "Total bobot sudah valid untuk perhitungan SAW."
                : "Total bobot belum valid. Hitung dan simpan bobot AHP dulu."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold text-emerald-100">
                  Kriteria aktif
                </p>
                <p className="mt-1 text-3xl font-black">{kriteria.length}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold text-emerald-100">
                  Perbandingan
                </p>
                <p className="mt-1 text-3xl font-black">{pairs.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
              <HelpCircle className="h-4 w-4" />
              Panduan Cepat
            </div>
            <h2 className="mt-3 [font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Cara memilih nilai perbandingan
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Pilih “sama penting”</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kalau dua kriteria punya pengaruh yang seimbang untuk menentukan
              penerima bantuan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Pilih “lebih penting”</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kalau salah satu kriteria lebih perlu diprioritaskan daripada
              kriteria lawannya.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="font-bold text-slate-950">CR wajib maksimal 0.1</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              CR adalah ukuran konsistensi jawaban. Jika CR lebih dari 0.1,
              ubah beberapa jawaban yang terasa bertentangan.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
              <Scale className="h-4 w-4" />
              Perbandingan {activePairIndex + 1} dari {pairs.length}
            </div>
            <h2 className="mt-3 [font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Mana yang lebih penting?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Pilih tingkat kepentingan yang paling sesuai. Default-nya adalah
              sama penting, jadi ubah hanya jika salah satu kriteria memang
              lebih diprioritaskan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Semua
          </button>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {activePair ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.4fr_1fr] lg:items-stretch">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Kriteria Kiri
              </p>
              <p className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                {activePair.a.kode}
              </p>
              <p className="mt-1 font-bold text-slate-800">
                {activePair.a.nama}
              </p>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                {getJenisLabel(activePair.a.jenis)}: {getJenisDescription(activePair.a.jenis)}
              </p>
            </div>

            <div className="flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 p-5 text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Pilihan Saat Ini
                </p>
                <p className="mt-2 text-sm font-black text-slate-900">
                  {getComparisonLabel(values[activePairKey])}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {getComparisonSide(values[activePairKey]) === "left"
                    ? "Kriteria kiri diprioritaskan"
                    : getComparisonSide(values[activePairKey]) === "right"
                      ? "Kriteria kanan diprioritaskan"
                      : "Keduanya seimbang"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                Kriteria Kanan
              </p>
              <p className="mt-3 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
                {activePair.b.kode}
              </p>
              <p className="mt-1 font-bold text-slate-800">
                {activePair.b.nama}
              </p>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                {getJenisLabel(activePair.b.jenis)}: {getJenisDescription(activePair.b.jenis)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {comparisonOptions.map((option) => {
            const isSelected = isSameComparisonValue(
              values[activePairKey],
              option.value
            );

            return (
              <button
                key={option.title}
                type="button"
                onClick={() => handleChange(activePairKey, String(option.value))}
                disabled={!activePair || isSubmitting}
                className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                <p className="text-sm font-black">{option.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 opacity-80">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <button
            type="button"
            onClick={() => setActivePairIndex((current) => Math.max(0, current - 1))}
            disabled={activePairIndex === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <div className="text-center text-xs font-bold text-slate-500">
            {answeredPairs} dari {pairs.length} perbandingan diubah dari default
            sama penting.
          </div>

          <button
            type="button"
            onClick={() =>
              setActivePairIndex((current) => Math.min(pairs.length - 1, current + 1))
            }
            disabled={activePairIndex === pairs.length - 1 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Selanjutnya
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
              <Target className="h-4 w-4" />
              Simpan ke Database
            </div>
            <h2 className="mt-3 [font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Hitung bobot AHP
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Gunakan Preview Hitung untuk mengecek hasil tanpa menyimpan.
              Setelah status konsisten, klik Hitung & Simpan Bobot supaya bobot
              baru dipakai oleh perhitungan SAW.
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

        {!isTotalBobotValid ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Total bobot aktif belum mendekati 1.0000. Setelah matrix AHP
              konsisten, simpan bobot baru agar menu SAW bisa menghasilkan
              ranking yang lebih tepat.
            </p>
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h3 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
                Hasil AHP Terbaru
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Fokus utamanya adalah status konsistensi. Jika konsisten, bobot
                aman dipakai. Jika tidak konsisten, ubah beberapa pilihan yang
                terasa bertentangan lalu hitung ulang.
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-right ${
                result.is_consistent
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em]">
                Status
              </p>
              <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
                {result.is_consistent ? "Konsisten" : "Belum Konsisten"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                CR / Konsistensi
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {formatNumber(result.consistency_ratio)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Valid jika CR ≤ 0.1000.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                CI
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {formatNumber(result.consistency_index)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Nilai bantu untuk menghitung CR.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                Lambda Max
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {formatNumber(result.lambda_max)}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Nilai teknis hasil matrix AHP.
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
                  <th className="px-4 py-3">Prioritas</th>
                </tr>
              </thead>

              <tbody>
                {[...result.weights]
                  .sort((a, b) => toSafeNumber(b.bobot) - toSafeNumber(a.bobot))
                  .map((item, index) => (
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
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                          #{index + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!result.is_consistent ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              Jawaban belum konsisten. Contoh masalah: C1 dipilih lebih penting
              dari C2, C2 lebih penting dari C3, tapi C3 malah jauh lebih
              penting dari C1. Coba kurangi pilihan yang terlalu ekstrem, lalu
              preview ulang.
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Bobot Aktif di Database
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Bobot di bawah ini adalah bobot yang sedang dipakai oleh SAW saat
              ini.
            </p>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-right ${
              isTotalBobotValid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.12em]">
              Total Bobot
            </p>
            <p className="mt-1 [font-family:var(--font-oswald)] text-3xl font-bold">
              {formatNumber(totalBobotSekarang)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Kriteria Aktif
            </p>
            <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              {kriteria.length}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Bobot Terisi
            </p>
            <p className="mt-2 [font-family:var(--font-oswald)] text-3xl font-bold text-slate-950">
              {jumlahKriteriaDenganBobot}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Total Persen
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
              {[...kriteria]
                .sort(
                  (a, b) =>
                    toSafeNumber(b.bobot_ahp) - toSafeNumber(a.bobot_ahp)
                )
                .map((item) => {
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
                          {getJenisLabel(item.jenis)}
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
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <button
          type="button"
          onClick={() => setShowAdvancedMatrix((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <h2 className="[font-family:var(--font-oswald)] text-2xl font-bold text-slate-950">
              Ringkasan Perbandingan
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Bagian ini opsional. Dibuka kalau kamu ingin melihat semua
              jawaban dalam bentuk tabel.
            </p>
          </div>
          <span className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
            {showAdvancedMatrix ? "Tutup" : "Lihat"}
          </span>
        </button>

        {showAdvancedMatrix ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Kriteria Kiri</th>
                  <th className="px-4 py-3">Pilihan</th>
                  <th className="px-4 py-3">Kriteria Kanan</th>
                </tr>
              </thead>

              <tbody>
                {pairs.map((pair, index) => {
                  const key = `${pair.a.id}_${pair.b.id}`;

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
                        <select
                          value={values[key] || "1"}
                          onChange={(event) =>
                            handleChange(key, event.target.value)
                          }
                          className="w-full min-w-60 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500"
                        >
                          {comparisonOptions.map((option) => (
                            <option
                              key={option.title}
                              value={String(option.value)}
                            >
                              {option.shortLabel}
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
        ) : null}
      </section>
    </div>
  );
}
