import type { Metadata } from "next";
import { Geist, Oswald } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPK Bantuan Keluarga Miskin",
  description:
    "Sistem Pendukung Keputusan untuk Program bantuan keluarga miskin menggunakan metode AHP dan SAW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} ${oswald.variable}`}>
      <body>{children}</body>
    </html>
  );
}