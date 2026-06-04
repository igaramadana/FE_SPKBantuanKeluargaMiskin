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

export type PenilaianSawItemPayload = {
  keluarga_id: string;
  kriteria_id: string;
  sub_kriteria_id?: string | null;
  nilai_awal: number;
};

export type SimpanPenilaianSawPayload = {
  data: PenilaianSawItemPayload[];
};

export type SimpanPenilaianSawResponse = {
  message: string;
  data: {
    id: string;
    keluarga_id: string;
    kriteria_id: string;
    sub_kriteria_id?: string | null;
    nilai_awal: string | number;
    nilai_normalisasi?: string | number | null;
    nilai_terbobot?: string | number | null;
  }[];
};

export type RiwayatSaw = {
  id: string;
  nama_perhitungan: string;
  metode: string;
  jumlah_data: number;
  consistency_ratio?: string | null;
  mode_status: string;
  threshold?: string | number | null;
  kuota?: number | null;
  tanggal_hitung: string;
  dihitung_oleh?: string | null;
};