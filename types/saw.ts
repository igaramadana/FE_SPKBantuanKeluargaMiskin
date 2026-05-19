// types/saw.ts
export type StatusKelayakan = "layak" | "tidak_layak" | "cadangan";

export type SawResult = {
  id?: string;
  keluarga_id: string;
  nama_kepala_keluarga: string;
  nik: string;
  kelurahan?: string | null;
  dusun?: string | null;
  total_nilai: string | number;
  ranking: number;
  status_sistem: StatusKelayakan;
  status_final?: StatusKelayakan | null;
  tanggal_hitung?: string;
  riwayat_perhitungan_id?: string;
};

export type SawCalculateFromDbPayload = {
  nama_perhitungan: string;
  mode: "threshold" | "kuota";
  threshold?: number;
  quota?: number;
  reserve_quota?: number;
  dihitung_oleh?: string;
};

export type SawCalculateFromDbResponse = {
  message: string;
  riwayat: {
    id: string;
    nama_perhitungan: string;
    jumlah_data: number;
    mode_status: string;
    threshold?: string | number | null;
    kuota?: number | null;
    tanggal_hitung: string;
  };
  data: unknown[];
  saved: unknown[];
};