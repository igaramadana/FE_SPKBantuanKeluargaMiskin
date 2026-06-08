import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";

  return value.trim();
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        message: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  const body = await request.json();

  const oldPassword = String(body.oldPassword || "");
  const newPassword = cleanText(body.newPassword);
  const confirmPassword = cleanText(body.confirmPassword);

  if (!oldPassword) {
    return NextResponse.json(
      {
        message: "Password lama wajib diisi.",
      },
      {
        status: 400,
      }
    );
  }

  if (!newPassword) {
    return NextResponse.json(
      {
        message: "Password baru wajib diisi.",
      },
      {
        status: 400,
      }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      {
        message: "Password baru minimal 6 karakter.",
      },
      {
        status: 400,
      }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      {
        message: "Konfirmasi password tidak sama.",
      },
      {
        status: 400,
      }
    );
  }

  const user = await prisma.users.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      keluarga_akun: {
        select: {
          nik: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "User tidak ditemukan.",
      },
      {
        status: 404,
      }
    );
  }

  if (!user.password_hash) {
    return NextResponse.json(
      {
        message: "Akun belum memiliki password.",
      },
      {
        status: 400,
      }
    );
  }

  const isOldPasswordValid = await bcrypt.compare(
    oldPassword,
    user.password_hash
  );

  if (!isOldPasswordValid) {
    return NextResponse.json(
      {
        message: "Password lama salah.",
      },
      {
        status: 400,
      }
    );
  }

  const nik = user.keluarga_akun?.[0]?.nik;

  if (nik && newPassword === nik) {
    return NextResponse.json(
      {
        message: "Password baru tidak boleh sama dengan NIK.",
      },
      {
        status: 400,
      }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.users.update({
    where: {
      id: user.id,
    },
    data: {
      password_hash: hashedPassword,
      must_change_password: false,
      password_changed_at: new Date(),
    },
  });

  return NextResponse.json({
    message: "Password berhasil diubah. Silakan login ulang.",
  });
}