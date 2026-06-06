// services/import-data.service.ts

import { apiGet, apiPost, apiUpload } from "@/lib/api";
import type {
  AutoGeneratePenilaianPayload,
  AutoGeneratePenilaianResponse,
  ImportBatch,
  ImportPreview,
  MappingImportPayload,
  MappingImportResponse,
  SaveRawImportResponse,
} from "@/types/import-data";

export function previewImportDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiUpload<ImportPreview>("/import/preview", formData);
}

export function simpanRawImportDataset(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiUpload<SaveRawImportResponse>("/import/save-raw", formData);
}

export function ambilImportBatch() {
  return apiGet<ImportBatch[]>("/import/batches");
}

/**
 * Endpoint lama. Masih disediakan untuk compatibility,
 * tapi flow baru sebaiknya pakai autoGeneratePenilaianDataset().
 */
export function mappingImportKeKeluarga(payload: MappingImportPayload) {
  return apiPost<MappingImportResponse, MappingImportPayload>(
    "/import/map-to-keluarga",
    payload
  );
}

/**
 * Flow baru:
 * Import Dataset -> Simpan Raw -> Auto Penilaian.
 */
export function autoGeneratePenilaianDataset(
  payload: AutoGeneratePenilaianPayload
) {
  return apiPost<AutoGeneratePenilaianResponse, AutoGeneratePenilaianPayload>(
    "/import/auto-generate-penilaian",
    payload
  );
}