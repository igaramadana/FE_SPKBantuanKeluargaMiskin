import { redirect } from "next/navigation";
import { Medal, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserShell } from "@/components/user/UserShell";
import { HasilSpkExplanation } from "@/components/spk/HasilSpkExplanation";

export const dynamic = "force-dynamic";

function formatTanggal(value?: Date | string | null) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(value?: string | null) {
  if (!value) return "-";

  const map: Record<string, string> = {
    pending: "Pending",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
    perlu_perbaikan: "Perlu Perbaikan",

    layak: "Layak",
    tidak_layak: "Tidak Layak",
    cadangan: "Cadangan",
  };

  return map[value] || value;
}

function statusClass(value?: string | null) {
  const map: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    terverifikasi: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ditolak: "border-red-200 bg-red-50 text-red-700",
    perlu_perbaikan: "border-orange-200 bg-orange-50 text-orange-700",

    layak: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cadangan: "border-blue-200 bg-blue-50 text-blue-700",
    tidak_layak: "border-red-200 bg-red-50 text-red-700",
  };

  return map[value || ""] || "border-slate-200 bg-slate-50 text-slate-600";
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    return value.toNumber();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    const parsed = Number(value.toString());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatNilai(value: unknown) {
  const numberValue = toNumber(value);

  if (numberValue === null) return "-";

  return numberValue.toFixed(4);
}

