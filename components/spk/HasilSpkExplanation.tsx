import {
  getMethodExplanation,
  getRankingExplanation,
  getScoreExplanation,
  getStatusSpkClass,
  getStatusSpkDescription,
  getStatusSpkTitle,
  formatStatusSpk,
} from "@/lib/spk-explanation";

type HasilSpkExplanationProps = {
  status?: string | null;
  ranking?: number | null;
  totalNilai?: number | null;
  showMethodInfo?: boolean;
};

function formatNilai(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return value.toFixed(4);
}

export function HasilSpkExplanation({
  status,
  ranking,
  totalNilai,
  showMethodInfo = true,
}: HasilSpkExplanationProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Penjelasan Hasil
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-950">
            {getStatusSpkTitle(status)}
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {getStatusSpkDescription(status)}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-md border px-3 py-1.5 text-xs font-bold ${getStatusSpkClass(
            status
          )}`}
        >
          {formatStatusSpk(status)}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Nilai Akhir
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatNilai(totalNilai)}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {getScoreExplanation(totalNilai)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Ranking
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {ranking || "-"}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {getRankingExplanation(ranking)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Status
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatStatusSpk(status)}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Status ini ditentukan dari mode penentuan hasil, seperti kuota atau
            threshold yang dipilih admin saat perhitungan.
          </p>
        </div>
      </div>

      {showMethodInfo ? (
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-800">
          <b>Metode:</b> {getMethodExplanation()}
        </div>
      ) : null}
    </section>
  );
}