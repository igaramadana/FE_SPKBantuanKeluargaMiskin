// types/import-data.ts

export type ImportPreviewValue = string | number | boolean | null;

export type ImportPreview = {
  filename: string;
  total_rows: number;
  columns: string[];
  missing_required_columns: string[];
  preview: Record<string, ImportPreviewValue>[];
};

export type ImportBatch = {
  id: string;
  nama_file: string;
  jumlah_baris: number;
  jumlah_valid: number;
  jumlah_error: number;
  uploaded_by?: string | null;
  created_at?: string | null;
};

export type SaveRawImportResponse = {
  message: string;
  batch: ImportBatch;
  sample?: Record<string, unknown>[];
  jumlah_valid?: number;
  jumlah_error?: number;
};

export type MappingImportPayload = {
  import_batch_id: string;
  kolom_nama_kepala_keluarga?: string;
  kolom_nik?: string;
  kolom_alamat?: string;
  kolom_kelurahan: string;
  kolom_dusun: string;
  kolom_jumlah_anggota: string;
};

export type MappingImportResponse = {
  message: string;

  total_diproses?: number;
  total_berhasil?: number;
  total_gagal?: number;
  total_penilaian_berhasil?: number;
  total_penilaian_gagal?: number;

  import_batch_id?: string;
  preview_only?: boolean;
  total_raw?: number;
  total_grouped?: number;
  total_keluarga_berhasil?: number;

  preview?: unknown[];
  errors?: string[];
};

export type AutoGeneratePenilaianPayload = {
  import_batch_id: string;
  preview_only: boolean;
  limit_preview?: number;
};

export type AutoGeneratePenilaianPreviewItem = {
  kode_keluarga_import: string;
  nama_kepala_keluarga: string;
  nik: string;
  kelurahan?: string | null;
  dusun?: string | null;
  jumlah_anggota?: number | null;
  jumlah_baris_group: number;
  scores: Record<string, number>;
  raw_ringkas?: Record<string, unknown>;
};

export type AutoGeneratePenilaianResponse = {
  message: string;
  import_batch_id: string;
  preview_only: boolean;
  total_raw: number;
  total_grouped: number;
  total_keluarga_berhasil: number;
  total_penilaian_berhasil: number;
  total_gagal: number;
  preview: AutoGeneratePenilaianPreviewItem[];
  errors: string[];
};