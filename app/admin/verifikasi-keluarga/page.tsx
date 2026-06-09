"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, RefreshCw, Search, UserCheck, XCircle } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";

type StatusVerifikasi = "pending" | "terverifikasi" | "ditolak" | "perlu_perbaikan";

type Keluarga = {
  id: string;
  user_id?: string | null;
  nama_kepala_keluarga: string;
  nik: string;
  alamat?: string | null;
  kelurahan?: string | null;
  dusun?: string | null;
  jumlah_anggota?: number | null;
  status_verifikasi: StatusVerifikasi;
  catatan_admin?: string | null;
};

type AkunUserInfo = {
  created: boolean;
  linked: boolean;
  message: string;
  user?: {
    id: string;
    nama: string;
    email: string;
    role: "admin" | "user";
    must_change_password: boolean;
  } | null;
  login?: {
    identifier: string;
    password_awal?: string | null;
    keterangan?: string | null;
  } | null;
};

type VerifikasiResponse = {
  message: string;
  data: Keluarga;
  akun_user?: AkunUserInfo | null;
};

const statusOptions: { label: string; value: StatusVerifikasi }[] = [
  { label: "Pending", value: "pending" },
  { label: "Terverifikasi", value: "terverifikasi" },
  { label: "Perlu Perbaikan", value: "perlu_perbaikan" },
  { label: "Ditolak", value: "ditolak" },
];

function statusClass(status: StatusVerifikasi) {
  if (status === "terverifikasi") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (status === "ditolak") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (status === "perlu_perbaikan") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function statusLabel(status: StatusVerifikasi) {
  return statusOptions.find((item) => item.value === status)?.label || status;
}

export default function VerifikasiKeluargaPage() {
  const [data, setData] = useState<Keluarga[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusVerifikasi | "">("pending");
  const [selectedKeluarga, setSelectedKeluarga] = useState<Keluarga | null>(null);
  const [catatanAdmin, setCatatanAdmin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAccount, setLastAccount] = useState<AkunUserInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCount = useMemo(() => data.length, [data]);

  async function loadData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await apiGet<Keluarga[]>("/keluarga", {
        search,
        status_verifikasi: statusFilter || undefined,
      });

      setData(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memuat data keluarga.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitVerifikasi(status: StatusVerifikasi) {
    if (!selectedKeluarga) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setLastAccount(null);

    try {
      const result = await apiPatch<VerifikasiResponse>(`/keluarga/${selectedKeluarga.id}/verifikasi`, {
        status_verifikasi: status,
        catatan_admin: catatanAdmin || null,
      });

      setLastAccount(result.akun_user || null);
      setSelectedKeluarga(result.data);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui verifikasi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDetail(item: Keluarga) {
    setSelectedKeluarga(item);
    setCatatanAdmin(item.catatan_admin || "");
    setLastAccount(null);
    setErrorMessage("");
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-700">
              <ClipboardCheck className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Verifikasi Data</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Verifikasi Keluarga</h1>
            <p className="mt-1 text-sm text-slate-500">
              Saat status diubah menjadi terverifikasi, sistem otomatis membuat akun user warga.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadData();
                  }
                }}
                placeholder="Cari nama kepala keluarga atau NIK..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusVerifikasi | "")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="">Semua Status</option>
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadData}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Cari
            </button>
          </div>

          <div className="mb-3 text-sm text-slate-500">
            Total data tampil: <span className="font-semibold text-slate-800">{filteredCount}</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Keluarga</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Akun</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Memuat data...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tidak ada data keluarga.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && data.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{item.nama_kepala_keluarga}</div>
                      <div className="text-xs text-slate-500">NIK: {item.nik}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{item.kelurahan || "-"}</div>
                      <div className="text-xs text-slate-400">{item.dusun || "-"}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(item.status_verifikasi)}`}>
                        {statusLabel(item.status_verifikasi)}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.user_id ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <UserCheck className="h-3.5 w-3.5" />
                          Sudah ada
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Belum ada</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedKeluarga ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center text-slate-500">
              <ClipboardCheck className="mb-3 h-10 w-10 text-slate-300" />
              <p className="font-semibold text-slate-700">Pilih data keluarga</p>
              <p className="mt-1 text-sm">Klik tombol detail untuk melakukan verifikasi.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedKeluarga.nama_kepala_keluarga}</h2>
                <p className="text-sm text-slate-500">NIK: {selectedKeluarga.nik}</p>
                <p className="mt-2 text-sm text-slate-600">{selectedKeluarga.alamat || "Alamat belum diisi."}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Kelurahan</p>
                  <p className="font-semibold text-slate-800">{selectedKeluarga.kelurahan || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Dusun</p>
                  <p className="font-semibold text-slate-800">{selectedKeluarga.dusun || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Jumlah Anggota</p>
                  <p className="font-semibold text-slate-800">{selectedKeluarga.jumlah_anggota || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold text-slate-800">{statusLabel(selectedKeluarga.status_verifikasi)}</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Catatan Admin</label>
                <textarea
                  value={catatanAdmin}
                  onChange={(event) => setCatatanAdmin(event.target.value)}
                  placeholder="Contoh: Data sudah sesuai dan dapat diproses dalam perhitungan SPK."
                  className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
                />
              </div>

              {lastAccount ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <div className="mb-2 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    {lastAccount.message}
                  </div>
                  <div className="space-y-1">
                    <p>
                      Login Warga: <span className="font-bold">{lastAccount.login?.identifier || "-"}</span>
                    </p>
                    {lastAccount.login?.password_awal ? (
                      <p>
                        Password Awal: <span className="font-bold">{lastAccount.login.password_awal}</span>
                      </p>
                    ) : null}
                    <p className="text-xs text-green-700">{lastAccount.login?.keterangan}</p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitVerifikasi("terverifikasi")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Terverifikasi + Buat Akun User
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitVerifikasi("perlu_perbaikan")}
                  className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700 transition hover:bg-yellow-100 disabled:opacity-60"
                >
                  Perlu Perbaikan
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitVerifikasi("ditolak")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Tolak Data
                </button>
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
