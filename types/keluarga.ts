export type StatusVerifikasi =
  | "pending"
  | "terverifikasi"
  | "ditolak"
  | "perlu_perbaikan";

export type PenilaianManualItem = {
  kode_kriteria: string;
  nilai_awal: number;
};

export type PenilaianKeluarga = {
  id: string;
  keluarga_id: string;
  kriteria_id: string;
  kode_kriteria: string;
  nama_kriteria: string;
  sub_kriteria_id?: string | null;
  nilai_awal: string | number;
  nilai_normalisasi?: string | number | null;
  nilai_terbobot?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

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
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  penilaian?: PenilaianKeluarga[];
};

export type KeluargaCreatePayload = {
  nama_kepala_keluarga: string;
  nik: string;
  alamat?: string;
  kelurahan?: string;
  dusun?: string;
  jumlah_anggota?: number;
  penilaian?: PenilaianManualItem[];
};

export type KeluargaUpdatePayload = {
  nama_kepala_keluarga?: string;
  nik?: string;
  alamat?: string;
  kelurahan?: string;
  dusun?: string;
  jumlah_anggota?: number;
  status_verifikasi?: StatusVerifikasi;
  catatan_admin?: string;
  penilaian?: PenilaianManualItem[];
};

export type UserAccountInfo = {
  created: boolean;
  already_exists?: boolean;
  linked?: boolean;
  user_id?: string | null;
  email?: string | null;
  nik?: string | null;
  password_awal?: string | null;
  message?: string;
};

export type KeluargaMutationResponse = {
  message: string;
  data: Keluarga;
  user_account?: UserAccountInfo | null;
  penilaian?: PenilaianKeluarga[];
};

export type VerifikasiKeluargaPayload = {
  status_verifikasi: StatusVerifikasi;
  catatan_admin?: string;
  /**
   * Jika true dan status_verifikasi = "terverifikasi", backend akan membuat
   * akun user otomatis untuk warga yang belum punya akun.
   */
  create_user_account?: boolean;
};