function Badge({ value }: { value?: string | null }) {
  return (
    <span
      className={`inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-bold ${statusClass(
        value
      )}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-sm font-bold text-slate-500">{label}</span>

      <span className="text-sm font-bold text-slate-950">{value}</span>
    </div>
  );
}

function EmptyResultCard() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Medal className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-amber-950">
            Hasil seleksi belum tersedia
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-amber-800">
            Hasil bantuan belum bisa ditampilkan karena admin belum menjalankan
            proses perhitungan AHP-SAW. Setelah perhitungan dilakukan, sistem
            akan menampilkan nilai akhir, ranking, dan status kelayakan bantuan
            di halaman ini.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
  }

  if (session.user.mustChangePassword) {
    redirect("/user/ubah-password");
  }

  const user = await prisma.users.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      keluarga_akun: {
        orderBy: {
          created_at: "desc",
        },
        take: 1,
        include: {
          penilaians: {
            include: {
              kriteria: true,
              sub_kriteria: true,
            },
          },
          hasilSpks: {
            orderBy: {
              tanggal_hitung: "desc",
            },
            take: 1,
            include: {
              riwayat_perhitungan: true,
            },
          },
        },
      },
    },
  });

  const keluarga = user?.keluarga_akun?.[0] || null;
  const hasilTerbaru = keluarga?.hasilSpks?.[0] || null;

  const penilaian = (keluarga?.penilaians || []).sort((a, b) => {
    return (a.kriteria.urutan || 999) - (b.kriteria.urutan || 999);
  });

  const statusBantuan =
    hasilTerbaru?.status_final || hasilTerbaru?.status_sistem || null;

  const totalNilaiNumber = toNumber(hasilTerbaru?.total_nilai);

  return (
    <UserShell
      activeHref="/user/dashboard"
      title="Status Bantuan Keluarga"
      description="Pantau data keluarga, status verifikasi, ranking, dan hasil seleksi bantuan berdasarkan metode AHP-SAW."
      userName={session.user.name}
      userIdentifier={keluarga?.nik || session.user.email}
    >
      <div className="space-y-6">
        {!keluarga ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-amber-950">
              Data keluarga belum terhubung
            </h3>

            <p className="mt-2 text-sm leading-7 text-amber-800">
              Akun kamu sudah login, tetapi belum terhubung ke data keluarga.
              Admin perlu menghubungkan akun ini ke data keluarga melalui field{" "}
              <b>user_id</b>. Setelah data terhubung, dashboard akan menampilkan
              data keluarga dan hasil seleksi bantuan.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                label="Status Data"
                value={formatStatus(keluarga.status_verifikasi)}
                description="Status verifikasi data keluarga oleh admin."
              />

              <SummaryCard
                label="Status Bantuan"
                value={formatStatus(statusBantuan)}
                description="Status hasil seleksi dari perhitungan AHP-SAW."
              />

              <SummaryCard
                label="Ranking"
                value={hasilTerbaru?.ranking || "-"}
                description="Semakin kecil ranking, semakin tinggi prioritas bantuan."
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Data Keluarga
                    </p>
                  </div>

                  <h3 className="mt-3 text-2xl font-bold text-slate-950">
                    {keluarga.nama_kepala_keluarga}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    NIK/Kode:{" "}
                    <span className="font-bold text-slate-800">
                      {keluarga.nik}
                    </span>
                  </p>
                </div>

                <Badge value={keluarga.status_verifikasi} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Alamat" value={keluarga.alamat || "-"} />

                <InfoItem
                  label="Kelurahan"
                  value={keluarga.kelurahan || "-"}
                />

                <InfoItem label="Dusun" value={keluarga.dusun || "-"} />

                <InfoItem
                  label="Jumlah Anggota"
                  value={String(keluarga.jumlah_anggota || "-")}
                />

                <InfoItem
                  label="Sumber Data"
                  value={keluarga.sumber_data || "manual"}
                />

                <InfoItem
                  label="Update Terakhir"
                  value={formatTanggal(keluarga.updated_at)}
                />
              </div>

              {keluarga.sumber_data === "import" ? (
                <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  Data ini berasal dari import dataset. Karena dataset tidak
                  menyediakan NIK/nama asli, sistem menggunakan kode:
                  <b> {keluarga.kode_keluarga_import || keluarga.nik}</b>.
                </div>
              ) : null}

              {keluarga.catatan_admin ? (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  <b>Catatan admin:</b> {keluarga.catatan_admin}
                </div>
              ) : null}
            </section>

            {!hasilTerbaru ? (
              <EmptyResultCard />
            ) : (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Ringkasan Hasil SPK
                    </p>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-slate-950">
                    Hasil Seleksi Terbaru
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                    Ringkasan ini menampilkan hasil terbaru dari perhitungan
                    AHP-SAW. Nilai akhir diperoleh dari proses normalisasi SAW
                    yang dikalikan dengan bobot kriteria hasil AHP.
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <ResultItem
                      label="Total Nilai"
                      value={formatNilai(hasilTerbaru.total_nilai)}
                    />

                    <ResultItem
                      label="Ranking"
                      value={String(hasilTerbaru.ranking)}
                    />

                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <span className="text-sm font-bold text-slate-500">
                        Status
                      </span>

                      <Badge value={statusBantuan} />
                    </div>

                    <ResultItem
                      label="Tanggal Hitung"
                      value={formatTanggal(hasilTerbaru.tanggal_hitung)}
                    />
                  </div>
                </section>

                <HasilSpkExplanation
                  status={statusBantuan}
                  ranking={hasilTerbaru.ranking}
                  totalNilai={totalNilaiNumber}
                />
              </>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                Nilai Kriteria
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-950">
                Detail Penilaian AHP-SAW
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Nilai berikut menunjukkan data penilaian keluarga pada setiap
                kriteria. Bobot kriteria ditentukan menggunakan AHP, sedangkan
                nilai normalisasi dan nilai terbobot digunakan pada proses SAW.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      <th className="px-4 py-4">Kode</th>
                      <th className="px-4 py-4">Kriteria</th>
                      <th className="px-4 py-4">Jenis</th>
                      <th className="px-4 py-4">Bobot AHP</th>
                      <th className="px-4 py-4">Nilai Awal</th>
                      <th className="px-4 py-4">Normalisasi</th>
                      <th className="px-4 py-4">Terbobot</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {penilaian.map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/40">
                        <td className="px-4 py-4 text-sm font-bold text-emerald-700">
                          {item.kriteria.kode}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {item.kriteria.nama}
                          </p>

                          {item.sub_kriteria ? (
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Sub-kriteria: {item.sub_kriteria.nama}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold capitalize text-slate-600">
                          {item.kriteria.jenis}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-slate-900">
                          {formatNilai(item.kriteria.bobot_ahp)}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatNilai(item.nilai_awal)}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatNilai(item.nilai_normalisasi)}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {formatNilai(item.nilai_terbobot)}
                        </td>
                      </tr>
                    ))}

                    {penilaian.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
                        >
                          Belum ada nilai kriteria untuk keluarga ini.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-800">
                <b>Catatan:</b> Kriteria bertipe <b>benefit</b> berarti semakin
                besar nilai semakin baik untuk prioritas, sedangkan kriteria
                bertipe <b>cost</b> berarti semakin kecil kondisi aslinya semakin
                diprioritaskan setelah proses normalisasi.
              </div>
            </section>
          </>
        )}
      </div>
    </UserShell>
  );
}