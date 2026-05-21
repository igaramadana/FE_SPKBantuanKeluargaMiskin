// types/import-data.ts
export type ImportPreview = {
  filename: string;
  total_rows: number;
  columns: string[];
  missing_required_columns: string[];
  preview: Record<string, string | number | null>[];
};

export type ImportBatch = {
  id: string;
  nama_file: string;
  jumlah_baris: number;
  jumlah_valid: number;
  jumlah_error: number;
  uploaded_by?: string | null;
  created_at?: string;
};

export type SaveRawImportResponse = {
  message: string;
  batch: ImportBatch;
  sample: Record<string, unknown>[];
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
  total_diproses: number;
  total_berhasil: number;
  total_gagal: number;
};