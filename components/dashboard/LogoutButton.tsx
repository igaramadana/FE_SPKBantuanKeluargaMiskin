"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    // Mencegah konflik navigasi bawaan tag html jika tombol dibungkus link/form
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Hapus session token NextAuth dari cookie browser
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });

      // 2. Hancurkan cache router internal Next.js di client
      router.refresh();

      // 3. Lakukan hard reload ke /login untuk memastikan state aplikasi bersih total
      window.location.href = "/login";
    } catch (error) {
      console.error("Gagal melakukan logout:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      type="button"
      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoggingOut ? "Mengeluarkan..." : "Logout"}
    </button>
  );
}