import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserShell } from "@/components/user/UserShell";

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
  };

  return map[value] || value;
}

function statusClass(value?: string | null) {
  const map: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    terverifikasi: "border-emerald-200 bg-emerald-50 text-emerald-700",
    ditolak: "border-red-200 bg-red-50 text-red-700",
    perlu_perbaikan: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return map[value || ""] || "border-slate-200 bg-slate-50 text-slate-600";
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

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

export default async function UserProfilPage() {
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
      },
    },
  });

  const keluarga = user?.keluarga_akun?.[0] || null;

  return (
    <UserShell
      activeHref="/user/profil"
      title="Profil Saya"
      description="Lihat data akun dan data keluarga yang terhubung dengan akun kamu."
      userName={session.user.name}
      userIdentifier={keluarga?.nik || session.user.email}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <UserRound className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Akun Warga
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  {session.user.name || "Warga"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Akun ini digunakan untuk melihat status data dan hasil bantuan.
                </p>
              </div>
            </div>

            {keluarga ? <Badge value={keluarga.status_verifikasi} /> : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProfileItem label="Nama Akun" value={session.user.name || "-"} />
            <ProfileItem label="Email Sistem" value={session.user.email || "-"} />
            <ProfileItem label="Role" value="User / Warga" />
          </div>
        </section>

        {!keluarga ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-amber-950">
              Data keluarga belum terhubung
            </h3>

            <p className="mt-2 text-sm leading-7 text-amber-800">
              Akun kamu belum terhubung ke data keluarga. Admin perlu
              menghubungkan akun ini melalui field <b>user_id</b>.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Data Keluarga Terhubung
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
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
              <ProfileItem label="Nama Kepala Keluarga" value={keluarga.nama_kepala_keluarga} />
              <ProfileItem label="NIK / Kode" value={keluarga.nik} />
              <ProfileItem label="Status Verifikasi" value={formatStatus(keluarga.status_verifikasi)} />
              <ProfileItem label="Alamat" value={keluarga.alamat} />
              <ProfileItem label="Kelurahan" value={keluarga.kelurahan} />
              <ProfileItem label="Dusun" value={keluarga.dusun} />
              <ProfileItem label="Jumlah Anggota" value={keluarga.jumlah_anggota} />
              <ProfileItem label="Sumber Data" value={keluarga.sumber_data || "manual"} />
              <ProfileItem label="Update Terakhir" value={formatTanggal(keluarga.updated_at)} />
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
        )}
      </div>
    </UserShell>
  );
}