import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  HandHeart,
  ShieldCheck,
  Users,
} from "lucide-react";

export const landingNavigation = [
  {
    label: "Beranda",
    href: "/",
    match: "/",
  },
  {
    label: "Tentang",
    href: "/tentang",
    match: "/tentang",
  },
  {
    label: "Fitur",
    href: "/#fitur",
    match: "/#fitur",
  },
  {
    label: "Kontak",
    href: "/#kontak",
    match: "/#kontak",
  },
];

export const heroStats = [
  {
    label: "Data Keluarga",
    value: "250",
    variant: "default",
  },
  {
    label: "Layak",
    value: "120",
    variant: "green",
  },
  {
    label: "Tidak Layak",
    value: "130",
    variant: "default",
  },
] as const;

export const rankingPreview = [
  {
    rank: "01",
    nama: "Budi Santoso",
    nilai: "0.874",
    status: "Layak",
  },
  {
    rank: "02",
    nama: "Siti Aminah",
    nilai: "0.846",
    status: "Layak",
  },
  {
    rank: "03",
    nama: "Agus Pratama",
    nilai: "0.812",
    status: "Layak",
  },
  {
    rank: "04",
    nama: "Dewi Lestari",
    nilai: "0.621",
    status: "Tidak Layak",
  },
];

export const fiturUtama = [
  {
    title: "Tepat Sasaran",
    description:
      "Menentukan penerima bantuan berdasarkan data keluarga dan kriteria yang sudah ditentukan.",
    icon: ClipboardCheck,
  },
  {
    title: "Transparan",
    description:
      "Proses penilaian dapat dilihat dan dipertanggungjawabkan berdasarkan hasil perhitungan.",
    icon: ShieldCheck,
  },
  {
    title: "Berbasis Data",
    description:
      "Menggunakan data terintegrasi untuk menghasilkan keputusan yang lebih objektif.",
    icon: Database,
  },
  {
    title: "Mudah Digunakan",
    description:
      "Admin dapat mengelola data keluarga, kriteria, import file, dan melihat hasil ranking.",
    icon: Users,
  },
];

export const caraKerja = [
  {
    title: "Input Data Keluarga",
    description:
      "Admin menginput atau mengimpor data keluarga dari file CSV, XLS, atau XLSX.",
    icon: FileSpreadsheet,
  },
  {
    title: "Kelola Kriteria",
    description:
      "Admin menentukan kriteria dan sub-kriteria untuk proses penilaian bantuan.",
    icon: ClipboardCheck,
  },
  {
    title: "Hitung AHP & SAW",
    description:
      "Sistem menghitung bobot kriteria dengan AHP dan ranking keluarga dengan SAW.",
    icon: BarChart3,
  },
  {
    title: "Cek Status Bantuan",
    description:
      "User dapat login atau mengecek status kelayakan bantuan berdasarkan data keluarga.",
    icon: CheckCircle2,
  },
];

export const landingBrand = {
  shortName: "SPK",
  title: "SPK Bantuan",
  subtitle: "Keluarga Miskin",
};

export const landingHero = {
  badge: "Sistem Pendukung Keputusan",
  title: "Program Bantuan Keluarga Miskin",
  description:
    "Sistem pendukung keputusan berbasis data untuk menentukan penerima bantuan sosial secara tepat, transparan, dan akuntabel.",
  primaryAction: "Cek Bantuan",
  secondaryAction: "Pelajari Sistem",
};

export const landingCta = {
  title: "Bersama Wujudkan Bantuan yang Tepat Sasaran",
  description:
    "Sistem ini hadir untuk mendukung kebijakan sosial yang lebih adil, transparan, dan bermanfaat bagi masyarakat.",
  action: "Pelajari Lebih Lanjut",
  icon: HandHeart,
};