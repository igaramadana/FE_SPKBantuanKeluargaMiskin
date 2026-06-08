import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserShell } from "@/components/user/UserShell";
import { UbahPasswordClient } from "@/components/user/UbahPasswordClient";

export const dynamic = "force-dynamic";

export default async function UbahPasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/admin/dashboard");
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
      activeHref="/user/ubah-password"
      title="Ubah Password"
      description="Ubah password akun agar akses warga lebih aman."
      userName={session.user.name}
      userIdentifier={keluarga?.nik || session.user.email}
    >
      <UbahPasswordClient
        userName={session.user.name || "User"}
        mustChangePassword={Boolean(session.user.mustChangePassword)}
      />
    </UserShell>
  );
}