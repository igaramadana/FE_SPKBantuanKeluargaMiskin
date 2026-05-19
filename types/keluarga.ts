// types/keluarga.ts
export type StatusVerifikasi =
  | "pending"
  | "terverifikasi"
  | "ditolak"
  | "perlu_perbaikan";

export type Keluarga = {
  id: string;
  user_id?: string | null;
  nama_kepala_keluarga: string;
  nik: string;
  alamat?: string | null;
  kelurahan?: string | null;
  dusun?: string | null;
  jumlah_anggota?: number | null;
  status_verifikasi: StatusVerifikasi;
  catatan_admin?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type KeluargaCreatePayload = {
  nama_kepala_keluarga: string;
  nik: string;
  alamat?: string;
  kelurahan?: string;
  dusun?: string;
  jumlah_anggota?: number;
};

export type KeluargaUpdatePayload = Partial<KeluargaCreatePayload> & {
  status_verifikasi?: StatusVerifikasi;
  catatan_admin?: string;
};

export type KeluargaFilter = {
  search?: string;
  kelurahan?: string;
  dusun?: string;
  status_verifikasi?: StatusVerifikasi | "";
};