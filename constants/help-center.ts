import { HelpCircle, FileText, Phone } from "lucide-react";

export const helpCenterHero = {
  title: "Pusat Bantuan & Layanan Pengaduan",
  description:
    "Kami siap mendengarkan. Ajukan pertanyaan, sanggahan, atau laporkan kendala terkait program bantuan sosial agar lebih tepat sasaran dan transparan.",
};

export const faqItems = [
  {
    id: 1,
    question: "Bagaimana cara mengecek apakah saya termasuk penerima bantuan",
    answer:
      "Anda dapat mengecek status penerimaan bantuan melalui halaman 'Beranda - Cek Kelayakan' di website ini dengan memasukkan Nomor Induk Kependudukan (NIK) yang valid.",
  },
  {
    id: 2,
    question: "Saya merasa memenuhi syarat, mengapa nama saya tidak terdaftar?",
    answer:
      "Sistem kami melakukan penilaian berdasarkan beberapa kriteria (Pendapatan, Kondisi Rumah, Jumlah Tanggungan, dll) dari data survei lapangan. Jika Anda merasa ada kesalahan data, Anda dapat mengajukan 'Sanggahan' melalui formulir pengaduan di halaman ini.",
  },
  {
    id: 3,
    question: "Bagaimana jika terdapat kesalahan ketik pada NIK atau Nama saya di sistem?",
    answer:
      "Untuk perbaikan data kependudukan (NIK/Nama) yang tidak sesuai, silakan menghubungi layanan kontak WhatsApp Care Center kami di bawah, atau langsung mendatangi kantor pelayanan desa dengan membawa KTP dan KK asli.",
  },
];

export const publicFormFields = [
  {
    id: "nik",
    label: "NIK Pelapor",
    type: "text",
    placeholder: "",
    required: true,
  },
  {
    id: "name",
    label: "Nama Laporan",
    type: "text",
    placeholder: "",
    required: true,
  },
  {
    id: "phone",
    label: "Nomor Telepon / WhatsApp",
    type: "tel",
    placeholder: "",
    required: true,
  },
  {
    id: "description",
    label: "Deskripsi Pengaduan",
    type: "textarea",
    placeholder: "",
    required: true,
  },
  {
    id: "file",
    label: "Unggah Bukti Pendukung (SKTM / SK PHK, dll.)",
    type: "file",
    placeholder: "Klik untuk mengunggah atau seret file kesini Format: JPG, PNG, PDF (Maks 5MB)",
    required: false,
  },
];

export const helpCenterContact = {
  title: "Butuh Bantuan Langsung?",
  items: [
    {
      icon: Phone,
      label: "Layanan Telepon",
      value: "0800-123-4567",
      type: "phone",
    },
    {
      icon: FileText,
      label: "Email",
      value: "bantuan@desasejahtera.go.id",
      type: "email",
    },
    {
      icon: HelpCircle,
      label: "WhatsApp Care Center",
      value: "+62 812-3456-7890",
      type: "whatsapp",
    },
    {
      icon: HelpCircle,
      label: "Alamat",
      value:
        "Gedung Pelayanan Sosial Terpadu\nJl. Kemerdekaan No. 45, Kota Bahagia",
      type: "address",
    },
  ],
};
