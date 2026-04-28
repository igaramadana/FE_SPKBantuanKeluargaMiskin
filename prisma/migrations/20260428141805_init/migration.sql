-- CreateEnum
CREATE TYPE "role_user" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "jenis_kriteria" AS ENUM ('benefit', 'cost');

-- CreateEnum
CREATE TYPE "status_kelayakan" AS ENUM ('layak', 'tidak_layak', 'cadangan');

-- CreateEnum
CREATE TYPE "status_verifikasi" AS ENUM ('pending', 'terverifikasi', 'ditolak', 'perlu_perbaikan');

-- CreateEnum
CREATE TYPE "status_dokumen" AS ENUM ('pending', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "mode_penentuan_status" AS ENUM ('threshold', 'kuota');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "role_user" NOT NULL DEFAULT 'user',
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keluarga" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "nama_kepala_keluarga" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "alamat" TEXT,
    "kelurahan" TEXT,
    "dusun" TEXT,
    "jumlah_anggota" INTEGER,
    "status_verifikasi" "status_verifikasi" NOT NULL DEFAULT 'pending',
    "catatan_admin" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kriteria" (
    "id" UUID NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" "jenis_kriteria" NOT NULL,
    "bobot_ahp" DECIMAL(10,6),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_kriteria" (
    "id" UUID NOT NULL,
    "kriteria_id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" DECIMAL(10,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaian" (
    "id" UUID NOT NULL,
    "keluarga_id" UUID NOT NULL,
    "kriteria_id" UUID NOT NULL,
    "sub_kriteria_id" UUID,
    "nilai_awal" DECIMAL(10,4) NOT NULL,
    "nilai_normalisasi" DECIMAL(10,6),
    "nilai_terbobot" DECIMAL(10,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ahp_perbandingan" (
    "id" UUID NOT NULL,
    "kriteria_1_id" UUID NOT NULL,
    "kriteria_2_id" UUID NOT NULL,
    "nilai" DECIMAL(10,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ahp_perbandingan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_perhitungan" (
    "id" UUID NOT NULL,
    "nama_perhitungan" TEXT NOT NULL,
    "metode" TEXT NOT NULL DEFAULT 'AHP-SAW',
    "jumlah_data" INTEGER NOT NULL,
    "consistency_ratio" DECIMAL(10,6),
    "mode_status" "mode_penentuan_status" NOT NULL,
    "threshold" DECIMAL(10,6),
    "kuota" INTEGER,
    "tanggal_hitung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dihitung_oleh" UUID,

    CONSTRAINT "riwayat_perhitungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_spk" (
    "id" UUID NOT NULL,
    "keluarga_id" UUID NOT NULL,
    "riwayat_perhitungan_id" UUID,
    "total_nilai" DECIMAL(10,6) NOT NULL,
    "ranking" INTEGER NOT NULL,
    "status_sistem" "status_kelayakan" NOT NULL,
    "status_final" "status_kelayakan",
    "alasan_override" TEXT,
    "override_by" UUID,
    "override_at" TIMESTAMP(3),
    "tanggal_hitung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasil_spk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch" (
    "id" UUID NOT NULL,
    "nama_file" TEXT NOT NULL,
    "jumlah_baris" INTEGER NOT NULL DEFAULT 0,
    "jumlah_valid" INTEGER NOT NULL DEFAULT 0,
    "jumlah_error" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_keluarga_raw" (
    "id" UUID NOT NULL,
    "import_batch_id" UUID NOT NULL,
    "raw_json" JSONB NOT NULL,
    "status_validasi" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_keluarga_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_keluarga" (
    "id" UUID NOT NULL,
    "keluarga_id" UUID NOT NULL,
    "jenis_dokumen" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status_verifikasi" "status_dokumen" NOT NULL DEFAULT 'pending',
    "catatan" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "aksi" TEXT NOT NULL,
    "tabel" TEXT NOT NULL,
    "record_id" TEXT,
    "before_json" JSONB,
    "after_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "keluarga_nik_key" ON "keluarga"("nik");

-- CreateIndex
CREATE INDEX "keluarga_kelurahan_idx" ON "keluarga"("kelurahan");

-- CreateIndex
CREATE INDEX "keluarga_dusun_idx" ON "keluarga"("dusun");

-- CreateIndex
CREATE INDEX "keluarga_status_verifikasi_idx" ON "keluarga"("status_verifikasi");

-- CreateIndex
CREATE UNIQUE INDEX "kriteria_kode_key" ON "kriteria"("kode");

-- CreateIndex
CREATE INDEX "sub_kriteria_kriteria_id_idx" ON "sub_kriteria"("kriteria_id");

-- CreateIndex
CREATE INDEX "penilaian_keluarga_id_idx" ON "penilaian"("keluarga_id");

-- CreateIndex
CREATE INDEX "penilaian_kriteria_id_idx" ON "penilaian"("kriteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "penilaian_keluarga_id_kriteria_id_key" ON "penilaian"("keluarga_id", "kriteria_id");

-- CreateIndex
CREATE UNIQUE INDEX "ahp_perbandingan_kriteria_1_id_kriteria_2_id_key" ON "ahp_perbandingan"("kriteria_1_id", "kriteria_2_id");

-- CreateIndex
CREATE INDEX "hasil_spk_keluarga_id_idx" ON "hasil_spk"("keluarga_id");

-- CreateIndex
CREATE INDEX "hasil_spk_ranking_idx" ON "hasil_spk"("ranking");

-- CreateIndex
CREATE INDEX "hasil_spk_status_sistem_idx" ON "hasil_spk"("status_sistem");

-- CreateIndex
CREATE INDEX "import_keluarga_raw_import_batch_id_idx" ON "import_keluarga_raw"("import_batch_id");

-- CreateIndex
CREATE INDEX "audit_log_tabel_idx" ON "audit_log"("tabel");

-- CreateIndex
CREATE INDEX "audit_log_aksi_idx" ON "audit_log"("aksi");

-- AddForeignKey
ALTER TABLE "keluarga" ADD CONSTRAINT "keluarga_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keluarga" ADD CONSTRAINT "keluarga_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_kriteria" ADD CONSTRAINT "sub_kriteria_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_keluarga_id_fkey" FOREIGN KEY ("keluarga_id") REFERENCES "keluarga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_kriteria_id_fkey" FOREIGN KEY ("kriteria_id") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_sub_kriteria_id_fkey" FOREIGN KEY ("sub_kriteria_id") REFERENCES "sub_kriteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ahp_perbandingan" ADD CONSTRAINT "ahp_perbandingan_kriteria_1_id_fkey" FOREIGN KEY ("kriteria_1_id") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ahp_perbandingan" ADD CONSTRAINT "ahp_perbandingan_kriteria_2_id_fkey" FOREIGN KEY ("kriteria_2_id") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_perhitungan" ADD CONSTRAINT "riwayat_perhitungan_dihitung_oleh_fkey" FOREIGN KEY ("dihitung_oleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_spk" ADD CONSTRAINT "hasil_spk_keluarga_id_fkey" FOREIGN KEY ("keluarga_id") REFERENCES "keluarga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_spk" ADD CONSTRAINT "hasil_spk_riwayat_perhitungan_id_fkey" FOREIGN KEY ("riwayat_perhitungan_id") REFERENCES "riwayat_perhitungan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_spk" ADD CONSTRAINT "hasil_spk_override_by_fkey" FOREIGN KEY ("override_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_keluarga_raw" ADD CONSTRAINT "import_keluarga_raw_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_keluarga" ADD CONSTRAINT "dokumen_keluarga_keluarga_id_fkey" FOREIGN KEY ("keluarga_id") REFERENCES "keluarga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_keluarga" ADD CONSTRAINT "dokumen_keluarga_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
