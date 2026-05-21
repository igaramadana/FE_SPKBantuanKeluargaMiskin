"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

type LoginButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function LoginButtonLanding({ children, className }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Bersihkan cookie session secara manual agar NextAuth di client benar-benar mati
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 2. Jalankan signOut NextAuth tanpa melakukan redirect otomatis bawaannya
      await signOut({ 
        redirect: false,
        callbackUrl: "/login" 
      });

    } catch (err) {
      console.error("Gagal membersihkan token:", err);
    } finally {
      // 3. Paksa browser melakukan pemuatan ulang penuh (Hard Reload) langsung ke halaman login
      // Cara ini memotong semua cache router Next.js yang memicu auto-redirect
      window.location.href = "/login";
    }
  }

  return (
    <button
      onClick={handleLoginClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Memuat..." : children}
    </button>
  );
}