import "dotenv/config";

import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tidak ditemukan di file .env");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

function createSyntheticEmail(nik: string) {
  const safeNik = nik.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  return `${safeNik}@warga.local`;
}

async function main() {
  console.log("Mulai generate akun user dari data keluarga...");

  const keluargaList = await prisma.keluarga.findMany({
    where: {
      user_id: null,
      nik: {
        not: "",
      },
    },
    select: {
      id: true,
      nik: true,
      nama_kepala_keluarga: true,
    },
  });

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const keluarga of keluargaList) {
    const nik = keluarga.nik?.trim();

    if (!nik) {
      skipped += 1;
      continue;
    }

    const email = createSyntheticEmail(nik);

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      await prisma.keluarga.update({
        where: {
          id: keluarga.id,
        },
        data: {
          user_id: existingUser.id,
        },
      });

      linked += 1;
      continue;
    }

    const hashedPassword = await bcrypt.hash(nik, 12);

    const user = await prisma.users.create({
      data: {
        nama: keluarga.nama_kepala_keluarga || `Warga ${nik}`,
        email,
        password_hash: hashedPassword,
        role: "user",
        must_change_password: true,
      },
      select: {
        id: true,
      },
    });

    await prisma.keluarga.update({
      where: {
        id: keluarga.id,
      },
      data: {
        user_id: user.id,
      },
    });

    created += 1;
  }

  console.log("Generate akun user selesai.");
  console.table({
    total_keluarga_diproses: keluargaList.length,
    akun_baru_dibuat: created,
    akun_lama_dihubungkan: linked,
    dilewati: skipped,
  });
}

main()
  .catch((error) => {
    console.error("Gagal generate akun user:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });