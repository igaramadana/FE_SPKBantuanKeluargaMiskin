import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

function cleanText(value?: string | null) {
  if (!value) return "";

  return value.trim();
}

function createSyntheticEmail(nik: string) {
  const safeNik = nik.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  return `${safeNik}@warga.local`;
}

export async function createUserAccountForKeluarga(params: {
  keluargaId: string;
  nik: string;
  namaKepalaKeluarga: string;
}) {
  const keluargaId = cleanText(params.keluargaId);
  const nik = cleanText(params.nik);
  const namaKepalaKeluarga = cleanText(params.namaKepalaKeluarga);

  if (!keluargaId) {
    throw new Error("ID keluarga wajib diisi.");
  }

  if (!nik) {
    throw new Error("NIK wajib diisi.");
  }

  const keluarga = await prisma.keluarga.findUnique({
    where: {
      id: keluargaId,
    },
    select: {
      id: true,
      user_id: true,
      nik: true,
      nama_kepala_keluarga: true,
    },
  });

  if (!keluarga) {
    throw new Error("Keluarga tidak ditemukan.");
  }

  if (keluarga.user_id) {
    return prisma.users.findUnique({
      where: {
        id: keluarga.user_id,
      },
    });
  }

  const email = createSyntheticEmail(nik);

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    await prisma.keluarga.update({
      where: {
        id: keluargaId,
      },
      data: {
        user_id: existingUser.id,
      },
    });

    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(nik, 12);

  const user = await prisma.users.create({
    data: {
      nama: namaKepalaKeluarga || `Warga ${nik}`,
      email,
      password_hash: hashedPassword,
      role: "user",
      must_change_password: true,
    },
  });

  await prisma.keluarga.update({
    where: {
      id: keluargaId,
    },
    data: {
      user_id: user.id,
    },
  });

  return user;
}