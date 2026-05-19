// services/import-data.service.ts
import { apiGet, apiPost, apiUpload } from "@/lib/api";
import type {
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

export function mappingImportKeKeluarga(payload: MappingImportPayload) {
  return apiPost<MappingImportResponse, MappingImportPayload>(
    "/import/map-to-keluarga",
    payload
  );
}