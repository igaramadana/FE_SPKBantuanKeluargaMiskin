import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPK Bantuan Keluarga Miskin",
  description: "Sistem Pendukung Keputusan untuk Program bantuan keluarga miskin menggunakan metode AHP dan SAW",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}