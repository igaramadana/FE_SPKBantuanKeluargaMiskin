import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL tidak ditemukan di file .env");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Mulai menjalankan seeder...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.users.upsert({
    where: {
      email: "admin@spk.local",
    },
    update: {
      nama: "Administrator",
      password_hash: passwordHash,
      role: "admin",
    },
    create: {
      nama: "Administrator",
      email: "admin@spk.local",
      password_hash: passwordHash,
      role: "admin",
    },
  });

  console.log("Admin berhasil dibuat:", admin.email);

  const userPasswordHash = await bcrypt.hash("user123", 10);

  const user = await prisma.users.upsert({
    where: {
      email: "user@spk.local",
    },
    update: {
      nama: "User Demo",
      password_hash: userPasswordHash,
      role: "user",
    },
    create: {
      nama: "User Demo",
      email: "user@spk.local",
      password_hash: userPasswordHash,
      role: "user",
    },
  });

  console.log("User demo berhasil dibuat:", user.email);

  const kriteriaList = [
    {
      kode: "C1",
      nama: "Jumlah Anggota Keluarga",
      jenis: "benefit",
      urutan: 1,
    },
    {
      kode: "C2",
      nama: "Luas Lantai Rumah",
      jenis: "cost",
      urutan: 2,
    },
    {
      kode: "C3",
      nama: "Kondisi Lantai",
      jenis: "benefit",
      urutan: 3,
    },
    {
      kode: "C4",
      nama: "Kondisi Dinding",
      jenis: "benefit",
      urutan: 4,
    },
    {
      kode: "C5",
      nama: "Kondisi Atap",
      jenis: "benefit",
      urutan: 5,
    },
    {
      kode: "C6",
      nama: "Sumber Air Minum",
      jenis: "benefit",
      urutan: 6,
    },
    {
      kode: "C7",
      nama: "Daya Listrik",
      jenis: "cost",
      urutan: 7,
    },
    {
      kode: "C8",
      nama: "Kepemilikan Kendaraan",
      jenis: "cost",
      urutan: 8,
    },
    {
      kode: "C9",
      nama: "Kepemilikan Aset Elektronik",
      jenis: "cost",
      urutan: 9,
    },
    {
      kode: "C10",
      nama: "Kepemilikan Ternak",
      jenis: "cost",
      urutan: 10,
    },
  ] as const;

  for (const item of kriteriaList) {
    await prisma.kriteria.upsert({
      where: {
        kode: item.kode,
      },
      update: {
        nama: item.nama,
        jenis: item.jenis,
        aktif: true,
        urutan: item.urutan,
      },
      create: {
        kode: item.kode,
        nama: item.nama,
        jenis: item.jenis,
        aktif: true,
        urutan: item.urutan,
      },
    });
  }

  console.log("Kriteria berhasil dibuat.");

  const kriteria = await prisma.kriteria.findMany();

  const getKriteriaId = (kode: string) => {
    const data = kriteria.find((item) => item.kode === kode);

    if (!data) {
      throw new Error(`Kriteria dengan kode ${kode} tidak ditemukan`);
    }

    return data.id;
  };

  const subKriteriaList = [
    {
      kriteriaKode: "C1",
      data: [
        { nama: "1 - 2 orang", nilai: 1 },
        { nama: "3 - 4 orang", nilai: 3 },
        { nama: "5 orang atau lebih", nilai: 5 },
      ],
    },
    {
      kriteriaKode: "C2",
      data: [
        { nama: "Kurang dari 20 m2", nilai: 5 },
        { nama: "20 - 40 m2", nilai: 4 },
        { nama: "41 - 60 m2", nilai: 3 },
        { nama: "Lebih dari 60 m2", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C3",
      data: [
        { nama: "Tanah", nilai: 5 },
        { nama: "Semen", nilai: 4 },
        { nama: "Keramik biasa", nilai: 2 },
        { nama: "Marmer / granit", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C4",
      data: [
        { nama: "Bambu / kayu kualitas rendah", nilai: 5 },
        { nama: "Kayu", nilai: 4 },
        { nama: "Tembok tanpa plester", nilai: 3 },
        { nama: "Tembok permanen", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C5",
      data: [
        { nama: "Rumbia / ijuk", nilai: 5 },
        { nama: "Seng / asbes", nilai: 4 },
        { nama: "Genteng biasa", nilai: 2 },
        { nama: "Beton", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C6",
      data: [
        { nama: "Sungai / air hujan", nilai: 5 },
        { nama: "Sumur tidak terlindung", nilai: 4 },
        { nama: "Sumur terlindung", nilai: 3 },
        { nama: "PDAM / air kemasan", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C7",
      data: [
        { nama: "Tidak ada listrik", nilai: 5 },
        { nama: "450 VA", nilai: 4 },
        { nama: "900 VA", nilai: 3 },
        { nama: "1300 VA atau lebih", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C8",
      data: [
        { nama: "Tidak memiliki kendaraan", nilai: 5 },
        { nama: "Memiliki sepeda", nilai: 4 },
        { nama: "Memiliki motor", nilai: 2 },
        { nama: "Memiliki mobil", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C9",
      data: [
        { nama: "Tidak memiliki aset elektronik", nilai: 5 },
        { nama: "Memiliki TV", nilai: 3 },
        { nama: "Memiliki kulkas / laptop / AC", nilai: 1 },
      ],
    },
    {
      kriteriaKode: "C10",
      data: [
        { nama: "Tidak memiliki ternak", nilai: 5 },
        { nama: "Memiliki ternak kecil", nilai: 3 },
        { nama: "Memiliki ternak bernilai tinggi", nilai: 1 },
      ],
    },
  ];

  for (const group of subKriteriaList) {
    const kriteriaId = getKriteriaId(group.kriteriaKode);

    for (const item of group.data) {
      const existingSubKriteria = await prisma.sub_kriteria.findFirst({
        where: {
          kriteria_id: kriteriaId,
          nama: item.nama,
        },
      });

      if (existingSubKriteria) {
        await prisma.sub_kriteria.update({
          where: {
            id: existingSubKriteria.id,
          },
          data: {
            nilai: item.nilai,
          },
        });
      } else {
        await prisma.sub_kriteria.create({
          data: {
            kriteria_id: kriteriaId,
            nama: item.nama,
            nilai: item.nilai,
          },
        });
      }
    }
  }

  console.log("Sub-kriteria berhasil dibuat.");

  const keluargaDemo = await prisma.keluarga.upsert({
    where: {
      nik: "3404010101010001",
    },
    update: {
      user_id: user.id,
      nama_kepala_keluarga: "Budi Santoso",
      alamat: "Dusun Melati RT 01/RW 02",
      kelurahan: "Mlati",
      dusun: "Melati",
      jumlah_anggota: 5,
      status_verifikasi: "terverifikasi",
      created_by: admin.id,
    },
    create: {
      user_id: user.id,
      nama_kepala_keluarga: "Budi Santoso",
      nik: "3404010101010001",
      alamat: "Dusun Melati RT 01/RW 02",
      kelurahan: "Mlati",
      dusun: "Melati",
      jumlah_anggota: 5,
      status_verifikasi: "terverifikasi",
      created_by: admin.id,
    },
  });

  console.log("Keluarga demo berhasil dibuat:", keluargaDemo.nama_kepala_keluarga);

  const keluargaDemo2 = await prisma.keluarga.upsert({
    where: {
      nik: "3404010101010002",
    },
    update: {
      nama_kepala_keluarga: "Siti Aminah",
      alamat: "Dusun Mawar RT 03/RW 04",
      kelurahan: "Mlati",
      dusun: "Mawar",
      jumlah_anggota: 3,
      status_verifikasi: "terverifikasi",
      created_by: admin.id,
    },
    create: {
      nama_kepala_keluarga: "Siti Aminah",
      nik: "3404010101010002",
      alamat: "Dusun Mawar RT 03/RW 04",
      kelurahan: "Mlati",
      dusun: "Mawar",
      jumlah_anggota: 3,
      status_verifikasi: "terverifikasi",
      created_by: admin.id,
    },
  });

  console.log("Keluarga demo berhasil dibuat:", keluargaDemo2.nama_kepala_keluarga);

  console.log("Seeder selesai dijalankan.");
}

main()
  .catch((error) => {
    console.error("Seeder gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });